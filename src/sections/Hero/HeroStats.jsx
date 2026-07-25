import React from 'react';

/**
 * HeroStats — Stats area showing four metrics.
 * Layout: 2x2 grid on mobile/tablet, 4 columns on desktop with 48px (lg:gap-12) gap.
 * Spacing: 56px (pt-14) top margin from buttons, border separator.
 */
export default function HeroStats() {
  const stats = [
    { value: '120+', label: 'Articles' },
    { value: '25+', label: 'Authors' },
    { value: '8', label: 'Categories' },
    { value: '1K+', label: 'Readers' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-24 lg:gap-48 pt-56 border-t border-border/20 w-full">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col text-left">
          <span className="text-[30px] font-bold font-heading text-text-primary leading-none">
            {stat.value}
          </span>
          <span className="text-[13px] font-semibold tracking-wider font-heading uppercase text-text-secondary mt-1.5">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

