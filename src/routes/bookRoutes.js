const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// GET /api/books/stats - Dashboard analytics
router.get('/stats', bookController.getBookStats);

// GET /api/books - Retrieve user's books (with search, filter, sort)
router.get('/', bookController.getAllBooks);

// GET /api/books/:id - Retrieve a single book
router.get('/:id', bookController.getBookById);

// POST /api/books - Create a new book
router.post('/', bookController.createBook);

// PATCH /api/books/:id - Partial update
router.patch('/:id', bookController.updateBook);

// PUT /api/books/:id - Full update
router.put('/:id', bookController.updateBook);

// DELETE /api/books/:id - Delete a book
router.delete('/:id', bookController.deleteBook);

module.exports = router;
