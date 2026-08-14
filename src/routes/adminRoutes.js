const express = require('express');
const router = express.Router();
const c = require('../controllers/adminController');
const authorizeRoles = require('../middlewares/authorization');

// All routes require admin role (verifyToken applied in app.js)
router.use(authorizeRoles('admin'));

router.get('/stats', c.getPlatformStats);          // GET /api/admin/stats
router.get('/users', c.getUsers);                  // GET /api/admin/users
router.patch('/users/:id', c.updateUser);           // PATCH /api/admin/users/:id
router.delete('/users/:id', c.deleteUser);          // DELETE /api/admin/users/:id
router.get('/books', c.getBooks);                   // GET /api/admin/books
router.post('/books', c.createBook);                // POST /api/admin/books
router.patch('/books/:id', c.updateBook);           // PATCH /api/admin/books/:id
router.delete('/books/:id', c.deleteBook);          // DELETE /api/admin/books/:id
router.get('/reviews', c.getReviews);               // GET /api/admin/reviews
router.delete('/reviews/:id', c.deleteReview);      // DELETE /api/admin/reviews/:id
router.post('/notify-all', c.notifyAll);            // POST /api/admin/notify-all

module.exports = router;

