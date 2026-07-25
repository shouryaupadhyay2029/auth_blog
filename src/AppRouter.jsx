import React, { useState, useEffect } from 'react';
import Home from '@/pages/Home';
import DesignSystem from '@/pages/DesignSystem';

/**
 * AppRouter handles simple, lightweight, zero-dependency client-side routing.
 * Maps window.location.pathname dynamically.
 *
 * Navigation helper: use lib/navigate.js for programmatic route changes.
 */
export default function AppRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
    };
  }, []);

  // Standard route matching
  if (path === '/design-system') {
    return <DesignSystem />;
  }

  // Placeholder routes — wired in future tickets:
  // /articles      → Articles page
  // /article/:slug → Article page
  // /login         → Login page
  // /signup        → Signup page
  // /dashboard     → Dashboard page
  // /profile       → Profile page

  // Default: render Home for all unmatched paths
  return <Home />;
}
