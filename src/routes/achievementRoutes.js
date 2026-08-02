const express = require('express');
const router = express.Router();
const c = require('../controllers/achievementController');

router.get('/', c.getAchievements); // GET /api/achievements

module.exports = router;
