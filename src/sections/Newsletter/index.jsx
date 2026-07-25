import React from 'react';
import { Section } from '@/components/layout';
import { Container, SectionHeading } from '@/components/ui';

/**
 * NewsletterSection — placeholder section for newsletter subscriptions.
 * Responsibility: Owns its own space and contains content for Newsletter.
 */
export default function NewsletterSection() {
  return (
    <Section id="newsletter" className="min-h-125 flex items-center justify-center border-b border-border/40">
      <Container className="flex flex-col items-center justify-center text-center space-y-4">
        <SectionHeading
          badge="Newsletter"
          title="Newsletter Section"
          description="Implementation begins in Ticket 07"
          align="center"
          className="mb-0"
        />
      </Container>
    </Section>
  );
}
