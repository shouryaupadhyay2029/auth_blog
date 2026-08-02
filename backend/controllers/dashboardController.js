/* BlogAuth V1 controllers/dashboardController.js — Dashboard Data Aggregator */
const { Article, Bookmark, Notification, ReadingHistory, AuditLog, User } = require('../models');
const catchAsync = require('../utils/catchAsync');

/**
 * Retrieve comprehensive workspace stats and activities for the authenticated user
 */
const getDashboardData = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  // 1. Fetch User Profile Details
  const profile = await User.findById(userId);

  // 2. Fetch User's Articles
  const userArticles = await Article.find({ author: userId });
  const userArticleIds = userArticles.map(art => art._id);

  // Split into published vs drafts
  const published = userArticles.filter(art => art.status === 'published');
  const drafts = userArticles.filter(art => art.status === 'draft');

  // Compute views aggregates
  const viewsCount = userArticles.reduce((acc, art) => acc + (art.views || 0), 0);

  // 3. Fetch User's Bookmarks
  const bookmarksList = await Bookmark.find({ user: userId })
    .populate({
      path: 'article',
      populate: { path: 'author', select: 'username email avatar' }
    });

  const bookmarks = bookmarksList.map(b => b.article).filter(Boolean);

  // 4. Fetch User's Notifications
  const notifications = await Notification.find({ recipient: userId })
    .populate('sender', 'username email avatar')
    .populate('article', 'title slug')
    .sort('-createdAt')
    .limit(10);

  // 5. Fetch Recent Activities (Audit Logs)
  const recentActivity = await AuditLog.find({ actor: userId })
    .sort('-createdAt')
    .limit(10);

  // 6. Fetch Recent Readers (who read this user's articles)
  const recentReadersHistory = await ReadingHistory.find({
    article: { $in: userArticleIds },
    user: { $ne: userId } // Exclude the author's own readings
  })
    .populate('user', 'username email avatar')
    .populate('article', 'title slug')
    .sort('-lastReadAt')
    .limit(5);

  const recentReaders = recentReadersHistory.map(history => ({
    user: history.user,
    article: history.article,
    progress: history.progress,
    readAt: history.lastReadAt
  }));

  // Compiling response statistics metrics payload
  res.status(200).json({
    success: true,
    profile: {
      username: profile.username,
      email: profile.email,
      avatar: profile.avatar,
      role: profile.role,
      bio: profile.bio,
      socials: profile.socials,
      createdAt: profile.createdAt
    },
    publishedCount: published.length,
    draftCount: drafts.length,
    viewsCount,
    followersCount: Math.floor(viewsCount * 0.08) + 12, // Scaled mock metric based on views
    drafts,
    published,
    bookmarks,
    notifications,
    recentActivity,
    recentReaders
  });
});

module.exports = {
  getDashboardData
};
