const express = require('express');
const router = express.Router();
const c = require('../controllers/adminController');
const isAdmin = require('../middlewares/isAdmin');

// All routes require admin role (verifyToken applied in app.js)
router.use(isAdmin);

router.get('/stats', c.getPlatformStats);          // GET /api/admin/stats
router.get('/users', c.getUsers);                  // GET /api/admin/users
router.patch('/users/:id', c.updateUser);           // PATCH /api/admin/users/:id
router.delete('/users/:id', c.deleteUser);          // DELETE /api/admin/users/:id
router.get('/books', c.getBooks);                   // GET /api/admin/books
router.post('/notify-all', c.notifyAll);            // POST /api/admin/notify-all

module.exports = router;
