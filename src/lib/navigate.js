/**
 * Programmatic client-side navigation helper.
 * Pushes a new entry to the history stack and dispatches a synthetic
 * 'pushstate' event so AppRouter can re-sync its path state.
 */
export function navigate(to) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new Event('pushstate'));
}
