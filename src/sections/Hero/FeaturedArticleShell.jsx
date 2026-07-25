import React from 'react';
import { Card, Avatar } from '@/components/ui';

/**
 * FeaturedArticleShell — Right column polished featured card.
 * Renders the primary featured article with a cover photo, title, excerpt, and user metadata.
 *
 * Responsibilities:
 *   • Card Container: rounded-24, padding-28, transition effects, shadow.
 *   • Image: 16:10 aspect ratio cover photo.
 *   • Category & Text: Editorial typography.
 *   • Metadata: Author details (Avatar, Name, Date, Read time).
 *   • Read Link: Interactive arrow hover translate effect.
 */
export default function FeaturedArticleShell() {
  return (
    <Card className="w-full p-28 flex flex-col gap-24 bg-surface/50 border border-border/40 rounded-3xl shadow-l1 hover:translate-y-[-4px] transition-all duration-250 ease-out group">
      {/* 16:10 Cover Photo */}
      <img
        src="/featured_cover.png"
        alt="Designing Systems Cover Photo"
        className="w-full aspect-16/10 object-cover rounded-3xl border border-border/20 select-none pointer-events-none"
      />

      {/* Content Flow */}
      <div className="flex flex-col gap-16 text-left">
        {/* Category Badge */}
        <span className="text-caption font-semibold tracking-[0.12em] text-accent uppercase font-heading">
          Development
        </span>

        {/* Title */}
        <h3 className="text-2xl lg:text-[34px] font-bold leading-[1.2] text-text-primary font-heading line-clamp-2">
          Designing Systems That Scale Beyond the MVP
        </h3>

        {/* Excerpt */}
        <p className="text-body-md text-text-secondary leading-relaxed font-body line-clamp-3">
          Learn how thoughtful architecture, reusable design systems, and scalable frontend patterns make products easier to build and maintain.
        </p>

        {/* Separator Divider */}
        <div className="h-px bg-border/20 w-full my-1" aria-hidden="true" />

        {/* Author Metadata Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Avatar
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80"
              name="Shourya Upadhyay"
              size="sm"
            />
            <div className="flex items-center gap-6 text-caption font-heading text-text-secondary">
              <span className="font-medium text-text-primary">Shourya Upadhyay</span>
              <span>•</span>
              <span>July 24, 2026</span>
              <span>•</span>
              <span>5 min read</span>
            </div>
          </div>

          {/* Read Article Link */}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="inline-flex items-center text-caption font-semibold text-text-primary font-heading tracking-wide hover:text-accent transition-colors duration-200"
          >
            <span>Read Article</span>
            <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200">
              →
            </span>
          </a>
        </div>
      </div>
    </Card>
  );
}

