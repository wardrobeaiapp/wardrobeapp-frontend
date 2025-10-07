/**
 * Unit tests for AICheckResultModal card rendering functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AICheckResultModal from '../AICheckResultModal';

// Mock the styled components to avoid style-related test issues
jest.mock('../../../../../../utils/textFormatting', () => ({
  formatCategory: (category: string) => category?.toLowerCase()
}));

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
    it('should render cards when compatible items have IDs and imageUrls', () => {
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

      render(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={compatibleItemsWithIds}
        />
      );

      // Should render card elements instead of text bullets
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

    it('should render text bullets when compatible items do NOT have IDs (fallback mode)', () => {
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

      render(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={compatibleItemsWithoutIds}
        />
      );

      // Should render text bullets instead of cards
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
            name: 'Pink Sneakers', // No ID - should render as text
            compatibilityTypes: ['complementing']
          }
        ]
      };

      render(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={mixedCompatibleItems}
        />
      );

      // When ANY item in category has ID, should render all as cards
      expect(screen.getByText('Brown Leather Boots')).toBeInTheDocument();
      expect(screen.getByText('Pink Sneakers')).toBeInTheDocument();
      
      // Should have image for the item with ID
      expect(screen.getByAltText('Brown Leather Boots')).toBeInTheDocument();
      
      // Should NOT render bullet points (all should be cards due to mixed mode logic)
      expect(screen.queryByText(/^• Brown Leather Boots$/)).not.toBeInTheDocument();
    });

    it('should limit display to maximum 3 items per category', () => {
      const manyCompatibleItems = {
        footwear: [
          { id: '1', name: 'Item 1', imageUrl: '/img1.jpg', category: 'footwear', compatibilityTypes: ['complementing'] },
          { id: '2', name: 'Item 2', imageUrl: '/img2.jpg', category: 'footwear', compatibilityTypes: ['complementing'] },
          { id: '3', name: 'Item 3', imageUrl: '/img3.jpg', category: 'footwear', compatibilityTypes: ['complementing'] },
          { id: '4', name: 'Item 4', imageUrl: '/img4.jpg', category: 'footwear', compatibilityTypes: ['complementing'] },
          { id: '5', name: 'Item 5', imageUrl: '/img5.jpg', category: 'footwear', compatibilityTypes: ['complementing'] }
        ]
      };

      render(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={manyCompatibleItems}
        />
      );

      // Should display only first 3 items
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
      
      // Should NOT display items 4 and 5
      expect(screen.queryByText('Item 4')).not.toBeInTheDocument();
      expect(screen.queryByText('Item 5')).not.toBeInTheDocument();

      // Should show "...and X more" indicator
      expect(screen.getByText('...and 2 more items')).toBeInTheDocument();
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

      render(
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

      render(
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

    it('should not render Works well with section when no compatible items', () => {
      render(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={{}}
        />
      );

      expect(screen.queryByText('Works well with:')).not.toBeInTheDocument();
    });

    it('should not render Works well with section when compatibleItems is undefined', () => {
      render(
        <AICheckResultModal
          {...defaultProps}
          compatibleItems={undefined}
        />
      );

      expect(screen.queryByText('Works well with:')).not.toBeInTheDocument();
    });
  });
});
