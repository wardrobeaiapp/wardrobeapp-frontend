import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { defaultTheme } from './defaultTheme';

export interface ThemeProviderProps {
  /**
   * Theme object to be used throughout the application
   */
  theme?: Partial<typeof defaultTheme>;
  /**
   * Child components
   */
  children: React.ReactNode;
}

// Create a context for the theme
const ThemeContext = createContext<typeof defaultTheme>(defaultTheme);

/**
 * Hook to access the theme object
 * @returns The theme object
 */
export const useTheme = () => {
  const theme = useContext(ThemeContext);
  
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return theme;
};

/**
 * ThemeProvider component that provides the theme to all styled-components
 * and makes it available via the useTheme hook
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme: customTheme = {},
  children,
}) => {
  // Merge the custom theme with the default theme
  const theme = useMemo(() => ({
    ...defaultTheme,
    ...customTheme,
    colors: {
      ...defaultTheme.colors,
      ...(customTheme.colors || {}),
    },
  }), [customTheme]);

  return (
    <ThemeContext.Provider value={theme}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
