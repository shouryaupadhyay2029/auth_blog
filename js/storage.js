/**
 * BlogAuth V1 — storage.js
 * JWT & User state storage helper
 */

(function () {
  'use strict';

  var StorageHelper = {
    getAccessToken: function () {
      return localStorage.getItem('auth_access_token');
    },

    setAccessToken: function (token) {
      if (token) {
        localStorage.setItem('auth_access_token', token);
      } else {
        localStorage.removeItem('auth_access_token');
      }
    },

    getRefreshToken: function () {
      return localStorage.getItem('auth_refresh_token');
    },

    setRefreshToken: function (token) {
      if (token) {
        localStorage.setItem('auth_refresh_token', token);
      } else {
        localStorage.removeItem('auth_refresh_token');
      }
    },

    getUser: function () {
      var user = localStorage.getItem('auth_user');
      try {
        return user ? JSON.parse(user) : null;
      } catch (e) {
        return null;
      }
    },

    setUser: function (user) {
      if (user) {
        localStorage.setItem('auth_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('auth_user');
      }
    },

    clear: function () {
      localStorage.removeItem('auth_access_token');
      localStorage.removeItem('auth_refresh_token');
      localStorage.removeItem('auth_user');
    },

    isAuthenticated: function () {
      return !!this.getAccessToken();
    }
  };

  window.StorageHelper = StorageHelper;

})();
