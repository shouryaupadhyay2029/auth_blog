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
    subtitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: [180, 'Subtitle cannot exceed 180 characters.']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    content: {
      type: String,
      default: ''
    },
    excerpt: {
      type: String,
      default: '',
      maxlength: [400, 'Excerpt cannot exceed 400 characters.']
    },
    coverImage: {
      type: String,
      default: '' // Cloudinary URL or local file path
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Article must map to an active author.']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false // Relaxed for drafts, enforced on publish/review
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
        values: ['draft', 'in review', 'scheduled', 'published', 'archived', 'rejected'],
        message: 'Status must match draft, in review, scheduled, published, archived, or rejected.'
      },
      default: 'draft'
    },
    visibility: {
      type: String,
      enum: ['public', 'private', 'unlisted'],
      default: 'public'
    },
    featured: {
      type: Boolean,
      default: false
    },
    editorsPick: {
      type: Boolean,
      default: false
    },
    allowComments: {
      type: Boolean,
      default: true
    },
    allowSharing: {
      type: Boolean,
      default: true
    },
    seoTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: [150, 'SEO Title cannot exceed 150 characters.']
    },
    seoDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [250, 'SEO Description cannot exceed 250 characters.']
    },
    metaKeywords: [
      {
        type: String,
        trim: true
      }
    ],
    canonicalUrl: {
      type: String,
      default: '',
      trim: true
    },
    featuredImage: {
      type: String,
      default: ''
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
    },
    publishedAt: {
      type: Date
    },
    scheduledAt: {
      type: Date
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    previewToken: {
      type: String
    },
    previewTokenExpires: {
      type: Date
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
articleSchema.index({ scheduledAt: 1 });
// Full-text search index for search discovery queries
articleSchema.index({ title: 'text', content: 'text', excerpt: 'text', subtitle: 'text' });

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

// Estimate reading time and auto-excerpt pre-save
articleSchema.pre('save', function (next) {
  if (this.isModified('content') && this.content) {
    const words = this.content.trim().split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
    
    // Auto-generate excerpt if empty
    if (!this.excerpt) {
      // Clean HTML tag if any and get first 200 chars
      const plainText = this.content.replace(/<[^>]*>/g, '').trim();
      this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
    }
  }
  next();
});

const Article = mongoose.model('Article', articleSchema);
module.exports = Article;
