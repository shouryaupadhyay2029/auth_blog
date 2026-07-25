import React from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '../icons';

/**
 * Reusable Loader component supporting spinner and pulse variants.
 */
export default function Loader({
  variant = 'spinner',
  size = 'md',
  className,
  ...props
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  if (variant === 'pulse') {
    return (
      <div 
        className={cn('flex items-center gap-1.5', className)} 
        {...props}
      >
        <span className={cn('rounded-full bg-accent animate-pulse delay-75', sizes[size])} />
        <span className={cn('rounded-full bg-accent animate-pulse delay-150', sizes[size])} />
        <span className={cn('rounded-full bg-accent animate-pulse delay-300', sizes[size])} />
      </div>
    );
  }

  return (
    <div 
      className={cn('flex items-center justify-center', className)} 
      {...props}
    >
      <Icon.Loader 
        className={cn('animate-spin text-accent', sizes[size])} 
        aria-label="Loading..."
      />
    </div>
  );
}
