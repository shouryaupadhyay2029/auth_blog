/* BlogAuth V1 models/User.js — User Schema model */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username credentials are required.'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, 'Username must contain at least 3 characters.'],
      maxlength: [30, 'Username cannot exceed 30 characters.'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.']
    },
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
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [8, 'Password must contain at least 8 characters.'],
      select: false // Exclude from queries by default
    },
    avatar: {
      type: String,
      default: '' // Cloudinary image URL
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'writer', 'admin'],
        message: 'Role value must match user, writer, or admin.'
      },
      default: 'user'
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio details cannot exceed 200 characters.']
    },
    socials: {
      github: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    emailVerificationToken: {
      type: String
    },
    emailVerificationExpires: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Password hashing pre-save hooks
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password match
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is currently locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts and lock account if threshold reached
userSchema.methods.incrementLoginAttempts = async function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = undefined;
  } else {
    this.loginAttempts += 1;
    if (this.loginAttempts >= 5) {
      this.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
    }
  }
  return this.save();
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function() {
  this.loginAttempts = 0;
  this.lockUntil = undefined;
  return this.save();
};

const User = mongoose.model('User', userSchema);
module.exports = User;
