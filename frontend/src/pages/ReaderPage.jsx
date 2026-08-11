import React, {
  useState, useEffect, useCallback, useRef, useMemo
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft, Maximize, Minimize, Moon, Sun, Bookmark,
  Loader, BookOpen, Clock, Download, ExternalLink,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// PDF.js setup — worker is served from the pdfjs-dist package via Vite's
// public asset pipeline. We use a CDN worker URL that matches the installed
// version (6.2.108) to avoid worker version mismatches.
// ─────────────────────────────────────────────────────────────────────────────
let pdfjsLib = null;

async function getPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const lib = await import('pdfjs-dist');
  // Worker URL — must match pdfjs-dist package version exactly
  const version = lib.version || '6.2.108';
  lib.GlobalWorkerOptions.workerSrc =
    `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  pdfjsLib = lib;
  return lib;
}

export default function ReaderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders, BACKEND_URL } = useAuth();

  // ── Book/PDF state ──────────────────────────────────────────────────────────
  const [book, setBook] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);       // PDF.js PDFDocumentProxy
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.3);
  const [rendering, setRendering] = useState(false);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [readingTime, setReadingTime] = useState(0);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);   // tracks in-progress render task
  const timerRef = useRef(null);

  // ─── Stream URL (backend proxies the real PDF — avoids CORS issues) ─────────
  const streamUrl = useMemo(
    () => `${BACKEND_URL}/api/downloads/stream/${id}`,
    [BACKEND_URL, id]
  );

  // ─── Direct PDF URL for download link ───────────────────────────────────────
  const downloadUrl = useMemo(
    () => `${BACKEND_URL}/api/downloads/file/${id}.pdf`,
    [BACKEND_URL, id]
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 1 — Fetch book metadata
  // ═══════════════════════════════════════════════════════════════════════════
  const fetchBook = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = getAuthHeaders();
      let bookData = null;

      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/books/${id}`, { headers });
        bookData = data;
      } catch (_) {
        try {
          const { data } = await axios.get(`${BACKEND_URL}/api/library/${id}`, { headers });
          bookData = data.book || data;
        } catch {
          setError('Book not found or access denied.');
          setLoading(false);
          return;
        }
      }

      if (!bookData) {
        setError('Book not found.');
        setLoading(false);
        return;
      }

      setBook(bookData);

      // Restore saved page from localStorage
      const savedPage = parseInt(
        localStorage.getItem(`reader-page-${id}`), 10
      );
      if (savedPage && savedPage > 1) setCurrentPage(savedPage);

      // Fetch bookmarks silently
      try {
        const { data: bms } = await axios.get(
          `${BACKEND_URL}/api/bookmarks/${id}`, { headers }
        );
        setBookmarks(bms || []);
      } catch (_) {}

      // Mark as reading silently
      try {
        await axios.post(
          `${BACKEND_URL}/api/shelf/${id}`,
          { status: 'reading' },
          { headers }
        );
      } catch (_) {}
    } catch (err) {
      setError('Book not found or access denied.');
    } finally {
      setLoading(false);
    }
  }, [id, BACKEND_URL, getAuthHeaders]);

  useEffect(() => { fetchBook(); }, [fetchBook]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 2 — Load PDF document via PDF.js (reads from backend stream proxy)
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!book) return;

    let cancelled = false;

    async function loadPdf() {
      setPdfLoading(true);
      setPdfError(null);
      setPdfDoc(null);
      setTotalPages(0);

      try {
        const lib = await getPdfJs();

        // Use our backend stream endpoint which proxies the real pdfUrl
        // This avoids CORS problems with external PDF hosts
        const loadingTask = lib.getDocument({
          url: streamUrl,
          withCredentials: true,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${lib.version}/cmaps/`,
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;

        if (!cancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
        } else {
          doc.destroy();
        }
      } catch (err) {
        if (!cancelled) {
          console.error('PDF load error:', err);
          setPdfError(
            'Unable to load this PDF. The file may be unavailable or incompatible.'
          );
        }
      } finally {
        if (!cancelled) setPdfLoading(false);
      }
    }

    loadPdf();
    return () => { cancelled = true; };
  }, [book, streamUrl]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Step 3 — Render current page onto canvas whenever page/scale/doc changes
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let cancelled = false;

    async function renderPage() {
      // Cancel any in-progress render task
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel(); } catch (_) {}
        renderTaskRef.current = null;
      }

      setRendering(true);
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderTask = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;

        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      } finally {
        if (!cancelled) setRendering(false);
      }
    }

    renderPage();
    return () => { cancelled = true; };
  }, [pdfDoc, currentPage, scale]);

  // Save current page to localStorage for progress restoration
  useEffect(() => {
    if (currentPage > 1) {
      localStorage.setItem(`reader-page-${id}`, String(currentPage));
    }
  }, [currentPage, id]);

  // Reading timer
  useEffect(() => {
    timerRef.current = setInterval(() => setReadingTime((t) => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // Navigation
  // ═══════════════════════════════════════════════════════════════════════════
  const goToPrevPage = () =>
    setCurrentPage((p) => Math.max(1, p - 1));

  const goToNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));

  const handlePageInput = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      setCurrentPage(val);
    }
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 3.0));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.5));

  // ═══════════════════════════════════════════════════════════════════════════
  // Bookmarks
  // ═══════════════════════════════════════════════════════════════════════════
  const addBookmark = async () => {
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/bookmarks`,
        {
          bookId: id,
          page: currentPage,
          label: `Page ${currentPage} — ${new Date().toLocaleTimeString()}`,
        },
        { headers: getAuthHeaders() }
      );
      setBookmarks((prev) => [...prev, data]);
      toast.success(`Bookmarked page ${currentPage} 🔖`);
    } catch {
      toast.error('Failed to add bookmark');
    }
  };

  const removeBookmark = async (bmId) => {
    try {
      await axios.delete(
        `${BACKEND_URL}/api/bookmarks/${bmId}`,
        { headers: getAuthHeaders() }
      );
      setBookmarks((prev) => prev.filter((b) => b._id !== bmId));
      toast.success('Bookmark removed');
    } catch (_) {}
  };

  const jumpToBookmark = (bm) => {
    if (bm.page) setCurrentPage(bm.page);
    setShowBookmarks(false);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // Fullscreen
  // ═══════════════════════════════════════════════════════════════════════════
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ─── Download handler ────────────────────────────────────────────────────────
  const handleDownload = () => {
    // Open the backend proxy endpoint which streams the real PDF as attachment
    window.open(downloadUrl, '_blank');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center text-white space-y-3">
          <Loader className="w-10 h-10 animate-spin mx-auto text-indigo-400" />
          <p className="text-sm text-neutral-400">Opening reader…</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR SCREEN
  // ═══════════════════════════════════════════════════════════════════════════
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center text-white space-y-5 max-w-sm px-4">
          <BookOpen className="w-16 h-16 text-neutral-600 mx-auto" />
          <div>
            <p className="text-neutral-300 text-sm font-semibold">{error}</p>
            <p className="text-neutral-500 text-xs mt-1">
              You can try again or download the PDF to read offline.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={fetchBook}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold transition-colors"
            >
              🔄 Retry
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold transition-colors"
            >
              ⬇ Download PDF
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-xl text-sm font-bold transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // READER UI
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div
      ref={containerRef}
      className={`min-h-screen flex flex-col ${
        darkMode ? 'bg-neutral-950' : 'bg-neutral-200'
      } transition-colors`}
      style={{ height: '100vh' }}
    >
      {/* ── TOP TOOLBAR ──────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center gap-2 px-3 py-2 border-b flex-shrink-0 flex-wrap gap-y-1
          ${darkMode
            ? 'bg-neutral-900 border-neutral-800 text-white'
            : 'bg-white border-slate-200 text-slate-800'}
          shadow-sm`}
      >
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-slate-500 hover:text-indigo-600 flex-shrink-0"
          title="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Book title / author */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black truncate">{book?.title}</p>
          <p className="text-[10px] text-slate-400 truncate">{book?.author}</p>
        </div>

        {/* Page counter + input */}
        <div
          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg flex-shrink-0
            ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-600'}`}
        >
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1 || !pdfDoc}
            className="disabled:opacity-30 hover:text-indigo-500 transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min={1}
            max={totalPages || 1}
            value={currentPage}
            onChange={handlePageInput}
            className={`w-10 text-center bg-transparent border-none outline-none text-xs font-bold
              ${darkMode ? 'text-white' : 'text-slate-800'}`}
            title="Jump to page"
          />
          <span className="text-slate-400">/</span>
          <span className={totalPages ? '' : 'opacity-40'}>
            {totalPages || '—'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages || !pdfDoc}
            className="disabled:opacity-30 hover:text-indigo-500 transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom */}
        <div
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0
            ${darkMode ? 'bg-neutral-800 text-neutral-300' : 'bg-slate-100 text-slate-600'}`}
        >
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="disabled:opacity-30 hover:text-indigo-500 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="min-w-[36px] text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={scale >= 3.0}
            className="disabled:opacity-30 hover:text-indigo-500 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Reading Timer */}
        <div
          className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg flex-shrink-0
            ${darkMode ? 'bg-neutral-800 text-neutral-400' : 'bg-slate-100 text-slate-500'}`}
        >
          <Clock className="w-3 h-3" />
          <span>{formatTime(readingTime)}</span>
        </div>

        {/* Bookmark */}
        <button
          onClick={addBookmark}
          title={`Bookmark page ${currentPage}`}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0
            ${bookmarks.length > 0
              ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : 'hover:bg-slate-100 dark:hover:bg-neutral-800'}`}
        >
          <Bookmark className="w-4 h-4" fill={bookmarks.length > 0 ? 'currentColor' : 'none'} />
        </button>

        {/* Bookmarks toggle */}
        <button
          onClick={() => setShowBookmarks(!showBookmarks)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors text-xs font-bold flex-shrink-0"
          title="Session bookmarks"
        >
          📑 {bookmarks.length}
        </button>

        {/* Download — streams real PDF as attachment */}
        <button
          onClick={handleDownload}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0 text-slate-500 hover:text-emerald-600"
          title="Download PDF"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Open stream in new tab */}
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0 text-slate-500 hover:text-indigo-600"
          title="Open PDF in browser tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>

        {/* Dark mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
          title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Bookmarks Sidebar */}
        {showBookmarks && (
          <div
            className={`w-56 flex-shrink-0 border-r overflow-y-auto
              ${darkMode
                ? 'bg-neutral-900 border-neutral-800 text-white'
                : 'bg-white border-slate-200'}`}
          >
            <div className="p-3">
              <h3 className="text-xs font-black mb-3">
                Bookmarks ({bookmarks.length})
              </h3>
              {bookmarks.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No bookmarks yet. Click the 🔖 icon to save the current page.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm._id}
                      className={`w-full px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-1
                        ${darkMode
                          ? 'bg-neutral-800'
                          : 'bg-slate-50 border border-slate-100'}`}
                    >
                      <button
                        onClick={() => jumpToBookmark(bm)}
                        className="flex items-center gap-1.5 truncate text-left flex-1 hover:text-indigo-600 transition-colors"
                        title={`Jump to ${bm.label || `Page ${bm.page}`}`}
                      >
                        <Bookmark className="w-3 h-3 text-amber-500 flex-shrink-0" fill="currentColor" />
                        <span className="truncate">{bm.label || `Page ${bm.page}`}</span>
                      </button>
                      <button
                        onClick={() => removeBookmark(bm._id)}
                        className="text-slate-300 hover:text-red-500 flex-shrink-0"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PDF CANVAS AREA ───────────────────────────────────────────────── */}
        <div
          className={`flex-1 relative overflow-auto flex flex-col items-center
            ${darkMode ? 'bg-neutral-950' : 'bg-neutral-300'}`}
        >
          {/* PDF loading spinner */}
          {pdfLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="text-center space-y-3">
                <Loader className="w-10 h-10 animate-spin mx-auto text-indigo-400" />
                <p className="text-sm text-neutral-400">Loading PDF…</p>
              </div>
            </div>
          )}

          {/* No PDF URL message */}
          {!pdfLoading && !pdfDoc && !pdfError && book && !book.pdfUrl && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6">
              <BookOpen className="w-16 h-16 text-neutral-500 mb-4" />
              <p className="text-neutral-300 font-semibold mb-1">
                PDF reading is not available for this book.
              </p>
              <p className="text-neutral-500 text-sm">
                No PDF URL has been set for "{book.title}".
              </p>
            </div>
          )}

          {/* PDF error message */}
          {pdfError && !pdfLoading && (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center px-6 space-y-4">
              <BookOpen className="w-16 h-16 text-red-400 mx-auto" />
              <div>
                <p className="text-neutral-200 font-semibold">{pdfError}</p>
                <p className="text-neutral-500 text-sm mt-1">
                  Try opening the PDF directly in a new tab or download it.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                <a
                  href={streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-bold text-white transition-colors"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl text-sm font-bold text-white transition-colors"
                >
                  ⬇ Download PDF
                </button>
              </div>
            </div>
          )}

          {/* Rendering indicator (subtle) */}
          {rendering && (
            <div className="absolute top-3 right-3 z-20">
              <Loader className="w-4 h-4 animate-spin text-indigo-400 opacity-70" />
            </div>
          )}

          {/* ── CANVAS ─────────────────────────────────────────────────────── */}
          <div
            className="py-4"
            style={{ display: pdfDoc && !pdfLoading ? 'block' : 'none' }}
          >
            <canvas
              ref={canvasRef}
              className={`shadow-2xl block mx-auto ${darkMode ? 'filter invert hue-rotate-180' : ''}`}
              style={{ maxWidth: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAVIGATION BAR ────────────────────────────────────────────── */}
      {pdfDoc && (
        <div
          className={`flex items-center justify-center gap-4 px-4 py-2.5 border-t flex-shrink-0
            ${darkMode
              ? 'bg-neutral-900 border-neutral-800 text-white'
              : 'bg-white border-slate-200 text-slate-800'}`}
        >
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
              bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30
              disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="flex items-center gap-1 text-sm font-semibold">
            <span className="text-indigo-500 font-black">{currentPage}</span>
            <span className="text-slate-400">/</span>
            <span>{totalPages}</span>
          </div>

          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold
              bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30
              disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
