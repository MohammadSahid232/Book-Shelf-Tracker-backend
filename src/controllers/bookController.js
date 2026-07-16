const Book = require('../models/bookModel');

// GET /api/books  (optional ?status=finished filter)
exports.getAllBooks = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) {
            query.status = status.toLowerCase();
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
        const newBook = await Book.create(req.body);
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// PATCH /api/books/:id  — update status or rating
exports.updateBook = async (req, res) => {
    try {
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
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
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });
        res.status(204).send();
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(500).json({ error: err.message });
    }
};
