/**
 * BlogAuth V1 — article.js
 * Sprint 7: Article Detail Page Logic & Dynamic Connection
 *
 * Core Features:
 *  1. Scroll Progress indicator (GPU scaleX)
 *  2. Sticky Table of Contents active heading highlighter (IntersectionObserver)
 *  3. Soft scroll-reveal for article blocks (paragraphs, quotes, images, code blocks)
 *  4. Copy to clipboard functionality for code blocks
 *  5. Dynamic article loading from database (supports preview tokens)
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
        var targetHref = link.getAttribute('href');
        if (targetHref && targetHref.startsWith('#')) {
          var targetId = targetHref.substring(1);
          if (targetId === activeId) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
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
        if (targetId && targetId.startsWith('#')) {
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
     5. DYNAMIC DATABASE CONTENT LOADING
  ───────────────────────────────────────────── */
  function loadArticleDetails() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('id');
    var preview = params.get('preview');

    if (!id && !preview) return; // Fallback to mock static html if no parameters

    // Display skeleton
    var skeletonView = document.querySelector('.skeleton-content-view');
    var realView = document.querySelector('.real-content-view');
    if (skeletonView && realView) {
      skeletonView.style.display = 'block';
      realView.style.display = 'none';
    }

    var endpoint = preview ? ('/articles/preview/' + preview) : ('/articles/' + id);

    window.CustomRequest.request(endpoint)
      .then(function (res) {
        if (res && res.data && res.data.article) {
          var art = res.data.article;

          // Header fields
          var titleEl = document.querySelector('.article-main-title');
          if (titleEl) titleEl.textContent = art.title;
          document.title = art.title + ' — BlogAuth';

          var subtitleEl = document.querySelector('.article-subtitle');
          if (subtitleEl) subtitleEl.textContent = art.subtitle || '';

          var catEl = document.querySelector('.article-header-category');
          if (catEl) catEl.textContent = art.category ? art.category.name : 'General';

          var dateEl = document.querySelector('.article-header-date');
          if (dateEl) {
            dateEl.textContent = new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
          }

          var readEl = document.querySelector('.article-header-read-time');
          if (readEl) readEl.textContent = (art.readTime || 1) + ' min read';

          // Sidebar fields
          var sidebarMetaDate = document.querySelector('.sidebar-meta-item:nth-child(1) .sidebar-meta-value');
          if (sidebarMetaDate) {
            sidebarMetaDate.textContent = new Date(art.publishedAt || art.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          }

          var sidebarMetaRead = document.querySelector('.sidebar-meta-item:nth-child(2) .sidebar-meta-value');
          if (sidebarMetaRead) sidebarMetaRead.textContent = (art.readTime || 1) + ' min read';

          var sidebarMetaCat = document.querySelector('.sidebar-meta-item:nth-child(3) .sidebar-meta-value');
          if (sidebarMetaCat) sidebarMetaCat.textContent = art.category ? art.category.name : 'General';

          // Authors
          var authorNames = document.querySelectorAll('.mobile-author-name, .sidebar-author-header .mobile-author-name');
          authorNames.forEach(function (el) {
            el.textContent = art.author ? art.author.username : 'Anonymous Writer';
          });
          
          var authorBios = document.querySelectorAll('.sidebar-author-bio');
          authorBios.forEach(function (el) {
            el.textContent = art.author && art.author.bio ? art.author.bio : 'Writer for the BlogAuth engineering journal.';
          });

          // Body Content
          var bodyEl = document.getElementById('article-body');
          if (bodyEl) {
            var contentHtml = art.content || '';
            // Convert simple markdown elements if content looks like raw markdown text
            if (contentHtml.indexOf('<p>') === -1 && contentHtml.indexOf('</div>') === -1) {
              contentHtml = contentHtml
                .replace(/\r\n/g, '\n')
                .replace(/\n\n/g, '</p><p class="article-body-p">')
                .replace(/### (.*)\n/g, '<h3 class="article-body-h3" id="h3-$1">$1</h3>')
                .replace(/## (.*)\n/g, '<h2 class="article-body-h2" id="h2-$1">$1</h2>')
                .replace(/# (.*)\n/g, '<h1 class="article-body-h1" id="h1-$1">$1</h1>')
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, '<code>$1</code>')
                .replace(/> (.*)\n/g, '<blockquote>$1</blockquote>');
              contentHtml = '<p class="article-body-p">' + contentHtml + '</p>';
            }
            bodyEl.innerHTML = contentHtml;
          }

          // Insert Cover image if exists
          if (art.coverImage) {
            var coverImgUrl = art.coverImage.startsWith('/uploads') ? 'http://localhost:5000' + art.coverImage : art.coverImage;
            var coverFigure = document.createElement('figure');
            coverFigure.className = 'article-image-figure';
            coverFigure.innerHTML = 
              '<div class="article-image-wrapper" style="height:400px; max-height:400px;">' +
                '<img src="' + coverImgUrl + '" alt="Article Cover Image" style="width:100%; height:100%; object-fit:cover; border-radius:var(--radius);">' +
              '</div>';
            bodyEl.insertBefore(coverFigure, bodyEl.firstChild);
          }

          // Hide skeleton, show content
          if (skeletonView && realView) {
            skeletonView.style.display = 'none';
            realView.style.display = 'block';
          }

          // Re-render TOC & transitions on new content
          initTableOfContents();
          initArticleReveals();
          initCodeCopy();
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Error loading article details: ' + err.message, 'error');
      });
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    initTableOfContents();
    initArticleReveals();
    initCodeCopy();
    loadArticleDetails();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
