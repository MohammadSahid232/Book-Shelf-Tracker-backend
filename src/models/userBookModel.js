const mongoose = require('mongoose');

/**
 * UserBook — user's personal reading shelf entry.
 * Links a User to a global Book from the library.
 */
const userBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    status: {
      type: String,
      enum: ['want to read', 'reading', 'finished', 'archived'],
      default: 'want to read',
      index: true,
    },
    currentPage: { type: Number, default: 0, min: 0 },
    readingProgress: { type: Number, default: 0, min: 0, max: 100 },
    favorite: { type: Boolean, default: false },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    startedAt: { type: Date, default: null },
    finishedAt: { type: Date, default: null },
    totalReadingTime: { type: Number, default: 0 }, // minutes
    lastReadAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Each user can only have one shelf entry per book
userBookSchema.index({ user: 1, book: 1 }, { unique: true });

// Auto-compute progress
userBookSchema.pre('save', function (next) {
  if (this.status === 'finished') {
    this.readingProgress = 100;
    if (!this.finishedAt) this.finishedAt = new Date();
  }
  if (this.status === 'reading' && !this.startedAt) {
    this.startedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('UserBook', userBookSchema);
