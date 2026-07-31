const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { bookRules, validate } = require('../validators/bookValidators');

// NOTE: verifyToken is already applied globally in app.js for /api/books — no need to reapply here.

// GET /api/books - Retrieve user's books (with optional ?status=finished filter)
router.get('/', bookController.getAllBooks);

// GET /api/books/:id - Retrieve a book by id
router.get('/:id', bookController.getBookById);

// POST /api/books - Create a new book with input validation (title required)
router.post('/', bookRules, validate, bookController.createBook);

// PATCH /api/books/:id - Update status or rating
router.patch('/:id', bookRules, validate, bookController.updateBook);

// DELETE /api/books/:id - Delete a book
router.delete('/:id', bookController.deleteBook);

module.exports = router;
