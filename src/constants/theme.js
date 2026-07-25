export const THEME = {
  colors: {
    background: '#121214', // Charcoal
    surface: '#1A1A1E',
    card: '#202024',
    textPrimary: '#F4F4F5',
    textSecondary: '#A1A1AA',
    accent: '#10B981',
    accentHover: '#34D399',
    border: '#27272A',
  },
  spacing: {
    '4': '0.25rem',
    '8': '0.5rem',
    '12': '0.75rem',
    '16': '1rem',
    '20': '1.25rem',
    '24': '1.5rem',
    '32': '2rem',
    '40': '2.5rem',
    '48': '3rem',
    '64': '4rem',
    '80': '5rem',
    '96': '6rem',
    '128': '8rem',
  },
  typography: {
    fontHeading: 'General Sans, sans-serif',
    fontBody: 'Inter, sans-serif',
    scales: {
      display: 'clamp(2.5rem, 6vw, 4.5rem)',
      h1: 'clamp(2rem, 4vw, 3rem)',
      h2: 'clamp(1.5rem, 3vw, 2.25rem)',
      h3: 'clamp(1.25rem, 2vw, 1.5rem)',
      bodyLarge: '1.125rem',
      body: '1rem',
      small: '0.875rem',
      caption: '0.75rem',
      metadata: '0.75rem',
    }
  },
  borderRadius: {
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    full: '9999px',
  },
  shadows: {
    l1: '0 2px 8px -1px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)', // Level 1: Cards
    l2: '0 10px 20px -5px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)', // Level 2: Floating Elements
    l3: '0 25px 50px -12px rgba(0, 0, 0, 0.15)', // Level 3: Modals
  },
  animations: {
    durationFast: 0.15,
    durationNormal: 0.3,
    durationSlow: 0.6,
    easePremium: [0.16, 1, 0.3, 1], // easeOutExpo
  }
};
