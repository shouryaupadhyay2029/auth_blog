/**
 * Layout components barrel export.
 *
 * Usage: import { PageContainer, Navbar, Section } from '@/components/layout';
 *
 * Hierarchy (use in this order inside every page):
 *   PageContainer → Navbar → Section → Container → content
 */
export { default as PageContainer } from './PageContainer/PageContainer';
export { default as Navbar } from './Navbar';
export { default as Section } from './Section/Section';
export { default as Footer } from './Footer';

/**
 * SectionHeader re-exports SectionHeading — import from ui/ instead.
 * @deprecated Use SectionHeading from '@/components/ui'.
 */
export { default as SectionHeader } from './SectionHeader';
