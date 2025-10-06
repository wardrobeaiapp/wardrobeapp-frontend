/**
 * Tests for structured complementing items feature
 * Verifies that complementing items are properly grouped by category
 */

import { filterStylingContext, flattenComplementingItems, getComplementingItemsCount } from '../../../services/ai/wardrobeContextHelpers';
import { WardrobeItem, ItemCategory, Season } from '../../../types';

describe('Structured Complementing Items', () => {
  const createMockItem = (name: string, category: ItemCategory, subcategory: string): WardrobeItem => ({
    id: `item-${name.toLowerCase().replace(' ', '-')}`,
    name,
    category,
    subcategory,
    color: 'black',
    season: [Season.SUMMER],
    scenarios: ['office'],
    wishlist: false,
    userId: 'user-1',
    dateAdded: '2024-01-01'
  });

  const mockWardrobeItems: WardrobeItem[] = [
    createMockItem('Navy Trousers', ItemCategory.BOTTOM, 'trousers'),
    createMockItem('Black Jeans', ItemCategory.BOTTOM, 'jeans'),
    createMockItem('Black Heels', ItemCategory.FOOTWEAR, 'heels'),
    createMockItem('Brown Boots', ItemCategory.FOOTWEAR, 'boots'),
    createMockItem('Gold Necklace', ItemCategory.ACCESSORY, 'jewelry'),
    createMockItem('Leather Bag', ItemCategory.ACCESSORY, 'bag'),
  ];

  describe('Category Grouping', () => {
    it('should group complementing items by category for TOP analysis', () => {
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer']
      };

      const result = filterStylingContext(mockWardrobeItems, topFormData);

      // Check that we have structured complementing items
      expect(result.complementing).toBeDefined();
      expect(typeof result.complementing).toBe('object');

      // Check specific category groupings
      expect(result.complementing.bottoms).toHaveLength(2);
      expect(result.complementing.bottoms?.[0].name).toBe('Navy Trousers');
      expect(result.complementing.bottoms?.[1].name).toBe('Black Jeans');

      expect(result.complementing.footwear).toHaveLength(2);
      expect(result.complementing.footwear?.[0].name).toBe('Black Heels');
      expect(result.complementing.footwear?.[1].name).toBe('Brown Boots');

      expect(result.complementing.accessories).toHaveLength(2);
      expect(result.complementing.accessories?.[0].name).toBe('Gold Necklace');
      expect(result.complementing.accessories?.[1].name).toBe('Leather Bag');

      // Categories that shouldn't be present for TOP analysis
      expect(result.complementing.tops).toBeUndefined();
      expect(result.complementing.onePieces).toBeUndefined();
    });

    it('should group complementing items by category for ONE_PIECE analysis', () => {
      const dressFormData = {
        category: 'one_piece',
        subcategory: 'dress',
        seasons: ['summer']
      };

      const result = filterStylingContext(mockWardrobeItems, dressFormData);

      // ONE_PIECE should complement with footwear and accessories only
      expect(result.complementing.footwear).toHaveLength(2);
      expect(result.complementing.accessories).toHaveLength(2);

      // Should not complement with bottoms (dresses don't need separate bottoms)
      expect(result.complementing.bottoms).toBeUndefined();
    });

    it('should handle empty categories gracefully', () => {
      const mockItemsNoFootwear = mockWardrobeItems.filter(item => item.category !== ItemCategory.FOOTWEAR);
      
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer']
      };

      const result = filterStylingContext(mockItemsNoFootwear, topFormData);

      // Should have bottoms and accessories
      expect(result.complementing.bottoms).toHaveLength(2);
      expect(result.complementing.accessories).toHaveLength(2);

      // Should not have footwear category at all
      expect(result.complementing.footwear).toBeUndefined();
    });
  });

  describe('Helper Functions', () => {
    it('should flatten structured complementing items correctly', () => {
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer']
      };

      const result = filterStylingContext(mockWardrobeItems, topFormData);
      const flattened = flattenComplementingItems(result.complementing);

      // Should have all complementing items in a flat array
      expect(flattened).toHaveLength(6); // 2 bottoms + 2 footwear + 2 accessories
      expect(flattened.some(item => item.name === 'Navy Trousers')).toBe(true);
      expect(flattened.some(item => item.name === 'Black Heels')).toBe(true);
      expect(flattened.some(item => item.name === 'Gold Necklace')).toBe(true);
    });

    it('should count complementing items correctly', () => {
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer']
      };

      const result = filterStylingContext(mockWardrobeItems, topFormData);
      const count = getComplementingItemsCount(result.complementing);

      expect(count).toBe(6); // 2 bottoms + 2 footwear + 2 accessories
    });

    it('should handle empty complementing items', () => {
      const emptyComplementing = {};
      
      const flattened = flattenComplementingItems(emptyComplementing);
      const count = getComplementingItemsCount(emptyComplementing);

      expect(flattened).toHaveLength(0);
      expect(count).toBe(0);
    });
  });

  describe('Backwards Compatibility', () => {
    it('should work with existing code patterns using helper functions', () => {
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer']
      };

      const result = filterStylingContext(mockWardrobeItems, topFormData);
      
      // Simulate how existing code would adapt
      const allComplementingItems = flattenComplementingItems(result.complementing);
      const totalContextItems = [...allComplementingItems, ...result.layering, ...result.outerwear];

      expect(totalContextItems.length).toBeGreaterThan(0);
      expect(allComplementingItems.every(item => item.name && item.category)).toBe(true);
    });
  });

  describe('Structured Benefits', () => {
    it('should provide better organization for UI presentation', () => {
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer']
      };

      const result = filterStylingContext(mockWardrobeItems, topFormData);

      // UI can now present items in organized sections
      const sections = Object.entries(result.complementing)
        .filter(([_, items]) => items && items.length > 0)
        .map(([category, items]) => ({
          category: category.charAt(0).toUpperCase() + category.slice(1),
          items: items!,
          count: items!.length
        }));

      expect(sections).toHaveLength(3); // bottoms, footwear, accessories
      expect(sections.find(s => s.category === 'Bottoms')?.count).toBe(2);
      expect(sections.find(s => s.category === 'Footwear')?.count).toBe(2);
      expect(sections.find(s => s.category === 'Accessories')?.count).toBe(2);
    });
  });
});
