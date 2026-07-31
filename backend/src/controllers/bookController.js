const Book = require('../models/bookModel');

// GET /api/books (optional ?status=finished filter, scoped by userId)
exports.getAllBooks = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) {
            query.status = status.toLowerCase();
        }
        // Scope to authenticated user if req.user is set
        if (req.user && req.user.id) {
            query.userId = req.user.id;
        }

        const books = await Book.find(query);
        res.status(200).json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json(book);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).json({ error: err.message });
    }
};

// POST /api/books
exports.createBook = async (req, res) => {
    try {
        const bookData = { ...req.body };
        if (req.user && req.user.id) {
            bookData.userId = req.user.id;
        }
        const newBook = await Book.create(bookData);
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PATCH /api/books/:id — update status or rating
exports.updateBook = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user && req.user.id && req.user.role !== 'admin') {
            query.userId = req.user.id;
        }
        const updatedBook = await Book.findOneAndUpdate(
            query,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
        res.status(200).json(updatedBook);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(400).json({ error: err.message });
    }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
    try {
        const query = { _id: req.params.id };
        if (req.user && req.user.id && req.user.role !== 'admin') {
            query.userId = req.user.id;
        }
        const book = await Book.findOneAndDelete(query);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.status(204).send();
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).json({ error: err.message });
    }
};
