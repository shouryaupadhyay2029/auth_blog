/**
 * BlogAuth V1 — api.js
 * Centralized API endpoints layer
 */

(function () {
  'use strict';

  var API = {
    // Auth endpoints
    login: function (credentials) {
      return window.CustomRequest.request('/auth/login', {
        method: 'POST',
        body: credentials
      });
    },

    register: function (userData) {
      return window.CustomRequest.request('/auth/register', {
        method: 'POST',
        body: userData
      });
    },

    getCurrentUser: function () {
      return window.CustomRequest.request('/auth/me');
    },

    forgotPassword: function (email) {
      return window.CustomRequest.request('/auth/forgot-password', {
        method: 'POST',
        body: { email: email }
      });
    },

    resetPassword: function (token, passwords) {
      return window.CustomRequest.request('/auth/reset-password/' + token, {
        method: 'POST',
        body: passwords
      });
    },

    // Article endpoints
    getArticles: function () {
      return window.CustomRequest.request('/articles');
    },

    getArticleById: function (id) {
      return window.CustomRequest.request('/articles/' + id);
    },

    createArticle: function (articleData) {
      return window.CustomRequest.request('/articles', {
        method: 'POST',
        body: articleData
      });
    },

    updateArticle: function (id, articleData) {
      return window.CustomRequest.request('/articles/' + id, {
        method: 'PUT',
        body: articleData
      });
    },

    deleteArticle: function (id) {
      return window.CustomRequest.request('/articles/' + id, {
        method: 'DELETE'
      });
    },

    // User dashboard dashboard data endpoints
    getDashboardData: function () {
      return window.CustomRequest.request('/dashboard');
    }
  };

  window.CentralAPI = API;

})();
