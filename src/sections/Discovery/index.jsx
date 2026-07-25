import React from 'react';
import { Section } from '@/components/layout';
import { Container, SectionHeading } from '@/components/ui';

/**
 * DiscoverySection — placeholder section for discovering categories/topics.
 * Responsibility: Owns its own space and contains content for Discovery.
 */
export default function DiscoverySection() {
  return (
    <Section id="discovery" className="min-h-125 flex items-center justify-center border-b border-border/40">
      <Container className="flex flex-col items-center justify-center text-center space-y-4">
        <SectionHeading
          badge="Discovery"
          title="Discovery Section"
          description="Implementation begins in Ticket 06"
          align="center"
          className="mb-0"
        />
      </Container>
    </Section>
  );
}
