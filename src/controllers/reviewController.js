const Review = require('../models/reviewModel');
const Book = require('../models/bookModel');

// Helper: recalculate book's averageRating
const recalcRating = async (bookId) => {
  const reviews = await Review.find({ book: bookId }, 'rating').lean();
  if (!reviews.length) {
    await Book.findByIdAndUpdate(bookId, { averageRating: 0, reviewCount: 0 });
    return;
  }
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Book.findByIdAndUpdate(bookId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: reviews.length,
  });
};

// GET /api/reviews/:bookId — get all reviews for a book
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ book: req.params.bookId })
      .populate('user', 'first_name last_name avatar')
      .populate('replies.user', 'first_name last_name avatar')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/reviews/:bookId — create or update a review
exports.createReview = async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating) return res.status(400).json({ message: 'Rating is required' });

    const existing = await Review.findOne({ user: req.user.id, book: req.params.bookId });
    let review;

    if (existing) {
      existing.rating = rating;
      existing.text = text || '';
      review = await existing.save();
    } else {
      review = await Review.create({ user: req.user.id, book: req.params.bookId, rating, text: text || '' });
    }

    await recalcRating(req.params.bookId);
    review = await Review.findById(review._id).populate('user', 'first_name last_name avatar').lean();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/reviews/:reviewId — delete own review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const bookId = review.book;
    await review.deleteOne();
    await recalcRating(bookId);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/reviews/:reviewId/like — toggle like
exports.likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    const idx = review.likes.indexOf(req.user.id);
    if (idx === -1) {
      review.likes.push(req.user.id);
    } else {
      review.likes.splice(idx, 1);
    }
    await review.save();
    res.json({ likes: review.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/reviews/:reviewId/reply — add reply
exports.replyReview = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Reply text required' });
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.replies.push({ user: req.user.id, text });
    await review.save();
    res.json(review.replies[review.replies.length - 1]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
