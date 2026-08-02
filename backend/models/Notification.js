/* BlogAuth V1 models/Notification.js — Notification Schema model */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must target a recipient user.']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification must register a triggering sender user.']
    },
    type: {
      type: String,
      enum: {
        values: ['like', 'comment', 'reply', 'follow'],
        message: 'Notification type must match like, comment, reply, or follow.'
      },
      required: [true, 'Notification type definition is required.']
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// High-speed indices
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
