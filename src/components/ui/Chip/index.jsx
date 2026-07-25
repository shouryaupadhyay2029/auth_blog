import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Reusable Chip UI component for toggling filters/categories.
 */
export default function Chip({
  children,
  active = false,
  onClick,
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center px-4 py-1.5 rounded-full text-small font-heading font-medium border transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50',
        active
          ? 'bg-accent border-transparent text-white shadow-sm'
          : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-text-secondary/30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
