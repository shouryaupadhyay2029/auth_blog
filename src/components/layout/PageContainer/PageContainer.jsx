import React from 'react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import NoiseOverlay from './NoiseOverlay';
import GridBackground from './GridBackground';

/**
 * PageContainer — top-level page shell.
 *
 * RESPONSIBILITY: PageContainer owns ONLY:
 *   • Page background color and min-height
 *   • Decorative overlays (noise grain, grid lines)
 *   • Lenis smooth scroll initialization
 *   • The <main> semantic wrapper for all page content
 *
 * PageContainer does NOT own:
 *   • Content width (→ use Container)
 *   • Section spacing (→ use Section)
 *   • Component spacing (→ use gap / space-y on children)
 *
 * Every page must begin:
 *   <PageContainer>
 *     <Navbar />
 *     <Section>
 *       <Container>content</Container>
 *     </Section>
 *   </PageContainer>
 */
export default function PageContainer({ children }) {
  useSmoothScroll();

  return (
    <div className="bg-background text-text-primary min-h-screen relative selection:bg-accent selection:text-text-primary">
      {/* Decorative background overlays */}
      <NoiseOverlay />
      <GridBackground />

      {/* Page content — all children render inside the semantic <main> */}
      <main className="relative z-10 w-full flex flex-col">
        {children}
      </main>
    </div>
  );
}

