const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// POST /api/ai/recommend - Generate Gemini AI book recommendations
router.post('/recommend', aiController.getRecommendations);

// GET /api/ai/insights - Generate AI reading habits and speed insights
router.get('/insights', aiController.getInsights);

module.exports = router;
