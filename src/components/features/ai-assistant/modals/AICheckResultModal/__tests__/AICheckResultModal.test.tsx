/**
 * Unit tests for AICheckResultModal card customRendering functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from 'styled-components';
import AICheckResultModal from '../AICheckResultModal';

// Simple theme for testing
const testTheme = {
  colors: {
    primary: '#7C3AED',
    primaryLight: '#8B5CF6',
    primaryDark: '#6D28D9',
    primaryContrast: '#FFFFFF',
    textPrimary: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',
    success: '#10B981',
    info: '#3B82F6',
    warning: '#F59E0B',
    danger: '#EF4444',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px',
  },
  space: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },
  sizes: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
    '1/2': '50%',
    '1/3': '33.333333%',
    '2/3': '66.666667%',
    '1/4': '25%',
    '2/4': '50%',
    '3/4': '75%',
    '1/5': '20%',
    '2/5': '40%',
    '3/5': '60%',
    '4/5': '80%',
    '1/6': '16.666667%',
    '2/6': '33.333333%',
    '3/6': '50%',
    '4/6': '66.666667%',
    '5/6': '83.333333%',
    '1/12': '8.333333%',
    '2/12': '16.666667%',
    '3/12': '25%',
    '4/12': '33.333333%',
    '5/12': '41.666667%',
    '6/12': '50%',
    '7/12': '58.333333%',
    '8/12': '66.666667%',
    '9/12': '75%',
    '10/12': '83.333333%',
    '11/12': '91.666667%',
    full: '100%',
    screen: '100vw',
    min: 'min-content',
    max: 'max-content',
    fit: 'fit-content',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
  transitions: {
    property: {
      common: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      colors: 'background-color, border-color, color, fill, stroke',
      transform: 'transform',
    },
    duration: {
      fastest: '75ms',
      faster: '100ms',
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
      slowest: '500ms',
    },
    easing: {
      'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
      'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    lineHeight: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  components: {},
  config: {
    initialColorMode: 'light' as const,
    useSystemColorMode: true,
  },
};

// Mock the styled components to avoid style-related test issues
jest.mock('../../../../../../utils/textFormatting', () => ({
  formatCategory: (category: string) => category?.toLowerCase()
}));

// Test wrapper component with theme
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    {children}
  </ThemeProvider>
);

// Custom render function with theme
const customRender = (ui: React.ReactElement, options?: any): any =>
  render(ui, { wrapper: TestWrapper, ...options });

describe('AICheckResultModal Card Rendering', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    analysisResult: 'Test analysis',
    suitableScenarios: ['Social Outings'],
    onAddToWishlist: jest.fn(),
    onSkip: jest.fn(),
    onDecideLater: jest.fn()
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Card vs Text Rendering Logic', () => {
    it('should customRender cards when compatible items have IDs and imageUrls', () => {
      const compatibleItemsWithIds = {
        footwear: [
          {
            id: '123',
            name: 'Brown Leather Boots',
            imageUrl: '/uploads/brown-boots.jpg',
            category: 'footwear',
            color: 'brown',
            brand: 'Nike',
            season: ['fall', 'winter'],
            compatibilityTypes: ['complementing']
          },
          {
            id: '456',
            name: 'Black Formal Shoes',
            imageUrl: '/uploads/black-shoes.jpg',
            category: 'footwear',
            color: 'black',
            compatibilityTypes: ['complementing']
          }
        ],
        accessories: [
          {
            id: '789',
            name: 'Brown Belt',
            imageUrl: '/uploads/brown-belt.jpg',
            category: 'accessories',
            color: 'brown',
            compatibilityTypes: ['complementing']
          }
        ]
      };

      customRender(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={compatibleItemsWithIds}
        />
      );

      // Should customRender card elements instead of text bullets
      expect(screen.getByText('Brown Leather Boots')).toBeInTheDocument();
      expect(screen.getByText('Black Formal Shoes')).toBeInTheDocument();
      expect(screen.getByText('Brown Belt')).toBeInTheDocument();

      // Should have images (alt text should be present)
      expect(screen.getByAltText('Brown Leather Boots')).toBeInTheDocument();
      expect(screen.getByAltText('Black Formal Shoes')).toBeInTheDocument();
      expect(screen.getByAltText('Brown Belt')).toBeInTheDocument();

      // Should NOT have bullet points (•) for card display
      expect(screen.queryByText(/^• Brown Leather Boots$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/^• Brown Belt$/)).not.toBeInTheDocument();
    });

    it('should customRender text bullets when compatible items do NOT have IDs (fallback mode)', () => {
      const compatibleItemsWithoutIds = {
        footwear: [
          {
            name: 'Brown Boots',
            compatibilityTypes: ['complementing']
          },
          {
            name: 'Black Shoes',
            compatibilityTypes: ['complementing']
          }
        ],
        accessories: [
          {
            name: 'Brown Belt', 
            compatibilityTypes: ['complementing']
          }
        ]
      };

      customRender(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={compatibleItemsWithoutIds}
        />
      );

      // Should customRender text bullets instead of cards
      expect(screen.getByText('• Brown Boots')).toBeInTheDocument();
      expect(screen.getByText('• Black Shoes')).toBeInTheDocument();
      expect(screen.getByText('• Brown Belt')).toBeInTheDocument();

      // Should NOT have images when in text mode
      expect(screen.queryByAltText('Brown Boots')).not.toBeInTheDocument();
      expect(screen.queryByAltText('Brown Belt')).not.toBeInTheDocument();
    });

    it('should handle mixed results - some items with IDs (cards), some without (text)', () => {
      const mixedCompatibleItems = {
        footwear: [
          {
            id: '123',
            name: 'Brown Leather Boots',
            imageUrl: '/uploads/brown-boots.jpg',
            category: 'footwear',
            color: 'brown',
            compatibilityTypes: ['complementing']
          },
          {
            name: 'Pink Sneakers', // No ID - should customRender as text
            compatibilityTypes: ['complementing']
          }
        ]
      };

      customRender(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={mixedCompatibleItems}
        />
      );

      // When ANY item in category has ID, should customRender all as cards
      expect(screen.getByText('Brown Leather Boots')).toBeInTheDocument();
      expect(screen.getByText('Pink Sneakers')).toBeInTheDocument();
      
      // Should have image for the item with ID
      expect(screen.getByAltText('Brown Leather Boots')).toBeInTheDocument();
      
      // Should NOT customRender bullet points (all should be cards due to mixed mode logic)
      expect(screen.queryByText(/^• Brown Leather Boots$/)).not.toBeInTheDocument();
    });

    it('should display all items per category (no artificial limit)', () => {
      const manyCompatibleItems = {
        footwear: [
          { id: '1', name: 'Item 1', imageUrl: '/img1.jpg', category: 'footwear', compatibilityTypes: ['complementing'] },
          { id: '2', name: 'Item 2', imageUrl: '/img2.jpg', category: 'footwear', compatibilityTypes: ['complementing'] },
          { id: '3', name: 'Item 3', imageUrl: '/img3.jpg', category: 'footwear', compatibilityTypes: ['complementing'] },
          { id: '4', name: 'Item 4', imageUrl: '/img4.jpg', category: 'footwear', compatibilityTypes: ['complementing'] },
          { id: '5', name: 'Item 5', imageUrl: '/img5.jpg', category: 'footwear', compatibilityTypes: ['complementing'] }
        ]
      };

      customRender(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={manyCompatibleItems}
        />
      );

      // Should display all 5 items (current implementation shows all items)
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      expect(screen.getByText('Item 4')).toBeInTheDocument();
      expect(screen.getByText('Item 5')).toBeInTheDocument();

      // Should NOT show "...and X more" indicator (no limitation in current implementation)
      expect(screen.queryByText(/...and \d+ more/)).not.toBeInTheDocument();
    });

    it('should handle missing image gracefully with placeholder', () => {
      const itemsWithMissingImages = {
        footwear: [
          {
            id: '123',
            name: 'No Image Boot',
            // imageUrl missing
            category: 'footwear',
            color: 'brown',
            compatibilityTypes: ['complementing']
          }
        ]
      };

      customRender(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={itemsWithMissingImages}
        />
      );

      expect(screen.getByText('No Image Boot')).toBeInTheDocument();
      
      // Should show placeholder when no image
      expect(screen.getByText('No Image')).toBeInTheDocument();
    });

    it('should display category headers correctly', () => {
      const compatibleItems = {
        footwear: [
          { id: '1', name: 'Boot', imageUrl: '/boot.jpg', category: 'footwear', compatibilityTypes: ['complementing'] }
        ],
        accessories: [
          { id: '2', name: 'Belt', imageUrl: '/belt.jpg', category: 'accessories', compatibilityTypes: ['complementing'] }
        ],
        one_piece: [
          { id: '3', name: 'Dress', imageUrl: '/dress.jpg', category: 'one_piece', compatibilityTypes: ['complementing'] }
        ]
      };

      customRender(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={compatibleItems}
        />
      );

      // Should show category headers
      expect(screen.getByText('footwear:')).toBeInTheDocument();
      expect(screen.getByText('accessories:')).toBeInTheDocument();
      
      // Should transform one_piece to Dresses
      expect(screen.getByText('Dresses:')).toBeInTheDocument();
    });

    it('should not customRender Works well with section when no compatible items', () => {
      customRender(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={{}}
        />
      );

      expect(screen.queryByText('Works well with:')).not.toBeInTheDocument();
    });

    it('should not customRender Works well with section when compatibleItems is undefined', () => {
      customRender(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={undefined}
        />
      );

      expect(screen.queryByText('Works well with:')).not.toBeInTheDocument();
    });
  });
});
