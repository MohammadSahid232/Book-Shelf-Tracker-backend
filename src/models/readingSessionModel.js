const mongoose = require('mongoose');

/**
 * ReadingSession — tracks individual reading sessions for analytics.
 */
const readingSessionSchema = new mongoose.Schema(
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
    startPage: { type: Number, default: 0 },
    endPage: { type: Number, default: 0 },
    pagesRead: { type: Number, default: 0 },
    duration: { type: Number, default: 0 }, // minutes
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    device: { type: String, default: 'web' },
  },
  { timestamps: false }
);

readingSessionSchema.index({ user: 1, startedAt: -1 });

module.exports = mongoose.model('ReadingSession', readingSessionSchema);
