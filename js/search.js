/* BlogAuth V1 search.js — Sprint 12: Spotlight Command Menu Logic */

document.addEventListener('DOMContentLoaded', () => {
  // Search Database
  const searchDatabase = {
    articles: [
      { title: "Building a Distributed Message Queue from Scratch in Rust", desc: "Designing parser pipelines and cluster state controllers.", url: "article.html", meta: "Rust / Systems" },
      { title: "Optimizing Read Performance on PostgreSQL Databases", desc: "Profiling lock contentions, custom indexes, and buffer pools.", url: "article.html", meta: "PostgreSQL / DB" },
      { title: "A Practical Approach to Zero-Trust Client Authentication", desc: "Enforcing JWT asserts, public key verification, and secure caches.", url: "article.html", meta: "Security / JWT" },
      { title: "Fluid Type Clamp Equations in Architectural CSS", desc: "Sizing elements fluidly with custom clamp mathematical structures.", url: "article.html", meta: "CSS / Design" }
    ],
    categories: [
      { title: "Systems Design", desc: "Distributed consensus, service boundaries, protocols.", url: "categories.html", meta: "18 Articles" },
      { title: "Databases", desc: "Replication trees, engine buffers, custom layouts.", url: "categories.html", meta: "14 Articles" },
      { title: "Security", desc: "Cryptographic keys, JWT validations, zero-trust.", url: "categories.html", meta: "12 Articles" },
      { title: "Frontend", desc: "Design systems engineering, CSS layouts, GPU animations.", url: "categories.html", meta: "19 Articles" }
    ],
    authors: [
      { title: "Sarah Chen", desc: "Platform Engineer. Virtualization, cloud virtualization runtimes, databases.", url: "about.html", meta: "Staff Writer" },
      { title: "Elena Rostova", desc: "Principal Compiler Architect. VMs, static parsers, V8 Core.", url: "about.html", meta: "Editorial Board" },
      { title: "Marcus Vance", desc: "Staff Infrastructure Architect. Network routing, distributed transactions.", url: "about.html", meta: "Editorial Board" }
    ],
    collections: [
      { title: "Building Scalable APIs", desc: "Curated path detailing HTTP structures, validations, and buffers.", url: "categories.html", meta: "4 Chapters" },
      { title: "Rust Essentials", desc: "Timeless concepts, compiler safety guidelines, memory patterns.", url: "categories.html", meta: "5 Chapters" },
      { title: "Cloud Native", desc: "Kubernetes containers, service mesh setups, serverless runtimes.", url: "categories.html", meta: "8 Chapters" }
    ]
  };

  // DOM Elements
  const backdrop = document.getElementById('search-modal-backdrop');
  const panel = document.getElementById('search-modal-panel');
  const input = document.getElementById('sm-input');
  const resultsContainer = document.getElementById('search-modal-results');
  const triggerInputs = [
    document.getElementById('nav-search'),
    document.getElementById('drawer-search-input')
  ];

  let activeIndex = -1;
  let resultItems = [];
  let searchTimeout = null;

  if (!backdrop || !panel || !input || !resultsContainer) return;

  // ─────────────────────────────────────────────────────────────────
  // 1. OPEN / CLOSE HANDLERS
  // ─────────────────────────────────────────────────────────────────
  function openSearch() {
    backdrop.style.display = 'flex';
    // Small delay to trigger CSS opacity transition
    setTimeout(() => {
      backdrop.classList.add('open');
      input.focus();
      renderEmptyInputState();
    }, 10);

    // Trap focus inside modal
    document.addEventListener('keydown', trapModalFocus);
  }

  function closeSearch() {
    backdrop.classList.remove('open');
    input.value = '';
    // Wait for transition before hiding element
    setTimeout(() => {
      backdrop.style.display = 'none';
    }, 250);

    document.removeEventListener('keydown', trapModalFocus);

    // Blur triggers
    triggerInputs.forEach(trig => {
      if (trig) trig.blur();
    });
  }

  // Bind Navbar Trigger inputs
  triggerInputs.forEach(trig => {
    if (!trig) return;
    trig.addEventListener('focus', (e) => {
      e.preventDefault();
      trig.blur(); // Don't focus navbar input, focus modal instead
      openSearch();
    });
    trig.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch();
    });
  });

  // Bind Backdrop Close click
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      closeSearch();
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // 2. SHORTCUT KEYS (Ctrl+K, Esc)
  // ─────────────────────────────────────────────────────────────────
  window.addEventListener('keydown', (e) => {
    // Escape key closes modal
    if (e.key === 'Escape' && backdrop.classList.contains('open')) {
      closeSearch();
    }

    // Ctrl+K or Cmd+K opens modal
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (backdrop.classList.contains('open')) {
        closeSearch();
      } else {
        openSearch();
      }
    }
  });

  // ─────────────────────────────────────────────────────────────────
  // 3. FOCUS TRAPPING & ARROW NAVIGATION
  // ─────────────────────────────────────────────────────────────────
  function trapModalFocus(e) {
    resultItems = Array.from(resultsContainer.querySelectorAll('.search-result-item'));

    if (e.key === 'Tab') {
      // Basic focus trap - keep focus on input or loops inside list
      if (document.activeElement !== input && resultItems.length === 0) {
        e.preventDefault();
        input.focus();
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (resultItems.length === 0) return;
      
      // Remove old selection
      updateKeyboardFocus(-1);

      activeIndex++;
      if (activeIndex >= resultItems.length) {
        activeIndex = 0; // Wrap around to top
      }
      
      updateKeyboardFocus(activeIndex);
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (resultItems.length === 0) return;

      // Remove old selection
      updateKeyboardFocus(-1);

      activeIndex--;
      if (activeIndex < 0) {
        activeIndex = resultItems.length - 1; // Wrap around to bottom
      }

      updateKeyboardFocus(activeIndex);
    }

    if (e.key === 'Enter') {
      if (activeIndex >= 0 && resultItems[activeIndex]) {
        e.preventDefault();
        resultItems[activeIndex].click();
      }
    }
  }

  function updateKeyboardFocus(index) {
    resultItems.forEach((item, idx) => {
      if (idx === index) {
        item.classList.add('keyboard-focus');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('keyboard-focus');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 4. RENDERING LIVE RESULTS
  // ─────────────────────────────────────────────────────────────────
  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    
    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);
    activeIndex = -1;

    if (query.length === 0) {
      renderEmptyInputState();
      return;
    }

    // Render loading shimmer skeletons immediately to feel like premium query search
    renderLoadingState();

    // Debounce actual queries for 220ms
    searchTimeout = setTimeout(() => {
      performQuerySearch(query);
    }, 220);
  });

  function renderLoadingState() {
    resultsContainer.innerHTML = `
      <div class="search-shimmer-wrapper">
        <div class="search-shimmer-row">
          <div class="ss-avatar"></div>
          <div class="ss-text-container">
            <div class="ss-line long"></div>
            <div class="ss-line short"></div>
          </div>
        </div>
        <div class="search-shimmer-row" style="margin-top: 16px;">
          <div class="ss-avatar"></div>
          <div class="ss-text-container">
            <div class="ss-line long"></div>
            <div class="ss-line short"></div>
          </div>
        </div>
        <div class="search-shimmer-row" style="margin-top: 16px;">
          <div class="ss-avatar"></div>
          <div class="ss-text-container">
            <div class="ss-line long"></div>
            <div class="ss-line short"></div>
          </div>
        </div>
      </div>
    `;
  }

  function renderEmptyInputState() {
    // Default Spotlight view: recent searches + quick categories grid
    resultsContainer.innerHTML = `
      <div class="search-section">
        <span class="search-section-title">Recent Searches</span>
        <div class="search-results-list">
          <a href="article.html" class="search-result-item">
            <div class="ri-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="ri-details">
              <div class="ri-title-row">
                <span class="ri-title">Building a Distributed Message Queue from Scratch in Rust</span>
                <span class="ri-meta">10m ago</span>
              </div>
              <span class="ri-desc">Parser pipelines, lock controls, and consensus.</span>
            </div>
            <div class="ri-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </div>
          </a>
          <a href="article.html" class="search-result-item">
            <div class="ri-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="ri-details">
              <div class="ri-title-row">
                <span class="ri-title">A Practical Approach to Zero-Trust Client Authentication</span>
                <span class="ri-meta">Yesterday</span>
              </div>
              <span class="ri-desc">JWT asserts, public key verifications, and tokens.</span>
            </div>
            <div class="ri-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
            </div>
          </a>
        </div>
      </div>

      <div class="search-section" style="margin-top: 32px;">
        <span class="search-section-title">Quick Categories</span>
        <div class="search-quick-grid">
          <a href="categories.html" class="search-quick-chip">Systems Design</a>
          <a href="categories.html" class="search-quick-chip">Databases</a>
          <a href="categories.html" class="search-quick-chip">Security</a>
          <a href="categories.html" class="search-quick-chip">Frontend</a>
        </div>
      </div>
    `;
    
    // Add event listeners on dynamic tags to close modal on click
    resultsContainer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeSearch);
    });
  }

  function performQuerySearch(query) {
    let matchesHtml = '';
    let matchesCount = 0;

    // Filter Helper
    const filter = (arr) => arr.filter(item => 
      item.title.toLowerCase().includes(query) || 
      item.desc.toLowerCase().includes(query)
    );

    const matchArticles = filter(searchDatabase.articles);
    const matchCategories = filter(searchDatabase.categories);
    const matchAuthors = filter(searchDatabase.authors);
    const matchCollections = filter(searchDatabase.collections);

    // Group 1: Articles
    if (matchArticles.length > 0) {
      matchesCount += matchArticles.length;
      matchesHtml += `
        <div class="search-section">
          <span class="search-section-title">Articles</span>
          <div class="search-results-list">
            ${matchArticles.map(item => `
              <a href="${item.url}" class="search-result-item">
                <div class="ri-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                </div>
                <div class="ri-details">
                  <div class="ri-title-row">
                    <span class="ri-title">${item.title}</span>
                    <span class="ri-meta">${item.meta}</span>
                  </div>
                  <span class="ri-desc">${item.desc}</span>
                </div>
                <div class="ri-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Group 2: Categories
    if (matchCategories.length > 0) {
      matchesCount += matchCategories.length;
      matchesHtml += `
        <div class="search-section" style="margin-top: 24px;">
          <span class="search-section-title">Categories</span>
          <div class="search-results-list">
            ${matchCategories.map(item => `
              <a href="${item.url}" class="search-result-item">
                <div class="ri-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                </div>
                <div class="ri-details">
                  <div class="ri-title-row">
                    <span class="ri-title">${item.title}</span>
                    <span class="ri-meta">${item.meta}</span>
                  </div>
                  <span class="ri-desc">${item.desc}</span>
                </div>
                <div class="ri-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Group 3: Authors
    if (matchAuthors.length > 0) {
      matchesCount += matchAuthors.length;
      matchesHtml += `
        <div class="search-section" style="margin-top: 24px;">
          <span class="search-section-title">Authors</span>
          <div class="search-results-list">
            ${matchAuthors.map(item => `
              <a href="${item.url}" class="search-result-item">
                <div class="ri-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <div class="ri-details">
                  <div class="ri-title-row">
                    <span class="ri-title">${item.title}</span>
                    <span class="ri-meta">${item.meta}</span>
                  </div>
                  <span class="ri-desc">${item.desc}</span>
                </div>
                <div class="ri-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Group 4: Collections
    if (matchCollections.length > 0) {
      matchesCount += matchCollections.length;
      matchesHtml += `
        <div class="search-section" style="margin-top: 24px;">
          <span class="search-section-title">Collections</span>
          <div class="search-results-list">
            ${matchCollections.map(item => `
              <a href="${item.url}" class="search-result-item">
                <div class="ri-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                </div>
                <div class="ri-details">
                  <div class="ri-title-row">
                    <span class="ri-title">${item.title}</span>
                    <span class="ri-meta">${item.meta}</span>
                  </div>
                  <span class="ri-desc">${item.desc}</span>
                </div>
                <div class="ri-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (matchesCount === 0) {
      renderEmptyState();
    } else {
      resultsContainer.innerHTML = matchesHtml;

      // Animate search rows entry stagger using GSAP if loaded
      if (typeof gsap !== 'undefined') {
        gsap.fromTo('.search-result-item', 
          { opacity: 0, y: 6 }, 
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' }
        );
      }

      // Close modal on row click
      resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', closeSearch);
      });
    }
  }

  function renderEmptyState() {
    resultsContainer.innerHTML = `
      <div class="search-empty-state">
        <div class="search-empty-illustration">
          <div class="sei-lens"></div>
          <div class="sei-handle"></div>
          <div class="sei-sparkle s1"></div>
          <div class="sei-sparkle s2"></div>
        </div>
        <h3 class="se-message">No matching articles were found.</h3>
        <p class="se-submessage">Try another keyword, or look for core disciplines like systems or databases.</p>
      </div>
    `;
  }
});
