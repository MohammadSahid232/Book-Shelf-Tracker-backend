const mongoose = require('mongoose');

/**
 * Achievement — user badges and milestones.
 */
const ACHIEVEMENT_TYPES = [
  'first_book',         // Added first book to shelf
  'books_5',            // 5 books finished
  'books_10',           // 10 books finished
  'books_50',           // 50 books finished
  'books_100',          // 100 books finished
  'pages_1000',         // 1,000 pages read
  'pages_5000',         // 5,000 pages read
  'streak_7',           // 7-day reading streak
  'streak_30',          // 30-day reading streak
  'streak_100',         // 100-day reading streak
  'top_reviewer',       // Written 10+ reviews
  'book_collector',     // 5+ collections created
  'early_bird',         // Reading before 7am
  'night_owl',          // Reading after midnight
  'speed_reader',       // Finished a book in under 24h
];

const achievementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ACHIEVEMENT_TYPES,
      required: true,
    },
    unlockedAt: { type: Date, default: Date.now },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }, // extra context
  },
  { timestamps: false }
);

achievementSchema.index({ user: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Achievement', achievementSchema);
module.exports.ACHIEVEMENT_TYPES = ACHIEVEMENT_TYPES;
