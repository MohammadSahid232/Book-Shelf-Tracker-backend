import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import {
  Search,
  Filter,
  ArrowUpDown,
  Grid,
  List,
  Plus,
  BookOpen,
  Star,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BooksPage() {
  const { getAuthHeaders, BACKEND_URL, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Sort State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('0');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (genreFilter !== 'all') params.append('genre', genreFilter);
      if (ratingFilter !== '0') params.append('rating', ratingFilter);
      if (search) params.append('search', search);
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('order', sortOrder);

      const response = await axios.get(`${BACKEND_URL}/api/books?${params.toString()}`, { headers });
      setBooks(response.data || []);
    } catch (err) {
      console.error('Failed to fetch books:', err);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [statusFilter, genreFilter, ratingFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  const handleSaveBook = async (formData) => {
    try {
      const headers = getAuthHeaders();
      if (editingBook) {
        await axios.patch(`${BACKEND_URL}/api/books/${editingBook._id || editingBook.id}`, formData, { headers });
        toast.success('Book updated! 🎉');
      } else {
        await axios.post(`${BACKEND_URL}/api/books`, formData, { headers });
        toast.success('Book added to library! 📚');
      }
      setIsModalOpen(false);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving book');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book from your library?')) return;
    try {
      const headers = getAuthHeaders();
      await axios.delete(`${BACKEND_URL}/api/books/${id}`, { headers });
      toast.success('Book deleted');
      fetchBooks();
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  const handleToggleFavorite = async (id, favorite) => {
    try {
      const headers = getAuthHeaders();
      await axios.patch(`${BACKEND_URL}/api/books/${id}`, { favorite }, { headers });
      fetchBooks();
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const headers = getAuthHeaders();
      await axios.patch(`${BACKEND_URL}/api/books/${id}`, { status: newStatus }, { headers });
      toast.success(`Moved to ${newStatus}`);
      fetchBooks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            My Digital Library
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, rate, and manage your complete book collection.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBook(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add New Book
        </button>
      </div>

      {/* Control Bar: Search, Filters, Sort & View Mode */}
      <div className="bg-white dark:bg-neutral-800/90 border border-slate-200/80 dark:border-neutral-700/80 rounded-2xl p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Title, Author, or Genre..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold bg-slate-900 text-white dark:bg-neutral-700 hover:bg-slate-800 rounded-xl transition-all"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-neutral-700/60">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 px-3 py-1.5 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="want to read">Want to Read</option>
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
              </select>
            </div>

            {/* Genre Filter */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 px-3 py-1.5 rounded-xl text-xs">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Genres</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 px-3 py-1.5 rounded-xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="createdAt">Date Added</option>
                <option value="title">Title</option>
                <option value="rating">Rating</option>
                <option value="readingProgress">Progress %</option>
              </select>
            </div>
          </div>

          {/* View Toggle (Grid / List) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl border border-slate-200 dark:border-neutral-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white dark:bg-neutral-800 text-blue-600 shadow-xs' : 'text-slate-400'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list' ? 'bg-white dark:bg-neutral-800 text-blue-600 shadow-xs' : 'text-slate-400'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Books Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-200 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white dark:bg-neutral-800/90 rounded-3xl p-12 text-center border border-slate-200 dark:border-neutral-700">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-white">No Books Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filter selection to find what you're looking for.
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
              : 'space-y-3'
          }
        >
          {books.map((book) => (
            <BookCard
              key={book._id || book.id}
              book={book}
              isAdmin={user?.role === 'admin'}
              onEdit={(b) => {
                setEditingBook(b);
                setIsModalOpen(true);
              }}
              onDelete={handleDeleteBook}
              onToggleFavorite={handleToggleFavorite}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Book Modal */}
      <BookModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBook(null);
        }}
        onSave={handleSaveBook}
        editingBook={editingBook}
      />
    </div>
  );
}
