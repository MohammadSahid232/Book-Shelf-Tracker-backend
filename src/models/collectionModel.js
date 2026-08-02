const mongoose = require('mongoose');

/**
 * Collection — user-created reading lists / bookshelves.
 */
const collectionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 500 },
    coverImage: { type: String, default: '' },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    isPublic: { type: Boolean, default: false },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Collection', collectionSchema);
