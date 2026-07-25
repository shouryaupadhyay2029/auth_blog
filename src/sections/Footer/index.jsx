import React from 'react';
import { Section } from '@/components/layout';
import { Container, SectionHeading } from '@/components/ui';

/**
 * FooterSection — placeholder section for the homepage footer.
 * Responsibility: Owns its own space and contains content for Footer.
 */
export default function FooterSection() {
  return (
    <Section id="footer" as="footer" className="min-h-75 flex items-center justify-center">
      <Container className="flex flex-col items-center justify-center text-center space-y-4">
        <SectionHeading
          badge="Footer"
          title="Footer Section"
          description="Implementation begins in Ticket 08"
          align="center"
          className="mb-0"
        />
      </Container>
    </Section>
  );
}
