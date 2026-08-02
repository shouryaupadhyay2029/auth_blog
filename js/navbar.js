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

  /* ─────────────────────────────────────────────────────────────────
     ADAPTIVE EDITORIAL NAVIGATION SYSTEM (GSAP ScrollTrigger Morph)
  ───────────────────────────────────────────────────────────────── */
  const navbarSurface = document.querySelector('.navbar-surface');
  const navbarHeader = document.querySelector('.navbar-header');
  const navLinks = document.querySelector('.nav-desktop .nav-links');
  const searchInput = document.getElementById('nav-search');
  const searchBar = document.querySelector('.search-bar');
  const signInBtn = document.querySelector('.user-actions .btn-ghost');
  const startWritingBtn = document.querySelector('.btn-start-writing');
  const startWritingText = startWritingBtn ? startWritingBtn.querySelector('.btn-text') : null;
  const logo = document.querySelector('.navbar-left .logo');
  
  // Morph text to icons selectors
  const navTexts = document.querySelectorAll('.nav-desktop .nav-text');
  const navIcons = document.querySelectorAll('.nav-desktop .nav-icon-wrapper');
  const navAnchors = document.querySelectorAll('.nav-desktop .nav-links a');

  if (navbarSurface && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isReadingMode = false;

    // Check if the page has a hero section (Homepage)
    const heroSection = document.querySelector('.hero-section');

    // Create morph timeline
    const morphTimeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        isReadingMode = true;
        navbarSurface.classList.add('navbar-surface-reading');
      },
      onReverseComplete: () => {
        isReadingMode = false;
        navbarSurface.classList.remove('navbar-surface-reading');
        
        // Safely reset elements back to clean cover states
        gsap.set([navbarSurface, '.navbar-content', logo, navLinks, searchBar, searchInput, navTexts, navIcons, navAnchors], { clearProps: 'all' });
        if (signInBtn) gsap.set(signInBtn, { clearProps: 'all' });
        if (startWritingText) gsap.set(startWritingText, { clearProps: 'all' });
      }
    });

    if (prefersReduced) {
      // Reduced motion: basic fade transition
      const triggerEl = heroSection || document.body;
      const startTrigger = heroSection ? 'bottom 25%' : '120px top';

      ScrollTrigger.create({
        trigger: triggerEl,
        start: startTrigger,
        onEnter: () => {
          gsap.to(navbarSurface, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
              navbarSurface.classList.add('navbar-surface-reading');
              gsap.to(navbarSurface, { opacity: 1, duration: 0.25 });
            }
          });
        },
        onLeaveBack: () => {
          gsap.to(navbarSurface, {
            opacity: 0,
            duration: 0.25,
            onComplete: () => {
              navbarSurface.classList.remove('navbar-surface-reading');
              gsap.to(navbarSurface, { opacity: 1, duration: 0.25 });
            }
          });
        }
      });
    } else {
      // Build high-end animation timeline
      // 1. Surface Morph
      morphTimeline.to(navbarSurface, {
        width: '74%',
        borderRadius: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
        background: 'linear-gradient(135deg, rgba(10, 10, 12, 0.94) 0%, rgba(6, 6, 8, 0.98) 100%)',
        backdropFilter: 'blur(28px) saturate(180%)',
        boxShadow: '0 8px 32px -8px rgba(0, 0, 0, 0.5)',
        scaleY: 0.88, // Keeps height around 61.6px (60-64px!)
        duration: 0.6,
        ease: 'power3.inOut'
      }, 0);

      // Counter-scale content wrapper to prevent distortion
      morphTimeline.to('.navbar-content', {
        scaleY: 1.13, // Counters scaleY(0.88)
        duration: 0.6,
        ease: 'power3.inOut'
      }, 0);

      // 2. Logo scale
      morphTimeline.to(logo, {
        scale: 0.8,
        duration: 0.6,
        ease: 'power3.inOut'
      }, 0);

      // 3. Nav Links gaps & Icon morph
      if (navLinks) {
        morphTimeline.to(navLinks, {
          gap: '18px', // Gap between icons: 16-20px!
          duration: 0.6,
          ease: 'power3.inOut'
        }, 0);

        // Text: opacity 1->0, translateY 0->-6px, scale 1->0.95
        morphTimeline.to(navTexts, {
          opacity: 0,
          y: -6,
          scale: 0.95,
          width: 0,
          marginLeft: 0,
          marginRight: 0,
          duration: 0.5,
          ease: 'power3.inOut'
        }, 0);

        // Icon: opacity 0->1, scale 0.85->1, blur 4px->0 with 80% overlap (start at 0.1s)
        morphTimeline.to(navIcons, {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power3.inOut'
        }, 0.1);

        // Anchor container: padding 10-12px (11px all around), borderRadius 50%
        morphTimeline.to(navAnchors, {
          paddingTop: '11px',
          paddingBottom: '11px',
          paddingLeft: '11px',
          paddingRight: '11px',
          borderRadius: '50%',
          duration: 0.6,
          ease: 'power3.inOut'
        }, 0);
      }

      // 4. Search bar collapse
      if (searchBar && searchInput) {
        morphTimeline.to(searchBar, {
          width: '38px',
          duration: 0.6,
          ease: 'power3.inOut'
        }, 0);
        morphTimeline.to(searchInput, {
          opacity: 0,
          duration: 0.4,
          ease: 'power3.inOut'
        }, 0);
      }

      // 5. Sign In button fade & collapse
      if (signInBtn) {
        morphTimeline.to(signInBtn, {
          opacity: 0,
          width: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginLeft: 0,
          marginRight: 0,
          pointerEvents: 'none',
          duration: 0.6,
          ease: 'power3.inOut'
        }, 0);
      }

      // 6. Start Writing button -> Icon button morph
      if (startWritingBtn && startWritingText) {
        morphTimeline.to(startWritingText, {
          opacity: 0,
          width: 0,
          marginLeft: 0,
          marginRight: 0,
          duration: 0.6,
          ease: 'power3.inOut'
        }, 0);
        morphTimeline.to(startWritingBtn, {
          paddingLeft: '11px',
          paddingRight: '11px',
          borderRadius: '10px', // macOS rounded square icon
          duration: 0.6,
          ease: 'power3.inOut'
        }, 0);
      }

      // Setup ScrollTrigger trigger points
      if (heroSection) {
        // Landing Page: transition when Hero is 75% scrolled out
        ScrollTrigger.create({
          trigger: heroSection,
          start: 'bottom 25%',
          onEnter: () => morphTimeline.play(),
          onLeaveBack: () => {
            morphTimeline.reverse();
            gsap.to(navbarHeader, { y: 0, opacity: 1, duration: 0.3 });
          }
        });
      } else {
        // Other Pages: transition after scrolling 120px down
        ScrollTrigger.create({
          trigger: document.body,
          start: '120px top',
          onEnter: () => morphTimeline.play(),
          onLeaveBack: () => {
            morphTimeline.reverse();
            gsap.to(navbarHeader, { y: 0, opacity: 1, duration: 0.3 });
          }
        });
      }

      // Scroll Direction Behavior (Auto-Hide / Auto-Reveal)
      ScrollTrigger.create({
        onUpdate: (self) => {
          if (isReadingMode) {
            if (self.direction === 1) {
              // Scroll DOWN: Shift navbar up by 10px, reduce opacity to 0.7
              gsap.to(navbarHeader, {
                y: -10,
                opacity: 0.7,
                duration: 0.35,
                ease: 'power2.out',
                overwrite: 'auto'
              });
            } else {
              // Scroll UP: Fully opaque, return to normal position
              gsap.to(navbarHeader, {
                y: 0,
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
              });
            }
          }
        }
      });

      // Hover / focus interaction expanded states for searchBar in Reading Mode
      if (searchBar && searchInput) {
        searchBar.addEventListener('mouseenter', () => {
          if (isReadingMode) {
            gsap.to(searchBar, { width: '170px', duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(searchInput, { opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          }
        });

        searchBar.addEventListener('mouseleave', () => {
          if (isReadingMode && document.activeElement !== searchInput) {
            gsap.to(searchBar, { width: '38px', duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(searchInput, { opacity: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          }
        });

        searchInput.addEventListener('focus', () => {
          if (isReadingMode) {
            gsap.to(searchBar, { width: '210px', duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(searchInput, { opacity: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          }
        });

        searchInput.addEventListener('blur', () => {
          if (isReadingMode) {
            gsap.to(searchBar, { width: '38px', duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
            gsap.to(searchInput, { opacity: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' });
          }
        });
      }

      // Hover expanded states for Start Writing button in Reading Mode
      if (startWritingBtn && startWritingText) {
        startWritingBtn.addEventListener('mouseenter', () => {
          if (isReadingMode) {
            gsap.to(startWritingText, {
              opacity: 1,
              width: 110,
              marginLeft: 4,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
        });

        startWritingBtn.addEventListener('mouseleave', () => {
          if (isReadingMode) {
            gsap.to(startWritingText, {
              opacity: 0,
              width: 0,
              marginLeft: 0,
              duration: 0.3,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }
        });
      }
    }
  }
});
