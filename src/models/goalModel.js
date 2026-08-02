const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'Reading Goal',
    },
    type: {
      type: String,
      enum: ['books', 'pages', 'daily'],
      default: 'books',
    },
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    current: {
      type: Number,
      default: 0,
      min: 0,
    },
    period: {
      type: String,
      enum: ['yearly', 'monthly', 'weekly', 'custom'],
      default: 'yearly',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'expired'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Goal', goalSchema);
