/**
 * Formats an ISO date string into a human-readable format.
 * E.g., "2026-07-20T10:00:00Z" -> "July 20, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
