const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    genre: {
      type: String,
      default: 'General',
      trim: true,
      index: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    totalPages: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentPage: {
      type: Number,
      default: 0,
      min: 0,
    },
    readingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['want to read', 'reading', 'finished'],
      default: 'want to read',
      index: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    review: {
      type: String,
      default: '',
    },
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to compute reading progress %
bookSchema.pre('save', function (next) {
  if (this.totalPages > 0) {
    this.readingProgress = Math.min(
      100,
      Math.round((this.currentPage / this.totalPages) * 100)
    );
  } else if (this.status === 'finished') {
    this.readingProgress = 100;
  } else {
    this.readingProgress = 0;
  }
  next();
});

// Text index for fast search across title, author, and genre
bookSchema.index({ title: 'text', author: 'text', genre: 'text' });

module.exports = mongoose.model('Book', bookSchema);
