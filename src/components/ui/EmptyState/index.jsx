import React from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '../icons';

/**
 * Reusable EmptyState component when lists or content collections are empty.
 */
export default function EmptyState({
  title = 'No content found',
  description = 'There are no items to display at the moment.',
  icon: CustomIcon = Icon.AlertCircle,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-12 bg-surface border border-dashed border-border rounded-lg max-w-md mx-auto',
        className
      )}
      {...props}
    >
      <div className="p-3 bg-background border border-border rounded-full text-text-secondary/70 mb-4 flex items-center justify-center">
        <CustomIcon size={24} aria-hidden="true" />
      </div>
      <h3 className="text-body-lg font-heading font-medium text-text-primary mb-2">
        {title}
      </h3>
      <p className="text-small text-text-secondary mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
}
