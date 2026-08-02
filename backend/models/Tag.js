/* BlogAuth V1 models/Tag.js — Tag Schema model */
const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [20, 'Tag name cannot exceed 20 characters.']
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true
    },
    count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);
// Slug auto-generation helper pre-validate
tagSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;
