/**
 * BlogAuth V1 — dashboard.js
 * Sprint 9: Editorial Dashboard Logic with real API endpoints
 */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     1. STAGGERED PAGE ENTRY
  ───────────────────────────────────────────── */
  function initDashboardEntry() {
    var elements = document.querySelectorAll('.dash-reveal');
    if (!elements.length) return;

    if (REDUCED) {
      elements.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    elements.forEach(function (el, index) {
      var delay = parseInt(el.dataset.dashDelay, 10) || (index * 80);
      setTimeout(function () {
        el.classList.add('revealed');
      }, delay);
    });
  }

  /* ─────────────────────────────────────────────
     2. CHART ANIMATION HEIGHTS
  ───────────────────────────────────────────── */
  function initChartHeights() {
    var barFills = document.querySelectorAll('.chart-bar-fill');
    barFills.forEach(function (bar) {
      var height = bar.dataset.height || '50%';
      
      if (REDUCED) {
        bar.style.height = height;
        return;
      }

      bar.style.height = '0%';
      setTimeout(function () {
        bar.style.height = height;
      }, 300);
    });
  }

  /* ─────────────────────────────────────────────
     3. HEATMAP CELL INTERACTIVITY
  ───────────────────────────────────────────── */
  function initHeatmapTooltips() {
    var cells = document.querySelectorAll('.heatmap-cell');
    cells.forEach(function (cell) {
      var count = cell.dataset.count || '0';
      cell.setAttribute('title', count + ' articles written on this day');
    });
  }

  /* ─────────────────────────────────────────────
     4. POPULATE DASHBOARD WITH REAL API DATA
  ───────────────────────────────────────────── */
  function populateDashboard() {
    // If not authenticated, let auth-service redirect
    if (!window.StorageHelper || !window.StorageHelper.isAuthenticated()) return;

    // Set Welcome Header Date
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var todayStr = new Date().toLocaleDateString('en-US', options);
    var dateQuote = document.querySelector('.welcome-quote');
    if (dateQuote) {
      dateQuote.innerHTML = '“Clear design enables clear thinking.” — ' + todayStr;
    }

    // Load active user metadata info
    var activeUser = window.StorageHelper.getUser();
    if (activeUser) {
      var welcomeTitle = document.querySelector('.welcome-title');
      if (welcomeTitle) {
        welcomeTitle.textContent = 'Welcome back, ' + (activeUser.name || activeUser.username) + '.';
      }
    }

    // Hit the central API dashboard statistics endpoint
    window.CentralAPI.getDashboardData()
      .then(function (data) {
        if (!data) return;

        // Populate metrics values
        var metrics = document.querySelectorAll('.stat-card-val');
        if (metrics.length >= 4) {
          metrics[0].textContent = data.publishedCount || '0';
          metrics[1].textContent = data.draftCount || '0';
          metrics[2].textContent = data.viewsCount || '0';
          metrics[3].textContent = data.followersCount || '0';
        }

        // Populate Draft list
        var draftContainer = document.querySelector('.draft-list');
        if (draftContainer && data.drafts && data.drafts.length > 0) {
          draftContainer.innerHTML = '';
          data.drafts.forEach(function (draft) {
            var item = document.createElement('div');
            item.className = 'draft-item';
            item.innerHTML = 
              '<div class="draft-info">' +
                '<span class="draft-title">' + draft.title + '</span>' +
                '<div class="draft-meta">' +
                  '<span class="status-chip-draft">' + (draft.category || 'General') + '</span>' +
                  '<span>Edited ' + new Date(draft.updatedAt).toLocaleDateString() + '</span>' +
                '</div>' +
              '</div>' +
              '<button class="btn btn-secondary btn-sm" type="button">Continue Writing</button>';
            draftContainer.appendChild(item);
          });
        }

        // Populate Published table
        var tableBody = document.querySelector('.published-table tbody');
        if (tableBody && data.published && data.published.length > 0) {
          tableBody.innerHTML = '';
          data.published.forEach(function (article) {
            var row = document.createElement('tr');
            row.innerHTML = 
              '<td class="pub-title-col">' + article.title + '</td>' +
              '<td>' + (article.category || 'General') + '</td>' +
              '<td>' + (article.views || 0) + '</td>' +
              '<td>' + (article.likes || 0) + '</td>' +
              '<td>' + new Date(article.publishedAt || article.createdAt).toLocaleDateString() + '</td>' +
              '<td>' +
                '<div class="action-links">' +
                  '<span class="link-btn link-btn-edit" data-id="' + article._id + '">Edit</span>' +
                  '<span class="link-btn link-btn-delete" data-id="' + article._id + '">Delete</span>' +
                '</div>' +
              '</td>';
            tableBody.appendChild(row);
          });
          initTableActions();
        }
      })
      .catch(function (err) {
        console.warn('Dashboard endpoints are unavailable, fallback to design static placeholders.', err);
      });
  }

  function initTableActions() {
    document.querySelectorAll('.link-btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this article?')) {
          window.CentralAPI.deleteArticle(id)
            .then(function () {
              window.CustomRequest.showToast('Article deleted successfully.', 'success');
              populateDashboard(); // Refresh
            });
        }
      });
    });
  }

  function initLogout() {
    var signOutBtn = document.querySelector('a[href="index.html"].btn-ghost');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        window.AuthService.logout();
      });
    }
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    initDashboardEntry();
    initChartHeights();
    initHeatmapTooltips();
    populateDashboard();
    initLogout();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
