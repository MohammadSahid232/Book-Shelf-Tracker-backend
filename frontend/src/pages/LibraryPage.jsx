import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, Star, Download, TrendingUp, Sparkles,
  ChevronRight, Heart, Eye, Clock, Flame, Zap, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Mini Book Card ─────────────────────────────────────────────────────────────
const LibBookCard = ({ book, onAddShelf }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-white dark:bg-neutral-800/90 rounded-2xl border border-slate-200/60 dark:border-neutral-700/60 shadow-sm hover:shadow-xl overflow-hidden cursor-pointer flex-shrink-0 w-36 sm:w-40"
      onClick={() => navigate(`/book/${book._id}`)}
    >
      <div className="relative h-52 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 overflow-hidden">
        {book.coverImage ? (
          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-indigo-300 dark:text-indigo-600 gap-2">
            <BookOpen className="w-10 h-10 stroke-1" />
          </div>
        )}
        {book.downloadAllowed && (
          <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">FREE</span>
        )}
        {book.featured && (
          <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded-md">★ Featured</span>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">{book.title}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{book.author}</p>
        {book.averageRating > 0 && (
          <div className="flex items-center gap-0.5 mt-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">{book.averageRating}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ── Section Row ────────────────────────────────────────────────────────────────
const BookRow = ({ title, icon, books = [], color = 'indigo', onAddShelf }) => {
  if (!books.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base md:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>{icon}</span> {title}
        </h2>
        <Link to="/search" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {books.map((b) => <LibBookCard key={b._id} book={b} onAddShelf={onAddShelf} />)}
      </div>
    </section>
  );
};

// ── Featured Hero ──────────────────────────────────────────────────────────────
const FeaturedHero = ({ books }) => {
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!books.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % books.length), 5000);
    return () => clearInterval(t);
  }, [books.length]);

  if (!books.length) return null;
  const book = books[idx];

  return (
    <motion.div
      key={book._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-3xl overflow-hidden h-56 md:h-72 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 shadow-2xl cursor-pointer"
      onClick={() => navigate(`/book/${book._id}`)}
    >
      {book.coverImage && (
        <div className="absolute inset-0">
          <img src={book.coverImage} alt="" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/60 to-transparent" />
        </div>
      )}
      <div className="relative z-10 p-6 md:p-10 h-full flex flex-col justify-end">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/30 px-2 py-0.5 rounded-full">{book.genre}</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">★ Featured</span>
        </div>
        <h2 className="text-xl md:text-3xl font-black text-white leading-tight line-clamp-2">{book.title}</h2>
        <p className="text-sm text-indigo-200 mt-1">{book.author}</p>
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/read/${book._id}`); }}
            className="px-4 py-2 bg-white text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" /> Read Now
          </button>
          {book.downloadAllowed && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/book/${book._id}`); }}
              className="px-4 py-2 bg-indigo-500/30 border border-indigo-400/40 text-white text-xs font-bold rounded-xl hover:bg-indigo-500/50 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </button>
          )}
        </div>
      </div>
      {/* Dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {books.map((_, i) => (
          <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-white scale-125' : 'bg-white/40'}`} />
        ))}
      </div>
    </motion.div>
  );
};

// ── Main Library Page ──────────────────────────────────────────────────────────
export default function LibraryPage() {
  const { getAuthHeaders, BACKEND_URL, user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/library/home`);
      setSections(data);
    } catch (err) {
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const handleAddShelf = async (bookId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/shelf/${bookId}`, {}, { headers: getAuthHeaders() });
      toast.success('Added to your shelf! 📚');
    } catch (err) {
      if (err.response?.status === 400) toast.error('Already on your shelf');
      else toast.error('Failed to add to shelf');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 p-4 md:p-8 space-y-6">
        <div className="h-56 md:h-72 rounded-3xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />
        {[1,2,3].map(i => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-32 rounded-lg bg-slate-200 dark:bg-neutral-800 animate-pulse" />
            <div className="flex gap-3">
              {[1,2,3,4,5].map(j => <div key={j} className="w-36 h-64 flex-shrink-0 rounded-2xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-8">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books, authors, genres..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        <button type="submit" className="absolute right-3 top-2.5 px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors">
          Search
        </button>
      </form>

      {/* Featured Hero */}
      {sections?.featured?.length > 0 && <FeaturedHero books={sections.featured} />}

      {/* Sections */}
      <BookRow title="Continue Reading" icon="🔖" books={[]} onAddShelf={handleAddShelf} />
      <BookRow title="New Arrivals" icon="✨" books={sections?.newArrivals || []} onAddShelf={handleAddShelf} />
      <BookRow title="Trending Now" icon="🔥" books={sections?.trending || []} onAddShelf={handleAddShelf} />
      <BookRow title="Programming & Tech" icon="💻" books={sections?.programming || []} onAddShelf={handleAddShelf} />
      <BookRow title="Fiction" icon="📖" books={sections?.fiction || []} onAddShelf={handleAddShelf} />
      <BookRow title="Self Help" icon="🌱" books={sections?.selfHelp || []} onAddShelf={handleAddShelf} />
      <BookRow title="Science Fiction" icon="🚀" books={sections?.sciFi || []} onAddShelf={handleAddShelf} />
      <BookRow title="Fantasy" icon="🧙" books={sections?.fantasy || []} onAddShelf={handleAddShelf} />

      {/* Empty State */}
      {!loading && !sections?.newArrivals?.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-4"
        >
          <div className="text-6xl">📚</div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Library is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {user?.role === 'admin'
              ? 'No books yet. Add the first book to the library!'
              : 'No books in the library yet. Check back soon!'}
          </p>
          {user?.role === 'admin' ? (
            <Link to="/admin/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Books
            </Link>
          ) : (
            <button onClick={() => navigate('/search')} className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-colors">
              <Search className="w-4 h-4" /> Search Books
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
