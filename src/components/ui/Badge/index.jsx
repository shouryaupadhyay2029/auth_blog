import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Reusable Badge UI component.
 */
export default function Badge({
  children,
  variant = 'secondary',
  className,
  ...props
}) {
  const baseStyles = 'inline-flex items-center px-2 py-0.5 rounded-sm text-caption font-medium font-heading uppercase tracking-wide border';
  
  const variants = {
    primary: 'bg-accent/10 border-accent/20 text-accent',
    secondary: 'bg-background border-border text-text-secondary',
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700',
    danger: 'bg-red-500/10 border-red-500/20 text-red-600',
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
