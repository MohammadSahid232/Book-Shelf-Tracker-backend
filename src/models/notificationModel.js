const mongoose = require('mongoose');

/**
 * Notification — in-app notifications for users.
 */
const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'book_added',
        'book_updated',
        'ai_recommendation',
        'goal_completed',
        'achievement_unlocked',
        'download_complete',
        'review_reply',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true, maxlength: 100 },
    message: { type: String, required: true, maxlength: 300 },
    read: { type: Boolean, default: false },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }, // linked bookId, achievementType, etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
