/**
 * BlogAuth V1 — editor.js
 * Editorial Studio Workspace Connection & Logic
 */

(function () {
  'use strict';

  var articleId = null;
  var lastSavedAt = null;
  var isDirty = false;
  var selectedTags = []; // Array of Tag Objects: {_id, name}
  var availableTags = []; // Cached query results

  // Redirect if not authenticated
  if (!window.StorageHelper || !window.StorageHelper.isAuthenticated()) {
    window.location.href = 'login.html';
    return;
  }

  /* ─────────────────────────────────────────────
     1. LIFECYCLE & INITIALIZATION
  ───────────────────────────────────────────── */
  function init() {
    // 1. Fetch url parameter ID
    var params = new URLSearchParams(window.location.search);
    articleId = params.get('id');

    // 2. Setup event listeners
    setupListeners();

    // 3. Load categories dynamic list
    loadCategories().then(function() {
      // 4. Fetch existing draft details if ID exists
      if (articleId) {
        loadArticleDraft(articleId);
      } else {
        document.getElementById('save-status-text').textContent = 'Unsaved draft (unsaved changes)';
      }
    });

    // 5. Start the 30-second autosave interval loop
    setInterval(function () {
      if (isDirty) {
        triggerAutosave();
      }
    }, 30000);
  }

  function setupListeners() {
    // Detect content dirty changes
    var textAreas = ['editor-title', 'editor-subtitle', 'editor-content', 'seo-title', 'seo-description', 'seo-keywords', 'seo-canonical'];
    textAreas.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () {
          isDirty = true;
          document.getElementById('save-indicator').className = 'status-dot saving';
          document.getElementById('save-status-text').textContent = 'Unsaved changes...';
        });
      }
    });

    var selects = ['article-category', 'publish-status', 'schedule-date', 'schedule-timezone'];
    selects.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', function () {
          isDirty = true;
          document.getElementById('save-indicator').className = 'status-dot saving';
          document.getElementById('save-status-text').textContent = 'Unsaved changes...';
        });
      }
    });

    // Manual Save Button
    document.getElementById('btn-manual-save').addEventListener('click', function () {
      triggerAutosave(true); // Force manual save
    });

    // Cover Upload triggers
    var dropzone = document.getElementById('cover-dropzone');
    var coverFileInput = document.getElementById('cover-file-input');
    var btnUploadCover = document.getElementById('btn-upload-cover');
    var btnRemoveCover = document.getElementById('btn-remove-cover');

    if (btnUploadCover && coverFileInput) {
      btnUploadCover.addEventListener('click', function () {
        coverFileInput.click();
      });
      coverFileInput.addEventListener('change', function () {
        if (coverFileInput.files.length > 0) {
          uploadCoverFile(coverFileInput.files[0]);
        }
      });
    }

    if (btnRemoveCover) {
      btnRemoveCover.addEventListener('click', removeCoverImage);
    }

    // Drag and drop cover image
    if (dropzone) {
      dropzone.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent)';
      });
      dropzone.addEventListener('dragleave', function () {
        dropzone.style.borderColor = 'var(--border)';
      });
      dropzone.addEventListener('drop', function (e) {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--border)';
        if (e.dataTransfer.files.length > 0) {
          uploadCoverFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Inline image upload
    var inlineFileInput = document.getElementById('inline-file-input');
    if (inlineFileInput) {
      inlineFileInput.addEventListener('change', function () {
        if (inlineFileInput.files.length > 0) {
          uploadInlineFile(inlineFileInput.files[0]);
        }
      });
    }

    // Tag management search
    var tagsSearch = document.getElementById('tags-search');
    if (tagsSearch) {
      tagsSearch.addEventListener('input', function () {
        var query = tagsSearch.value.trim();
        if (query.length >= 2) {
          searchTags(query);
        } else {
          document.getElementById('tags-suggestions-box').style.display = 'none';
        }
      });

      tagsSearch.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          var name = tagsSearch.value.trim();
          if (name.length > 0) {
            createNewTag(name);
          }
        }
      });
    }

    // Document click to close suggestions
    document.addEventListener('click', function (e) {
      var suggestions = document.getElementById('tags-suggestions-box');
      if (suggestions && e.target !== tagsSearch) {
        suggestions.style.display = 'none';
      }
    });

    // Workflow actions
    document.getElementById('btn-submit-review').addEventListener('click', submitForReview);
    document.getElementById('btn-publish-immediately').addEventListener('click', publishImmediately);
    document.getElementById('btn-schedule-post').addEventListener('click', schedulePublication);
    document.getElementById('btn-duplicate-draft').addEventListener('click', duplicateDraft);
    document.getElementById('btn-archive-draft').addEventListener('click', archiveDraft);
    document.getElementById('btn-delete-draft').addEventListener('click', deleteDraft);
    document.getElementById('btn-preview-draft').addEventListener('click', generatePreviewLink);
  }

  /* ─────────────────────────────────────────────
     2. TAXONOMY API CALLS & RENDERING
  ───────────────────────────────────────────── */
  function loadCategories() {
    return window.CustomRequest.request('/categories')
      .then(function (data) {
        var categorySelect = document.getElementById('article-category');
        if (categorySelect && data && data.results) {
          data.results.forEach(function (cat) {
            var option = document.createElement('option');
            option.value = cat._id;
            option.textContent = cat.name;
            categorySelect.appendChild(option);
          });
        }
      })
      .catch(function (err) {
        console.error('Failed to load categories:', err);
      });
  }

  function searchTags(query) {
    window.CustomRequest.request('/tags?q=' + encodeURIComponent(query))
      .then(function (data) {
        var box = document.getElementById('tags-suggestions-box');
        if (!box) return;

        if (data && data.results && data.results.length > 0) {
          box.innerHTML = '';
          data.results.forEach(function (tag) {
            var div = document.createElement('div');
            div.className = 'tag-suggest-item';
            div.textContent = tag.name;
            div.addEventListener('click', function () {
              addTagPill(tag);
              box.style.display = 'none';
              document.getElementById('tags-search').value = '';
            });
            box.appendChild(div);
          });
          box.style.display = 'flex';
        } else {
          box.style.display = 'none';
        }
      })
      .catch(function (err) {
        console.error('Search tags error:', err);
      });
  }

  function createNewTag(name) {
    window.CustomRequest.request('/tags', {
      method: 'POST',
      body: { name: name }
    })
      .then(function (res) {
        if (res && res.data) {
          addTagPill(res.data);
          document.getElementById('tags-search').value = '';
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Failed to create tag: ' + err.message, 'error');
      });
  }

  function addTagPill(tag) {
    // Prevent duplicate selections
    var exists = selectedTags.some(function (t) {
      return t._id === tag._id;
    });
    if (exists) return;

    selectedTags.push(tag);
    isDirty = true;

    renderTagPills();
  }

  function removeTagPill(tagId) {
    selectedTags = selectedTags.filter(function (t) {
      return t._id !== tagId;
    });
    isDirty = true;
    renderTagPills();
  }

  function renderTagPills() {
    var wrapper = document.getElementById('tags-wrapper');
    var searchInput = document.getElementById('tags-search');
    if (!wrapper || !searchInput) return;

    // Remove existing pills
    var pills = wrapper.querySelectorAll('.tag-pill');
    pills.forEach(function (pill) {
      pill.remove();
    });

    // Render new pills before the input box
    selectedTags.forEach(function (tag) {
      var pill = document.createElement('span');
      pill.className = 'tag-pill';
      pill.innerHTML = tag.name + ' <button type="button" data-id="' + tag._id + '">✕</button>';
      pill.querySelector('button').addEventListener('click', function () {
        removeTagPill(tag._id);
      });
      wrapper.insertBefore(pill, searchInput);
    });
  }

  /* ─────────────────────────────────────────────
     3. FILE UPLOADS
  ───────────────────────────────────────────── */
  function uploadCoverFile(file) {
    var formData = new FormData();
    formData.append('image', file);

    document.getElementById('save-status-text').textContent = 'Uploading cover image...';

    window.CustomRequest.request('/media/upload-cover', {
      method: 'POST',
      body: formData
    })
      .then(function (res) {
        if (res && res.url) {
          var img = document.getElementById('cover-image-img');
          img.src = res.url.startsWith('/uploads') ? 'http://localhost:5000' + res.url : res.url;
          img.style.display = 'block';
          document.getElementById('cover-placeholder').style.display = 'none';
          document.getElementById('btn-remove-cover').style.display = 'inline-block';
          isDirty = true;
          window.CustomRequest.showToast('Cover image uploaded successfully.', 'success');
          document.getElementById('save-status-text').textContent = 'Draft updated.';
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Upload cover failed: ' + err.message, 'error');
      });
  }

  function removeCoverImage() {
    var img = document.getElementById('cover-image-img');
    img.src = '';
    img.style.display = 'none';
    document.getElementById('cover-placeholder').style.display = 'block';
    document.getElementById('btn-remove-cover').style.display = 'none';
    isDirty = true;
  }

  function uploadInlineFile(file) {
    var formData = new FormData();
    formData.append('image', file);

    document.getElementById('save-status-text').textContent = 'Inserting inline image...';

    window.CustomRequest.request('/media/upload-inline', {
      method: 'POST',
      body: formData
    })
      .then(function (res) {
        if (res && res.url) {
          var url = res.url.startsWith('/uploads') ? 'http://localhost:5000' + res.url : res.url;
          var textarea = document.getElementById('editor-content');
          var insertText = '![Image Caption](' + url + ')';
          
          // Insert at cursor
          var start = textarea.selectionStart;
          var end = textarea.selectionEnd;
          var text = textarea.value;
          textarea.value = text.substring(0, start) + insertText + text.substring(end);
          isDirty = true;
          window.CustomRequest.showToast('Image uploaded and inserted successfully.', 'success');
          document.getElementById('save-status-text').textContent = 'Draft content updated.';
          textarea.focus();
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Upload inline image failed: ' + err.message, 'error');
      });
  }

  /* ─────────────────────────────────────────────
     4. DATA SAVING & SYNC
  ───────────────────────────────────────────── */
  function getFormData() {
    var coverImg = document.getElementById('cover-image-img');
    var coverUrl = (coverImg && coverImg.style.display === 'block') ? coverImg.src : '';
    // Strip host from coverUrl if it starts with localhost:5000
    if (coverUrl.startsWith('http://localhost:5000')) {
      coverUrl = coverUrl.replace('http://localhost:5000', '');
    }

    var keywordsVal = document.getElementById('seo-keywords').value.trim();
    var keywords = keywordsVal ? keywordsVal.split(',').map(function (k) { return k.trim(); }) : [];

    return {
      title: document.getElementById('editor-title').value.trim() || 'Untitled Article',
      subtitle: document.getElementById('editor-subtitle').value.trim(),
      content: document.getElementById('editor-content').value,
      coverImage: coverUrl,
      category: document.getElementById('article-category').value || undefined,
      tags: selectedTags.map(function (t) { return t._id; }),
      seoTitle: document.getElementById('seo-title').value.trim(),
      seoDescription: document.getElementById('seo-description').value.trim(),
      metaKeywords: keywords,
      canonicalUrl: document.getElementById('seo-canonical').value.trim()
    };
  }

  function triggerAutosave(forceManual) {
    var payload = getFormData();
    
    // Stop auto-saving empty content unless manual
    if (!forceManual && !payload.content && payload.title === 'Untitled Article') return;

    var indicator = document.getElementById('save-indicator');
    var textStatus = document.getElementById('save-status-text');

    indicator.className = 'status-dot saving';
    textStatus.textContent = 'Saving changes...';

    if (articleId) {
      // Autosave update
      payload.lastSavedAt = lastSavedAt;
      if (forceManual) {
        payload.versionSummary = 'Manual Save';
      }

      window.CustomRequest.request('/articles/' + articleId + '/autosave', {
        method: 'POST',
        body: payload
      })
        .then(function (res) {
          if (res && res.success) {
            isDirty = false;
            lastSavedAt = res.lastSavedTime;
            indicator.className = 'status-dot';
            textStatus.textContent = 'All changes saved (' + new Date(lastSavedAt).toLocaleTimeString() + ')';
            
            if (res.data && res.data.article) {
              document.getElementById('publish-status').value = res.data.article.status;
            }
            loadRevisionsList(articleId);
          }
        })
        .catch(function (err) {
          if (err.message && err.message.indexOf('Conflict') !== -1) {
            indicator.className = 'status-dot conflict';
            textStatus.textContent = 'Save Conflict: Draft open in another session.';
            window.CustomRequest.showToast('Save conflict occurred. Please reload to fetch recent changes.', 'error');
            isDirty = false; // Stop repeats until resolved
          } else {
            indicator.className = 'status-dot conflict';
            textStatus.textContent = 'Failed to autosave.';
          }
        });
    } else {
      // Create new draft
      window.CustomRequest.request('/articles', {
        method: 'POST',
        body: payload
      })
        .then(function (res) {
          if (res && res.data && res.data.article) {
            isDirty = false;
            articleId = res.data.article._id;
            lastSavedAt = res.data.article.updatedAt;
            
            indicator.className = 'status-dot';
            textStatus.textContent = 'Draft created (' + new Date(lastSavedAt).toLocaleTimeString() + ')';

            // Add id parameter to URL
            var newUrl = window.location.pathname + '?id=' + articleId;
            window.history.replaceState({ path: newUrl }, '', newUrl);

            document.getElementById('publish-status').value = res.data.article.status;
            loadRevisionsList(articleId);
          }
        })
        .catch(function (err) {
          indicator.className = 'status-dot conflict';
          textStatus.textContent = 'Failed to initialize draft.';
        });
    }
  }

  /* ─────────────────────────────────────────────
     5. LOAD EXISTENT DRAFTS
  ───────────────────────────────────────────── */
  function loadArticleDraft(id) {
    window.CustomRequest.request('/articles/' + id)
      .then(function (res) {
        if (res && res.data && res.data.article) {
          var art = res.data.article;
          lastSavedAt = art.updatedAt;

          document.getElementById('editor-title').value = art.title;
          document.getElementById('editor-subtitle').value = art.subtitle || '';
          document.getElementById('editor-content').value = art.content || '';
          
          if (art.coverImage) {
            var img = document.getElementById('cover-image-img');
            img.src = art.coverImage.startsWith('/uploads') ? 'http://localhost:5000' + art.coverImage : art.coverImage;
            img.style.display = 'block';
            document.getElementById('cover-placeholder').style.display = 'none';
            document.getElementById('btn-remove-cover').style.display = 'inline-block';
          }

          document.getElementById('publish-status').value = art.status;
          document.getElementById('article-category').value = art.category ? art.category._id : '';
          
          if (art.tags && art.tags.length > 0) {
            selectedTags = art.tags;
            renderTagPills();
          }

          // SEO inputs
          document.getElementById('seo-title').value = art.seoTitle || '';
          document.getElementById('seo-description').value = art.seoDescription || '';
          document.getElementById('seo-keywords').value = art.metaKeywords ? art.metaKeywords.join(', ') : '';
          document.getElementById('seo-canonical').value = art.canonicalUrl || '';

          // Scheduling
          if (art.scheduledAt) {
            // Populate datetime input
            var localTime = new Date(art.scheduledAt).toISOString().slice(0, 16);
            document.getElementById('schedule-date').value = localTime;
            document.getElementById('schedule-timezone').value = art.timezone || 'UTC';
          }

          // Indicator reset
          document.getElementById('save-indicator').className = 'status-dot';
          document.getElementById('save-status-text').textContent = 'Draft loaded successfully.';

          loadRevisionsList(id);
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Failed to load draft details: ' + err.message, 'error');
      });
  }

  function loadRevisionsList(id) {
    window.CustomRequest.request('/articles/' + id + '/versions')
      .then(function (res) {
        var container = document.getElementById('revision-container');
        if (!container) return;

        if (res && res.versions && res.versions.length > 0) {
          container.innerHTML = '';
          res.versions.forEach(function (ver) {
            var item = document.createElement('div');
            item.className = 'revision-item';
            item.innerHTML = 
              '<div class="revision-meta">' +
                '<span>' + new Date(ver.createdAt).toLocaleString() + '</span>' +
                '<span>by ' + (ver.editor ? ver.editor.username : 'Editor') + '</span>' +
              '</div>' +
              '<span class="revision-desc">' + ver.summary + '</span>' +
              '<span class="revision-btn-restore" data-id="' + ver._id + '">Restore revision</span>';
            
            item.querySelector('.revision-btn-restore').addEventListener('click', function () {
              restoreRevision(ver._id);
            });
            container.appendChild(item);
          });
        } else {
          container.innerHTML = '<span style="font-size:0.75rem; color:var(--text-secondary);">No revisions saved yet.</span>';
        }
      })
      .catch(function (err) {
        console.error('Failed to load version history:', err);
      });
  }

  function restoreRevision(versionId) {
    if (!articleId) return;

    if (confirm('Are you sure you want to restore the draft back to this revision? Any unsaved edits will be overwritten.')) {
      window.CustomRequest.request('/articles/' + articleId + '/versions/' + versionId + '/restore', {
        method: 'POST'
      })
        .then(function (res) {
          window.CustomRequest.showToast('Revision restored successfully.', 'success');
          // Reload details
          loadArticleDraft(articleId);
        })
        .catch(function (err) {
          window.CustomRequest.showToast('Failed to restore version: ' + err.message, 'error');
        });
    }
  }

  /* ─────────────────────────────────────────────
     6. WORKFLOW WORKSPACE ACTIONS
  ───────────────────────────────────────────── */
  function submitForReview() {
    if (!articleId) {
      window.CustomRequest.showToast('Please save your draft before submitting.', 'error');
      return;
    }

    // Force validation
    var category = document.getElementById('article-category').value;
    if (!category) {
      window.CustomRequest.showToast('Please classify this article with a Category before submitting.', 'error');
      return;
    }

    window.CustomRequest.request('/articles/' + articleId + '/review', {
      method: 'POST'
    })
      .then(function (res) {
        if (res && res.data && res.data.article) {
          document.getElementById('publish-status').value = res.data.article.status;
          window.CustomRequest.showToast('Article submitted for editorial review.', 'success');
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Review submission failed: ' + err.message, 'error');
      });
  }

  function publishImmediately() {
    if (!articleId) {
      window.CustomRequest.showToast('Please save your draft before publishing.', 'error');
      return;
    }

    var category = document.getElementById('article-category').value;
    if (!category) {
      window.CustomRequest.showToast('Please classify this article with a Category before publishing.', 'error');
      return;
    }

    window.CustomRequest.request('/articles/' + articleId + '/publish', {
      method: 'POST'
    })
      .then(function (res) {
        if (res && res.data && res.data.article) {
          document.getElementById('publish-status').value = res.data.article.status;
          window.CustomRequest.showToast('Article published successfully!', 'success');
          // Redirect back to dashboard shortly
          setTimeout(function() {
            window.location.href = 'dashboard.html';
          }, 1500);
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Publish failed: ' + err.message, 'error');
      });
  }

  function schedulePublication() {
    if (!articleId) {
      window.CustomRequest.showToast('Please save your draft before scheduling.', 'error');
      return;
    }

    var scheduledAt = document.getElementById('schedule-date').value;
    var timezone = document.getElementById('schedule-timezone').value;

    if (!scheduledAt) {
      window.CustomRequest.showToast('Please select a date and time to publish.', 'error');
      return;
    }

    window.CustomRequest.request('/articles/' + articleId + '/schedule', {
      method: 'POST',
      body: {
        scheduledAt: scheduledAt,
        timezone: timezone
      }
    })
      .then(function (res) {
        if (res && res.data && res.data.article) {
          document.getElementById('publish-status').value = res.data.article.status;
          window.CustomRequest.showToast('Post scheduled successfully!', 'success');
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Scheduling failed: ' + err.message, 'error');
      });
  }

  function duplicateDraft() {
    if (!articleId) return;

    window.CustomRequest.request('/articles/' + articleId + '/duplicate', {
      method: 'POST'
    })
      .then(function (res) {
        if (res && res.data && res.data.article) {
          window.CustomRequest.showToast('Draft duplicated successfully.', 'success');
          window.location.href = 'editor.html?id=' + res.data.article._id;
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Duplication failed: ' + err.message, 'error');
      });
  }

  function archiveDraft() {
    if (!articleId) return;

    window.CustomRequest.request('/articles/' + articleId + '/archive', {
      method: 'POST'
    })
      .then(function (res) {
        if (res && res.data && res.data.article) {
          document.getElementById('publish-status').value = res.data.article.status;
          window.CustomRequest.showToast('Article moved to archives.', 'success');
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Archiving failed: ' + err.message, 'error');
      });
  }

  function deleteDraft() {
    if (!articleId) return;

    if (confirm('Are you sure you want to delete this draft? This action is permanent.')) {
      window.CustomRequest.request('/articles/' + articleId, {
        method: 'DELETE'
      })
        .then(function () {
          window.CustomRequest.showToast('Draft deleted successfully.', 'success');
          window.location.href = 'dashboard.html';
        })
        .catch(function (err) {
          window.CustomRequest.showToast('Deletion failed: ' + err.message, 'error');
        });
    }
  }

  function generatePreviewLink() {
    if (!articleId) {
      window.CustomRequest.showToast('Please save your draft first to generate a preview link.', 'error');
      return;
    }

    window.CustomRequest.request('/articles/' + articleId + '/preview', {
      method: 'POST'
    })
      .then(function (res) {
        if (res && res.token) {
          // Open preview URL in a new window
          var previewUrl = 'article.html?preview=' + res.token;
          window.open(previewUrl, '_blank');
        }
      })
      .catch(function (err) {
        window.CustomRequest.showToast('Failed to generate preview token: ' + err.message, 'error');
      });
  }

  /* ─────────────────────────────────────────────
     INIT DOM TRIGGER
  ───────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
