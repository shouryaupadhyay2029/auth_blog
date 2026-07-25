import React from 'react';
import { Section } from '@/components/layout';
import { Container } from '@/components/ui';
import HeroContent from './HeroContent';
import HeroActions from './HeroActions';
import HeroStats from './HeroStats';
import FeaturedArticleShell from './FeaturedArticleShell';

/**
 * HeroSection — main page hero orchestrator.
 * Layout: CSS Grid columns (55% left / 45% right) on desktop, stacks on mobile/tablet.
 *
 * Responsibilities:
 *   • Grid layout composition.
 *   • Integration of HeroContent, HeroActions, HeroStats (left) and FeaturedArticleShell (right).
 */
export default function HeroSection() {
  return (
    <Section id="hero" className="pt-128 pb-64 md:pt-128 md:pb-64 border-b border-border/20">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-[55fr_45fr] gap-32 md:gap-48 lg:gap-64 xl:gap-80 items-start w-full">
          {/* Left Column: Flow of content, CTA actions, and stats */}
          <div className="flex flex-col gap-8 w-full">
            <HeroContent />
            <HeroActions />
            <HeroStats />
          </div>

          {/* Right Column: Featured article container block */}
          <div className="w-full flex items-center justify-center">
            <FeaturedArticleShell />
          </div>
        </div>
      </Container>
    </Section>
  );
}
