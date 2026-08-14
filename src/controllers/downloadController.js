const axios = require('axios');
const fs = require('fs');
const Download = require('../models/downloadModel');
const Book = require('../models/bookModel');

// POST /api/downloads/:bookId — track download and return file URL
exports.trackDownload = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (!book.pdfUrl) {
      return res.status(400).json({ message: 'PDF download is not available for this book.' });
    }

    const format = req.body.format || 'pdf';
    const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
    const downloadUrl = `${BACKEND_URL}/api/downloads/file/${book._id}.pdf`;

    if (req.user && req.user.id) {
      await Download.create({
        user: req.user.id,
        book: book._id,
        format,
        ip: req.ip,
      });
    }

    await Book.findByIdAndUpdate(book._id, { $inc: { downloadCount: 1 } });

    res.json({ url: downloadUrl, format, title: book.title, pdfUrl: book.pdfUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/downloads/file/:bookId — stream/download original PDF file
exports.downloadPdfFile = async (req, res) => {
  try {
    let bookId = req.params.bookId;
    if (bookId && bookId.endsWith('.pdf')) {
      bookId = bookId.slice(0, -4);
    }

    const book = await Book.findById(bookId);
    if (!book || !book.pdfUrl) {
      return res.status(404).json({ message: 'PDF file unavailable for this book.' });
    }

    const cleanTitle = (book.title || 'Book').replace(/[^a-zA-Z0-9 _-]/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cleanTitle}.pdf"`);

    if (book.pdfUrl.startsWith('http')) {
      try {
        const response = await axios.get(book.pdfUrl, {
          responseType: 'stream',
          timeout: 12000,
          headers: {
            'User-Agent': 'BookShelfTracker/1.0',
            Accept: 'application/pdf,*/*',
          },
        });
        return response.data.pipe(res);
      } catch (streamErr) {
        console.error('Download stream error:', streamErr.message);
        return res.status(502).json({ message: `Unable to download PDF from URL: ${book.pdfUrl}` });
      }
    } else if (fs.existsSync(book.pdfUrl)) {
      return fs.createReadStream(book.pdfUrl).pipe(res);
    } else {
      return res.status(404).json({ message: `PDF file not found at path: ${book.pdfUrl}` });
    }
  } catch (err) {
    console.error('PDF download error:', err.message);
    res.status(500).json({ message: 'Failed to download PDF file', error: err.message });
  }
};

// GET /api/downloads/stream/:bookId — stream original PDF for reader access (no CORS/frame issues)
exports.streamPdf = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book || !book.pdfUrl) {
      return res.status(404).json({ message: 'PDF reading is not available for this book.' });
    }

    res.removeHeader('X-Frame-Options');
    res.removeHeader('Content-Security-Policy');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="book.pdf"');

    if (book.pdfUrl.startsWith('http')) {
      try {
        const response = await axios.get(book.pdfUrl, {
          responseType: 'stream',
          timeout: 12000,
          headers: {
            'User-Agent': 'BookShelfTracker/1.0',
            Accept: 'application/pdf,*/*',
          },
        });
        return response.data.pipe(res);
      } catch (streamErr) {
        console.error('Stream PDF error:', streamErr.message);
        return res.status(502).json({ message: `Unable to stream PDF from URL: ${book.pdfUrl}` });
      }
    } else if (fs.existsSync(book.pdfUrl)) {
      return fs.createReadStream(book.pdfUrl).pipe(res);
    } else {
      return res.status(404).json({ message: `PDF file not found at path: ${book.pdfUrl}` });
    }
  } catch (err) {
    console.error('PDF stream error:', err.message);
    res.status(500).json({ message: 'Unable to stream PDF', error: err.message });
  }
};

// GET /api/downloads — user's download history
exports.getDownloadHistory = async (req, res) => {
  try {
    const downloads = await Download.find({ user: req.user.id })
      .populate('book', 'title author genre coverImage pdfUrl')
      .sort({ downloadedAt: -1 })
      .limit(50)
      .lean();
    res.json(downloads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
