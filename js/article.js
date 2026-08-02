/**
 * BlogAuth V1 — article.js
 * Sprint 7: Article Detail Page Logic
 *
 * Core Features:
 *  1. Scroll Progress indicator (GPU scaleX)
 *  2. Sticky Table of Contents active heading highlighter (IntersectionObserver)
 *  3. Soft scroll-reveal for article blocks (paragraphs, quotes, images, code blocks)
 *  4. Copy to clipboard functionality for code blocks
 */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;



  /* ─────────────────────────────────────────────
     2. TABLE OF CONTENTS ACTIVE HEADING HIGHLIGHTER
  ───────────────────────────────────────────── */
  function initTableOfContents() {
    var tocLinks = document.querySelectorAll('.toc-link');
    var headings = document.querySelectorAll('.article-content h2, .article-content h3');
    if (!tocLinks.length || !headings.length) return;

    var headingStates = {};

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        headingStates[entry.target.id] = entry.isIntersecting;
      });

      // Find the first intersecting heading, or fallback to the closest one above the viewport
      var activeId = null;
      for (var i = 0; i < headings.length; i++) {
        var id = headings[i].id;
        if (headingStates[id]) {
          activeId = id;
          break;
        }
      }

      if (!activeId) {
        // Fallback: see which heading is closest to top of viewport
        var closest = null;
        var minTop = Infinity;
        headings.forEach(function (h) {
          var rect = h.getBoundingClientRect();
          if (rect.top < 200 && Math.abs(rect.top) < minTop) {
            minTop = Math.abs(rect.top);
            activeId = h.id;
          }
        });
      }

      // Highlight active link
      tocLinks.forEach(function (link) {
        var targetId = link.getAttribute('href').substring(1);
        if (targetId === activeId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0
    });

    headings.forEach(function (heading) {
      observer.observe(heading);
    });

    // Smooth scroll support
    tocLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var targetId = link.getAttribute('href');
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          var headerOffset = 90;
          var elementPosition = targetEl.getBoundingClientRect().top;
          var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: REDUCED ? 'auto' : 'smooth'
          });
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
     3. SOFT SCROLL REVEALS FOR ARTICLE BLOCKS
  ───────────────────────────────────────────── */
  function initArticleReveals() {
    var revealBlocks = document.querySelectorAll(
      '.article-body-p, .article-body-h2, .article-body-h3, ' +
      '.article-pull-quote, .article-callout, ' +
      '.article-code-block-wrapper, .article-image-figure, ' +
      '.article-content ul, .article-content ol'
    );

    if (!revealBlocks.length) return;

    revealBlocks.forEach(function (block) {
      block.classList.add('art-reveal');
    });

    if (REDUCED) {
      revealBlocks.forEach(function (block) {
        block.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.05
    });

    revealBlocks.forEach(function (block) {
      observer.observe(block);
    });
  }

  /* ─────────────────────────────────────────────
     4. CODE BLOCK COPY TO CLIPBOARD
  ───────────────────────────────────────────── */
  function initCodeCopy() {
    var copyButtons = document.querySelectorAll('.code-block-copy');
    copyButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var wrapper = btn.closest('.article-code-block-wrapper');
        if (!wrapper) return;
        var codeEl = wrapper.querySelector('.code-block-code');
        if (!codeEl) return;

        navigator.clipboard.writeText(codeEl.textContent).then(function () {
          var originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.style.color = 'var(--accent)';
          setTimeout(function () {
            btn.textContent = originalText;
            btn.style.color = '';
          }, 2000);
        }).catch(function (err) {
          console.error('Failed to copy text: ', err);
        });
      });
    });
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    initTableOfContents();
    initArticleReveals();
    initCodeCopy();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
