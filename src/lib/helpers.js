/**
 * General helper functions.
 */

/**
 * Converts a text string into a URL-friendly slug.
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-');       // Replace multiple - with single -
}

/**
 * Retrieves the initials from a user's name.
 * E.g., "Shourya Upadhyay" -> "SU"
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Calculates estimated reading time for a given text.
 * Assumes average reading speed of 200 words per minute.
 */
export function readingTime(text, wpm = 200) {
  if (!text) return '0 min read';
  const words = text.trim().split(/\s+/).length;
  const time = Math.ceil(words / wpm);
  return `${time} min read`;
}
