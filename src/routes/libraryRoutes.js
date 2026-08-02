const express = require('express');
const router = express.Router();
const c = require('../controllers/libraryController');
const verifyToken = require('../middlewares/VerifyToken');

// Optional auth — attach user if token present (for shelf status on detail page)
const optionalAuth = (req, res, next) => {
  const h = req.headers.authorization;
  if (h && h.startsWith('Bearer ')) {
    const jwt = require('jsonwebtoken');
    try {
      req.user = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET || 'supersecretkey');
    } catch (_) {}
  }
  next();
};

router.get('/home', c.getHomeSections);       // GET /api/library/home
router.get('/genres', c.getGenres);           // GET /api/library/genres
router.get('/search', c.searchBooks);         // GET /api/library/search?q=...
router.get('/', c.getLibrary);                // GET /api/library
router.get('/:id', optionalAuth, c.getBookDetail); // GET /api/library/:id

module.exports = router;
