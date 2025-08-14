// Central theme file with design tokens
export const theme = {
  colors: {
    // Purple scale (primary brand colors)
    purple: {
      50: '#f3e8fd',   // Very light background tint
      100: '#e6d7fc',  // Light background
      200: '#d4b4fb',  // Subtle accents
      300: '#c084f5',  // Light interactive elements
      400: '#a855f7',  // Secondary purple
      500: '#8b5cf6',  // PRIMARY purple (main brand color)
      600: '#7c3aed',  // Hover states
      700: '#6d28d9',  // Active/pressed states
      800: '#5b21b6',  // Dark purple
      900: '#4c1d95',  // Very dark purple
    },
    
    // Gray scale (matching actual app usage)
    gray: {
      50: '#f9fafb',   // Lightest background
      100: '#f3f4f6',  // Light background
      200: '#e5e7eb',  // Light borders
      300: '#d1d5db',  // Medium borders
      400: '#9ca3af',  // Placeholder text
      500: '#6b7280',  // Light text
      600: '#4b5563',  // Medium text
      700: '#374151',  // Dark text
      800: '#1f2937',  // Very dark text
      900: '#111827',  // Darkest text
    },
    
    // Semantic colors
    primary: '#8b5cf6',      // Purple 500
    primaryHover: '#7c3aed', // Purple 600
    primaryActive: '#6d28d9', // Purple 700
    secondary: '#f50057',    // Keep existing secondary
    
    // Status colors
    success: '#4caf50',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    
    // Neutral colors
    white: '#ffffff',
    black: '#000000',
    background: '#f9fafb',   // Gray 50
    text: '#1f2937',         // Gray 800
    textSecondary: '#6b7280', // Gray 500
    border: '#e5e7eb',       // Gray 200
    borderFocus: '#8b5cf6',  // Purple 500
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      xxl: '2rem',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      loose: 1.75,
    },
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '16px',
    round: '50%',
  },
  shadows: {
    none: 'none',
    sm: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
    md: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
    lg: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
    xl: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
  },
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  }
};

export default theme;
