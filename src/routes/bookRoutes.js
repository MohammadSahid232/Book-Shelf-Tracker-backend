const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const verifyToken = require('../middlewares/VerifyToken');
const isAdmin = require('../middlewares/isAdmin');

// GET /api/books/stats - Dashboard analytics (authenticated)
router.get('/stats', verifyToken, bookController.getBookStats);

// GET /api/books - Retrieve user's books with search, filter, sort (authenticated)
router.get('/', verifyToken, bookController.getAllBooks);

// GET /api/books/:id - Retrieve a single book (authenticated)
router.get('/:id', verifyToken, bookController.getBookById);

// POST /api/books - Create a new book (ADMIN ONLY)
router.post('/', verifyToken, isAdmin, bookController.createBook);

// PATCH /api/books/:id - Partial update (authenticated user, owns the book)
router.patch('/:id', verifyToken, bookController.updateBook);

// PUT /api/books/:id - Full update (authenticated user, owns the book)
router.put('/:id', verifyToken, bookController.updateBook);

// DELETE /api/books/:id - Delete a book (authenticated user, owns the book or admin)
router.delete('/:id', verifyToken, bookController.deleteBook);

module.exports = router;
