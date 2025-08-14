// Shared design tokens for form components across features
// This ensures consistency while maintaining feature independence

export const formTokens = {
  // Spacing
  spacing: {
    xs: '0.25rem',      // 4px
    sm: '0.5rem',       // 8px
    md: '0.75rem',      // 12px
    lg: '1rem',         // 16px
    xl: '1.5rem',       // 24px
    xxl: '2rem',        // 32px
  },

  // Colors
  colors: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    primaryDisabled: '#a5b4fc',
    
    secondary: '#f3f4f6',
    secondaryHover: '#e5e7eb',
    secondaryText: '#6b7280',
    secondaryTextHover: '#4b5563',
    
    danger: '#ef4444',
    dangerHover: '#dc2626',
    
    success: '#10b981',
    successHover: '#059669',
    
    border: '#d1d5db',
    borderFocus: '#8b5cf6',
    
    text: '#374151',
    textMuted: '#6b7280',
    textPlaceholder: '#9ca3af',
    
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      muted: '#f3f4f6',
      error: '#fee2e2',
      upload: '#f9fafb',
      uploadHover: '#f5f3ff',
    },
    
    error: '#ef4444',
    errorBackground: '#fee2e2',
  },

  // Typography
  typography: {
    fontSizes: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
    },
    
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Border radius
  borderRadius: {
    sm: '0.25rem',      // 4px
    base: '0.375rem',   // 6px
    md: '0.5rem',       // 8px
    lg: '0.75rem',      // 12px
    xl: '1rem',         // 16px
    full: '9999px',     // fully rounded
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    
    // Interactive shadows
    button: '0 4px 12px rgba(139, 92, 246, 0.4)',
    buttonSecondary: '0 2px 8px rgba(107, 114, 128, 0.2)',
    focus: '0 0 0 3px rgba(139, 92, 246, 0.1)',
  },

  // Transitions
  transitions: {
    fast: '0.1s ease',
    base: '0.2s ease',
    slow: '0.3s ease',
    
    // Specific property transitions
    colors: 'color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease',
    transform: 'transform 0.2s ease',
    shadow: 'box-shadow 0.2s ease',
    all: 'all 0.2s ease',
  },

  // Form-specific measurements
  form: {
    inputHeight: '2.5rem',     // 40px
    inputPadding: '0.75rem',   // 12px
    buttonHeight: '2.5rem',    // 40px
    buttonPadding: '0.75rem 2rem',
    
    // Responsive breakpoints for form layouts
    breakpoints: {
      mobile: '768px',
    },
  },
};

// Helper function to create consistent focus styles
export const createFocusStyles = (color = formTokens.colors.borderFocus) => `
  outline: none;
  border-color: ${color};
  box-shadow: ${formTokens.shadows.focus};
`;

// Helper function for hover transform effect
export const createHoverTransform = () => `
  transform: translateY(-1px);
`;

// Helper function for button styles
export const createButtonStyles = (variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
  const variantColors = {
    primary: {
      background: `linear-gradient(135deg, ${formTokens.colors.primary} 0%, ${formTokens.colors.primaryHover} 100%)`,
      color: '#ffffff',
      hoverShadow: formTokens.shadows.button,
    },
    secondary: {
      background: formTokens.colors.secondary,
      color: formTokens.colors.secondaryText,
      hoverShadow: formTokens.shadows.buttonSecondary,
    },
    danger: {
      background: `linear-gradient(135deg, ${formTokens.colors.danger} 0%, ${formTokens.colors.dangerHover} 100%)`,
      color: '#ffffff',
      hoverShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
    },
  };

  const variant_config = variantColors[variant];
  
  return `
    background: ${variant_config.background};
    color: ${variant_config.color};
    border: ${variant === 'secondary' ? `1px solid ${formTokens.colors.border}` : 'none'};
    padding: ${formTokens.form.buttonPadding};
    border-radius: ${formTokens.borderRadius.md};
    font-size: ${formTokens.typography.fontSizes.sm};
    font-weight: ${formTokens.typography.fontWeights.semibold};
    cursor: pointer;
    transition: ${formTokens.transitions.all};
    
    &:hover:not(:disabled) {
      ${createHoverTransform()}
      box-shadow: ${variant_config.hoverShadow};
      ${variant === 'secondary' ? `
        background: ${formTokens.colors.secondaryHover};
        color: ${formTokens.colors.secondaryTextHover};
      ` : ''}
    }
    
    &:active {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
};
