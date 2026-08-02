/* BlogAuth V1 models/Report.js — Report Schema model */
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Report must be filed by a user.']
    },
    type: {
      type: String,
      enum: {
        values: ['article', 'comment'],
        message: 'Report target type must match article or comment.'
      },
      required: [true, 'Report target type specification is required.']
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Report target database ID is required.'],
      refPath: 'type' // Dynamic reference depending on target type
    },
    reason: {
      type: String,
      enum: {
        values: ['spam', 'harassment', 'rules', 'plagiarism', 'other'],
        message: 'Reason must match spam, harassment, rules, plagiarism, or other.'
      },
      required: [true, 'Report reason category is required.']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'resolved'],
        message: 'Status must match pending, reviewed, or resolved.'
      },
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Indexes
reportSchema.index({ status: 1 });
reportSchema.index({ targetId: 1 });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
