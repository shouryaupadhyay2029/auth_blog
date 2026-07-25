import React from 'react';
import { Section } from '@/components/layout';
import { Container, SectionHeading } from '@/components/ui';

/**
 * FeaturedArticleSection — placeholder section for featured articles.
 * Responsibility: Owns its own space and contains content for Featured.
 */
export default function FeaturedArticleSection() {
  return (
    <Section id="featured" className="min-h-125 flex items-center justify-center border-b border-border/40">
      <Container className="flex flex-col items-center justify-center text-center space-y-4">
        <SectionHeading
          badge="Featured"
          title="Featured Articles Section"
          description="Implementation begins in Ticket 05"
          align="center"
          className="mb-0"
        />
      </Container>
    </Section>
  );
}
