import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Section — vertical rhythm + semantic wrapper.
 *
 * RESPONSIBILITY: Section owns ONLY:
 *   • Vertical spacing (section-spacing utility → py-16 / py-24)
 *   • Semantic HTML element (default: <section>, overridable via `as`)
 *   • Optional background overrides via `className`
 *   • overflow-hidden for contained backgrounds / gradients
 *
 * Section does NOT own:
 *   • Content width (→ use Container inside)
 *   • Horizontal padding (→ use Container inside)
 *   • Component-level spacing (→ use gap / space-y on children)
 *
 * Canonical usage:
 *   <Section>
 *     <Container>
 *       content
 *     </Container>
 *   </Section>
 */
export default function Section({
  children,
  id,
  className,
  as: Component = 'section',
}) {
  return (
    <Component
      id={id}
      className={cn(
        'py-16 md:py-24 relative w-full overflow-hidden',
        className
      )}
    >
      {children}
    </Component>
  );
}
