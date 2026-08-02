const express = require('express');
const router = express.Router();
const c = require('../controllers/bookmarkController');

router.get('/all', c.getAllBookmarks);         // GET /api/bookmarks/all
router.get('/:bookId', c.getBookmarks);        // GET /api/bookmarks/:bookId
router.post('/', c.createBookmark);            // POST /api/bookmarks
router.delete('/:id', c.deleteBookmark);       // DELETE /api/bookmarks/:id

module.exports = router;
