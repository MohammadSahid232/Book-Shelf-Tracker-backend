const express = require('express');
const router = express.Router();
const c = require('../controllers/shelfController');

router.get('/stats', c.getShelfStats);          // GET /api/shelf/stats
router.get('/', c.getShelf);                    // GET /api/shelf
router.post('/:bookId', c.addToShelf);          // POST /api/shelf/:bookId
router.patch('/:bookId', c.updateShelf);        // PATCH /api/shelf/:bookId
router.delete('/:bookId', c.removeFromShelf);   // DELETE /api/shelf/:bookId

module.exports = router;
