/* BlogAuth V1 models/Comment.js — Comment Schema model */
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must map to an active author user.']
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Comment must map to a target article.']
    },
    content: {
      type: String,
      required: [true, 'Comment content text is required.'],
      trim: true,
      maxlength: [1000, 'Comment content cannot exceed 1000 characters.']
    },
    likesCount: {
      type: Number,
      default: 0
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null // Null indicates root comment; non-null indicates threaded reply
    }
  },
  {
    timestamps: true
  }
);

// Indexes
commentSchema.index({ article: 1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
