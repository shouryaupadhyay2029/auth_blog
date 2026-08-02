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
     4. POPULATE DASHBOARD WITH REAL API DATA & STATES
  ───────────────────────────────────────────── */
  function getDraftSkeletonHtml() {
    return (
      '<div class="draft-item skeleton-bg sk-card" style="height:80px; margin-bottom:var(--spacing-16); padding:var(--spacing-16); box-sizing:border-box;">' +
        '<div class="skeleton-bg sk-title" style="height:16px; width:50%; margin-bottom:8px;"></div>' +
        '<div class="skeleton-bg sk-meta" style="height:12px; width:30%;"></div>' +
      '</div>'
    );
  }

  function getTableSkeletonHtml() {
    return (
      '<tr>' +
        '<td colspan="6" style="padding:var(--spacing-16);">' +
          '<div class="skeleton-bg" style="height:20px; width:90%; margin-bottom:12px;"></div>' +
          '<div class="skeleton-bg" style="height:20px; width:80%; margin-bottom:12px;"></div>' +
          '<div class="skeleton-bg" style="height:20px; width:85%;"></div>' +
        '</td>' +
      '</tr>'
    );
  }

  function renderEmptyState(container, title, message, type) {
    container.innerHTML = 
      '<div class="premium-empty-card" style="margin-top:var(--spacing-16);">' +
        '<div class="pec-illustration ' + type + '"></div>' +
        '<div class="pec-title">' + title + '</div>' +
        '<div class="pec-desc">' + message + '</div>' +
        (type === 'drafts' ? '<button class="btn btn-secondary btn-sm" id="btn-create-first-draft" type="button">Create Article</button>' : '') +
      '</div>';
    
    // Bind click trigger to new draft if exists
    var createDraftBtn = container.querySelector('#btn-create-first-draft');
    if (createDraftBtn) {
      createDraftBtn.addEventListener('click', function () {
        window.location.href = 'editor.html';
      });
    }
  }

  function renderErrorState(container, onRetry) {
    container.innerHTML = 
      '<div class="premium-empty-card" style="border-color:rgba(239,68,68,0.15); margin-top:var(--spacing-16);">' +
        '<div class="pec-title" style="color:#ef4444;">Connection Interrupted</div>' +
        '<div class="pec-desc">We encountered an issue loading workspace data from the server.</div>' +
        '<button class="btn btn-secondary btn-sm" id="btn-retry-load" type="button">Retry Connection</button>' +
      '</div>';
    
    var retryBtn = container.querySelector('#btn-retry-load');
    if (retryBtn && onRetry) {
      retryBtn.addEventListener('click', onRetry);
    }
  }

  function createSidebarCard(title, className, itemsHtml) {
    var sidebar = document.querySelector('.dashboard-actions-sidebar');
    if (!sidebar) return;

    // Check if card already exists
    var existingCard = sidebar.querySelector('.' + className);
    if (existingCard) {
      existingCard.remove();
    }

    var card = document.createElement('div');
    card.className = 'actions-card dash-reveal revealed ' + className;
    card.style.marginTop = 'var(--spacing-24)';
    card.innerHTML = 
      '<h4 class="actions-card-title">' + title + '</h4>' +
      '<div class="card-inner-list" style="margin-top:var(--spacing-16); display:flex; flex-direction:column; gap:var(--spacing-12);">' +
        itemsHtml +
      '</div>';
    
    sidebar.appendChild(card);
  }

  function populateDashboard() {
    if (!window.StorageHelper || !window.StorageHelper.isAuthenticated()) return;

    // Load active user profile meta
    var activeUser = window.StorageHelper.getUser();
    if (activeUser) {
      var welcomeTitle = document.querySelector('.welcome-title');
      if (welcomeTitle) {
        welcomeTitle.textContent = 'Welcome back, ' + (activeUser.username || 'Writer') + '.';
      }
    }

    // Set Welcome Header Date
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var todayStr = new Date().toLocaleDateString('en-US', options);
    var dateQuote = document.querySelector('.welcome-quote');
    if (dateQuote) {
      dateQuote.innerHTML = '“Clear design enables clear thinking.” — ' + todayStr;
    }

    // Initial Loaders
    var draftContainer = document.querySelector('.draft-list');
    var tableBody = document.querySelector('.published-table tbody');

    if (draftContainer) {
      draftContainer.innerHTML = getDraftSkeletonHtml() + getDraftSkeletonHtml();
    }
    if (tableBody) {
      tableBody.innerHTML = getTableSkeletonHtml();
    }

    // Fetch workspace parameters from backend API
    window.CentralAPI.getDashboardData()
      .then(function (data) {
        if (!data) return;

        // 1. Populate metrics values
        var metrics = document.querySelectorAll('.stat-card-val');
        if (metrics.length >= 4) {
          metrics[0].textContent = data.publishedCount || '0';
          metrics[1].textContent = data.draftCount || '0';
          metrics[2].textContent = data.viewsCount || '0';
          metrics[3].textContent = data.followersCount || '0';
        }

        // 2. Populate Draft list
        if (draftContainer) {
          if (!data.drafts || data.drafts.length === 0) {
            renderEmptyState(draftContainer, 'No drafts available', 'Your active writing projects will appear here once saved.', 'drafts');
          } else {
            draftContainer.innerHTML = '';
            data.drafts.forEach(function (draft) {
              var item = document.createElement('div');
              item.className = 'draft-item';
              item.innerHTML = 
                '<div class="draft-info">' +
                  '<span class="draft-title" style="cursor:pointer;" onclick="window.location.href=\'editor.html?id=' + draft._id + '\'">' + draft.title + '</span>' +
                  '<div class="draft-meta">' +
                    '<span class="status-chip-draft">Draft</span>' +
                    '<span>Edited ' + new Date(draft.updatedAt).toLocaleDateString() + '</span>' +
                  '</div>' +
                '</div>' +
                '<button class="btn btn-secondary btn-sm" type="button" onclick="window.location.href=\'editor.html?id=' + draft._id + '\'">Continue Writing</button>';
              draftContainer.appendChild(item);
            });
          }
        }

        // 3. Populate Published table
        if (tableBody) {
          if (!data.published || data.published.length === 0) {
            tableBody.innerHTML = 
              '<tr>' +
                '<td colspan="6" style="padding:var(--spacing-24);">' +
                  '<div class="pec-title" style="text-align:center; font-family:var(--font-heading); font-size:0.9375rem; color:var(--text-secondary);">No articles published yet.</div>' +
                '</td>' +
              '</tr>';
          } else {
            tableBody.innerHTML = '';
            data.published.forEach(function (article) {
              var row = document.createElement('tr');
              row.innerHTML = 
                '<td class="pub-title-col" style="cursor:pointer;" onclick="window.location.href=\'article.html?id=' + article._id + '\'">' + article.title + '</td>' +
                '<td>' + (article.category ? (article.category.name || 'General') : 'General') + '</td>' +
                '<td>' + (article.views || 0) + '</td>' +
                '<td>' + (article.likesCount || 0) + '</td>' +
                '<td>' + new Date(article.updatedAt || article.createdAt).toLocaleDateString() + '</td>' +
                '<td>' +
                  '<div class="action-links">' +
                    '<span class="link-btn link-btn-edit" data-id="' + article._id + '" style="cursor:pointer; color:var(--accent); font-weight:600; margin-right:8px;">Edit</span>' +
                    '<span class="link-btn link-btn-delete" data-id="' + article._id + '" style="cursor:pointer; color:#ef4444; font-weight:600;">Delete</span>' +
                  '</div>' +
                '</td>';
              tableBody.appendChild(row);
            });
            initTableActions();
          }
        }

        // 4. Render Bookmarks
        if (data.bookmarks && data.bookmarks.length > 0) {
          var bookmarkItems = data.bookmarks.map(function (b) {
            return (
              '<div style="font-size:0.8125rem; border-bottom:1px solid rgba(255,255,255,0.03); padding-bottom:8px;">' +
                '<a href="article.html?id=' + b._id + '" style="color:var(--text-primary); text-decoration:none; font-weight:600; display:block;">' + b.title + '</a>' +
                '<span style="color:var(--text-secondary); font-size:0.75rem;">by ' + (b.author ? b.author.username : 'Writer') + '</span>' +
              '</div>'
            );
          }).join('');
          createSidebarCard('Bookmarks', 'side-bookmarks', bookmarkItems);
        }

        // 5. Render Notifications
        if (data.notifications && data.notifications.length > 0) {
          var notificationItems = data.notifications.map(function (n) {
            var actionText = n.type === 'like' ? 'liked your post' : (n.type === 'comment' ? 'commented on your post' : 'replied to you');
            return (
              '<div style="font-size:0.8125rem; display:flex; flex-direction:column; gap:2px; border-bottom:1px solid rgba(255,255,255,0.03); padding-bottom:8px;">' +
                '<span style="color:var(--text-primary); font-weight:600;">' + (n.sender ? n.sender.username : 'User') + ' <span style="font-weight:400; color:var(--text-secondary);">' + actionText + '</span></span>' +
                '<span style="color:var(--accent); font-size:0.75rem; font-style:italic;">"' + (n.article ? n.article.title : '') + '"</span>' +
              '</div>'
            );
          }).join('');
          createSidebarCard('Notifications', 'side-notifications', notificationItems);
        }

        // 6. Render Recent Activities
        if (data.recentActivity && data.recentActivity.length > 0) {
          var activityItems = data.recentActivity.map(function (act) {
            return (
              '<div style="font-size:0.8125rem; color:var(--text-secondary); display:flex; justify-content:space-between; align-items:center;">' +
                '<span>' + act.action + '</span>' +
                '<span style="font-size:0.75rem; opacity:0.6;">' + new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</span>' +
              '</div>'
            );
          }).join('');
          createSidebarCard('Recent Activity', 'side-activity', activityItems);
        }

        // 7. Render Recent Readers
        if (data.recentReaders && data.recentReaders.length > 0) {
          var readerItems = data.recentReaders.map(function (r) {
            return (
              '<div style="font-size:0.8125rem; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.03); padding-bottom:8px;">' +
                '<div>' +
                  '<span style="color:var(--text-primary); font-weight:600; display:block;">' + (r.user ? r.user.username : 'Anonymous Reader') + '</span>' +
                  '<span style="color:var(--text-secondary); font-size:0.75rem;">read ' + r.progress + '% of article</span>' +
                '</div>' +
                '<span style="font-size:0.75rem; opacity:0.6;">' + new Date(r.readAt).toLocaleDateString() + '</span>' +
              '</div>'
            );
          }).join('');
          createSidebarCard('Recent Readers', 'side-readers', readerItems);
        }
      })
      .catch(function (err) {
        console.error('Dashboard load error:', err);
        if (draftContainer) {
          renderErrorState(draftContainer, populateDashboard);
        }
        if (tableBody) {
          tableBody.innerHTML = 
            '<tr>' +
              '<td colspan="6" style="padding:var(--spacing-24); text-align:center; color:#ef4444; font-weight:600;">' +
                'Failed to load published articles from server.' +
              '</td>' +
            '</tr>';
        }
      });
  }

  function initTableActions() {
    document.querySelectorAll('.link-btn-delete').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.dataset.id;
        if (confirm('Are you sure you want to delete this article?')) {
          window.CentralAPI.deleteArticle(id)
            .then(function () {
              window.CustomRequest.showToast('Article deleted successfully.', 'success');
              populateDashboard(); // Refresh
            })
            .catch(function (err) {
              window.CustomRequest.showToast('Failed to delete article: ' + err.message, 'error');
            });
        }
      });
    });

    document.querySelectorAll('.link-btn-edit').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id = btn.dataset.id;
        window.location.href = 'editor.html?id=' + id;
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
