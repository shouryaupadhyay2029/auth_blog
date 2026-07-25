/**
 * Truncates text to a specified character limit.
 */
export function truncate(text, length = 100, suffix = '...') {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + suffix;
}
