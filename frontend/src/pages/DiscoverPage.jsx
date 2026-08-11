import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, BookOpen, Plus, Sparkles, Star, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DiscoverPage() {
  const navigate = useNavigate();
  const { getAuthHeaders, BACKEND_URL } = useAuth();
  const [query, setQuery] = useState('atomic habits');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedBooks, setAddedBooks] = useState({});

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/discover/search?q=${encodeURIComponent(query)}`,
        { headers: getAuthHeaders() }
      );
      setBooks(response.data.books || []);
      if ((response.data.books || []).length === 0) {
        toast.error('No books found for your query.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error fetching books from Google Books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async (book, redirectAction = null) => {
    if (addedBooks[book.id]) {
      const savedBookId = addedBooks[book.id];
      if (redirectAction === 'read') {
        navigate(`/read/${savedBookId}`);
      } else if (redirectAction === 'download') {
        window.open(`${BACKEND_URL}/api/downloads/file/${savedBookId}.pdf`, '_blank');
      }
      return savedBookId;
    }

    setAddingId(book.id);
    try {
      const headers = getAuthHeaders();
      const payload = {
        title: book.title,
        author: book.author,
        genre: book.genre || 'General',
        coverImage: book.coverImage,
        description: book.description,
        totalPages: book.totalPages || 250,
        status: 'want to read',
        downloadAllowed: true,
      };

      const response = await axios.post(`${BACKEND_URL}/api/books`, payload, { headers });
      const createdBook = response.data;
      const createdId = createdBook._id || createdBook.id;

      // Also add to the user's reading shelf so it appears in My Reading Shelf
      try {
        await axios.post(`${BACKEND_URL}/api/shelf/${createdId}`, { status: 'want to read' }, { headers });
      } catch (_) {} // Ignore if already on shelf

      setAddedBooks((prev) => ({ ...prev, [book.id]: createdId }));
      toast.success(`"${book.title}" added to your library! 📚`);

      const token = localStorage.getItem('token') || '';
      if (redirectAction === 'read') {
        navigate(`/read/${createdId}`);
      } else if (redirectAction === 'download') {
        window.open(`${BACKEND_URL}/api/downloads/file/${createdId}.pdf?token=${token}`, '_blank');
      }
      return createdId;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add book to library');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-8 transition-colors">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold mb-3">
            <Sparkles className="w-4 h-4 text-purple-300 fill-purple-300" />
            Powered by Digital Book Engine
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Discover Millions of Books Online</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Search titles, preview cover artwork, read descriptions, read online, and download PDFs in 1-click.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by title, author, or keyword (e.g. Stephen King)..."
                className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl bg-white/10 dark:bg-neutral-800/80 border border-white/20 text-white placeholder:text-indigo-200/60 focus:outline-none focus:ring-2 focus:ring-purple-400 backdrop-blur-md"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-md flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Search Results ({books.length})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white dark:bg-neutral-800/90 rounded-3xl p-12 text-center border border-slate-200 dark:border-neutral-700">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-neutral-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-white">Search Digital Books</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter a search keyword above to explore and read books online.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {books.map((b) => (
              <div
                key={b.id}
                className="bg-white dark:bg-neutral-800/90 rounded-2xl border border-slate-200 dark:border-neutral-700/80 p-4 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div>
                  <div className="w-full h-48 rounded-xl bg-slate-100 dark:bg-neutral-700/40 overflow-hidden mb-3 flex items-center justify-center border border-slate-200/60 dark:border-neutral-700">
                    <img
                      src={b.coverImage}
                      alt={b.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 rounded-md">
                    {b.genre}
                  </span>

                  <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1 mt-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                    by {b.author}
                  </p>

                  <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-neutral-700 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>{b.totalPages || 250} Pages</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">PDF Ready</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleAddToLibrary(b, 'read')}
                      className="flex-1 py-1.5 px-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Read
                    </button>

                    <button
                      onClick={() => handleAddToLibrary(b, 'download')}
                      className="py-1.5 px-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>

                    <button
                      onClick={() => handleAddToLibrary(b)}
                      disabled={addingId === b.id}
                      className="py-1.5 px-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-neutral-700 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1 disabled:opacity-50"
                      title="Add to Library"
                    >
                      {addingId === b.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
