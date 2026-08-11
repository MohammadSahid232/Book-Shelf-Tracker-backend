import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Heart, Download, Bookmark, Clock,
  CheckCircle, List, Archive, Loader, Plus, Search, BookMarked,
  ChevronDown, RotateCcw, BookCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'want to read', label: 'Want to Read', icon: '📖', color: 'text-blue-600' },
  { value: 'reading',      label: 'Reading',      icon: '📚', color: 'text-amber-600' },
  { value: 'finished',     label: 'Finished',     icon: '✅', color: 'text-emerald-600' },
  { value: 'archived',     label: 'Archived',     icon: '📦', color: 'text-slate-500' },
];

const STATUS_COLORS = {
  'want to read': 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  'reading':      'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  'finished':     'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  'archived':     'bg-slate-100 text-slate-600 dark:bg-neutral-700 dark:text-slate-400',
};

// ── Shelf Card ─────────────────────────────────────────────────────────────────
const ShelfCard = ({ entry, onUpdate, onRemove, navigate, backendUrl }) => {
  const book = entry.book;
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [updating, setUpdating] = useState(false);

  if (!book) return null;

  const currentStatus = entry.status || 'want to read';

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) { setShowStatusMenu(false); return; }
    setUpdating(true);
    setShowStatusMenu(false);
    try {
      await onUpdate(book._id, { status: newStatus });
      toast.success(`Status changed to "${newStatus}" 📚`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-neutral-800/90 rounded-2xl border border-slate-200/70 dark:border-neutral-700/70 p-3 flex gap-3 hover:shadow-md transition-shadow group relative"
    >
      {/* Cover */}
      <div
        className="w-14 h-20 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 overflow-hidden flex-shrink-0 cursor-pointer"
        onClick={() => navigate(`/book/${book._id}`)}
      >
        {book.coverImage
          ? <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
          : <BookOpen className="w-6 h-6 text-indigo-300 m-auto mt-5" />
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          onClick={() => navigate(`/book/${book._id}`)}
        >
          {book.title}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">{book.author}</p>

        {/* Status badge + dropdown */}
        <div className="relative mt-1.5 inline-block">
          <button
            onClick={(e) => { e.stopPropagation(); setShowStatusMenu((v) => !v); }}
            disabled={updating}
            className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full transition-all hover:opacity-80 ${STATUS_COLORS[currentStatus] || ''}`}
          >
            {updating ? <Loader className="w-2.5 h-2.5 animate-spin" /> : null}
            {currentStatus}
            <ChevronDown className="w-2.5 h-2.5" />
          </button>

          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 top-full mt-1 z-50 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-xl shadow-xl overflow-hidden min-w-[148px]"
                onClick={(e) => e.stopPropagation()}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-neutral-700 transition-colors text-left ${opt.value === currentStatus ? 'bg-slate-50 dark:bg-neutral-700/60 font-black' : ''}`}
                  >
                    <span>{opt.icon}</span>
                    <span className={opt.color}>{opt.label}</span>
                    {opt.value === currentStatus && <span className="ml-auto text-[9px] text-slate-400">Current</span>}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {entry.readingProgress > 0 && (
          <div className="mt-2">
            <div className="w-full bg-slate-100 dark:bg-neutral-700 rounded-full h-1">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${entry.readingProgress}%` }} />
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">{entry.readingProgress}% read</p>
          </div>
        )}
      </div>

      {/* Action buttons — always visible on hover */}
      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => navigate(`/read/${book._id}`)}
          className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 hover:bg-indigo-100 transition-colors"
          title="Read Now"
        >
          <BookOpen className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => {
            window.open(`${backendUrl}/api/downloads/file/${book._id}.pdf`, '_blank');
          }}
          className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 hover:bg-emerald-100 transition-colors"
          title="Download PDF"
        >
          <Download className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onRemove(book._id)}
          className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 transition-colors"
          title="Remove from shelf"
        >
          ✕
        </button>
      </div>
    </motion.div>
  );
};

// ── Stat Mini Card ─────────────────────────────────────────────────────────────
const MiniStat = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 border border-slate-100 dark:border-neutral-700 text-center">
    <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mx-auto mb-2`}>
      <Icon className="w-4.5 h-4.5 text-white" />
    </div>
    <p className="text-xl font-black text-slate-900 dark:text-white">{value ?? 0}</p>
    <p className="text-[10px] text-slate-400 mt-0.5">{label}</p>
  </div>
);

// ── Main My Library Page ───────────────────────────────────────────────────────
export default function MyLibraryPage() {
  const { getAuthHeaders, BACKEND_URL } = useAuth();
  const navigate = useNavigate();

  const [shelf, setShelf] = useState([]);
  const [stats, setStats] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const headers = getAuthHeaders();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [shelfRes, statsRes, dlRes, bmRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/shelf`, { headers }),
        axios.get(`${BACKEND_URL}/api/shelf/stats`, { headers }),
        axios.get(`${BACKEND_URL}/api/downloads`, { headers }),
        axios.get(`${BACKEND_URL}/api/bookmarks/all`, { headers }),
      ]);
      setShelf(shelfRes.data || []);
      setStats(statsRes.data);
      setDownloads(dlRes.data || []);
      setBookmarks(bmRes.data || []);
    } catch (err) {
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRemove = async (bookId) => {
    if (!window.confirm('Remove this book from your shelf?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/shelf/${bookId}`, { headers });
      toast.success('Removed from shelf');
      setShelf((prev) => prev.filter((e) => e.book?._id !== bookId));
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const handleUpdate = async (bookId, updateData) => {
    const res = await axios.patch(`${BACKEND_URL}/api/shelf/${bookId}`, updateData, { headers });
    // Optimistically update local shelf state
    setShelf((prev) =>
      prev.map((e) =>
        e.book?._id === bookId
          ? { ...e, ...updateData, readingProgress: res.data?.readingProgress ?? e.readingProgress }
          : e
      )
    );
    return res.data;
  };

  const TABS = [
    { id: 'all', label: 'All', icon: BookOpen },
    { id: 'reading', label: 'Reading', icon: Clock },
    { id: 'want to read', label: 'Want to Read', icon: List },
    { id: 'finished', label: 'Finished', icon: CheckCircle },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  const filteredShelf = shelf.filter((e) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'favorites') return e.favorite;
    return e.status === activeTab;
  }).filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.book?.title?.toLowerCase().includes(q) || e.book?.author?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">My Library</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your personal reading collection</p>
        </div>
        <button
          onClick={() => navigate('/library')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Browse Library
        </button>
      </div>

      {/* Stats Row */}
      {!loading && stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <MiniStat label="Total Books" value={stats.totalBooks} icon={BookOpen} color="bg-indigo-500" />
          <MiniStat label="Reading" value={stats.reading} icon={Clock} color="bg-amber-500" />
          <MiniStat label="Finished" value={stats.finished} icon={CheckCircle} color="bg-emerald-500" />
          <MiniStat label="Want to Read" value={stats.wantToRead} icon={List} color="bg-blue-500" />
          <MiniStat label="Favorites" value={stats.favorites} icon={Heart} color="bg-rose-500" />
          <MiniStat label="Pages Read" value={stats.totalPagesRead} icon={BookMarked} color="bg-purple-500" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${activeTab === id ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-neutral-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-neutral-700'}`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Search */}
      {activeTab !== 'downloads' && activeTab !== 'bookmarks' && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your library..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />)}
        </div>
      ) : activeTab === 'downloads' ? (
        <div className="space-y-3">
          {downloads.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Download className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No downloads yet</p>
            </div>
          ) : (
            downloads.map((d) => (
              <div key={d._id} className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 p-3 flex items-center gap-3">
                <div className="w-10 h-14 rounded-lg bg-indigo-50 overflow-hidden">
                  {d.book?.coverImage && <img src={d.book.coverImage} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{d.book?.title}</p>
                  <p className="text-[10px] text-slate-400">{d.book?.author}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">{d.format}</span>
                  <p className="text-[9px] text-slate-400 mt-1">{new Date(d.downloadedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'bookmarks' ? (
        <div className="space-y-3">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No bookmarks yet. Bookmark pages while reading.</p>
            </div>
          ) : (
            bookmarks.map((bm) => (
              <div key={bm._id} onClick={() => navigate(`/read/${bm.book?._id}#page=${bm.page}`)}
                className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 p-3 flex items-center gap-3 cursor-pointer hover:border-indigo-300 transition-colors"
              >
                <Bookmark className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{bm.book?.title}</p>
                  <p className="text-[10px] text-slate-400">{bm.label || `Page ${bm.page}`}</p>
                </div>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">Pg {bm.page}</span>
              </div>
            ))
          )}
        </div>
      ) : filteredShelf.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            {activeTab === 'all' ? 'Your shelf is empty' : `No ${activeTab} books`}
          </h3>
          <p className="text-sm text-slate-400 max-w-xs mx-auto">
            Browse the library and add books to your shelf to start reading.
          </p>
          <button onClick={() => navigate('/library')} className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">
            Browse Library
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredShelf.map((entry) => (
            <ShelfCard key={entry._id} entry={entry} onUpdate={handleUpdate} onRemove={handleRemove} navigate={navigate} backendUrl={BACKEND_URL} />
          ))}
        </div>
      )}
    </div>
  );
}
