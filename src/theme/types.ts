// Theme type definitions for styled-components
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryContrast: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  borderDark: string;
  
  // Status colors
  success: string;
  info: string;
  warning: string;
  danger: string;
  
  // Common colors
  white: string;
  black: string;
  transparent: string;
  
  // Grayscale
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
}

export interface ThemeShadows {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  full: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

export interface ThemeTypography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

export interface ThemeBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeZIndices {
  hide: number;
  auto: string;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipLink: number;
  toast: number;
  tooltip: number;
}

export interface ThemeTransitions {
  property: {
    common: string;
    colors: string;
    transform: string;
  };
  duration: {
    fastest: string;
    faster: string;
    fast: string;
    normal: string;
    slow: string;
    slower: string;
    slowest: string;
  };
  easing: {
    'ease-in': string;
    'ease-out': string;
    'ease-in-out': string;
  };
}

export interface ThemeComponents {
  // Add component-specific theme overrides here
  // Example:
  // Button: {
  //   baseStyle: CSSObject;
  //   variants: Record<string, CSSObject>;
  //   sizes: Record<string, CSSObject>;
  //   defaultProps: Record<string, any>;
  // };
}

export interface ThemeConfig {
  initialColorMode: 'light' | 'dark';
  useSystemColorMode: boolean;
}

export interface Theme {
  colors: ThemeColors;
  shadows: ThemeShadows;
  borderRadius: ThemeBorderRadius;
  space: ThemeSpacing;
  sizes: Record<string, string | number>;
  breakpoints: ThemeBreakpoints;
  zIndices: ThemeZIndices;
  transitions: ThemeTransitions;
  components: ThemeComponents;
  config: ThemeConfig;
  typography: ThemeTypography;
  
  // Add any additional theme properties here
  [key: string]: any;
}

// Default theme interface for styled-components
declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
