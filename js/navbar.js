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
      const href = link.getAttribute('href');
      
      // Only prevent default if it's a dummy # or in-page anchor
      if (!href || href === '#' || href.startsWith('#')) {
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

  // Simulated interactive search state engine
  if (desktopSearch) {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) {
      const statusDiv = document.getElementById('search-status');
      const suggestionContent = dropdown.querySelector('.search-dropdown-section:first-child');
      const taxonomyContent = dropdown.querySelector('.search-dropdown-section:last-of-type');
      let debounceTimer = null;

      desktopSearch.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        
        clearTimeout(debounceTimer);
        if (!val) {
          statusDiv.style.display = 'none';
          suggestionContent.style.display = 'block';
          taxonomyContent.style.display = 'block';
          return;
        }

        // Show loader state
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = '<div class="search-dropdown-status-text skeleton" style="height: 18px; width: 60%; margin: 8px 0;">Searching...</div>';
        suggestionContent.style.display = 'none';
        taxonomyContent.style.display = 'none';

        debounceTimer = setTimeout(() => {
          // Query simulation
          let results = [];
          if (val.includes('rust') || val.includes('queue')) {
            results.push({
              title: 'Building a Distributed Message Queue from Scratch in Rust',
              url: 'article.html'
            });
          }
          if (val.includes('postgre') || val.includes('sql') || val.includes('database')) {
            results.push({
              title: 'Optimizing Read Performance on PostgreSQL Databases',
              url: 'article.html'
            });
          }
          if (val.includes('design') || val.includes('token') || val.includes('typograph') || val.includes('css')) {
            results.push({
              title: 'Stretching Tokens: Fluid Typography in CSS',
              url: 'article.html'
            });
          }

          if (results.length > 0) {
            statusDiv.innerHTML = `
              <span class="search-dropdown-label">Search Results (${results.length})</span>
              <ul class="search-dropdown-list">
                ${results.map(r => `<li><a href="${r.url}" class="search-suggest-item" style="font-weight:600; color:var(--accent);">${r.title}</a></li>`).join('')}
              </ul>
            `;
          } else {
            // No results empty state
            statusDiv.innerHTML = `
              <div class="search-dropdown-status-text" style="text-align: center; padding: var(--spacing-8) 0;">
                <span style="font-size: 1.5rem; display: block; margin-bottom: var(--spacing-8);">🔍</span>
                <strong>No results found</strong>
                <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">We couldn't find any articles matching "${e.target.value}". Try another keyword.</p>
              </div>
            `;
          }
        }, 400); // 400ms loading simulator
      });
    }
  }
});
