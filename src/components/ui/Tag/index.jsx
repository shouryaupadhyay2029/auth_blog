import React from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '../icons';

/**
 * Reusable, interactive Tag UI component.
 */
export default function Tag({
  children,
  onRemove,
  active = false,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-small font-body border transition-smooth',
        active 
          ? 'bg-accent/10 border-accent/30 text-accent font-medium' 
          : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:border-text-secondary/30',
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:bg-accent/20 rounded-full p-0.5 inline-flex items-center justify-center transition-colors focus:outline-none"
          aria-label="Remove tag"
        >
          <Icon.X size={12} className="stroke-[2.5]" />
        </button>
      )}
    </span>
  );
}
