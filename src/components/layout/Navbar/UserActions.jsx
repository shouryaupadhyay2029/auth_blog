import React from 'react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

/**
 * Renders user navigation actions (Sign In / Start Writing).
 * Reuses Button component.
 */
export default function UserActions({ className }) {
  const hoverTranslateClass = 'hover:-translate-y-0.5 motion-reduce:hover:transform-none transition-transform duration-200';

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn('text-text-secondary hover:text-text-primary px-3 py-1.5', hoverTranslateClass)}
      >
        Sign In
      </Button>
      <Button
        variant="primary"
        size="sm"
        className={cn('px-4 py-1.5 font-semibold text-caption', hoverTranslateClass)}
      >
        Start Writing
      </Button>
    </div>
  );
}
