const Bookmark = require('../models/bookmarkModel');

// GET /api/bookmarks/:bookId
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id, book: req.params.bookId }).sort({ page: 1 }).lean();
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/bookmarks
exports.createBookmark = async (req, res) => {
  try {
    const { bookId, page, label, note, color } = req.body;
    if (!bookId || !page) return res.status(400).json({ message: 'bookId and page are required' });

    const bookmark = await Bookmark.create({ user: req.user.id, book: bookId, page, label, note, color });
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/bookmarks/:id
exports.deleteBookmark = async (req, res) => {
  try {
    const bm = await Bookmark.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!bm) return res.status(404).json({ message: 'Bookmark not found' });
    res.json({ message: 'Bookmark deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/bookmarks/all — all user bookmarks (across books)
exports.getAllBookmarks = async (req, res) => {
  try {
    const bms = await Bookmark.find({ user: req.user.id })
      .populate('book', 'title author coverImage')
      .sort({ createdAt: -1 })
      .lean();
    res.json(bms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
