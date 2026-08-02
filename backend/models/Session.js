/* BlogAuth V1 models/Session.js — Session Schema model */
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Session must map to a user.']
    },
    token: {
      type: String,
      required: [true, 'Session token validation is required.'],
      unique: true
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    expiresAt: {
      type: Date,
      required: [true, 'Session expiration timing is required.']
    }
  },
  {
    timestamps: true
  }
);

// Indexes
sessionSchema.index({ user: 1 });
// TTL Index to automatically delete expired session documents from MongoDB
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;
