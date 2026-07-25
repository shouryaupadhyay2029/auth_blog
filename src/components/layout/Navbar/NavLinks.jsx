import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { PUBLIC_NAV_LINKS } from '@/constants/navigation';

/**
 * Reusable navigation links component.
 * Displays underline spring transition for the active link.
 * Link list is sourced from constants/navigation.js.
 */
export default function NavLinks({ activePath = '/', className }) {
  return (
    <nav className={className} aria-label="Main Navigation">
      <ul className="flex items-center gap-8 font-heading text-small">
        {PUBLIC_NAV_LINKS.map((link) => {
          const isActive = activePath === link.path;

          return (
            <li key={link.path} className="relative py-1 flex items-center justify-center">
              <a
                href={link.path === '/' ? '#' : link.path}
                onClick={(e) => {
                  // If it's a page anchor # let's mock navigation behavior
                  if (link.path === '/' || link.path.startsWith('#')) {
                    e.preventDefault();
                  }
                }}
                className={cn(
                  'text-text-secondary transition-colors duration-300 hover:text-accent font-semibold tracking-tight',
                  isActive && 'text-text-primary'
                )}
              >
                {link.label}
              </a>
              {isActive && (
                <motion.div
                  layoutId="desktop-active-underline"
                  className="absolute bottom-[-4px] left-0 right-0 h-[1.5px] bg-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

