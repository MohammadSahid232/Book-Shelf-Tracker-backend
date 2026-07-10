const BookModel = require('../models/bookModel');

// GET /api/books  (optional ?status=finished filter)
exports.getAllBooks = (req, res) => {
    const { status } = req.query;
    const books = BookModel.getAll(status);
    res.status(200).json(books);
};

// GET /api/books/:id
exports.getBookById = (req, res) => {
    const id = parseInt(req.params.id);
    const book = BookModel.getById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(book);
};

// POST /api/books
exports.createBook = (req, res) => {
    const newBook = BookModel.create(req.body);
    res.status(201).json(newBook);
};

// PATCH /api/books/:id  — update status or rating
exports.updateBook = (req, res) => {
    const id = parseInt(req.params.id);
    const updatedBook = BookModel.update(id, req.body);
    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(updatedBook);
};

// DELETE /api/books/:id
exports.deleteBook = (req, res) => {
    const id = parseInt(req.params.id);
    const success = BookModel.delete(id);
    if (!success) return res.status(404).json({ message: 'Book not found' });
    res.status(204).send();
};
