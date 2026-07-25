import React from 'react';
import { PageContainer, Navbar } from '@/components/layout';
import {
  HeroSection,
  FeaturedArticleSection,
  DiscoverySection,
  NewsletterSection,
  FooterSection,
} from '@/sections';

/**
 * Home — page composer.
 *
 * Layout Hierarchy:
 *   PageContainer
 *   └── Navbar
 *   └── HeroSection
 *   └── FeaturedArticleSection
 *   └── DiscoverySection
 *   └── NewsletterSection
 *   └── FooterSection
 */
export default function Home() {
  return (
    <PageContainer>
      <Navbar activePath="/" />
      <HeroSection />
      <FeaturedArticleSection />
      <DiscoverySection />
      <NewsletterSection />
      <FooterSection />
    </PageContainer>
  );
}


