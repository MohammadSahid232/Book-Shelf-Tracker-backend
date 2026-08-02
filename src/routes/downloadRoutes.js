const express = require('express');
const router = express.Router();
const c = require('../controllers/downloadController');

router.post('/:bookId', c.trackDownload);   // POST /api/downloads/:bookId
router.get('/', c.getDownloadHistory);       // GET /api/downloads

module.exports = router;
