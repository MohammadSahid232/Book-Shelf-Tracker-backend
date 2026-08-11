import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  BookOpen, Download, Heart, Star, Plus, Share2, ArrowLeft,
  Eye, Clock, Globe, Building, Tag, Bookmark, FileText,
  CheckCircle, ChevronDown, ChevronUp, Loader
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── Star Rating ───────────────────────────────────────────────────────────────
const StarRating = ({ value, onChange, size = 'sm' }) => {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button"
          onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
          onClick={() => onChange && onChange(s)}
          className="focus:outline-none"
        >
          <Star className={`${sz} transition-colors ${(hovered || value) >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-neutral-600'}`} />
        </button>
      ))}
    </div>
  );
};

// ── Review Card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review }) => (
  <div className="bg-slate-50 dark:bg-neutral-800/60 rounded-2xl p-4 border border-slate-100 dark:border-neutral-700/50">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
          {review.user?.first_name?.[0] || '?'}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            {review.user?.first_name} {review.user?.last_name}
          </p>
          <p className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      <StarRating value={review.rating} />
    </div>
    {review.text && <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">{review.text}</p>}
    <div className="flex items-center gap-2 mt-2">
      <span className="text-[10px] text-slate-400">👍 {review.likes?.length || 0} helpful</span>
    </div>
  </div>
);

// ── Main Book Detail Page ─────────────────────────────────────────────────────
export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAuthHeaders, BACKEND_URL, user } = useAuth();

  const [book, setBook] = useState(null);
  const [userBook, setUserBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [myRating, setMyRating] = useState(0);
  const [myReview, setMyReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [onShelf, setOnShelf] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      const [detailRes, reviewRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/library/${id}`, { headers }),
        axios.get(`${BACKEND_URL}/api/reviews/${id}`, { headers }),
      ]);
      setBook(detailRes.data.book);
      setUserBook(detailRes.data.userBook);
      setOnShelf(!!detailRes.data.userBook);
      setReviews(reviewRes.data);

      // Pre-fill own review
      const mine = reviewRes.data.find((r) => r.user?._id === user?.id);
      if (mine) { setMyRating(mine.rating); setMyReview(mine.text || ''); }
    } catch (err) {
      toast.error('Book not found');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  }, [id, BACKEND_URL]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddShelf = async (status = 'want to read') => {
    try {
      const headers = getAuthHeaders();
      if (onShelf) {
        await axios.patch(`${BACKEND_URL}/api/shelf/${id}`, { status }, { headers });
        toast.success(`Status updated to "${status}"`);
      } else {
        await axios.post(`${BACKEND_URL}/api/shelf/${id}`, { status }, { headers });
        setOnShelf(true);
        toast.success('Added to your shelf! 📚');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDownload = async (format = 'pdf') => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('token') || '';
      window.open(`${BACKEND_URL}/api/downloads/file/${id}.pdf?token=${token}`, '_blank');
      toast.success(`Downloading ${book.title} (PDF)`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!myRating) return toast.error('Please select a rating');
    setSubmittingReview(true);
    try {
      await axios.post(`${BACKEND_URL}/api/reviews/${id}`, { rating: myRating, text: myReview }, { headers: getAuthHeaders() });
      toast.success('Review submitted! ⭐');
      fetchData();
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 flex items-center justify-center">
        <Loader className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!book) return null;

  const desc = book.description || 'No description available.';
  const shortDesc = desc.length > 400 ? desc.slice(0, 400) + '...' : desc;
  const hasPdf = true;
  const hasEpub = !!book.epubUrl;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 text-slate-900 dark:text-white">
      <div className="max-w-5xl mx-auto p-4 md:p-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Library
        </button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Cover + Actions */}
          <div className="md:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[3/4] bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40"
            >
              {book.coverImage ? (
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-indigo-300">
                  <BookOpen className="w-20 h-20 stroke-1" />
                </div>
              )}
              {book.featured && (
                <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-lg">★ FEATURED</div>
              )}
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-2.5 text-center border border-slate-100 dark:border-neutral-700">
                <Eye className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{book.viewCount || 0}</p>
                <p className="text-[9px] text-slate-400">Views</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-2.5 text-center border border-slate-100 dark:border-neutral-700">
                <Download className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{book.downloadCount || 0}</p>
                <p className="text-[9px] text-slate-400">Downloads</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-2.5 text-center border border-slate-100 dark:border-neutral-700">
                <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{book.averageRating || '—'}</p>
                <p className="text-[9px] text-slate-400">Rating</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl p-2.5 text-center border border-slate-100 dark:border-neutral-700">
                <FileText className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{book.totalPages || '—'}</p>
                <p className="text-[9px] text-slate-400">Pages</p>
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 space-y-5"
          >
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">{book.genre}</span>
                {book.language && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">{book.language}</span>}
                {book.readingLevel && <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">{book.readingLevel}</span>}
              </div>
              <h1 className="text-2xl md:text-3xl font-black leading-tight">{book.title}</h1>
              {book.subtitle && <p className="text-base text-slate-500 dark:text-slate-400 mt-1">{book.subtitle}</p>}
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">by {book.author}</p>

              {book.averageRating > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={Math.round(book.averageRating)} />
                  <span className="text-sm font-bold">{book.averageRating}</span>
                  <span className="text-xs text-slate-400">({book.reviewCount} reviews)</span>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2">
              {hasPdf && (
                <button
                  onClick={() => navigate(`/read/${book._id}`)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/30"
                >
                  <BookOpen className="w-4 h-4" /> Read Now
                </button>
              )}
              {hasPdf && (
                <button
                  onClick={() => handleDownload('pdf')}
                  disabled={downloading}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" /> {downloading ? 'Loading…' : 'Download PDF'}
                </button>
              )}
              {book.downloadAllowed && hasEpub && (
                <button
                  onClick={() => handleDownload('epub')}
                  disabled={downloading}
                  className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-bold rounded-2xl text-sm flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" /> EPUB
                </button>
              )}
              <button
                onClick={() => handleAddShelf()}
                className={`px-5 py-2.5 font-bold rounded-2xl text-sm flex items-center gap-2 transition-colors border ${onShelf ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border-indigo-300' : 'bg-white dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-700 hover:border-indigo-400'}`}
              >
                {onShelf ? <CheckCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {onShelf ? 'On Shelf' : 'Add to Shelf'}
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="p-2.5 bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-2xl text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-neutral-800/80 rounded-2xl p-4 border border-slate-100 dark:border-neutral-700">
              <h3 className="text-sm font-black mb-2">About this Book</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {descExpanded ? desc : shortDesc}
              </p>
              {desc.length > 400 && (
                <button onClick={() => setDescExpanded(!descExpanded)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 mt-2">
                  {descExpanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                </button>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {book.publisher && <div><span className="text-slate-400 flex items-center gap-1"><Building className="w-3 h-3" /> Publisher</span><p className="font-semibold mt-0.5">{book.publisher}</p></div>}
              {book.isbn && <div><span className="text-slate-400 flex items-center gap-1"><Tag className="w-3 h-3" /> ISBN</span><p className="font-semibold mt-0.5">{book.isbn}</p></div>}
              {book.publicationDate && <div><span className="text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Published</span><p className="font-semibold mt-0.5">{new Date(book.publicationDate).getFullYear()}</p></div>}
              {book.language && <div><span className="text-slate-400 flex items-center gap-1"><Globe className="w-3 h-3" /> Language</span><p className="font-semibold mt-0.5">{book.language}</p></div>}
            </div>

            {/* Tags */}
            {book.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {book.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 rounded-full font-semibold">#{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-10 space-y-5">
          <h2 className="text-lg font-black">Reviews & Ratings</h2>

          {/* Write Review */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-slate-100 dark:border-neutral-700">
            <h3 className="text-sm font-bold mb-3">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <StarRating value={myRating} onChange={setMyRating} size="lg" />
              <textarea
                value={myReview}
                onChange={(e) => setMyReview(e.target.value)}
                placeholder="Share your thoughts about this book..."
                rows={3}
                className="w-full text-sm px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              <button type="submit" disabled={submittingReview || !myRating}
                className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {submittingReview ? <Loader className="w-3.5 h-3.5 animate-spin" /> : null}
                Submit Review
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No reviews yet. Be the first!</p>
            ) : (
              reviews.map((r) => <ReviewCard key={r._id} review={r} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
