import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import { Button, Divider } from '@/components/ui';
import { Icon } from '@/components/ui/icons';
import { cn } from '@/lib/cn';
import { PUBLIC_NAV_LINKS } from '@/constants/navigation';

/**
 * Mobile navigation slide-out drawer.
 * Handles focus trapping, Esc key binding, click-outside overlays, and body scroll locking.
 */
export default function MobileDrawer({ isOpen, onClose, activePath = '/' }) {
  const drawerRef = useRef(null);
  const triggerRef = useRef(null);

  // Store trigger element to restore focus on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Auto-focus close button on mount
      setTimeout(() => {
        const closeBtn = drawerRef.current?.querySelector('[aria-label="Close menu"]');
        closeBtn?.focus();
      }, 50);
    } else {
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key listener & Focus trapping
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusable = drawerRef.current?.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-10000 md:hidden">

          {/* Overlay fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-text-primary/20 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Drawer panel slide */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
            className="absolute right-0 top-0 bottom-0 w-4/5 max-w-sm bg-background border-l border-border/80 shadow-l3 p-6 flex flex-col justify-between"
          >
            {/* Header & Logo */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="p-1 text-text-secondary hover:text-text-primary hover:bg-surface border border-transparent hover:border-border rounded-md transition-smooth focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <Icon.X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav aria-label="Mobile Navigation">
                <ul className="flex flex-col gap-4">
                  {PUBLIC_NAV_LINKS.map((link) => {
                    const isActive = activePath === link.path;
                    return (
                      <li key={link.path}>
                        <a
                          href={link.path === '/' ? '#' : link.path}
                          onClick={(e) => {
                            if (link.path === '/' || link.path.startsWith('#')) {
                              e.preventDefault();
                            }
                            onClose();
                          }}
                          className={cn(
                            'block py-2 text-body font-heading font-semibold text-text-secondary hover:text-accent transition-colors',
                            isActive && 'text-text-primary'
                          )}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            {/* Actions Footer */}
            <div className="space-y-4">
              <Divider />
              <div className="flex flex-col gap-3">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full justify-center"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  onClick={onClose}
                  className="w-full justify-center text-caption font-semibold"
                >
                  Start Writing
                </Button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
