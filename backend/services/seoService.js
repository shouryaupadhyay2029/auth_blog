/* BlogAuth V1 services/seoService.js — SEO & Metadata Auto-generator Service */

function generateSlug(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 6);
}

function estimateReadTime(content) {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function generateExcerpt(content, maxLength = 200) {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>/g, '').trim();
  return plainText.substring(0, maxLength) + (plainText.length > maxLength ? '...' : '');
}

function generateMetadata(article, categoryName = 'General', tagNames = []) {
  const title = article.seoTitle || article.title || 'Untitled Post';
  const description = article.seoDescription || article.excerpt || generateExcerpt(article.content, 160);
  const image = article.featuredImage || article.coverImage || '';

  return {
    title,
    description,
    canonicalUrl: article.canonicalUrl || `/posts/${article.slug}`,
    openGraph: {
      title,
      description,
      image,
      type: 'article',
      siteName: 'BlogAuth Journal',
      url: article.canonicalUrl || `/posts/${article.slug}`,
      article: {
        publishedTime: article.publishedAt || article.createdAt,
        modifiedTime: article.updatedAt,
        section: categoryName,
        tags: tagNames
      }
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      image
    }
  };
}

module.exports = {
  generateSlug,
  estimateReadTime,
  generateExcerpt,
  generateMetadata
};
