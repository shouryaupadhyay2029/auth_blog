// BlogAuth V1 navbar.js

document.addEventListener('DOMContentLoaded', () => {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const drawerClose = document.querySelector('.drawer-close');
  const drawerOverlay = document.querySelector('.mobile-drawer-overlay');
  const drawer = document.querySelector('.mobile-drawer');

  // Open Drawer slide-in
  const openDrawer = () => {
    drawer.classList.add('open');
    drawerOverlay.classList.add('open');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  };

  // Close Drawer slide-out
  const closeDrawer = () => {
    drawer.classList.remove('open');
    drawerOverlay.classList.remove('open');
    document.body.style.overflow = ''; // Unlock background scrolling
  };

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

  // Esc key closes drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Active link state switching logic
  const allLinks = document.querySelectorAll('.nav-links li a');
  allLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Mock page selection behavior for clean transitions
      e.preventDefault();

      // Clear all active states on list items
      const parentList = link.closest('.nav-links');
      const listItems = parentList.querySelectorAll('li');
      listItems.forEach(item => item.classList.remove('active'));

      // Mark clicked item active
      link.parentElement.classList.add('active');

      // If in mobile menu, auto-close drawer
      if (parentList.closest('.mobile-drawer')) {
        closeDrawer();
      }
    });
  });

  // Focus search input on Ctrl+K or Cmd+K shortcut
  const desktopSearch = document.getElementById('nav-search');
  const mobileSearch = document.getElementById('drawer-search-input');

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (drawer && drawer.classList.contains('open')) {
        if (mobileSearch) mobileSearch.focus();
      } else {
        if (desktopSearch) desktopSearch.focus();
      }
    }
  });
});
