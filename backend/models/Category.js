/* BlogAuth V1 models/Category.js — Category Schema model */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required.'],
      unique: true,
      trim: true,
      maxlength: [40, 'Category name cannot exceed 40 characters.']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: [200, 'Category description cannot exceed 200 characters.']
    },
    icon: {
      type: String,
      default: '' // SVG identifier or vector class name
    },
    articleCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Slug auto-generation helper pre-validate
categorySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
