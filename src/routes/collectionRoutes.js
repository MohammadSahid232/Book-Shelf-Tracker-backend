const express = require('express');
const router = express.Router();
const c = require('../controllers/collectionController');

router.get('/public', c.getPublicCollections);         // GET /api/collections/public
router.get('/', c.getCollections);                     // GET /api/collections
router.get('/:id', c.getCollectionById);               // GET /api/collections/:id
router.post('/', c.createCollection);                  // POST /api/collections
router.patch('/:id', c.updateCollection);              // PATCH /api/collections/:id
router.delete('/:id', c.deleteCollection);             // DELETE /api/collections/:id
router.post('/:id/books', c.addBook);                  // POST /api/collections/:id/books
router.delete('/:id/books/:bookId', c.removeBook);     // DELETE /api/collections/:id/books/:bookId

module.exports = router;
