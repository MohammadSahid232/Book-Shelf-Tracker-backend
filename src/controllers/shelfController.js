const UserBook = require('../models/userBookModel');
const Book = require('../models/bookModel');
const Achievement = require('../models/achievementModel');
const Notification = require('../models/notificationModel');

// ── Helper: unlock achievement ────────────────────────────────────────────────
const unlockAchievement = async (userId, type, metadata = {}) => {
  try {
    const existing = await Achievement.findOne({ user: userId, type });
    if (existing) return; // Already unlocked

    await Achievement.create({ user: userId, type, metadata });
    await Notification.create({
      user: userId,
      type: 'achievement_unlocked',
      title: '🏆 Achievement Unlocked!',
      message: `You earned the "${type.replace(/_/g, ' ')}" badge!`,
      data: { type },
    });
  } catch (_) {} // Non-blocking
};

// ── Helper: check + unlock achievements ───────────────────────────────────────
const checkAchievements = async (userId) => {
  const finished = await UserBook.countDocuments({ user: userId, status: 'finished' });
  const total = await UserBook.countDocuments({ user: userId });

  if (total >= 1) unlockAchievement(userId, 'first_book');
  if (finished >= 5) unlockAchievement(userId, 'books_5');
  if (finished >= 10) unlockAchievement(userId, 'books_10');
  if (finished >= 50) unlockAchievement(userId, 'books_50');
  if (finished >= 100) unlockAchievement(userId, 'books_100');
};

// GET /api/shelf — user's personal reading shelf
exports.getShelf = async (req, res) => {
  try {
    const { status, favorite } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (favorite === 'true') filter.favorite = true;

    const shelf = await UserBook.find(filter)
      .populate('book', 'title author genre coverImage totalPages pdfUrl epubUrl downloadAllowed averageRating description')
      .sort({ updatedAt: -1 })
      .lean();

    res.json(shelf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/shelf/:bookId — add book to shelf
exports.addToShelf = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const existing = await UserBook.findOne({ user: req.user.id, book: req.params.bookId });
    if (existing) return res.status(400).json({ message: 'Book already on your shelf' });

    const userBook = await UserBook.create({
      user: req.user.id,
      book: req.params.bookId,
      status: req.body.status || 'want to read',
    });

    await checkAchievements(req.user.id);
    res.status(201).json(userBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/shelf/:bookId — update reading progress/status
exports.updateShelf = async (req, res) => {
  try {
    const { status, currentPage, favorite, rating } = req.body;

    const userBook = await UserBook.findOne({ user: req.user.id, book: req.params.bookId });
    if (!userBook) return res.status(404).json({ message: 'Book not on your shelf' });

    const book = await Book.findById(req.params.bookId).lean();

    if (status !== undefined) userBook.status = status;
    if (currentPage !== undefined) {
      userBook.currentPage = currentPage;
      if (book?.totalPages > 0) {
        userBook.readingProgress = Math.min(100, Math.round((currentPage / book.totalPages) * 100));
      }
    }
    if (favorite !== undefined) userBook.favorite = favorite;
    if (rating !== undefined) userBook.rating = rating;
    userBook.lastReadAt = new Date();

    await userBook.save();
    await checkAchievements(req.user.id);

    res.json(userBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/shelf/:bookId — remove from shelf
exports.removeFromShelf = async (req, res) => {
  try {
    const result = await UserBook.findOneAndDelete({ user: req.user.id, book: req.params.bookId });
    if (!result) return res.status(404).json({ message: 'Book not on your shelf' });
    res.json({ message: 'Removed from shelf' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/shelf/stats — reading statistics for user dashboard
exports.getShelfStats = async (req, res) => {
  try {
    const uid = req.user.id;
    const all = await UserBook.find({ user: uid }).populate('book', 'totalPages genre').lean();

    const totalBooks = all.length;
    const finished = all.filter((b) => b.status === 'finished').length;
    const reading = all.filter((b) => b.status === 'reading').length;
    const wantToRead = all.filter((b) => b.status === 'want to read').length;
    const favorites = all.filter((b) => b.favorite).length;

    const totalPagesRead = all.reduce((sum, b) => sum + (b.currentPage || 0), 0);
    const ratedBooks = all.filter((b) => b.rating > 0);
    const avgRating = ratedBooks.length
      ? (ratedBooks.reduce((s, b) => s + b.rating, 0) / ratedBooks.length).toFixed(1)
      : '0.0';

    // Genre distribution
    const genreCounts = {};
    all.forEach((b) => {
      if (b.book?.genre) genreCounts[b.book.genre] = (genreCounts[b.book.genre] || 0) + 1;
    });
    const genreDistribution = Object.entries(genreCounts).map(([name, value]) => ({ name, value }));

    // Monthly books (current year)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = {};
    months.forEach((m) => (monthlyMap[m] = 0));
    all.forEach((b) => {
      if (b.finishedAt) {
        const m = months[new Date(b.finishedAt).getMonth()];
        monthlyMap[m]++;
      }
    });
    const monthlyStats = Object.entries(monthlyMap).map(([month, books]) => ({ month, books }));

    res.json({ totalBooks, finished, reading, wantToRead, favorites, totalPagesRead, avgRating, genreDistribution, monthlyStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
