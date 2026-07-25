import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { textRevealVariants, staggerContainer } from '@/animations/motion';

/**
 * AnimatedText — word-by-word scroll reveal component.
 *
 * Splits text into individual words and animates each word
 * upward out of an overflow-hidden mask as the element enters the viewport.
 *
 * @param {string}  text      - Text content to animate
 * @param {string}  className - Additional classes applied to the wrapper element
 * @param {string}  as        - HTML element to render as (default: 'h2')
 * @param {number}  delay     - Initial delay before first word animates (seconds)
 * @param {number}  stagger   - Delay between each word animation (seconds)
 */
export default function AnimatedText({
  text,
  className,
  as: Component = 'h2',
  delay = 0,
  stagger = 0.03,
}) {
  const words = text.split(' ');

  return (
    <Component className={cn('overflow-hidden flex flex-wrap select-none', className)}>
      <motion.span
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        custom={{ staggerChildren: stagger, delayChildren: delay }}
        className="inline-flex flex-wrap"
      >
        {words.map((word, idx) => (
          <span
            key={idx}
            className="relative inline-block overflow-hidden mr-[0.25em] pb-[0.05em]"
          >
            <motion.span
              variants={textRevealVariants}
              className="inline-block origin-bottom"
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}
