/**
 * BlogAuth V1 — micro.js
 * Sprint 8: Premium Micro Experience System
 *
 * Architecture:
 *  1. Reduced-motion guard (exits early if prefers-reduced-motion)
 *  2. Page Entry Sequence (navbar → hero → sections)
 *  3. Scroll Reveal System (unified IntersectionObserver)
 *  4. Divider Reveal (line grows, then label)
 *  5. Section Heading Line Reveals
 *  6. Topic Row Staggered Reveals
 *  7. Proximity Effect
 *  8. Card Clickthrough (delegated from latest.js pattern)
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     MOTION GUARD
  ───────────────────────────────────────────── */
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Easing constant (matches CSS --ease-out-expo) */
  // Used for JS-driven animations if needed.
  const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

  /* ─────────────────────────────────────────────
     UTILITY: Reveal an element after delay (ms)
  ───────────────────────────────────────────── */
  function reveal(el, delay) {
    if (!el) return;
    setTimeout(function () {
      el.classList.add('m-visible');
    }, delay || 0);
  }

  /* ─────────────────────────────────────────────
     UTILITY: Apply CSS custom property delay
  ───────────────────────────────────────────── */
  function setDelay(el, ms) {
    el.style.setProperty('--m-delay', ms);
  }

  /* ─────────────────────────────────────────────
     1. PAGE ENTRY SEQUENCE
     Orchestrates the full cascade from navbar
     through hero to the first section divider.
  ───────────────────────────────────────────── */
  function initPageEntry() {
    /* ── NAVBAR ── */
    var navSurface = document.querySelector('.navbar-surface');
    var logo       = document.querySelector('.navbar-left .logo');
    var navLinks   = document.querySelectorAll('.nav-desktop .nav-links li');
    var searchBar  = document.querySelector('.search-bar');
    var ctaBtns    = document.querySelectorAll('.user-actions .btn');
    var mobileToggle = document.querySelector('.mobile-toggle');

    /* Apply entry classes */
    if (navSurface) navSurface.classList.add('m-navbar-surface');
    if (logo)       logo.classList.add('m-logo');

    navLinks.forEach(function (li) {
      li.classList.add('m-nav-link');
    });

    if (searchBar)    searchBar.classList.add('m-search');

    ctaBtns.forEach(function (btn) {
      btn.classList.add('m-cta');
    });

    if (mobileToggle) mobileToggle.classList.add('m-cta');

    /* ── HERO LEFT ── */
    var eyebrow      = document.querySelector('.hero-eyebrow');
    var heroLines    = document.querySelectorAll('.hero-heading span');
    var heroPara     = document.querySelector('.hero-paragraph');
    var heroActions  = document.querySelector('.hero-actions');
    var statItems    = document.querySelectorAll('.stat-item');

    /* Wrap eyebrow in clip */
    if (eyebrow) {
      wrapInClip(eyebrow, 'm-clip-inner');
    }

    /* Wrap each heading line */
    heroLines.forEach(function (span) {
      wrapInClip(span, 'm-clip-inner');
    });

    /* Hero paragraph, actions — use init class */
    if (heroPara)    heroPara.classList.add('m-init');
    if (heroActions) heroActions.classList.add('m-init');

    statItems.forEach(function (item) {
      item.classList.add('m-stat');
    });

    /* ── HERO RIGHT CARD ── */
    var heroCardWrapper = document.querySelector('.featured-card-wrapper');
    if (heroCardWrapper) {
      /* Remove the old experience.css classes to avoid conflict */
      heroCardWrapper.classList.remove('revealed');
      heroCardWrapper.classList.add('m-hero-card');
    }

    /* ── FIRST DIVIDER (below hero) ── */
    var firstDivider = document.querySelector('.editorial-divider');
    if (firstDivider) {
      firstDivider.classList.add('m-scroll');
    }

    if (REDUCED) {
      /* Instant reveal everything */
      document.querySelectorAll(
        '.m-navbar-surface, .m-logo, .m-nav-link, .m-search, .m-cta, ' +
        '.m-clip-inner, .m-init, .m-stat, .m-hero-card, .m-scroll'
      ).forEach(function (el) {
        el.classList.add('m-visible');
      });
      return;
    }

    /* ── TIMELINE (ms) ── */
    var t = 0;

    /* Navbar surface — first */
    reveal(navSurface, t);           t += 80;

    /* Logo */
    reveal(logo, t);                 t += 60;

    /* Nav links — 40ms apart */
    navLinks.forEach(function (li) {
      reveal(li, t);                 t += 40;
    });

    /* Search */
    reveal(searchBar, t);            t += 50;

    /* CTA buttons */
    ctaBtns.forEach(function (btn) {
      reveal(btn, t);                t += 30;
    });
    reveal(mobileToggle, t - 30);   /* mobile toggle at same time as first btn */

    /* ── HERO — starts after navbar settles ── */
    t = 320;

    /* Eyebrow */
    revealClipInner(eyebrow, t);     t += 120;

    /* Heading lines */
    heroLines.forEach(function (span) {
      revealClipInner(span, t);      t += 120;
    });

    /* Paragraph */
    reveal(heroPara, t);             t += 120;

    /* Buttons */
    reveal(heroActions, t);          t += 120;

    /* Stats Counting Sequence */
    var statTargets = [
      { target: 12, suffix: 'K+' },
      { target: 2.5, suffix: 'K+' },
      { target: 28, suffix: '+' }
    ];

    statItems.forEach(function (item, index) {
      var valEl = item.querySelector('.stat-value');
      var lblEl = item.querySelector('.stat-label');
      
      if (valEl) {
        valEl.style.opacity = '0';
        valEl.style.transform = 'translateY(12px)';
        valEl.style.transition = 'opacity 600ms var(--ease-premium-out), transform 600ms var(--ease-premium-out)';
      }
      if (lblEl) {
        lblEl.style.opacity = '0';
        lblEl.style.transform = 'translateY(8px)';
        lblEl.style.transition = 'opacity 600ms var(--ease-premium-out), transform 600ms var(--ease-premium-out)';
      }

      setTimeout(function () {
        if (valEl) {
          valEl.style.opacity = '1';
          valEl.style.transform = 'translateY(0)';
        }
        var targetData = statTargets[index];
        if (targetData && valEl) {
          animateStatCounting(valEl, 0, targetData.target, 1200, targetData.suffix, function () {
            if (lblEl) {
              lblEl.style.opacity = '0.6';
              lblEl.style.transform = 'translateY(0)';
            }
          });
        }
      }, t + (index * 100));
    });

    t += 300;

    /* Card — overlaps with stats */
    var cardDelay = 700;
    if (heroCardWrapper) reveal(heroCardWrapper, cardDelay);

    /* First divider — after hero content */
    if (firstDivider) reveal(firstDivider, 1100);
  }

  /* ─────────────────────────────────────────────
     HELPER: Wrap element in a clip container
  ───────────────────────────────────────────── */
  function wrapInClip(el, innerClass) {
    if (!el || el.dataset.mClipped) return;
    el.dataset.mClipped = '1';

    var wrapper = document.createElement('span');
    wrapper.className = 'm-clip';

    var inner = document.createElement('span');
    inner.className = innerClass;

    /* Move children into inner */
    while (el.firstChild) {
      inner.appendChild(el.firstChild);
    }
    wrapper.appendChild(inner);
    el.appendChild(wrapper);
  }

  /* Reveal the .m-clip-inner inside an element */
  function revealClipInner(el, delay) {
    if (!el) return;
    var inner = el.querySelector('.m-clip-inner');
    if (inner) reveal(inner, delay);
  }

  /* ─────────────────────────────────────────────
     2. SCROLL REVEAL SYSTEM
     Unified IntersectionObserver for all sections.
     Targets: .reveal-scroll, .latest-reveal,
              .m-scroll (if not already revealed),
              and any element with [data-m-scroll].
  ───────────────────────────────────────────── */
  function initScrollReveal() {
    /* Add m-scroll to all existing reveal-scroll targets */
    document.querySelectorAll('.reveal-scroll').forEach(function (el) {
      el.classList.add('m-scroll');
    });

    /* Add m-scroll to all latest-reveal targets */
    document.querySelectorAll('.latest-reveal').forEach(function (el) {
      /* Transfer delay from data-latest-delay to --m-delay custom prop */
      var d = parseInt(el.dataset.latestDelay, 10) || 0;
      el.style.setProperty('--m-delay', d + 'ms');
      el.classList.add('m-scroll');
    });

    var scrollEls = document.querySelectorAll('.m-scroll');
    if (!scrollEls.length) return;

    if (REDUCED) {
      scrollEls.forEach(function (el) { el.classList.add('m-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.dataset.mDelay, 10) ||
                    parseInt(getComputedStyle(el).getPropertyValue('--m-delay'), 10) || 0;
        setTimeout(function () {
          el.classList.add('m-visible');
        }, delay);
        observer.unobserve(el);
      });
    }, {
      rootMargin: '0px 0px -48px 0px',
      threshold: 0.08
    });

    scrollEls.forEach(function (el) { observer.observe(el); });
  }

  /* ─────────────────────────────────────────────
     3. DIVIDER REVEAL
     Adds m-scroll + m-visible sequencing to all
     .editorial-divider elements via the scroll observer.
     The CSS handles the line-grows-then-label sequence.
  ───────────────────────────────────────────── */
  function initDividers() {
    document.querySelectorAll('.editorial-divider').forEach(function (div) {
      /* Already handled by scroll reveal — just ensure class is present */
      div.classList.add('m-scroll');
    });
  }

  /* ─────────────────────────────────────────────
     4. SECTION HEADING LINE REVEALS
     Wraps each section heading's text in a line-reveal
     clip so they animate line by line on scroll.
  ───────────────────────────────────────────── */
  function initHeadingReveals() {
    var headings = document.querySelectorAll(
      '.section-title, .latest-section-title, .topics-left .section-title'
    );

    headings.forEach(function (h) {
      if (h.dataset.mHeading) return;
      h.dataset.mHeading = '1';

      /* Wrap each text line in a clip-mask reveal */
      var text = h.textContent.trim();
      h.innerHTML = '';

      var wrapper = document.createElement('span');
      wrapper.className = 'm-heading-line';

      var inner = document.createElement('span');
      inner.className = 'm-heading-line-inner m-scroll';

      inner.textContent = text;
      wrapper.appendChild(inner);
      h.appendChild(wrapper);
    });
  }

  /* ─────────────────────────────────────────────
     5. TOPIC ROW STAGGERED REVEALS
     Each .topic-row gets m-scroll with a stagger delay.
  ───────────────────────────────────────────── */
  function initTopicReveal() {
    var rows = document.querySelectorAll('.topic-row');
    rows.forEach(function (row, i) {
      if (row.dataset.mTopicSet) return;
      row.dataset.mTopicSet = '1';

      var delay = parseInt(row.dataset.delay, 10) || (i * 80);
      row.style.setProperty('--m-delay', delay + 'ms');

      /* Observe via the unified scroll observer */
      /* topic-row already has initial state from micro.css */
      row.classList.add('m-scroll');
    });
  }

  /* ─────────────────────────────────────────────
     6. PROXIMITY EFFECT
     Listens for mousemove globally.
     When mouse is within 120px of a card,
     adds .m-proximity to it.
  ───────────────────────────────────────────── */
  function initProximity() {
    if (REDUCED) return;

    var cards = Array.from(document.querySelectorAll(
      '.featured-large-card, .featured-small-card, ' +
      '.latest-feature-card, .latest-standard-card, .latest-compact-card, ' +
      '.featured-card'
    ));

    if (!cards.length) return;

    var THRESHOLD = 120; /* px */
    var rafId = null;

    function onMouseMove(e) {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = null;
        var mx = e.clientX;
        var my = e.clientY;

        cards.forEach(function (card) {
          var rect = card.getBoundingClientRect();

          /* Distance from mouse to nearest edge of card */
          var cx = Math.max(rect.left, Math.min(mx, rect.right));
          var cy = Math.max(rect.top,  Math.min(my, rect.bottom));
          var dist = Math.hypot(mx - cx, my - cy);

          /* Inside the card: hover styles dominate; remove proximity class */
          if (dist === 0) {
            card.classList.remove('m-proximity');
            return;
          }

          if (dist < THRESHOLD) {
            card.classList.add('m-proximity');
          } else {
            card.classList.remove('m-proximity');
          }
        });
      });
    }

    function onMouseLeave() {
      cards.forEach(function (card) {
        card.classList.remove('m-proximity');
      });
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
  }

  /* ─────────────────────────────────────────────
     7. CARD CLICKTHROUGH
     Whole card surface clickable. Delegates from
     the primary link inside.
  ───────────────────────────────────────────── */
  function initCardClickthrough() {
    var allCards = document.querySelectorAll(
      '.featured-large-card, .featured-small-card, ' +
      '.latest-feature-card, .latest-standard-card, .latest-compact-card'
    );

    allCards.forEach(function (card) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', function (e) {
        if (e.target.closest('a')) return;
        var link = card.querySelector('a');
        if (link) link.click();
      });
    });
  }

  /* ─────────────────────────────────────────────
     8. NAVBAR SLIDING UNDERLINE
     (Carries over the existing nav-underline
     system from experience.css — ensures it
     works with the new entry animation)
  ───────────────────────────────────────────── */
  function initNavUnderline() {
    var navLinks = document.querySelector('.nav-desktop .nav-links');
    if (!navLinks) return;

    /* Create the underline element if not present */
    if (!document.querySelector('.nav-underline')) {
      var underline = document.createElement('span');
      underline.className = 'nav-underline';
      navLinks.parentElement.style.position = 'relative';
      navLinks.parentElement.appendChild(underline);
    }

    var underlineEl = document.querySelector('.nav-underline');
    if (!underlineEl) return;

    function moveUnderline(li) {
      var parentRect = navLinks.getBoundingClientRect();
      var liRect = li.getBoundingClientRect();
      underlineEl.style.left  = (liRect.left - parentRect.left) + 'px';
      underlineEl.style.width = liRect.width + 'px';
    }

    /* Set to active on load */
    var activeItem = navLinks.querySelector('li.active');
    if (activeItem) {
      /* Wait until navbar is visible */
      setTimeout(function () { moveUnderline(activeItem); }, 400);
    }

    /* Follow hover */
    var items = navLinks.querySelectorAll('li');
    items.forEach(function (li) {
      li.addEventListener('mouseenter', function () { moveUnderline(li); });
    });

    navLinks.addEventListener('mouseleave', function () {
      var active = navLinks.querySelector('li.active');
      if (active) moveUnderline(active);
    });

    /* Follow active click */
    items.forEach(function (li) {
      li.addEventListener('click', function () {
        setTimeout(function () { moveUnderline(li); }, 10);
      });
    });
  }

  /* ─────────────────────────────────────────────
     STATS COUNTING ANIMATION HELPER
  ───────────────────────────────────────────── */
  function animateStatCounting(el, start, end, duration, suffix, onComplete) {
    var startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      // Easing: cubicBezier out-expo equivalent
      var easeProgress = 1 - Math.pow(2, -10 * progress);
      var currentValue = easeProgress * (end - start) + start;
      
      if (end % 1 === 0) {
        el.textContent = Math.floor(currentValue) + (suffix || '');
      } else {
        el.textContent = currentValue.toFixed(1) + (suffix || '');
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = end + (suffix || '');
        if (onComplete) onComplete();
      }
    }
    window.requestAnimationFrame(step);
  }

  /* ─────────────────────────────────────────────
     HERO PARALLAX DRIFT (Card and Radial Background)
  ───────────────────────────────────────────── */
  function initParallax() {
    if (REDUCED) return;
    
    var heroCardWrapper = document.querySelector('.featured-card-wrapper');
    var heroBackdrop = document.querySelector('.hero-backdrop');
    
    if (!heroCardWrapper && !heroBackdrop) return;
    
    var rafId = null;
    
    window.addEventListener('scroll', function () {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = null;
        var scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        if (heroCardWrapper) {
          var cardOffset = scrollY * 0.22; // 0.78x relative scroll rate
          heroCardWrapper.style.transform = 'translate3d(0, ' + cardOffset + 'px, 0)';
        }
        
        if (heroBackdrop) {
          var backdropOffset = scrollY * 0.55; // 0.45x relative scroll rate
          heroBackdrop.style.transform = 'translate3d(-50%, calc(-50% + ' + backdropOffset + 'px), 0)';
        }
      });
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────
     SCROLL INDICATOR (Divider line progress)
  ───────────────────────────────────────────── */
  function initScrollIndicator() {
    if (REDUCED) return;
    
    var divider = document.querySelector('.editorial-divider');
    if (!divider) return;
    
    var line = divider.querySelector('.divider-line');
    if (!line) return;
    
    // Override the CSS animation
    line.style.transition = 'none';
    
    var rafId = null;
    
    function updateIndicator() {
      var rect = divider.getBoundingClientRect();
      var viewportHeight = window.innerHeight;
      
      var startY = viewportHeight;
      var endY = viewportHeight * 0.4;
      
      var progress = (startY - rect.top) / (startY - endY);
      progress = Math.max(0, Math.min(1, progress));
      
      // Eased progress for fluid transition
      var easedProgress = progress * (2 - progress);
      
      line.style.transform = 'scaleX(' + easedProgress + ')';
    }
    
    window.addEventListener('scroll', function () {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = null;
        updateIndicator();
      });
    }, { passive: true });
    
    updateIndicator();
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    initPageEntry();
    initDividers();
    initHeadingReveals();
    initTopicReveal();
    initScrollReveal();   /* Must run after dividers + headings + topics are set up */
    initProximity();
    initCardClickthrough();
    initNavUnderline();
    initParallax();
    initScrollIndicator();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
