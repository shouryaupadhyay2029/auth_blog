/* BlogAuth V1 services/schedulerService.js — Background Post Scheduler */
const { Article, AuditLog } = require('../models');

/**
 * Scan database for scheduled posts whose publication date has arrived and publish them.
 */
async function publishScheduledArticles() {
  const now = new Date();
  
  // Find scheduled posts that are due
  const dueArticles = await Article.find({
    status: 'scheduled',
    scheduledAt: { $lte: now }
  });

  if (dueArticles.length === 0) return 0;

  let count = 0;
  for (const article of dueArticles) {
    article.status = 'published';
    article.publishedAt = article.scheduledAt || now;
    // Set scheduledAt to null or keep it for records
    await article.save();

    // Log the audit event
    await AuditLog.create({
      action: 'Article Scheduled Publish',
      targetType: 'Article',
      targetId: article._id,
      metadata: { details: `Scheduled article "${article.title}" published automatically.` },
      actor: article.author
    });

    count++;
  }

  if (count > 0) {
    console.log(`[Scheduler] Published ${count} scheduled articles successfully.`);
  }

  return count;
}

let timerId = null;

/**
 * Starts the recurring scheduler check (every 1 minute)
 */
function startScheduler() {
  if (timerId) return;
  
  console.log('[Scheduler] Background post publication scheduler started.');
  // Check immediately, then check every 60 seconds
  publishScheduledArticles().catch(err => console.error('[Scheduler Error]:', err));
  
  timerId = setInterval(async () => {
    try {
      await publishScheduledArticles();
    } catch (error) {
      console.error('[Scheduler Execution Error]:', error);
    }
  }, 60 * 1000);
}

/**
 * Stops the scheduler
 */
function stopScheduler() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
    console.log('[Scheduler] Background scheduler stopped.');
  }
}

module.exports = {
  publishScheduledArticles,
  startScheduler,
  stopScheduler
};
