/* BlogAuth V1 models/ReadingHistory.js — ReadingHistory Schema model */
const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reading history must map to a user.']
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Reading history must map to a targeted article.']
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0 // Scroll/reading percentage completion
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index for user/article unique reading records
readingHistorySchema.index({ user: 1, article: 1 }, { unique: true });
readingHistorySchema.index({ user: 1 });
readingHistorySchema.index({ lastReadAt: -1 });

const ReadingHistory = mongoose.model('ReadingHistory', readingHistorySchema);
module.exports = ReadingHistory;
