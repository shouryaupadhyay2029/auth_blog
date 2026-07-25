import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { getInitials } from '@/lib/helpers';

/**
 * Avatar component renders profile photos with initials fallback.
 */
export default function Avatar({
  src,
  name,
  size = 'md',
  className,
  ...props
}) {
  const [error, setError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-caption',
    md: 'w-10 h-10 text-small',
    lg: 'w-16 h-16 text-body-lg',
  };

  const initials = getInitials(name);

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full bg-surface border border-border overflow-hidden select-none shrink-0 font-heading font-medium text-text-secondary',
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !error ? (
        <img
          src={src}
          alt={name}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span aria-label={name}>{initials || '?'}</span>
      )}
    </div>
  );
}
