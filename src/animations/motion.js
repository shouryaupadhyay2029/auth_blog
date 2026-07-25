/**
 * Reusable Framer Motion animation variants.
 */

const EASE_PREMIUM = [0.16, 1, 0.3, 1]; // easeOutExpo
const DURATION_NORMAL = 0.6;

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      duration: DURATION_NORMAL,
      ease: 'easeOut',
      ...custom,
    },
  }),
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_NORMAL,
      ease: EASE_PREMIUM,
      ...custom,
    },
  }),
};

export const fadeDown = {
  hidden: { opacity: 0, y: -24 },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION_NORMAL,
      ease: EASE_PREMIUM,
      ...custom,
    },
  }),
};

export const fadeLeft = {
  hidden: { opacity: 0, x: 24 },
  visible: (custom = {}) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION_NORMAL,
      ease: EASE_PREMIUM,
      ...custom,
    },
  }),
};

export const fadeRight = {
  hidden: { opacity: 0, x: -24 },
  visible: (custom = {}) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: DURATION_NORMAL,
      ease: EASE_PREMIUM,
      ...custom,
    },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      staggerChildren: custom.staggerChildren || 0.08,
      delayChildren: custom.delayChildren || 0.05,
      ...custom,
    },
  }),
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: EASE_PREMIUM,
    },
  },
};

export const hoverLift = {
  hover: {
    y: -6,
    transition: {
      duration: 0.25,
      ease: EASE_PREMIUM,
    },
  },
};

export const pageTransition = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: EASE_PREMIUM,
    },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

// Typography reveal variants
export const textRevealVariants = {
  hidden: { y: '100%' },
  visible: (custom = {}) => ({
    y: '0%',
    transition: {
      duration: 0.6,
      ease: EASE_PREMIUM,
      ...custom,
    },
  }),
};
