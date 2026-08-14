const Book = require('../models/bookModel');
const User = require('../models/UserModel');
const UserBook = require('../models/userBookModel');
const Review = require('../models/reviewModel');
const Download = require('../models/downloadModel');
const Notification = require('../models/notificationModel');

// GET /api/admin/stats — platform-wide analytics
exports.getPlatformStats = async (req, res) => {
  try {
    const [totalBooks, totalUsers, totalReviews, totalDownloads] = await Promise.all([
      Book.countDocuments({ approved: true }),
      User.countDocuments(),
      Review.countDocuments(),
      Download.countDocuments(),
    ]);

    // Top downloaded books
    const topDownloaded = await Book.find({ approved: true })
      .sort({ downloadCount: -1 })
      .limit(10)
      .select('title author coverImage downloadCount viewCount averageRating')
      .lean();

    // Top genres
    const genreAgg = await Book.aggregate([
      { $match: { approved: true } },
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Books per month (this year)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const monthlyBooks = await Book.aggregate([
      { $match: { createdAt: { $gte: startOfYear }, approved: true } },
      { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalBooks,
      totalUsers,
      totalReviews,
      totalDownloads,
      topDownloaded,
      topGenres: genreAgg.map((g) => ({ genre: g._id, count: g.count })),
      monthlyBooks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/users — all users (paginated)
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search
      ? { $or: [{ first_name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/users/:id — change role or update user
exports.updateUser = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...(role && { role }) },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/admin/users/:id — remove user
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/books — all books with full stats
exports.getBooks = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = search ? { $text: { $search: search } } : {};

    const [books, total] = await Promise.all([
      Book.find(filter)
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean(),
      Book.countDocuments(filter),
    ]);

    res.json({ books, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/books — create a new library book (admin only, no user scoping)
exports.createBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      uploadedBy: req.user.id,
      approved: true,
      // Ensure no user scoping — this is a global library book
      user: null,
      userId: null,
    };

    // Parse tags if sent as comma-separated string
    if (typeof bookData.tags === 'string') {
      bookData.tags = bookData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // Auto compute reading progress
    if (bookData.totalPages > 0 && bookData.currentPage >= 0) {
      bookData.readingProgress = Math.min(
        100,
        Math.round((bookData.currentPage / bookData.totalPages) * 100)
      );
    }

    const newBook = await Book.create(bookData);
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/admin/books/:id — update any book (admin only)
exports.updateBook = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Parse tags if sent as comma-separated string
    if (typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.json(updatedBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/admin/books/:id — delete any book (admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ message: 'Book deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/notify-all — send notification to all users
exports.notifyAll = async (req, res) => {
  try {
    const { title, message, type = 'system' } = req.body;
    const users = await User.find({}, '_id').lean();
    await Notification.insertMany(
      users.map((u) => ({ user: u._id, type, title, message }))
    );
    res.json({ message: `Notification sent to ${users.length} users` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/reviews — get all user reviews with populated user and book details
exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await Review.find()
      .populate('user', 'first_name last_name email role avatar createdAt')
      .populate('book', 'title author coverImage genre')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Review.countDocuments();

    // Optional filter if search term provided
    let filtered = reviews;
    if (search) {
      const q = search.toLowerCase();
      filtered = reviews.filter(
        (r) =>
          r.user?.first_name?.toLowerCase().includes(q) ||
          r.user?.last_name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.book?.title?.toLowerCase().includes(q) ||
          r.text?.toLowerCase().includes(q)
      );
    }

    res.json({ reviews: filtered, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/reviews/:id — delete a review (admin moderation)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
