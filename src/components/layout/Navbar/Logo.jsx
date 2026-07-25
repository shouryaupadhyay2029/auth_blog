import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Reusable Typographic Logo component.
 */
export default function Logo({ className }) {
  return (
    <div className={cn('inline-flex items-center gap-2 select-none font-heading font-bold text-text-primary tracking-wider text-small', className)}>
      <span className="text-accent text-body" aria-hidden="true">▲</span>
      <span>BLOGAUTH</span>
    </div>
  );
}
