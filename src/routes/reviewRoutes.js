const express = require('express');
const router = express.Router();
const c = require('../controllers/reviewController');

router.get('/:bookId', c.getReviews);                   // GET  /api/reviews/:bookId
router.post('/:bookId', c.createReview);                 // POST /api/reviews/:bookId
router.delete('/:reviewId', c.deleteReview);             // DELETE /api/reviews/:reviewId
router.post('/:reviewId/like', c.likeReview);            // POST /api/reviews/:reviewId/like
router.post('/:reviewId/reply', c.replyReview);          // POST /api/reviews/:reviewId/reply

module.exports = router;
