/**
 * Unit tests for wardrobeContextHelpers - Styling Context Splitting
 */

import { filterStylingContext } from '../../../services/ai/wardrobeContextHelpers';
import { WardrobeItem, ItemCategory, Season } from '../../../types';

describe('wardrobeContextHelpers - Styling Context Splitting', () => {
  const mockWardrobeItems: WardrobeItem[] = [
    // COMPLEMENTING ITEMS
    {
      id: 'item-1',
      name: 'Navy Trousers',
      category: ItemCategory.BOTTOM,
      subcategory: 'trousers',
      color: 'navy',
      season: [Season.SUMMER, Season.TRANSITIONAL],
      scenarios: ['office'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    {
      id: 'item-2', 
      name: 'Black Heels',
      category: ItemCategory.FOOTWEAR,
      subcategory: 'heels',
      color: 'black',
      season: [Season.SUMMER, Season.TRANSITIONAL],
      scenarios: ['office'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    {
      id: 'item-3',
      name: 'Gold Necklace', 
      category: ItemCategory.ACCESSORY,
      subcategory: 'jewelry',
      color: 'gold',
      season: [Season.SUMMER, Season.WINTER, Season.TRANSITIONAL],
      scenarios: ['social'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    
    // LAYERING ITEMS
    {
      id: 'item-4',
      name: 'Basic White Tee',
      category: ItemCategory.TOP,
      subcategory: 't-shirt',
      color: 'white',
      season: [Season.SUMMER, Season.TRANSITIONAL],
      scenarios: ['casual'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    {
      id: 'item-5',
      name: 'Navy Cardigan',
      category: ItemCategory.OUTERWEAR,
      subcategory: 'cardigan',
      color: 'navy',
      season: [Season.TRANSITIONAL, Season.WINTER],
      scenarios: ['office'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    {
      id: 'item-6',
      name: 'Slip Dress',
      category: ItemCategory.ONE_PIECE,
      subcategory: 'dress',
      color: 'black',
      season: [Season.SUMMER, Season.TRANSITIONAL],
      scenarios: ['social'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    
    // WISHLIST ITEMS (should be excluded)
    {
      id: 'item-7',
      name: 'Wishlist Blouse',
      category: ItemCategory.TOP,
      subcategory: 'blouse',
      color: 'white',
      season: [Season.SUMMER],
      scenarios: ['office'],
      wishlist: true,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    
    // WRONG SEASON ITEMS
    {
      id: 'item-8',
      name: 'Winter Coat',
      category: ItemCategory.OUTERWEAR,
      subcategory: 'coat',
      color: 'black',
      season: [Season.WINTER],
      scenarios: ['office'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    }
  ];

  describe('filterStylingContext', () => {
    describe('TOP item analysis', () => {
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer', 'spring/fall']
      };

      it('should correctly split complementing and layering items for TOP', () => {
        const result = filterStylingContext(mockWardrobeItems, topFormData);

        // Should include complementing items: bottoms, shoes, accessories
        expect(result.complementing).toHaveLength(3);
        expect(result.complementing.map(item => item.name)).toContain('Navy Trousers');
        expect(result.complementing.map(item => item.name)).toContain('Black Heels');
        expect(result.complementing.map(item => item.name)).toContain('Gold Necklace');

        // Should include layering items: other tops and outerwear
        expect(result.layering).toHaveLength(2);
        expect(result.layering.map(item => item.name)).toContain('Basic White Tee');
        expect(result.layering.map(item => item.name)).toContain('Navy Cardigan');
      });

      it('should exclude wishlist items', () => {
        const result = filterStylingContext(mockWardrobeItems, topFormData);
        
        const allItems = [...result.complementing, ...result.layering];
        expect(allItems.map(item => item.name)).not.toContain('Wishlist Blouse');
      });

      it('should exclude wrong season items', () => {
        const result = filterStylingContext(mockWardrobeItems, topFormData);
        
        const allItems = [...result.complementing, ...result.layering];
        expect(allItems.map(item => item.name)).not.toContain('Winter Coat');
      });
    });

    describe('ONE_PIECE item analysis', () => {
      const dresFormData = {
        category: 'one_piece',
        subcategory: 'dress',
        seasons: ['summer']
      };

      it('should correctly split complementing and layering items for ONE_PIECE', () => {
        const result = filterStylingContext(mockWardrobeItems, dresFormData);

        // Should include complementing items: shoes, accessories, outerwear
        expect(result.complementing).toHaveLength(2); // Heels and Necklace (cardigan wrong season)
        expect(result.complementing.map(item => item.name)).toContain('Black Heels');
        expect(result.complementing.map(item => item.name)).toContain('Gold Necklace');

        // Should include layering items: other dresses (very limited)
        // Most one_pieces don't layer, so should be empty or very few
        expect(result.layering.length).toBeLessThanOrEqual(1);
      });
    });

    describe('OUTERWEAR item analysis', () => {
      const outerwearFormData = {
        category: 'outerwear', 
        subcategory: 'blazer',
        seasons: ['spring/fall']
      };

      it('should correctly split complementing and layering items for OUTERWEAR', () => {
        const result = filterStylingContext(mockWardrobeItems, outerwearFormData);

        // Should include complementing items: bottoms, shoes, accessories
        expect(result.complementing).toHaveLength(3);
        expect(result.complementing.map(item => item.name)).toContain('Navy Trousers');
        expect(result.complementing.map(item => item.name)).toContain('Black Heels');
        expect(result.complementing.map(item => item.name)).toContain('Gold Necklace');

        // Should include layering items: tops and dresses that can go underneath
        expect(result.layering).toHaveLength(2);
        expect(result.layering.map(item => item.name)).toContain('Basic White Tee');
        expect(result.layering.map(item => item.name)).toContain('Slip Dress');
      });
    });

    describe('FOOTWEAR item analysis', () => {
      const footwearFormData = {
        category: 'footwear',
        subcategory: 'sneakers',  
        seasons: ['summer']
      };

      it('should correctly split complementing and layering items for FOOTWEAR', () => {
        const result = filterStylingContext(mockWardrobeItems, footwearFormData);

        // Should include complementing items: tops, bottoms, dresses, accessories, outerwear
        expect(result.complementing).toHaveLength(4);
        expect(result.complementing.map(item => item.name)).toContain('Navy Trousers');
        expect(result.complementing.map(item => item.name)).toContain('Gold Necklace');
        expect(result.complementing.map(item => item.name)).toContain('Basic White Tee');
        expect(result.complementing.map(item => item.name)).toContain('Slip Dress');

        // Footwear typically doesn't layer, so should be empty
        expect(result.layering).toHaveLength(0);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty wardrobe', () => {
        const result = filterStylingContext([], {
          category: 'top',
          subcategory: 'blouse',
          seasons: ['summer']
        });

        expect(result.complementing).toHaveLength(0);
        expect(result.layering).toHaveLength(0);
      });

      it('should handle missing seasons', () => {
        const result = filterStylingContext(mockWardrobeItems, {
          category: 'top',
          subcategory: 'blouse'
          // No seasons provided
        });

        // Should still work, likely including all seasonal items
        expect(result.complementing.length + result.layering.length).toBeGreaterThan(0);
      });

      it('should handle OTHER category', () => {
        const result = filterStylingContext(mockWardrobeItems, {
          category: 'other',
          subcategory: 'misc',
          seasons: ['summer']
        });

        // OTHER category should return empty contexts
        expect(result.complementing).toHaveLength(0);
        expect(result.layering).toHaveLength(0);
      });

      it('should handle all wishlist items', () => {
        const wishlistItems = mockWardrobeItems.map(item => ({...item, wishlist: true}));
        
        const result = filterStylingContext(wishlistItems, {
          category: 'top',
          subcategory: 'blouse',
          seasons: ['summer']
        });

        expect(result.complementing).toHaveLength(0);
        expect(result.layering).toHaveLength(0);
      });
    });

    describe('Season filtering', () => {
      it('should only include season-appropriate items', () => {
        const winterFormData = {
          category: 'top',
          subcategory: 'sweater',
          seasons: ['winter']
        };

        const result = filterStylingContext(mockWardrobeItems, winterFormData);
        
        const allItems = [...result.complementing, ...result.layering];
        
        // Should include winter items and all-season items
        expect(allItems.map(item => item.name)).toContain('Gold Necklace'); // All-season accessory
        expect(allItems.map(item => item.name)).toContain('Navy Cardigan'); // Winter outerwear
        
        // Should exclude summer-only items
        expect(allItems.map(item => item.name)).not.toContain('Slip Dress'); // Summer dress
      });

      it('should handle multiple seasons', () => {
        const multiSeasonFormData = {
          category: 'top',
          subcategory: 'blouse',
          seasons: ['summer', 'spring/fall']
        };

        const result = filterStylingContext(mockWardrobeItems, multiSeasonFormData);
        
        const allItems = [...result.complementing, ...result.layering];
        expect(allItems.length).toBeGreaterThan(3); // Should include items from both seasons
      });
    });
  });

  describe('Category mapping logic', () => {
    it('should correctly identify complementing categories', () => {
      // Test various category combinations
      const testCases = [
        { newItem: 'top', existing: 'bottom', shouldComplement: true },
        { newItem: 'top', existing: 'footwear', shouldComplement: true },
        { newItem: 'top', existing: 'accessory', shouldComplement: true },
        { newItem: 'top', existing: 'top', shouldComplement: false }, // Same category
        
        { newItem: 'one_piece', existing: 'footwear', shouldComplement: true },
        { newItem: 'one_piece', existing: 'outerwear', shouldComplement: true },
        { newItem: 'one_piece', existing: 'top', shouldComplement: false },
        
        { newItem: 'outerwear', existing: 'bottom', shouldComplement: true },
        { newItem: 'outerwear', existing: 'footwear', shouldComplement: true },
        { newItem: 'outerwear', existing: 'top', shouldComplement: false } // Layering instead
      ];

      testCases.forEach(({ newItem, existing, shouldComplement }) => {
        const mockItem = {
          ...mockWardrobeItems[0],
          category: existing as ItemCategory
        };

        const result = filterStylingContext([mockItem], {
          category: newItem,
          subcategory: 'test',
          seasons: ['summer']
        });

        if (shouldComplement) {
          expect(result.complementing.length).toBeGreaterThan(0);
        } else {
          expect(result.complementing.length).toBe(0);
        }
      });
    });
  });
});
