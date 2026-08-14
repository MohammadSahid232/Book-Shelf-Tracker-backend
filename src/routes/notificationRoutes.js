const express = require('express');
const router = express.Router();
const c = require('../controllers/notificationController');

router.get('/', c.getNotifications);                     // GET /api/notifications
router.patch('/read-all', c.markAllRead);                // PATCH /api/notifications/read-all
router.patch('/:id/read', c.markRead);                   // PATCH /api/notifications/:id/read
router.delete('/:id', c.deleteNotification);             // DELETE /api/notifications/:id

module.exports = router;
