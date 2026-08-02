/* BlogAuth V1 models/index.js — Unified Database Models Exporter */
const User = require('./User');
const Category = require('./Category');
const Tag = require('./Tag');
const Article = require('./Article');
const Bookmark = require('./Bookmark');
const Like = require('./Like');
const Comment = require('./Comment');
const Notification = require('./Notification');
const ReadingHistory = require('./ReadingHistory');
const Session = require('./Session');
const NewsletterSubscriber = require('./NewsletterSubscriber');
const Report = require('./Report');
const AuditLog = require('./AuditLog');

module.exports = {
  User,
  Category,
  Tag,
  Article,
  Bookmark,
  Like,
  Comment,
  Notification,
  ReadingHistory,
  Session,
  NewsletterSubscriber,
  Report,
  AuditLog
};
