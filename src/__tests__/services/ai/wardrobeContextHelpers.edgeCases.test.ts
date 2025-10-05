/**
 * Unit tests for wardrobeContextHelpers - Edge Cases and Error Handling
 */

import { filterStylingContext } from '../../../services/ai/wardrobeContextHelpers';
import { WardrobeItem, ItemCategory, Season } from '../../../types';

describe('wardrobeContextHelpers - Edge Cases and Error Handling', () => {
  const createValidItem = (overrides: Partial<WardrobeItem> = {}): WardrobeItem => ({
    id: 'test-id',
    name: 'Test Item',
    category: ItemCategory.TOP,
    subcategory: 'test',
    color: 'black',
    season: [Season.SUMMER],
    scenarios: ['test'],
    wishlist: false,
    userId: 'user-1',
    dateAdded: '2024-01-01',
    ...overrides
  });

  describe('Input validation', () => {
    it('should handle null/undefined wardrobeItems', () => {
      expect(() => {
        filterStylingContext(null as any, { category: 'top', seasons: ['summer'] });
      }).not.toThrow();

      expect(() => {
        filterStylingContext(undefined as any, { category: 'top', seasons: ['summer'] });
      }).not.toThrow();
    });

    it('should handle empty wardrobeItems array', () => {
      const result = filterStylingContext([], { category: 'top', seasons: ['summer'] });
      
      expect(result.complementing).toEqual([]);
      expect(result.layering).toEqual([]);
    });

    it('should handle null/undefined formData', () => {
      const items = [createValidItem()];

      expect(() => {
        filterStylingContext(items, null as any);
      }).not.toThrow();

      expect(() => {
        filterStylingContext(items, undefined as any);
      }).not.toThrow();
    });

    it('should handle missing required formData fields', () => {
      const items = [createValidItem()];

      // Missing category
      const result1 = filterStylingContext(items, { seasons: ['summer'] } as any);
      expect(result1.complementing).toEqual([]);
      expect(result1.layering).toEqual([]);

      // Missing seasons
      const result2 = filterStylingContext(items, { category: 'top' });
      expect(result2).toBeDefined(); // Should still work
    });

    it('should handle empty seasons array', () => {
      const items = [createValidItem()];
      const result = filterStylingContext(items, { 
        category: 'top', 
        subcategory: 'blouse',
        seasons: [] 
      });
      
      expect(result).toBeDefined();
      expect(Array.isArray(result.complementing)).toBe(true);
      expect(Array.isArray(result.layering)).toBe(true);
    });
  });

  describe('Invalid item data handling', () => {
    it('should handle items with missing category', () => {
      const invalidItem = createValidItem({ category: undefined as any });
      const result = filterStylingContext([invalidItem], { 
        category: 'top', 
        seasons: ['summer'] 
      });
      
      expect(result.complementing).toEqual([]);
      expect(result.layering).toEqual([]);
    });

    it('should handle items with null/undefined properties', () => {
      const itemsWithNulls = [
        createValidItem({ name: null as any }),
        createValidItem({ color: undefined as any }),
        createValidItem({ subcategory: null as any }),
        createValidItem({ season: null as any }),
        createValidItem({ scenarios: undefined as any })
      ];

      const result = filterStylingContext(itemsWithNulls, { 
        category: 'top', 
        seasons: ['summer'] 
      });
      
      // Should not crash and should handle gracefully
      expect(result).toBeDefined();
      expect(Array.isArray(result.complementing)).toBe(true);
      expect(Array.isArray(result.layering)).toBe(true);
    });

    it('should handle items with invalid enum values', () => {
      const invalidItems = [
        createValidItem({ category: 'invalid-category' as any }),
        createValidItem({ season: ['invalid-season'] as any })
      ];

      const result = filterStylingContext(invalidItems, { 
        category: 'top', 
        seasons: ['summer'] 
      });
      
      expect(result).toBeDefined();
      // Items with invalid categories should be filtered out
      expect(result.complementing.length + result.layering.length).toBe(0);
    });

    it('should handle circular references in item objects', () => {
      const circularItem = createValidItem();
      (circularItem as any).self = circularItem; // Create circular reference

      expect(() => {
        filterStylingContext([circularItem], { category: 'top', seasons: ['summer'] });
      }).not.toThrow();
    });
  });

  describe('Season handling edge cases', () => {
    it('should handle mixed season formats', () => {
      const items = [
        createValidItem({ 
          season: ['summer', 'spring/fall'] as Season[],
          category: ItemCategory.BOTTOM 
        })
      ];

      const result = filterStylingContext(items, { 
        category: 'top', 
        seasons: ['summer', 'winter'] 
      });
      
      // Should match on 'summer' overlap
      expect(result.complementing).toHaveLength(1);
    });

    it('should handle case-insensitive season matching', () => {
      const items = [createValidItem({ 
        category: ItemCategory.BOTTOM,
        season: [Season.SUMMER]
      })];

      const result = filterStylingContext(items, { 
        category: 'top', 
        seasons: ['SUMMER', 'Summer', 'summer'] as any
      });
      
      expect(result.complementing.length).toBeGreaterThan(0);
    });

    it('should handle all-season items correctly', () => {
      const allSeasonItem = createValidItem({
        category: ItemCategory.ACCESSORY,
        season: [Season.SUMMER, Season.WINTER, Season.TRANSITIONAL] // Covers all seasons
      });

      const result = filterStylingContext([allSeasonItem], { 
        category: 'top', 
        seasons: ['winter'] 
      });
      
      expect(result.complementing).toHaveLength(1);
    });
  });

  describe('Performance and memory handling', () => {
    it('should handle large wardrobe efficiently', () => {
      const largeWardrobe: WardrobeItem[] = Array.from({ length: 1000 }, (_, i) => 
        createValidItem({ 
          id: `item-${i}`,
          name: `Item ${i}`,
          category: i % 2 === 0 ? ItemCategory.BOTTOM : ItemCategory.FOOTWEAR
        })
      );

      const startTime = Date.now();
      const result = filterStylingContext(largeWardrobe, { 
        category: 'top', 
        seasons: ['summer'] 
      });
      const endTime = Date.now();

      // Should complete in reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
      expect(result.complementing.length + result.layering.length).toBeLessThanOrEqual(1000);
    });

    it('should handle duplicate items correctly', () => {
      const duplicateItem = createValidItem({ category: ItemCategory.BOTTOM });
      const items = [duplicateItem, duplicateItem, duplicateItem]; // Same reference

      const result = filterStylingContext(items, { 
        category: 'top', 
        seasons: ['summer'] 
      });
      
      // Should include all duplicates (filtering happens elsewhere)
      expect(result.complementing).toHaveLength(3);
    });

    it('should handle deep nested objects without stack overflow', () => {
      const deepItem = createValidItem();
      let current = deepItem as any;
      
      // Create deep nesting (but not circular)
      for (let i = 0; i < 100; i++) {
        current.nested = { level: i };
        current = current.nested;
      }

      expect(() => {
        filterStylingContext([deepItem], { category: 'top', seasons: ['summer'] });
      }).not.toThrow();
    });
  });

  describe('Boundary value testing', () => {
    it('should handle extreme string lengths', () => {
      const longStringItem = createValidItem({
        name: 'A'.repeat(10000), // Very long name
        color: 'B'.repeat(1000), // Very long color
        subcategory: 'C'.repeat(500) // Very long subcategory
      });

      expect(() => {
        filterStylingContext([longStringItem], { 
          category: 'top', 
          subcategory: 'D'.repeat(1000),
          seasons: ['summer'] 
        });
      }).not.toThrow();
    });

    it('should handle empty string values', () => {
      const emptyStringItem = createValidItem({
        name: '',
        color: '',
        subcategory: ''
      });

      const result = filterStylingContext([emptyStringItem], { 
        category: 'top',
        subcategory: '',
        seasons: ['summer'] 
      });
      
      expect(result).toBeDefined();
    });

    it('should handle special characters in strings', () => {
      const specialCharItem = createValidItem({
        name: '!@#$%^&*()_+-={}[]|\\:";\'<>,.?/',
        color: '🌈🔥💎',
        subcategory: 'test-sub_category.with.dots'
      });

      expect(() => {
        filterStylingContext([specialCharItem], { 
          category: 'top', 
          seasons: ['summer'] 
        });
      }).not.toThrow();
    });
  });

  describe('Data consistency checks', () => {
    it('should always return consistent structure', () => {
      const testCases = [
        { items: [], formData: { category: 'top', seasons: ['summer'] } },
        { items: [createValidItem()], formData: { category: 'bottom', seasons: ['winter'] } },
        { items: null, formData: { category: 'one_piece', seasons: [] } },
        { items: undefined, formData: null }
      ];

      testCases.forEach(({ items, formData }, index) => {
        const result = filterStylingContext(items as any, formData as any);
        
        expect(result).toHaveProperty('complementing');
        expect(result).toHaveProperty('layering');
        expect(Array.isArray(result.complementing)).toBe(true);
        expect(Array.isArray(result.layering)).toBe(true);
      });
    });

    it('should never return null or undefined arrays', () => {
      const result = filterStylingContext([], { category: 'other', seasons: ['summer'] });
      
      expect(result.complementing).not.toBeNull();
      expect(result.complementing).not.toBeUndefined();
      expect(result.layering).not.toBeNull();
      expect(result.layering).not.toBeUndefined();
    });

    it('should maintain referential integrity of original items', () => {
      const originalItem = createValidItem({ category: ItemCategory.BOTTOM });
      const result = filterStylingContext([originalItem], { 
        category: 'top', 
        seasons: ['summer'] 
      });
      
      // Should be the same reference, not a copy
      if (result.complementing.length > 0) {
        expect(result.complementing[0]).toBe(originalItem);
      }
    });
  });

  describe('Logging and debugging support', () => {
    it('should handle console.log failures gracefully', () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn().mockImplementation(() => {
        throw new Error('Console error');
      });

      try {
        expect(() => {
          filterStylingContext([createValidItem()], { 
            category: 'top', 
            seasons: ['summer'] 
          });
        }).not.toThrow();
      } finally {
        console.log = originalConsoleLog;
      }
    });

    it('should provide meaningful debug information', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      filterStylingContext([createValidItem()], { 
        category: 'top', 
        subcategory: 'blouse',
        seasons: ['summer'] 
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('FILTERING STYLING CONTEXT')
      );
      
      consoleSpy.mockRestore();
    });
  });
});
