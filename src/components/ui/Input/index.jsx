import React from 'react';
import { cn } from '@/lib/cn';

/**
 * Reusable, accessible Input field component.
 */
export default function Input({
  type = 'text',
  label,
  error,
  disabled = false,
  leadingIcon: LeadingIcon,
  trailingIcon: TrailingIcon,
  validationMessage,
  id,
  className,
  placeholder,
  value,
  onChange,
  required = false,
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
      <div className="relative flex items-center w-full">
        {LeadingIcon && (
          <div className="absolute left-3 text-text-secondary pointer-events-none select-none flex items-center justify-center">
            <LeadingIcon size={16} aria-hidden="true" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          className={cn(
            'w-full bg-surface border font-body text-small px-3 py-2 rounded-md outline-none transition-smooth',
            'border-border text-text-primary',
            'focus:ring-2 focus:ring-accent/20 focus:border-accent',
            LeadingIcon && 'pl-10',
            TrailingIcon && 'pr-10',
            isError && 'border-red-500 focus:ring-red-500/20',
            disabled && 'opacity-60 cursor-not-allowed bg-background',
            className
          )}
          {...props}
        />
        {TrailingIcon && (
          <div className="absolute right-3 text-text-secondary pointer-events-none select-none flex items-center justify-center">
            <TrailingIcon size={16} aria-hidden="true" />
          </div>
        )}
      </div>
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
