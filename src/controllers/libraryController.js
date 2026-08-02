const Book = require('../models/bookModel');
const UserBook = require('../models/userBookModel');

// ── Helper: Build Library Filter ──────────────────────────────────────────────
const buildFilter = (query) => {
  const { genre, language, rating, search, available, featured } = query;
  const filter = { approved: true };

  if (genre && genre !== 'all') filter.genre = { $regex: new RegExp(genre, 'i') };
  if (language && language !== 'all') filter.language = { $regex: new RegExp(language, 'i') };
  if (rating && Number(rating) > 0) filter.averageRating = { $gte: Number(rating) };
  if (available === 'true') filter.downloadAllowed = true;
  if (featured === 'true') filter.featured = true;

  if (search) {
    filter.$text = { $search: search };
  }

  return filter;
};

// GET /api/library — paginated public catalog + homepage sections
exports.getLibrary = async (req, res) => {
  try {
    const { page = 1, limit = 24, sortBy = 'createdAt', order = 'desc', ...rest } = req.query;
    const filter = buildFilter(rest);
    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [books, total] = await Promise.all([
      Book.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Book.countDocuments(filter),
    ]);

    res.json({
      books,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/library/home — curated homepage sections
exports.getHomeSections = async (req, res) => {
  try {
    const base = { approved: true };

    const [featured, newArrivals, trending, programming, fiction, selfHelp, sciFi, fantasy] =
      await Promise.all([
        Book.find({ ...base, featured: true }).sort({ createdAt: -1 }).limit(6).lean(),
        Book.find(base).sort({ createdAt: -1 }).limit(12).lean(),
        Book.find(base).sort({ viewCount: -1 }).limit(12).lean(),
        Book.find({ ...base, genre: { $regex: /programming/i } }).limit(8).lean(),
        Book.find({ ...base, genre: { $regex: /fiction/i } }).limit(8).lean(),
        Book.find({ ...base, genre: { $regex: /self.?help/i } }).limit(8).lean(),
        Book.find({ ...base, genre: { $regex: /sci.?fi|science fiction/i } }).limit(8).lean(),
        Book.find({ ...base, genre: { $regex: /fantasy/i } }).limit(8).lean(),
      ]);

    res.json({ featured, newArrivals, trending, programming, fiction, selfHelp, sciFi, fantasy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/library/search — full-text search with filters
exports.searchBooks = async (req, res) => {
  try {
    const { q, genre, language, rating, available, sortBy = 'score', page = 1, limit = 20 } = req.query;
    if (!q && !genre && !language) {
      return res.json({ books: [], total: 0 });
    }

    const filter = buildFilter({ genre, language, rating, available, search: q });
    const skip = (Number(page) - 1) * Number(limit);

    const sortOption = q ? { score: { $meta: 'textScore' } } : { [sortBy]: -1 };

    const [books, total] = await Promise.all([
      Book.find(filter, q ? { score: { $meta: 'textScore' } } : {})
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Book.countDocuments(filter),
    ]);

    res.json({ books, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/library/:id — single book detail (increments view count)
exports.getBookDetail = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    ).lean();

    if (!book) return res.status(404).json({ message: 'Book not found' });

    // If user is logged in, check their shelf status
    let userBook = null;
    if (req.user?.id) {
      userBook = await UserBook.findOne({ user: req.user.id, book: book._id }).lean();
    }

    res.json({ book, userBook });
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Book not found' });
    res.status(500).json({ error: err.message });
  }
};

// GET /api/library/genres — distinct genres in catalog
exports.getGenres = async (req, res) => {
  try {
    const genres = await Book.distinct('genre', { approved: true });
    res.json(genres.filter(Boolean).sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
