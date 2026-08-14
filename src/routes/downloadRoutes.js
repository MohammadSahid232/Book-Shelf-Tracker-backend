const express = require('express');
const router = express.Router();
const c = require('../controllers/downloadController');
const verifyToken = require('../middlewares/VerifyToken');

router.post('/:bookId', verifyToken, c.trackDownload);     // POST /api/downloads/:bookId
router.get('/file/:bookId', c.downloadPdfFile);             // GET /api/downloads/file/:bookId (Public PDF download)
router.get('/stream/:bookId', c.streamPdf);                // GET /api/downloads/stream/:bookId (Public Reader PDF stream)
router.get('/', verifyToken, c.getDownloadHistory);         // GET /api/downloads

module.exports = router;
