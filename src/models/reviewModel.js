const mongoose = require('mongoose');

/**
 * Review — book reviews and star ratings from users.
 */
const reviewSchema = new mongoose.Schema(
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
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      default: '',
      maxlength: 2000,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    replies: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// One review per user per book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
