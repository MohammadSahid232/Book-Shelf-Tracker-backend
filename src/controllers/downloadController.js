const Download = require('../models/downloadModel');
const Book = require('../models/bookModel');

// POST /api/downloads/:bookId — track download and return file URL
exports.trackDownload = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (!book.downloadAllowed) {
      return res.status(403).json({ message: 'This book is not available for download' });
    }

    const format = req.body.format || 'pdf';
    const fileUrl = format === 'epub' ? book.epubUrl : book.pdfUrl;

    if (!fileUrl) {
      return res.status(404).json({ message: `No ${format.toUpperCase()} file available` });
    }

    // Track download
    await Download.create({
      user: req.user.id,
      book: book._id,
      format,
      ip: req.ip,
    });

    // Increment downloadCount on book
    await Book.findByIdAndUpdate(book._id, { $inc: { downloadCount: 1 } });

    res.json({ url: fileUrl, format, title: book.title });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/downloads — user's download history
exports.getDownloadHistory = async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user.id })
      .populate('book', 'title author genre coverImage')
      .sort({ downloadedAt: -1 })
      .limit(50)
      .lean();
    res.json(downloads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
