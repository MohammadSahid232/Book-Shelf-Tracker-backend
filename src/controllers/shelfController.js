const UserBook = require('../models/userBookModel');
const Book = require('../models/bookModel');
const Notification = require('../models/notificationModel');

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

// POST /api/shelf/add — add book by bookId or title
exports.addToShelf = async (req, res) => {
  try {
    let bookId = req.params.bookId || req.body.bookId;
    const { title, author, genre, description, status = 'want to read' } = req.body;

    let book;

    if (bookId && bookId !== 'undefined') {
      book = await Book.findById(bookId);
    }

    if (!book && title) {
      // Find existing book by title or create catalog entry
      book = await Book.findOne({ title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
      if (!book) {
        book = await Book.create({
          title,
          author: author || 'Unknown Author',
          genre: genre || 'General',
          description: description || '',
          coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
          pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          downloadAllowed: true,
          totalPages: 300,
          approved: true,
        });
      }
      bookId = book._id;
    }

    if (!book) return res.status(404).json({ message: 'Book not found' });

    const existing = await UserBook.findOne({ user: req.user.id, book: book._id });
    if (existing) {
      return res.status(200).json({ message: 'Book already on your shelf', userBook: existing });
    }

    const userBook = await UserBook.create({
      user: req.user.id,
      book: book._id,
      status,
    });

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
