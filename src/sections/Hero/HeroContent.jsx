import React from 'react';

/**
 * HeroContent — Left column typography block.
 * Includes Eyebrow, Heading, and Description.
 *
 * Responsibilities:
 *   • Eyebrow: Uppercase tag element.
 *   • Heading: 3-line headline with final word in emerald accent.
 *   • Description: Capped at max-width 540px.
 */
export default function HeroContent() {
  return (
    <div className="text-left flex flex-col">
      {/* Editorial Eyebrow */}
      <span className="text-sm font-semibold tracking-[0.18em] text-accent uppercase mb-20 block font-heading">
        EDITORIAL PLATFORM
      </span>

      {/* Main Heading (Write. Publish. Inspire.) */}
      <h1 className="text-4xl sm:text-5xl lg:text-[60px] xl:text-[72px] font-heading font-bold leading-[0.95] tracking-[-0.04em] text-text-primary max-w-155 flex flex-col">
        <span>Write.</span>
        <span>Publish.</span>
        <span className="text-accent">Inspire.</span>
      </h1>

      {/* Description Paragraph */}
      <p className="text-body-lg text-text-secondary max-w-135 mt-32 mb-40 leading-[1.75] font-light font-body">
        A thoughtful space for developers to publish engineering insights, tutorials, project breakdowns, and ideas worth sharing.
      </p>
    </div>
  );
}

