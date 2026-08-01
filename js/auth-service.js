/**
 * BlogAuth V1 — auth-service.js
 * Authentication Service layer managing token storage and protected route redirects
 */

(function () {
  'use strict';

  var AuthService = {
    login: function (credentials) {
      return window.CentralAPI.login(credentials)
        .then(function (data) {
          if (data && data.token) {
            window.StorageHelper.setAccessToken(data.token);
            if (data.refreshToken) {
              window.StorageHelper.setRefreshToken(data.refreshToken);
            }
            if (data.user) {
              window.StorageHelper.setUser(data.user);
            }
            window.CustomRequest.showToast('Workspace authentication successful.', 'success');
            return data;
          } else {
            throw new Error('Invalid token response from server');
          }
        });
    },

    register: function (userData) {
      return window.CentralAPI.register(userData)
        .then(function (data) {
          window.CustomRequest.showToast('Workspace account created successfully.', 'success');
          return data;
        });
    },

    logout: function () {
      window.StorageHelper.clear();
      window.CustomRequest.showToast('Logged out of publishing workspace.', 'info');
      setTimeout(function () {
        window.location.href = 'login.html';
      }, 800);
    },

    checkAuth: function () {
      if (!window.StorageHelper.isAuthenticated()) {
        if (this.isProtectedRoute()) {
          window.location.href = 'login.html';
        }
      }
    },

    isProtectedRoute: function () {
      var protectedPages = ['dashboard.html', 'editor.html', 'settings.html', 'profile.html'];
      var currentPage = window.location.pathname.split('/').pop();
      return protectedPages.indexOf(currentPage) !== -1;
    }
  };

  window.AuthService = AuthService;

  // Run immediate authorization route guard validation checks
  AuthService.checkAuth();

})();
