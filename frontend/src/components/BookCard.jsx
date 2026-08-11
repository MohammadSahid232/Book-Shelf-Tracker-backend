import React from 'react';
import { Star, Heart, BookOpen, Edit3, Trash2, NotebookPen } from 'lucide-react';

export default function BookCard({ book, onEdit, onDelete, onToggleFavorite, onStatusChange, onOpenNotes, isAdmin }) {
  const isFinished = book.status === 'finished';
  const progress = book.readingProgress || (book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : (isFinished ? 100 : 0));

  const statusColors = {
    'want to read': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-700 font-extrabold',
    'reading': 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700 font-extrabold',
    'finished': 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700 font-extrabold',
  };

  const statusLabels = {
    'want to read': 'Want to Read',
    'reading': 'Reading',
    'finished': 'Finished',
  };

  return (
    <div className="group relative bg-white dark:bg-neutral-800/90 rounded-2xl border border-slate-200/80 dark:border-neutral-700/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 flex flex-col justify-between overflow-hidden">
      <div>
        {/* Cover Image or Placeholder */}
        <div className="relative w-full h-48 rounded-xl bg-slate-100 dark:bg-neutral-700/40 overflow-hidden mb-3 border border-slate-200/60 dark:border-neutral-700/50 flex items-center justify-center">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-neutral-500">
              <BookOpen className="w-10 h-10 stroke-1" />
              <span className="text-[11px] font-semibold tracking-wide uppercase">No Cover</span>
            </div>
          )}

          {/* High-Visibility Single Color Genre Badge */}
          {book.genre && (
            <span className="absolute top-2.5 left-2.5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white rounded-lg shadow-md border border-indigo-400/40 backdrop-blur-md">
              {book.genre}
            </span>
          )}

          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite && onToggleFavorite(book._id || book.id, !book.favorite)}
            title={book.favorite ? 'Remove Favorite' : 'Mark as Favorite'}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 text-rose-500 hover:scale-110 transition-transform shadow-md border border-slate-200/60 dark:border-neutral-700 backdrop-blur-md"
          >
            <Heart className={`w-4 h-4 ${book.favorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-rose-500'}`} />
          </button>
        </div>

        {/* Book Details */}
        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
          by {book.author || 'Unknown Author'}
        </p>

        {/* Progress Bar & Status */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider ${statusColors[book.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {statusLabels[book.status] || book.status}
            </span>
            <span className="text-slate-700 dark:text-slate-300 font-extrabold">{progress}% Completed</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-neutral-700/60 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isFinished ? 'bg-emerald-500' : book.status === 'reading' ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {book.totalPages > 0 && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
              <span>Pages: {book.currentPage || 0} / {book.totalPages}</span>
            </p>
          )}
        </div>

        {/* Star Rating */}
        {book.rating > 0 && (
          <div className="flex items-center gap-1 mt-2.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= book.rating
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-200 dark:text-neutral-700'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">{book.rating}.0</span>
          </div>
        )}

        {/* Review snippet */}
        {book.review && (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 mt-2 pt-2 border-t border-slate-100 dark:border-neutral-700/60">
            "{book.review}"
          </p>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-neutral-700/60">
        <select
          value={book.status || 'want to read'}
          onChange={(e) => onStatusChange && onStatusChange(book._id || book.id, e.target.value)}
          className="text-xs font-bold bg-slate-100 dark:bg-neutral-700 border border-slate-300 dark:border-neutral-600 text-slate-800 dark:text-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="want to read">Want to Read</option>
          <option value="reading">Reading</option>
          <option value="finished">Finished</option>
        </select>

        <div className="flex items-center gap-1">
          {onOpenNotes && (
            <button
              onClick={() => onOpenNotes(book)}
              title="Open Notes"
              className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors"
            >
              <NotebookPen className="w-4 h-4" />
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(book)}
              title="Edit Book"
              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(book._id || book.id)}
              title="Delete Book"
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
