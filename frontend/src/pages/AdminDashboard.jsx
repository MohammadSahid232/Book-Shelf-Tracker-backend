import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Users, Download, Star, TrendingUp, Plus,
  Edit3, Trash2, Search, Bell, Settings, BarChart2,
  Eye, ChevronRight, Sparkles, Loader, AlertCircle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import BookModal from '../components/BookModal';

// ── Stat Card ─────────────────────────────────────────────────────────────────
const AdminStatCard = ({ label, value, icon: Icon, color }) => (
  <div className={`bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-slate-100 dark:border-neutral-700 flex items-center gap-4`}>
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 dark:text-white">{value ?? '—'}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  </div>
);

// ── Book Table Row ─────────────────────────────────────────────────────────────
const BookRow = ({ book, onEdit, onDelete, navigate }) => (
  <tr className="border-b border-slate-100 dark:border-neutral-700/60 hover:bg-slate-50/60 dark:hover:bg-neutral-800/50 transition-colors">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 overflow-hidden flex-shrink-0">
          {book.coverImage ? <img src={book.coverImage} alt="" className="w-full h-full object-cover" /> : <BookOpen className="w-5 h-5 text-indigo-400 m-auto mt-3" />}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{book.title}</p>
          <p className="text-[10px] text-slate-400">{book.author}</p>
        </div>
      </div>
    </td>
    <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">{book.genre}</td>
    <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{book.viewCount || 0}</span>
    </td>
    <td className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400">
      <span className="flex items-center gap-1"><Download className="w-3 h-3" />{book.downloadCount || 0}</span>
    </td>
    <td className="px-3 py-3">
      <div className="flex items-center gap-1">
        {book.featured && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Featured</span>}
        {book.downloadAllowed && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">Free</span>}
      </div>
    </td>
    <td className="px-3 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(`/book/${book._id}`)}
          title="View Book"
          className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-100/80 dark:bg-neutral-800 hover:bg-indigo-50 border border-slate-200/60 dark:border-neutral-700 rounded-xl transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onEdit(book)}
          title="Edit Book"
          className="p-1.5 text-slate-500 hover:text-blue-600 bg-slate-100/80 dark:bg-neutral-800 hover:bg-blue-50 border border-slate-200/60 dark:border-neutral-700 rounded-xl transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(book._id)}
          title="Delete Book"
          className="p-1.5 text-red-600 hover:text-red-700 bg-red-50/80 dark:bg-red-950/40 hover:bg-red-100 border border-red-200/60 dark:border-red-900/50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </td>
  </tr>
);

// ── User Table Row ─────────────────────────────────────────────────────────────
const UserRow = ({ user: u, onRoleToggle, onDelete }) => (
  <tr className="border-b border-slate-100 dark:border-neutral-700/60 hover:bg-slate-50/60 dark:hover:bg-neutral-800/50 transition-colors">
    <td className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
          {u.first_name?.[0] || '?'}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-900 dark:text-white">{u.first_name} {u.last_name}</p>
          <p className="text-[10px] text-slate-400">{u.email}</p>
        </div>
      </div>
    </td>
    <td className="px-3 py-3">
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-neutral-700 dark:text-slate-300'}`}>
        {u.role}
      </span>
    </td>
    <td className="px-3 py-3 text-[10px] text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
    <td className="px-3 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onRoleToggle(u)}
          className="text-[10px] px-2.5 py-1.5 bg-amber-100/70 dark:bg-neutral-800 text-rose-800 dark:text-amber-400 border border-amber-200/60 dark:border-neutral-700 rounded-xl font-bold hover:bg-amber-200/60 transition-colors shadow-2xs cursor-pointer"
          title={`Change role to ${u.role === 'admin' ? 'user' : 'admin'}`}
        >
          {u.role === 'admin' ? '→ User' : '→ Admin'}
        </button>
        <button
          onClick={() => onDelete(u._id)}
          title="Delete User"
          className="p-1.5 text-red-600 hover:text-red-700 bg-red-50/80 dark:bg-red-950/40 hover:bg-red-100 border border-red-200/60 dark:border-red-900/50 rounded-xl transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
        </button>
      </div>
    </td>
  </tr>
);

// ── Review Card / Row ─────────────────────────────────────────────────────────
const ReviewRow = ({ review: r, onDelete }) => (
  <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200/70 dark:border-neutral-700/70 p-4 space-y-3 shadow-xs transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      {/* User Details */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-xs overflow-hidden">
          {r.user?.avatar ? (
            <img src={r.user.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            (r.user?.first_name?.[0] || 'U')
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {r.user?.first_name} {r.user?.last_name}
            </p>
            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${r.user?.role === 'admin' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-neutral-700 dark:text-slate-300'}`}>
              {r.user?.role || 'user'}
            </span>
          </div>
          <p className="text-[10px] text-slate-400">{r.user?.email}</p>
        </div>
      </div>

      {/* Action / Rating */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-xl border border-amber-200/50 dark:border-amber-900/40">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-black text-amber-800 dark:text-amber-300">{r.rating}/5</span>
        </div>
        <button
          onClick={() => onDelete(r._id)}
          title="Delete Review"
          className="p-1.5 text-red-600 hover:text-red-700 bg-red-50/80 dark:bg-red-950/40 hover:bg-red-100 border border-red-200/60 dark:border-red-900/50 rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    {/* Book & Review Content */}
    <div className="pt-2 border-t border-slate-100 dark:border-neutral-700/60 flex items-start gap-3">
      {r.book?.coverImage && (
        <img src={r.book.coverImage} alt="" className="w-8 h-11 object-cover rounded-md flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          Book: <span className="text-slate-900 dark:text-white font-extrabold">{r.book?.title || 'Unknown Book'}</span> by {r.book?.author || 'Unknown'}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed italic bg-slate-50 dark:bg-neutral-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-neutral-800">
          "{r.text || 'No written text review provided.'}"
        </p>
        <p className="text-[9px] text-slate-400 mt-1.5">
          Reviewed on {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  </div>
);

// ── Main Admin Dashboard ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { getAuthHeaders, BACKEND_URL } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [tab, setTab] = useState('overview'); // 'overview' | 'books' | 'users' | 'reviews'
  const [bookSearch, setBookSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [reviewSearch, setReviewSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const headers = getAuthHeaders();

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers });
      setStats(data);
    } catch (err) {
      toast.error('Failed to load admin stats');
    } finally {
      setLoadingStats(false);
    }
  }, [BACKEND_URL]);

  const fetchBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/books?limit=50&search=${bookSearch}`, { headers });
      setBooks(data.books || []);
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoadingBooks(false);
    }
  }, [BACKEND_URL, bookSearch]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/users?limit=50&search=${userSearch}`, { headers });
      setUsers(data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, [BACKEND_URL, userSearch]);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const { data } = await axios.get(`${BACKEND_URL}/api/admin/reviews?limit=50&search=${reviewSearch}`, { headers });
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error('Failed to load user reviews');
    } finally {
      setLoadingReviews(false);
    }
  }, [BACKEND_URL, reviewSearch]);

  useEffect(() => { fetchStats(); fetchBooks(); }, []);
  useEffect(() => { if (tab === 'users') fetchUsers(); }, [tab]);
  useEffect(() => { if (tab === 'reviews') fetchReviews(); }, [tab]);

  const handleSaveBook = async (formData) => {
    try {
      if (editingBook) {
        await axios.patch(`${BACKEND_URL}/api/admin/books/${editingBook._id}`, formData, { headers });
        toast.success('Book updated! ✅');
      } else {
        await axios.post(`${BACKEND_URL}/api/admin/books`, formData, { headers });
        toast.success('Book added to library! 📚');
      }
      setIsModalOpen(false);
      setEditingBook(null);
      fetchBooks();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || 'Error saving book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Delete this book from the library?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/books/${bookId}`, { headers });
      toast.success('Book deleted');
      fetchBooks();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  const handleRoleToggle = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${u.first_name}'s role to ${newRole}?`)) return;
    try {
      await axios.patch(`${BACKEND_URL}/api/admin/users/${u._id}`, { role: newRole }, { headers });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/users/${userId}`, { headers });
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this user review?')) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/reviews/${reviewId}`, { headers });
      toast.success('Review deleted');
      fetchReviews();
      fetchStats();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'books', label: 'Books', icon: BookOpen },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reviews', label: 'User Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your digital library platform</p>
        </div>
        <button
          onClick={() => { setEditingBook(null); setIsModalOpen(true); }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Add Book
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-neutral-800 p-1 rounded-2xl border border-slate-200 dark:border-neutral-700 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${tab === id ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {loadingStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AdminStatCard label="Total Books" value={stats?.totalBooks} icon={BookOpen} color="bg-indigo-500" />
              <AdminStatCard label="Total Users" value={stats?.totalUsers} icon={Users} color="bg-purple-500" />
              <AdminStatCard label="Total Downloads" value={stats?.totalDownloads} icon={Download} color="bg-emerald-500" />
              <AdminStatCard label="Total Reviews" value={stats?.totalReviews} icon={Star} color="bg-amber-500" />
            </div>
          )}

          {/* Top Downloaded */}
          {stats?.topDownloaded?.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 p-5">
              <h3 className="text-sm font-black mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-indigo-500" /> Top Downloaded Books</h3>
              <div className="space-y-2">
                {stats.topDownloaded.slice(0, 5).map((b, i) => (
                  <div key={b._id} className="flex items-center gap-3 py-1.5">
                    <span className="text-xs font-black text-slate-400 w-5">{i + 1}</span>
                    <div className="w-7 h-9 rounded-md overflow-hidden bg-indigo-100 flex-shrink-0">
                      {b.coverImage && <img src={b.coverImage} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{b.title}</p>
                      <p className="text-[10px] text-slate-400">{b.author}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{b.downloadCount} ↓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Genres */}
          {stats?.topGenres?.length > 0 && (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 p-5">
              <h3 className="text-sm font-black mb-4">Top Genres</h3>
              <div className="space-y-2">
                {stats.topGenres.slice(0, 8).map((g) => (
                  <div key={g.genre} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 dark:text-slate-300 w-28 truncate">{g.genre}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-neutral-700 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (g.count / (stats.topGenres[0]?.count || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── BOOKS TAB ── */}
      {tab === 'books' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchBooks()}
                placeholder="Search books..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button onClick={fetchBooks} className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">Search</button>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 overflow-hidden">
            {loadingBooks ? (
              <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-neutral-700">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Book</th>
                      <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Genre</th>
                      <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Views</th>
                      <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Downloads</th>
                      <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Flags</th>
                      <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">No books found. Click "Add Book" to add your first book.</td></tr>
                    ) : (
                      books.map((b) => (
                        <BookRow key={b._id} book={b} onEdit={(book) => { setEditingBook(book); setIsModalOpen(true); }} onDelete={handleDeleteBook} navigate={navigate} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── USERS TAB ── */}
      {tab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button onClick={fetchUsers} className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">Search</button>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-100 dark:border-neutral-700 overflow-hidden">
            {loadingUsers ? (
              <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-neutral-700">
                      <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
                      <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                      <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined</th>
                      <th className="px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-400">No users found.</td></tr>
                    ) : (
                      users.map((u) => (
                        <UserRow key={u._id} user={u} onRoleToggle={handleRoleToggle} onDelete={handleDeleteUser} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── REVIEWS TAB ── */}
      {tab === 'reviews' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={reviewSearch}
                onChange={(e) => setReviewSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchReviews()}
                placeholder="Search user reviews..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button onClick={fetchReviews} className="px-3 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700">Search</button>
          </div>

          {loadingReviews ? (
            <div className="flex items-center justify-center py-12"><Loader className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : reviews.length === 0 ? (
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700 p-12 text-center text-sm text-slate-400">
              No user reviews found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((r) => (
                <ReviewRow key={r._id} review={r} onDelete={handleDeleteReview} />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Book Modal */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBook(null); }}
        onSave={handleSaveBook}
        editingBook={editingBook}
      />
    </div>
  );
}
