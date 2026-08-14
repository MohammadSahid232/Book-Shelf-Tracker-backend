const mongoose = require('mongoose');

/**
 * Bookmark — saved reading positions inside a book.
 */
const bookmarkSchema = new mongoose.Schema(
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
    page: { type: Number, required: true, min: 1 },
    label: { type: String, default: '', maxlength: 100 },
    note: { type: String, default: '', maxlength: 500 },
    color: { type: String, default: '#f59e0b' }, // highlight color
  },
  { timestamps: true }
);

bookmarkSchema.index({ user: 1, book: 1 });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
