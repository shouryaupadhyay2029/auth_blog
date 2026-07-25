/**
 * SectionHeader — re-exports SectionHeading from ui/.
 *
 * This component exists only for backward-compatibility if this path is
 * ever referenced. Use the canonical import instead:
 *
 *   import SectionHeading from '@/components/ui/SectionHeading';
 *
 * SectionHeading (ui/) is the single implementation. SectionHeader (layout/)
 * is intentionally removed as a standalone component to avoid duplication.
 */
export { default } from '@/components/ui/SectionHeading';
