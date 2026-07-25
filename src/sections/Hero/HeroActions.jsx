import React from 'react';
import { Button } from '@/components/ui';

/**
 * HeroActions — CTA buttons area.
 * Reuses existing Button layout component.
 */
export default function HeroActions() {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-16 w-full sm:w-auto">
      <Button variant="primary" size="md" className="font-semibold text-caption uppercase tracking-wider justify-center">
        Start Writing
      </Button>
      <Button variant="ghost" size="md" className="font-semibold text-caption uppercase tracking-wider justify-center hover:underline underline-offset-4 decoration-accent">
        Explore Articles
      </Button>
    </div>
  );
}
