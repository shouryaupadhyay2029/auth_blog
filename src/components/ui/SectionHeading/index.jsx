import React from 'react';
import { cn } from '@/lib/cn';

/**
 * SectionHeading renders a standard title + description block for page sections.
 */
export default function SectionHeading({
  title,
  description,
  badge,
  align = 'left',
  className,
}) {
  const isCenter = align === 'center';

  return (
    <div className={cn(
      'mb-12 flex flex-col',
      isCenter ? 'items-center text-center' : 'items-start text-left',
      className
    )}>
      {badge && (
        <span className="text-accent font-heading text-caption uppercase tracking-widest mb-3 block font-semibold">
          {badge}
        </span>
      )}
      <h2 className="text-section-title leading-tight mb-4 tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-body-md text-text-secondary max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
