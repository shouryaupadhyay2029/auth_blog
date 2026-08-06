/* BlogAuth V1 models/ArticleVersion.js — Revision History Schema model */
const mongoose = require('mongoose');

const articleVersionSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Version must link to an article.']
    },
    editor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Version must record the editor.']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    excerpt: {
      type: String,
      default: ''
    },
    coverImage: {
      type: String,
      default: ''
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
      }
    ],
    summary: {
      type: String,
      default: 'Revision update'
    },
    changedFields: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

articleVersionSchema.index({ article: 1, createdAt: -1 });

const ArticleVersion = mongoose.model('ArticleVersion', articleVersionSchema);
module.exports = ArticleVersion;
