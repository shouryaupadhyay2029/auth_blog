/**
 * BlogAuth V1 — auth.js
 * Sprint 8: Authentication Experience with API integrations
 */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     1. STAGGERED PAGE ENTRY
  ───────────────────────────────────────────── */
  function initAuthEntry() {
    var elements = document.querySelectorAll('.auth-reveal');
    if (!elements.length) return;

    if (REDUCED) {
      elements.forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    elements.forEach(function (el, index) {
      var delay = parseInt(el.dataset.authDelay, 10) || (index * 80);
      setTimeout(function () {
        el.classList.add('revealed');
      }, delay);
    });
  }

  /* ─────────────────────────────────────────────
     2. LEFT PANEL DYNAMIC PUBLISHING MESSAGES
  ───────────────────────────────────────────── */
  function initQuoteRotation() {
    var quoteText = document.getElementById('auth-quote-text');
    var quoteAuthor = document.getElementById('auth-quote-author');
    if (!quoteText || !quoteAuthor) return;

    var messages = [
      {
        text: "“Write. Publish. Inspire. Clear design enables clear thinking.”",
        author: "ARCHIVE JOURNAL"
      },
      {
        text: "“A developer platform engineered for clarity, readability, and performance.”",
        author: "SYSTEM DESIGN SPEC"
      },
      {
        text: "“Decouple your services, simplify your models, and write clean articles.”",
        author: "ARCHITECTURAL BLUEPRINT"
      }
    ];

    var currentIndex = 0;

    setInterval(function () {
      if (REDUCED) return;
      
      quoteText.style.opacity = '0';
      quoteText.style.transform = 'translateY(4px)';
      quoteAuthor.style.opacity = '0';

      setTimeout(function () {
        currentIndex = (currentIndex + 1) % messages.length;
        quoteText.textContent = messages[currentIndex].text;
        quoteAuthor.textContent = messages[currentIndex].author;

        quoteText.style.opacity = '0.9';
        quoteText.style.transform = 'translateY(0)';
        quoteAuthor.style.opacity = '1';
      }, 500);

    }, 6000);
  }

  /* ─────────────────────────────────────────────
     3. FORM INPUT LABEL FEEDBACK
  ───────────────────────────────────────────── */
  function initInputEffects() {
    var inputs = document.querySelectorAll('.form-input');
    inputs.forEach(function (input) {
      var group = input.closest('.form-group');
      if (!group) return;
      var label = group.querySelector('.form-label');

      input.addEventListener('focus', function () {
        if (label) {
          label.style.color = 'var(--accent)';
        }
      });

      input.addEventListener('blur', function () {
        if (label) {
          label.style.color = '';
        }
      });
    });
  }

  /* ─────────────────────────────────────────────
     4. BACKEND SUBMIT FLOWS
  ───────────────────────────────────────────── */
  function clearErrors() {
    document.querySelectorAll('.form-validation-msg').forEach(function (msg) {
      msg.textContent = '';
    });
  }

  function showValidationError(fieldId, message) {
    var errorSlot = document.getElementById('validation-' + fieldId);
    if (errorSlot) {
      errorSlot.textContent = message;
    }
  }

  function setSubmittingState(form, isSubmitting) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (isSubmitting) {
      btn.disabled = true;
      btn.dataset.originalHtml = btn.innerHTML;
      btn.innerHTML = 'Connecting...';
      btn.style.opacity = '0.7';
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalHtml || 'Submit';
      btn.style.opacity = '';
    }
  }

  function initSubmitHandlers() {
    var form = document.querySelector('form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors();

      var currentPage = window.location.pathname.split('/').pop();
      var submitButton = form.querySelector('button[type="submit"]');

      setSubmittingState(form, true);

      if (currentPage === 'login.html') {
        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value;

        window.AuthService.login({ email: email, password: password })
          .then(function () {
            window.location.href = 'dashboard.html';
          })
          .catch(function (err) {
            showValidationError('password', err.message || 'Verification failed');
          })
          .finally(function () {
            setSubmittingState(form, false);
          });

      } else if (currentPage === 'register.html') {
        var name = document.getElementById('name').value.trim();
        var username = document.getElementById('username').value.trim();
        var email = document.getElementById('email').value.trim();
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('password_confirm').value;

        if (password !== confirmPassword) {
          showValidationError('password-confirm', 'Passwords do not match');
          setSubmittingState(form, false);
          return;
        }

        window.AuthService.register({
          name: name,
          username: username,
          email: email,
          password: password
        })
          .then(function () {
            window.location.href = 'login.html';
          })
          .catch(function (err) {
            showValidationError('email', err.message || 'Registration failed');
          })
          .finally(function () {
            setSubmittingState(form, false);
          });

      } else if (currentPage === 'forgot-password.html') {
        var email = document.getElementById('email').value.trim();

        window.CentralAPI.forgotPassword(email)
          .then(function () {
            window.CustomRequest.showToast('Reset email dispatched successfully.', 'success');
          })
          .catch(function (err) {
            showValidationError('email', err.message || 'Request failed');
          })
          .finally(function () {
            setSubmittingState(form, false);
          });

      } else if (currentPage === 'reset-password.html') {
        // Extract token from query param or hash path
        var urlParams = new URLSearchParams(window.location.search);
        var token = urlParams.get('token') || 'mock-reset-token';
        var password = document.getElementById('password').value;
        var confirmPassword = document.getElementById('password_confirm').value;

        if (password !== confirmPassword) {
          showValidationError('password-confirm', 'Passwords do not match');
          setSubmittingState(form, false);
          return;
        }

        window.CentralAPI.resetPassword(token, { password: password })
          .then(function () {
            window.CustomRequest.showToast('Workspace password updated successfully.', 'success');
            setTimeout(function () {
              window.location.href = 'login.html';
            }, 1000);
          })
          .catch(function (err) {
            showValidationError('password', err.message || 'Update failed');
          })
          .finally(function () {
            setSubmittingState(form, false);
          });
      }
    });
  }

  /* ─────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────── */
  function init() {
    initAuthEntry();
    initQuoteRotation();
    initInputEffects();
    initSubmitHandlers();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
