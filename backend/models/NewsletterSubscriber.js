/* BlogAuth V1 models/NewsletterSubscriber.js — NewsletterSubscriber Schema model */
const mongoose = require('mongoose');

const newsletterSubscriberSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email address is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email format.'
      ]
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    token: {
      type: String,
      default: '' // Verification token
    }
  },
  {
    timestamps: true
  }
);

const NewsletterSubscriber = mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
module.exports = NewsletterSubscriber;
