import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Container — content width boundary.
 *
 * RESPONSIBILITY: Container owns ONLY:
 *   • Maximum content width (1280px)
 *   • Horizontal padding (responsive: px-6 → px-8)
 *   • Auto horizontal centering (mx-auto)
 *
 * Container does NOT own:
 *   • Vertical spacing (→ use Section or gap/space-y)
 *   • Backgrounds (→ use Section className or Card)
 *   • Positioning (→ use parent layout)
 *
 * Always place Container directly inside Section:
 *   <Section>
 *     <Container>
 *       content
 *     </Container>
 *   </Section>
 */
export default function Container({
  children,
  className,
  as: Component = 'div',
}) {
  return (
    <Component className={cn('content-container', className)}>
      {children}
    </Component>
  );
}
