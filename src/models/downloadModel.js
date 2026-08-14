const mongoose = require('mongoose');

/**
 * Download — tracks book download history per user.
 */
const downloadSchema = new mongoose.Schema(
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
    format: {
      type: String,
      enum: ['pdf', 'epub'],
      default: 'pdf',
    },
    downloadedAt: { type: Date, default: Date.now },
    ip: { type: String, default: '' },
  },
  { timestamps: false }
);

downloadSchema.index({ user: 1, downloadedAt: -1 });

module.exports = mongoose.model('Download', downloadSchema);
