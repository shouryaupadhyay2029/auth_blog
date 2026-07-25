import React from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '../icons';

/**
 * Reusable, accessible, and flexible Button component.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: LeadingIcon,
  trailingIcon: TrailingIcon,
  className,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-heading font-medium transition-smooth select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2';
  
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover border border-transparent active:scale-[0.98]',
    secondary: 'bg-surface hover:bg-background border border-border text-text-primary active:scale-[0.98]',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent active:scale-[0.98]',
  };

  const sizes = {
    sm: 'text-caption py-1.5 px-3 rounded-sm gap-1.5',
    md: 'text-small py-2 px-4 rounded-md gap-2',
    lg: 'text-body py-3 px-6 rounded-lg gap-2.5',
  };

  const isBtnDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isBtnDisabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        isBtnDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {loading && (
        <Icon.Loader className="animate-spin text-current shrink-0" aria-hidden="true" />
      )}
      {!loading && LeadingIcon && (
        <LeadingIcon className="shrink-0" aria-hidden="true" />
      )}
      <span>{children}</span>
      {!loading && TrailingIcon && (
        <TrailingIcon className="shrink-0" aria-hidden="true" />
      )}
    </button>
  );
}
