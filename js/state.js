/* BlogAuth V1 state.js — Sprint 12: Application State Management & Interaction Simulator */

// Global Toast Manager
window.showToast = function(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  // Create Toast
  const toast = document.createElement('div');
  toast.className = `toast-card toast-${type}`;
  
  // Icon selections
  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  } else if (type === 'warning') {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
  } else {
    iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <p class="toast-message">${message}</p>
    </div>
    <button class="toast-close" aria-label="Close notification">✕</button>
  `;

  container.appendChild(toast);

  // Trigger scale reveal
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto dismiss listeners
  const dismissTimer = setTimeout(() => {
    dismissToast(toast);
  }, 4000);

  // Manual dismiss click listener
  toast.querySelector('.toast-close').addEventListener('click', () => {
    clearTimeout(dismissTimer);
    dismissToast(toast);
  });
};

function dismissToast(toast) {
  toast.classList.remove('show');
  toast.classList.add('hide');
  setTimeout(() => {
    toast.remove();
  }, 350);
}

document.addEventListener('DOMContentLoaded', () => {
  // ─────────────────────────────────────────────────────────────────
  // 1. ONLINE / OFFLINE CONNECTIVITY MONITOR
  // ─────────────────────────────────────────────────────────────────
  let banner = document.getElementById('offline-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'offline-banner';
    banner.className = 'offline-banner';
    banner.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-3.536 5 5 0 011.414-3.536m0 0L5.636 5.636M3 3l18 18"/>
      </svg>
      No active database connection detected. Working in offline mode.
    `;
    document.body.appendChild(banner);
  }

  function checkOnlineState() {
    if (navigator.onLine) {
      if (banner.classList.contains('active')) {
        banner.classList.remove('active');
        window.showToast("Database connection restored successfully.", "success");
      }
    } else {
      banner.classList.add('active');
      window.showToast("Local offline mode active. Working with cached content.", "warning");
    }
  }

  window.addEventListener('online', checkOnlineState);
  window.addEventListener('offline', checkOnlineState);
  
  // Initial check
  if (!navigator.onLine) {
    banner.classList.add('active');
  }

  // ─────────────────────────────────────────────────────────────────
  // 2. FORM VALIDATION & INTERACTIVE STATE BUTTONS
  // ─────────────────────────────────────────────────────────────────
  const loginForm = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginSubmitBtn = document.getElementById('login-submit-btn');

  if (loginForm && loginSubmitBtn) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = emailInput ? emailInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value.trim() : '';

      // Reset styles
      if (emailInput) emailInput.classList.remove('input-error-shake');
      if (passwordInput) passwordInput.classList.remove('input-error-shake');

      // Empty asserts
      if (!email || !password) {
        window.showToast("Credentials fields are required.", "error");
        if (!email && emailInput) {
          emailInput.classList.add('input-error-shake');
          emailInput.focus();
        } else if (!password && passwordInput) {
          passwordInput.classList.add('input-error-shake');
          passwordInput.focus();
        }
        return;
      }

      // Check simulated credentials
      if (email !== 'admin@blogauth.com') {
        window.showToast("Email does not exist in our systems index.", "error");
        if (emailInput) {
          emailInput.classList.add('input-error-shake');
          emailInput.focus();
        }
        return;
      }

      if (password !== 'admin123') {
        window.showToast("Incorrect password validation.", "error");
        if (passwordInput) {
          passwordInput.classList.add('input-error-shake');
          passwordInput.focus();
        }
        return;
      }

      // Successful Auth simulation
      const originalText = loginSubmitBtn.innerHTML;
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.innerHTML = `<span class="btn-spinner"></span>Authenticating...`;
      
      setTimeout(() => {
        window.showToast("Developer access verified! Welcome back.", "success");
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 800);
      }, 1500);
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // 3. PAGE INITIAL LOADER SIMULATORS (Landing & Categories Grid)
  // ─────────────────────────────────────────────────────────────────
  const simLoaders = document.querySelectorAll('.page-skeleton-trigger');
  simLoaders.forEach(section => {
    const realContent = section.querySelector('.real-content-view');
    const skeletonView = section.querySelector('.skeleton-content-view');
    
    if (realContent && skeletonView) {
      // Simulate API query loads
      setTimeout(() => {
        skeletonView.style.display = 'none';
        realContent.style.display = 'block';
        
        // Trigger GSAP ScrollTrigger refresh to align offsets
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 750);
    }
  });
});
