/* BlogAuth V1 models/Article.js — Article Schema model */
const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required.'],
      trim: true,
      minlength: [5, 'Title must contain at least 5 characters.'],
      maxlength: [120, 'Title cannot exceed 120 characters.']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Article content block is required.']
    },
    excerpt: {
      type: String,
      required: [true, 'Article summary excerpt is required.'],
      maxlength: [400, 'Excerpt cannot exceed 400 characters.']
    },
    coverImage: {
      type: String,
      default: '' // Cloudinary URL pointer
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article must map to an active author.']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Article must map to a classification category.']
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tag'
      }
    ],
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: 'Status must match draft, published, or archived.'
      },
      default: 'draft'
    },
    views: {
      type: Number,
      default: 0
    },
    likesCount: {
      type: Number,
      default: 0
    },
    readTime: {
      type: Number,
      default: 1 // Read duration estimate in minutes
    }
  },
  {
    timestamps: true
  }
);
// High-speed indices for page loads
articleSchema.index({ author: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ createdAt: -1 });
// Full-text search index for search discovery queries
articleSchema.index({ title: 'text', content: 'text', excerpt: 'text' });

// Slug auto-generation helper pre-validate
articleSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 6);
  }
  next();
});

// Estimate reading time pre-save
articleSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const words = this.content.trim().split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
