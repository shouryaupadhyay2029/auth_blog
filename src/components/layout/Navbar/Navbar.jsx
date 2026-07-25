import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui';
import Logo from './Logo';
import NavLinks from './NavLinks';
import SearchBar from './SearchBar';
import UserActions from './UserActions';
import MobileDrawer from './MobileDrawer';
import useScrollState from '@/hooks/useScrollState';
import { Icon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/**
 * Fixed, floating premium navigation header.
 * Uses CSS grid columns to keep elements aligned without justify-between hacks.
 */
export default function Navbar({ activePath = '/' }) {
  const isScrolled = useScrollState(80);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-5 left-0 right-0 z-50 w-full px-4"
      >
        <Container className="p-0">
          <div
            className={cn(
              'h-18 rounded-xl border px-6 flex items-center transition-all duration-300',
              'grid grid-cols-[auto_1fr_auto] md:grid-cols-[auto_auto_1fr_auto_auto] gap-6',
              isScrolled
                ? 'bg-card/98 border-border shadow-l2'
                : 'bg-background/90 border-border/50 shadow-l1 backdrop-blur-md'
            )}
          >
            {/* Column 1: Logo */}
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="BlogAuth homepage">
              <Logo />
            </a>

            {/* Column 2: Navigation Links (Desktop only) */}
            <NavLinks activePath={activePath} className="hidden lg:block" />

            {/* Column 3: Flexible Spacer (Invisible, automatically takes remaining space in grid) */}
            <div className="hidden md:block" aria-hidden="true" />

            {/* Column 4: Search Bar (Desktop & Tablet only) */}
            <SearchBar className="hidden md:block" />

            {/* Column 5: User Actions (Desktop only) / Drawer trigger */}
            <div className="flex items-center gap-4 justify-self-end">
              <UserActions className="hidden lg:flex" />

              {/* Hamburger Button (Mobile & Tablet Drawer Trigger) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                aria-expanded={isDrawerOpen}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border rounded-md transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <Icon.Menu size={20} />
              </button>
            </div>
          </div>
        </Container>
      </motion.header>

      {/* Slide-out Mobile/Tablet Drawer */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activePath={activePath}
      />
    </>
  );
}
