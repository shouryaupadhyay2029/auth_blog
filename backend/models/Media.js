/* BlogAuth V1 models/Media.js — Media Upload Asset Tracker Model */
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: [true, 'Asset URL is required.']
    },
    publicId: {
      type: String,
      required: [true, 'Asset unique Public ID is required.']
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Asset must map to an active uploader user.']
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      default: null
    },
    isUsed: {
      type: Boolean,
      default: false
    },
    bytes: {
      type: Number
    },
    mimeType: {
      type: String
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    },
    format: {
      type: String
    },
    thumbnailUrl: {
      type: String
    },
    type: {
      type: String,
      enum: ['avatar', 'cover', 'inline', 'general'],
      default: 'general'
    },
    altText: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

mediaSchema.index({ article: 1 });
mediaSchema.index({ isUsed: 1 });
mediaSchema.index({ uploader: 1 });
mediaSchema.index({ type: 1 });
mediaSchema.index({ createdAt: -1 });

// Text index to support full text search on filename/publicId and url
mediaSchema.index({ publicId: 'text', url: 'text' });

const Media = mongoose.model('Media', mediaSchema);
module.exports = Media;
