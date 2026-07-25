import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { hoverLift } from '@/animations/motion';

/**
 * Reusable Card component supporting Editorial, Surface, and Interactive (hover motion) variants.
 */
export default function Card({
  children,
  variant = 'surface',
  onClick,
  className,
  as: Component = 'div',
  ...props
}) {
  const baseStyles = 'w-full text-left overflow-hidden flex flex-col h-auto';

  const variants = {
    editorial: 'bg-transparent border-b border-border/60 pb-8 rounded-none',
    surface: 'bg-card border border-border rounded-lg p-6 shadow-l1',
    interactive: 'bg-card border border-border rounded-lg p-6 shadow-l1 cursor-pointer hover:border-accent/40 hover:shadow-l2',
  };

  const isInteractive = variant === 'interactive';

  if (isInteractive) {
    return (
      <motion.div
        variants={hoverLift}
        whileHover="hover"
        onClick={onClick}
        className={cn(baseStyles, variants.interactive, className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <Component
      className={cn(baseStyles, variants[variant], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
}
