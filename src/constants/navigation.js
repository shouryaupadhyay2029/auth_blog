import { ROUTES } from './routes';

/**
 * Public navigation links shown in Navbar and MobileDrawer.
 * Single source of truth for the visible nav items.
 */
export const PUBLIC_NAV_LINKS = [
  { label: 'Home', path: ROUTES.HOME },
  { label: 'Articles', path: ROUTES.ARTICLES },
  { label: 'Categories', path: '/categories' },
  { label: 'About', path: '/about' },
];

/**
 * Authenticated navigation links (future use).
 */
export const NAVIGATION = {
  mainLinks: [
    { label: 'Articles', path: ROUTES.ARTICLES },
    { label: 'Dashboard', path: ROUTES.DASHBOARD },
  ],
  userLinks: [
    { label: 'Profile', path: ROUTES.PROFILE },
    { label: 'Create Article', path: ROUTES.CREATE_ARTICLE },
    { label: 'Sign Out', path: '/logout' }
  ]
};

