/**
 * Design System & Animation Tokens
 * 
 * All design decisions are semantic and purposeful:
 * - Colors encode information (success/warning/error/info)
 * - Animations reveal information or guide attention
 * - Spacing follows a 4px grid for consistency
 * - Typography uses 2 weights only (400/500) to reduce visual noise
 */

export const theme = {
  colors: {
    // Brand
    primary: {
      50: '#f0f7ff',
      100: '#e0edff',
      200: '#bae0ff',
      300: '#7bc8ff',
      400: '#36abff',
      500: '#0084ff', // Primary brand blue
      600: '#0066cc',
      700: '#0052a3',
      800: '#003d7a',
      900: '#001a33',
    },

    // Status colors (semantic meaning, not just decoration)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
    },
    info: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
    },

    // Neutral
    slate: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
  },

  /**
   * Animation strategy:
   * - Fast (150ms): micro-interactions (hover, focus, clicks)
   * - Standard (300ms): transitions between states
   * - Reveal (500ms): data entrance, score calculations
   * - Relax (800ms): complex multi-step animations
   * 
   * Easing:
   * - ease-out-cubic: for revealing/entering (feels like content "appears" naturally)
   * - ease-in-out-cubic: for state changes (smooth, intentional)
   * - ease-out-elastic: sparingly for celebratory moments
   */
  animation: {
    // Micro-interactions
    fast: {
      duration: 150,
      timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)', // ease-in-out
    },
    standard: {
      duration: 300,
      timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    reveal: {
      duration: 500,
      timingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)', // ease-out
    },
    relax: {
      duration: 800,
      timingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)', // ease-out-elastic
    },
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
  },

  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  typography: {
    fontFamily: {
      sans: '"Inter", system-ui, sans-serif',
      mono: '"Fira Code", monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '32px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  shadows: {
    // Minimal shadows for depth, not decoration
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Z-index layering (semantic, not arbitrary numbers)
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    tooltip: 1060,
  },
};

/**
 * Tailwind CSS animation definitions
 * Add to tailwind.config.ts:
 */
export const tailwindAnimations = {
  extend: {
    animation: {
      // Fade in (used for page/section entrance)
      fadeIn: 'fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
      fadeOut: 'fadeOut 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',

      // Slide in from directions (used for modals, panels)
      slideInUp: 'slideInUp 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      slideInDown: 'slideInDown 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      slideInLeft: 'slideInLeft 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      slideInRight: 'slideInRight 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',

      // Scale reveal (used for score numbers, badges)
      scaleIn: 'scaleIn 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      scaleOut: 'scaleOut 300ms cubic-bezier(0.4, 0, 0.2, 1) forwards',

      // Pulse (used for loading states, emphasis)
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',

      // Bounce (celebratory, used sparingly for good scores)
      bounce: 'bounce 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',

      // Shimmer (skeleton loading)
      shimmer: 'shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',

      // Number count (used for animated score display)
      countUp: 'countUp 800ms ease-out forwards',

      // Reveal from noise (high-impact moment like final score reveal)
      revealIn: 'revealIn 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
    },

    keyframes: {
      fadeIn: {
        from: { opacity: '0' },
        to: { opacity: '1' },
      },
      fadeOut: {
        from: { opacity: '1' },
        to: { opacity: '0' },
      },

      slideInUp: {
        from: { transform: 'translateY(16px)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
      },
      slideInDown: {
        from: { transform: 'translateY(-16px)', opacity: '0' },
        to: { transform: 'translateY(0)', opacity: '1' },
      },
      slideInLeft: {
        from: { transform: 'translateX(-24px)', opacity: '0' },
        to: { transform: 'translateX(0)', opacity: '1' },
      },
      slideInRight: {
        from: { transform: 'translateX(24px)', opacity: '0' },
        to: { transform: 'translateX(0)', opacity: '1' },
      },

      scaleIn: {
        from: { transform: 'scale(0.95)', opacity: '0' },
        to: { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        from: { transform: 'scale(1)', opacity: '1' },
        to: { transform: 'scale(0.95)', opacity: '0' },
      },

      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.5' },
      },

      bounce: {
        '0%': {
          transform: 'translateY(-10px)',
          opacity: '0',
        },
        '50%': {
          opacity: '1',
        },
        '100%': {
          transform: 'translateY(0)',
          opacity: '1',
        },
      },

      shimmer: {
        '0%': {
          backgroundPosition: '-1000px 0',
        },
        '100%': {
          backgroundPosition: '1000px 0',
        },
      },

      countUp: {
        from: { '--num': '0' },
        to: { '--num': 'var(--target-num)' },
      },

      revealIn: {
        from: {
          opacity: '0',
          filter: 'blur(4px)',
        },
        to: {
          opacity: '1',
          filter: 'blur(0)',
        },
      },
    },
  },
};
