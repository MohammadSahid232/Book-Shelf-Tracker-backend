const express = require('express');
const router = express.Router();
const discoverController = require('../controllers/discoverController');

// GET /api/discover/search?q=query - Search Google Books API
router.get('/search', discoverController.searchGoogleBooks);

module.exports = router;
