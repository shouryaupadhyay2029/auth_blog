/* BlogAuth V1 models/Bookmark.js — Bookmark Schema model */
const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Bookmark must map to an active user.']
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Bookmark must target a valid article.']
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring user can only bookmark an article once
bookmarkSchema.index({ user: 1, article: 1 }, { unique: true });
bookmarkSchema.index({ user: 1 });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
module.exports = Bookmark;
