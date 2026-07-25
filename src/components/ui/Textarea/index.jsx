import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Reusable, accessible Textarea component.
 */
export default function Textarea({
  label,
  error,
  disabled = false,
  validationMessage,
  id,
  className,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 4,
  ...props
}) {
  const isError = !!error;

  return (
    <div className="flex flex-col w-full text-left gap-1.5">
      {label && (
        <label htmlFor={id} className="text-small font-heading font-medium text-text-primary">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={cn(
          'w-full bg-surface border font-body text-small px-3 py-2 rounded-md outline-none transition-smooth resize-y',
          'border-border text-text-primary',
          'focus:ring-2 focus:ring-accent/20 focus:border-accent',
          isError && 'border-red-500 focus:ring-red-500/20',
          disabled && 'opacity-60 cursor-not-allowed bg-background',
          className
        )}
        {...props}
      />
      {(isError || validationMessage) && (
        <span className={cn(
          'text-caption',
          isError ? 'text-red-500 font-medium' : 'text-text-secondary/80'
        )}>
          {error || validationMessage}
        </span>
      )}
    </div>
  );
}
