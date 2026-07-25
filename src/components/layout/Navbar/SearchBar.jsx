import React from 'react';
import { Input } from '@/components/ui';
import { Icon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/**
 * Navigation search bar.
 * Hidden on mobile, responsive width on tablet (220px) vs desktop (300px).
 */
export default function SearchBar({ className }) {
  return (
    <div className={cn('hidden md:block w-55 lg:w-75 transition-all duration-300', className)}>
      <Input
        id="nav-search"
        type="text"
        placeholder="Search articles..."
        leadingIcon={Icon.Search}
        className="w-full h-9 py-1 bg-surface border-border/80 focus:ring-accent/10"
      />
    </div>
  );
}
