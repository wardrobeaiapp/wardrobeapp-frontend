export * from './types';
export * from './defaultTheme';
export * from './ThemeProvider';

export { default as ThemeProvider } from './ThemeProvider';

export default {
  // Re-export everything
  ...require('./types'),
  ...require('./defaultTheme'),
  ThemeProvider: require('./ThemeProvider').default,
};
