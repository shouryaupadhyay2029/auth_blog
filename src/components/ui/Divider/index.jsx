import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Reusable Divider component to separate elements.
 */
export default function Divider({
  orientation = 'horizontal',
  className,
  ...props
}) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'bg-border/60 shrink-0',
        isVertical ? 'w-px h-full self-stretch mx-4' : 'h-px w-full my-4',
        className
      )}
      {...props}
    />
  );
}
