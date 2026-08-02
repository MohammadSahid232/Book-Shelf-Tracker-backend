const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    // ── Core Identity ──────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    subtitle: { type: String, default: '', trim: true },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    genre: { type: String, default: 'General', trim: true, index: true },
    language: { type: String, default: 'English', trim: true },
    publisher: { type: String, default: '', trim: true },
    publicationDate: { type: Date, default: null },
    isbn: { type: String, default: '', trim: true },
    description: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    readingLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Ages'],
      default: 'All Ages',
    },

    // ── Media ─────────────────────────────────────────────────
    coverImage: { type: String, default: '' },
    pdfUrl: { type: String, default: '' },
    epubUrl: { type: String, default: '' },

    // ── Catalog Fields ────────────────────────────────────────
    totalPages: { type: Number, default: 0, min: 0 },
    featured: { type: Boolean, default: false, index: true },
    downloadAllowed: { type: Boolean, default: false },
    downloadSize: { type: String, default: '' }, // e.g., "2.4 MB"

    // ── Stats (auto-updated) ──────────────────────────────────
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    // ── Admin / Ownership ────────────────────────────────────
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approved: { type: Boolean, default: true },

    // ── Legacy user-scoped fields (kept for backward compat) ──
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: {
      type: String,
      enum: ['want to read', 'reading', 'finished'],
      default: 'want to read',
    },
    currentPage: { type: Number, default: 0, min: 0 },
    readingProgress: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    review: { type: String, default: '' },
    favorite: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Pre-save: compute reading progress %
bookSchema.pre('save', function (next) {
  if (this.totalPages > 0 && this.currentPage >= 0) {
    this.readingProgress = Math.min(100, Math.round((this.currentPage / this.totalPages) * 100));
  } else if (this.status === 'finished') {
    this.readingProgress = 100;
  }
  next();
});

// Text index for full-text search
bookSchema.index({ title: 'text', author: 'text', genre: 'text', description: 'text', tags: 'text', isbn: 'text' });

module.exports = mongoose.model('Book', bookSchema);
