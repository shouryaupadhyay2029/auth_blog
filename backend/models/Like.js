/* BlogAuth V1 models/Like.js — Like Schema model */
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Like must map to an active user.']
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Like must target a valid article.']
    }
  },
  {
    timestamps: true
  }
);

// Compound unique index ensuring user can only like an article once
likeSchema.index({ user: 1, article: 1 }, { unique: true });
likeSchema.index({ article: 1 });

const Like = mongoose.model('Like', likeSchema);
module.exports = Like;
