/**
 * Unit tests for wardrobeContextHelpers - Category Mapping Logic
 * Tests the core helper functions for determining complementing vs layering relationships
 */

import { ItemCategory, Season } from '../../../types';

// Since these are internal functions, we'll test them through the main function
// but with focused test cases to verify the specific logic
import { filterStylingContext } from '../../../services/ai/wardrobeContextHelpers';

describe('wardrobeContextHelpers - Category Mapping Logic', () => {
  // Helper to create a minimal test item
  const createTestItem = (category: ItemCategory, subcategory: string = 'test', season: string[] = ['summer']) => ({
    id: 'test-id',
    name: 'Test Item',
    category,
    subcategory,
    color: 'black',
    season,
    scenarios: ['test'],
    wishlist: false,
    userId: 'user-1',
    dateAdded: '2024-01-01'
  });

  describe('Complementing Category Logic', () => {
    describe('TOP items should complement', () => {
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer']
      };

      it('should complement with BOTTOM items', () => {
        const bottomItem = createTestItem(ItemCategory.BOTTOM, 'trousers');
        const result = filterStylingContext([bottomItem], topFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.BOTTOM);
        expect(result.layering).toHaveLength(0);
        expect(result.outerwear).toHaveLength(0);
      });

      it('should complement with FOOTWEAR items', () => {
        const footwearItem = createTestItem(ItemCategory.FOOTWEAR, 'heels');
        const result = filterStylingContext([footwearItem], topFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.FOOTWEAR);
        expect(result.layering).toHaveLength(0);
        expect(result.outerwear).toHaveLength(0);
      });

      it('should complement with ACCESSORY items', () => {
        const accessoryItem = createTestItem(ItemCategory.ACCESSORY, 'jewelry');
        const result = filterStylingContext([accessoryItem], topFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.ACCESSORY);
        expect(result.layering).toHaveLength(0);
        expect(result.outerwear).toHaveLength(0);
      });

      it('should NOT complement with other TOP items (layering instead)', () => {
        const otherTopItem = createTestItem(ItemCategory.TOP, 't-shirt');
        const result = filterStylingContext([otherTopItem], topFormData);
        
        expect(result.complementing).toHaveLength(0);
        expect(result.layering).toHaveLength(1);
        expect(result.outerwear).toHaveLength(0);
      });

      it('should NOT complement with ONE_PIECE items', () => {
        const dresItem = createTestItem(ItemCategory.ONE_PIECE, 'dress');
        const result = filterStylingContext([dresItem], topFormData);
        
        expect(result.complementing).toHaveLength(0);
        expect(result.layering).toHaveLength(0); // Dresses don't layer with tops
        expect(result.outerwear).toHaveLength(0);
      });
    });

    describe('ONE_PIECE items should complement', () => {
      const dresFormData = {
        category: 'one_piece',
        subcategory: 'dress',
        seasons: ['summer']
      };

      it('should complement with FOOTWEAR items', () => {
        const footwearItem = createTestItem(ItemCategory.FOOTWEAR, 'sandals');
        const result = filterStylingContext([footwearItem], dresFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.FOOTWEAR);
      });

      it('should complement with ACCESSORY items', () => {
        const accessoryItem = createTestItem(ItemCategory.ACCESSORY, 'bag');
        const result = filterStylingContext([accessoryItem], dresFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.ACCESSORY);
      });

      it('should complement with OUTERWEAR items', () => {
        const outerwearItem = createTestItem(ItemCategory.OUTERWEAR, 'blazer');
        const result = filterStylingContext([outerwearItem], dresFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.OUTERWEAR);
      });

      it('should NOT complement with TOP items', () => {
        const topItem = createTestItem(ItemCategory.TOP, 'blouse');
        const result = filterStylingContext([topItem], dresFormData);
        
        expect(result.complementing).toHaveLength(0);
      });

      it('should NOT complement with BOTTOM items', () => {
        const bottomItem = createTestItem(ItemCategory.BOTTOM, 'skirt');
        const result = filterStylingContext([bottomItem], dresFormData);
        
        expect(result.complementing).toHaveLength(0);
      });
    });

    describe('OUTERWEAR items should complement', () => {
      const outerwearFormData = {
        category: 'outerwear',
        subcategory: 'jacket',
        seasons: ['spring/fall']
      };

      it('should complement with BOTTOM items', () => {
        const bottomItem = createTestItem(ItemCategory.BOTTOM, 'jeans');
        const result = filterStylingContext([bottomItem], outerwearFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.BOTTOM);
      });

      it('should complement with FOOTWEAR items', () => {
        const footwearItem = createTestItem(ItemCategory.FOOTWEAR, 'boots');
        const result = filterStylingContext([footwearItem], outerwearFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.FOOTWEAR);
      });

      it('should complement with ACCESSORY items', () => {
        const accessoryItem = createTestItem(ItemCategory.ACCESSORY, 'scarf');
        const result = filterStylingContext([accessoryItem], outerwearFormData);
        
        expect(result.complementing).toHaveLength(1);
        expect(result.complementing[0].category).toBe(ItemCategory.ACCESSORY);
      });

      it('should NOT complement with TOP items (layering instead)', () => {
        const topItem = createTestItem(ItemCategory.TOP, 'sweater');
        topItem.season = [Season.TRANSITIONAL]; // Match season for layering test
        const result = filterStylingContext([topItem], outerwearFormData);
        
        expect(result.complementing).toHaveLength(0);
        expect(result.layering).toHaveLength(1); // Should layer over tops
      });
    });

    describe('FOOTWEAR items should complement', () => {
      const footwearFormData = {
        category: 'footwear',
        subcategory: 'sneakers',
        seasons: ['summer']
      };

      it('should complement with ALL other categories', () => {
        const items = [
          createTestItem(ItemCategory.TOP, 't-shirt'),
          createTestItem(ItemCategory.BOTTOM, 'shorts'),
          createTestItem(ItemCategory.ONE_PIECE, 'dress'),
          createTestItem(ItemCategory.OUTERWEAR, 'cardigan'),
          createTestItem(ItemCategory.ACCESSORY, 'hat')
        ];

        const result = filterStylingContext(items, footwearFormData);
        
        expect(result.complementing).toHaveLength(5);
        expect(result.layering).toHaveLength(0); // Footwear doesn't layer
      });
    });

    describe('ACCESSORY items should complement', () => {
      const accessoryFormData = {
        category: 'accessory',
        subcategory: 'jewelry',
        seasons: ['summer']
      };

      it('should complement with ALL other categories', () => {
        const items = [
          createTestItem(ItemCategory.TOP, 'blouse'),
          createTestItem(ItemCategory.BOTTOM, 'skirt'),
          createTestItem(ItemCategory.ONE_PIECE, 'dress'),
          createTestItem(ItemCategory.OUTERWEAR, 'blazer'),
          createTestItem(ItemCategory.FOOTWEAR, 'heels')
        ];

        const result = filterStylingContext(items, accessoryFormData);
        
        expect(result.complementing).toHaveLength(5);
        expect(result.layering).toHaveLength(0); // Accessories don't layer typically
      });
    });
  });

  describe('Layering Category Logic', () => {
    describe('TOP items layering', () => {
      const topFormData = {
        category: 'top',
        subcategory: 'cardigan', // Layering piece
        seasons: ['spring/fall']
      };

      it('should layer with other TOP items', () => {
        const basicTopItem = createTestItem(ItemCategory.TOP, 't-shirt');
        basicTopItem.season = [Season.TRANSITIONAL]; // Match season
        const result = filterStylingContext([basicTopItem], topFormData);
        
        expect(result.layering).toHaveLength(1);
        expect(result.layering[0].category).toBe(ItemCategory.TOP);
      });

      it('should NOT layer with non-matching seasons', () => {
        const winterTopItem = createTestItem(ItemCategory.TOP, 'sweater');
        winterTopItem.season = [Season.WINTER]; // Different season
        const result = filterStylingContext([winterTopItem], topFormData);
        
        expect(result.layering).toHaveLength(0);
      });
    });

    describe('OUTERWEAR items layering', () => {
      const outerwearFormData = {
        category: 'outerwear',
        subcategory: 'blazer',
        seasons: ['spring/fall']
      };

      it('should layer over TOP items', () => {
        const topItem = createTestItem(ItemCategory.TOP, 'blouse');
        topItem.season = [Season.TRANSITIONAL]; // Match season
        const result = filterStylingContext([topItem], outerwearFormData);
        
        expect(result.layering).toHaveLength(1);
        expect(result.layering[0].category).toBe(ItemCategory.TOP);
      });

      it('should layer over ONE_PIECE items', () => {
        const dresItem = createTestItem(ItemCategory.ONE_PIECE, 'dress');
        dresItem.season = [Season.TRANSITIONAL]; // Match season
        const result = filterStylingContext([dresItem], outerwearFormData);
        
        expect(result.layering).toHaveLength(1);
        expect(result.layering[0].category).toBe(ItemCategory.ONE_PIECE);
      });

      it('should NOT layer over BOTTOM items', () => {
        const bottomItem = createTestItem(ItemCategory.BOTTOM, 'pants');
        bottomItem.season = [Season.TRANSITIONAL]; // Match season
        const result = filterStylingContext([bottomItem], outerwearFormData);
        
        expect(result.layering).toHaveLength(0);
        expect(result.complementing).toHaveLength(1); // Should complement instead
      });
    });

    describe('ONE_PIECE items layering (limited)', () => {
      const dresFormData = {
        category: 'one_piece',
        subcategory: 'slip-dress', // Potentially layerable
        seasons: ['summer']
      };

      it('should have very limited layering options', () => {
        const items = [
          createTestItem(ItemCategory.TOP, 'cardigan'),
          createTestItem(ItemCategory.ONE_PIECE, 'dress'),
          createTestItem(ItemCategory.OUTERWEAR, 'blazer')
        ];

        const result = filterStylingContext(items, dresFormData);
        
        // Most one-pieces have limited layering, mainly with other dresses in special cases
        expect(result.layering.length).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Edge cases and boundary conditions', () => {
    it('should handle OTHER category correctly', () => {
      const otherFormData = {
        category: 'other',
        subcategory: 'misc',
        seasons: ['summer']
      };

      const items = [
        createTestItem(ItemCategory.TOP, 'shirt'),
        createTestItem(ItemCategory.BOTTOM, 'pants')
      ];

      const result = filterStylingContext(items, otherFormData);
      
      expect(result.complementing).toHaveLength(0);
      expect(result.layering).toHaveLength(0);
    });

    it('should handle unknown/missing categories gracefully', () => {
      const unknownFormData = {
        category: 'unknown-category' as any,
        subcategory: 'test',
        seasons: ['summer']
      };

      const items = [createTestItem(ItemCategory.TOP, 'shirt')];
      
      // Should not throw error
      expect(() => {
        filterStylingContext(items, unknownFormData);
      }).not.toThrow();
    });

    it('should prioritize complementing over layering when both possible', () => {
      // This tests the precedence of the category mapping logic
      const topFormData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer']
      };

      const outerwearItem = createTestItem(ItemCategory.OUTERWEAR, 'cardigan');
      const result = filterStylingContext([outerwearItem], topFormData);
      
      // Outerwear can both complement tops (when worn together) and layer (over tops)
      // Our logic should put it in layering for tops since TOP+OUTERWEAR typically involves layering
      expect(result.layering).toHaveLength(1);
      expect(result.complementing).toHaveLength(0);
    });
  });

  describe('Regression Tests - Recent Fixes', () => {
    describe('ONE_PIECE complementing vs layering fixes', () => {
      const dressFormData = {
        category: 'one_piece',
        subcategory: 'dress',
        seasons: ['summer']
      };

      it('should include OUTERWEAR in separate outerwear category for dresses', () => {
        const jacket = createTestItem(ItemCategory.OUTERWEAR, 'jacket', ['summer']);
        const result = filterStylingContext([jacket], dressFormData);
        
        expect(result.complementing).toHaveLength(0); // Should be empty
        expect(result.layering).toHaveLength(0); // Should be empty
        expect(result.outerwear).toHaveLength(1); // Should be in outerwear category
        expect(result.outerwear[0].category).toBe(ItemCategory.OUTERWEAR);
      });

      it('should include FOOTWEAR and ACCESSORY in complementing for dresses', () => {
        const heels = createTestItem(ItemCategory.FOOTWEAR, 'heels', ['summer']);
        const bag = createTestItem(ItemCategory.ACCESSORY, 'bag', ['summer']);
        
        const result = filterStylingContext([heels, bag], dressFormData);
        
        expect(result.complementing).toHaveLength(2);
        expect(result.layering).toHaveLength(0);
        expect(result.outerwear).toHaveLength(0);
      });

      it('should allow TOP items to layer over ONE_PIECE', () => {
        const blazer = createTestItem(ItemCategory.TOP, 'blazer', ['summer']);
        const result = filterStylingContext([blazer], dressFormData);
        
        expect(result.layering).toContainEqual(expect.objectContaining({ 
          category: ItemCategory.TOP,
          subcategory: 'blazer'
        }));
        expect(result.complementing).toHaveLength(0);
        expect(result.outerwear).toStrictEqual([]);
      });

      it('should put OUTERWEAR items in outerwear category for ONE_PIECE', () => {
        const jacket = createTestItem(ItemCategory.OUTERWEAR, 'jacket', ['summer']);  
        const result = filterStylingContext([jacket], dressFormData);
        
        expect(result.outerwear).toStrictEqual([expect.objectContaining({
          category: ItemCategory.OUTERWEAR,
          subcategory: 'jacket'
        })]);
        expect(result.complementing).toStrictEqual([]);
        expect(result.layering).toStrictEqual([]);
      });
    });

    describe('Bidirectional styling rules', () => {
      it('should include shirts in layering when analyzing sweaters', () => {
        const shirt = createTestItem(ItemCategory.TOP, 'shirt', ['spring/fall']);
        const sweaterFormData = {
          category: 'top',
          subcategory: 'sweater',
          seasons: ['spring/fall']
        };
        
        const result = filterStylingContext([shirt], sweaterFormData);
        
        expect(result.layering).toContainEqual(expect.objectContaining({
          category: ItemCategory.TOP,
          subcategory: 'shirt'
        }));
      });

      it('should include shirts in layering when analyzing sweatshirts', () => {
        const shirt = createTestItem(ItemCategory.TOP, 'shirt', ['spring/fall']);
        const sweatshirtFormData = {
          category: 'top',
          subcategory: 'sweatshirt',
          seasons: ['spring/fall']
        };
        
        const result = filterStylingContext([shirt], sweatshirtFormData);
        
        expect(result.layering).toContainEqual(expect.objectContaining({
          category: ItemCategory.TOP,
          subcategory: 'shirt'
        }));
      });

      it('should include sweaters/sweatshirts in layering when analyzing shirts', () => {
        const sweater = createTestItem(ItemCategory.TOP, 'sweater', ['spring/fall']);
        const sweatshirt = createTestItem(ItemCategory.TOP, 'sweatshirt', ['spring/fall']);
        const shirtFormData = {
          category: 'top',
          subcategory: 'shirt',
          seasons: ['spring/fall']
        };
        
        const result = filterStylingContext([sweater, sweatshirt], shirtFormData);
        
        expect(result.layering).toHaveLength(2);
        expect(result.layering).toContainEqual(expect.objectContaining({
          subcategory: 'sweater'
        }));
        expect(result.layering).toContainEqual(expect.objectContaining({
          subcategory: 'sweatshirt'
        }));
      });
    });
  });
});
