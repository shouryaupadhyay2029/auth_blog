/**
 * BlogAuth V1 — request.js
 * Reusable Fetch Wrapper with Auth Headers, Refresh Tokens and Global Error Hooks
 */

(function () {
  'use strict';

  var API_BASE_URL = 'http://localhost:5000/api'; // Default backend server base URL

  function showToast(message, type) {
    // Create standard dynamic toast overlay to keep UI unified
    var toast = document.createElement('div');
    toast.className = 'api-toast toast-' + (type || 'info');
    toast.textContent = message;
    
    // Add basic styles dynamically so we do not modify existing main layout files
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: type === 'error' ? '#EF4444' : '#10B981',
      color: '#FFFFFF',
      padding: '12px 24px',
      fontFamily: 'var(--font-heading)',
      fontSize: '0.875rem',
      fontWeight: '600',
      zIndex: '99999',
      boxShadow: 'var(--shadow-lg)',
      borderLeft: '4px solid rgba(255,255,255,0.4)',
      transform: 'translateY(100px)',
      opacity: '0',
      transition: 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)'
    });

    document.body.appendChild(toast);
    
    // Force reflow and animate in
    toast.offsetHeight;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';

    setTimeout(function () {
      toast.style.transform = 'translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 4000);
  }

  function request(endpoint, options) {
    options = options || {};
    options.headers = options.headers || {};
    options.method = options.method || 'GET';

    // Set authorization header if token exists
    var token = window.StorageHelper ? window.StorageHelper.getAccessToken() : null;
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    if (!(options.body instanceof FormData) && typeof options.body === 'object') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    var url = endpoint.startsWith('http') ? endpoint : API_BASE_URL + endpoint;

    return fetch(url, options)
      .then(function (response) {
        if (response.status === 401) {
          // Token expired or invalid
          if (window.StorageHelper) {
            window.StorageHelper.clear();
          }
          // Redirect if current page is protected
          if (window.AuthService && window.AuthService.isProtectedRoute()) {
            window.location.href = 'login.html';
          }
          throw new Error('Unauthorized');
        }

        if (response.status === 403) {
          showToast('Forbidden access denied.', 'error');
          throw new Error('Forbidden');
        }

        if (!response.ok) {
          return response.json().then(function (err) {
            throw new Error(err.message || 'Request failed');
          }).catch(function () {
            throw new Error('Network response was not OK');
          });
        }

        // Handle empty responses
        if (response.status === 204) {
          return null;
        }

        return response.json();
      })
      .catch(function (error) {
        if (error.message !== 'Unauthorized' && error.message !== 'Forbidden') {
          showToast(error.message || 'Connection error', 'error');
        }
        throw error;
      });
  }

  window.CustomRequest = {
    request: request,
    showToast: showToast
  };

})();
