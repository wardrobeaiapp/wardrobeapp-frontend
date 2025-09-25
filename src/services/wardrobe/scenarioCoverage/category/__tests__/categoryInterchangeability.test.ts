import { calculateCategoryCoverage } from '../calculations';
import { WardrobeItem, Season, ItemCategory } from '../../../../../types';
import { Scenario } from '../../../../scenarios/types';

const mockScenario: Scenario = {
  id: 'test-scenario',
  user_id: 'test-user',
  name: 'Social Outings',
  frequency: '2 times per week'
};

describe('Category Interchangeability in Coverage Calculation', () => {
  
  describe('TOP category interchangeability', () => {
    test('should count both tops and dresses when calculating top coverage', async () => {
      const items: WardrobeItem[] = [
        // 2 actual tops
        {
          id: '1',
          category: ItemCategory.TOP,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Blue Shirt',
          wishlist: false
        } as WardrobeItem,
        {
          id: '2', 
          category: ItemCategory.TOP,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'White Blouse',
          wishlist: false
        } as WardrobeItem,
        
        // 3 dresses (should count as tops too)
        {
          id: '3',
          category: ItemCategory.ONE_PIECE,
          subcategory: 'dress',
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Black Dress',
          wishlist: false
        } as WardrobeItem,
        {
          id: '4',
          category: ItemCategory.ONE_PIECE,
          subcategory: 'dress', 
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Floral Dress',
          wishlist: false
        } as WardrobeItem,
        {
          id: '5',
          category: ItemCategory.ONE_PIECE,
          subcategory: 'jumpsuit',
          season: ['spring/fall'], 
          scenarios: ['test-scenario'],
          name: 'Navy Jumpsuit',
          wishlist: false
        } as WardrobeItem,
        
        // 1 bottom (should not count for tops)
        {
          id: '6',
          category: ItemCategory.BOTTOM,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Black Jeans',
          wishlist: false
        } as WardrobeItem
      ];

      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Social Outings',
        '2 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        items
      );

      // Should count 2 tops + 3 one-pieces = 5 items
      expect(result).not.toBeInstanceOf(Array);
      const coverage = result as any;
      expect(coverage.currentItems).toBe(5);
      expect(coverage.category).toBe(ItemCategory.TOP);
    });

    test('should not count wishlist dresses when calculating top coverage', async () => {
      const items: WardrobeItem[] = [
        // 1 actual top
        {
          id: '1',
          category: ItemCategory.TOP,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Blue Shirt',
          wishlist: false
        } as WardrobeItem,
        
        // 1 wishlist dress (should NOT count)
        {
          id: '2',
          category: ItemCategory.ONE_PIECE,
          subcategory: 'dress',
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Wishlist Dress',
          wishlist: true
        } as WardrobeItem
      ];

      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario', 
        'Social Outings',
        '2 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        items
      );

      const coverage = result as any;
      expect(coverage.currentItems).toBe(1); // Only the actual top, not the wishlist dress
    });
  });

  describe('BOTTOM category interchangeability', () => {
    test('should count both bottoms and dresses when calculating bottom coverage', async () => {
      const items: WardrobeItem[] = [
        // 1 actual bottom
        {
          id: '1',
          category: ItemCategory.BOTTOM,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Black Jeans',
          wishlist: false
        } as WardrobeItem,
        
        // 2 dresses (should count as bottoms too)
        {
          id: '2',
          category: ItemCategory.ONE_PIECE,
          subcategory: 'dress',
          season: ['spring/fall'],
          scenarios: ['test-scenario'], 
          name: 'Midi Dress',
          wishlist: false
        } as WardrobeItem,
        {
          id: '3',
          category: ItemCategory.ONE_PIECE,
          subcategory: 'jumpsuit',
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Blue Jumpsuit',
          wishlist: false
        } as WardrobeItem,
        
        // 1 top (should not count for bottoms)
        {
          id: '4',
          category: ItemCategory.TOP,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'White Shirt',
          wishlist: false
        } as WardrobeItem
      ];

      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Social Outings',
        '2 times per week', 
        'spring/fall' as Season,
        ItemCategory.BOTTOM,
        items
      );

      const coverage = result as any;
      expect(coverage.currentItems).toBe(3); // 1 bottom + 2 one-pieces = 3
      expect(coverage.category).toBe(ItemCategory.BOTTOM);
    });
  });

  describe('ONE_PIECE category (no interchangeability)', () => {
    test('should count only one-pieces when calculating one-piece coverage', async () => {
      const items: WardrobeItem[] = [
        // 2 dresses
        {
          id: '1',
          category: ItemCategory.ONE_PIECE,
          subcategory: 'dress',
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Evening Dress',
          wishlist: false
        } as WardrobeItem,
        {
          id: '2',
          category: ItemCategory.ONE_PIECE,
          subcategory: 'jumpsuit',
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Casual Jumpsuit',
          wishlist: false
        } as WardrobeItem,
        
        // These should NOT count for one-piece category
        {
          id: '3',
          category: ItemCategory.TOP,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Top',
          wishlist: false
        } as WardrobeItem,
        {
          id: '4', 
          category: ItemCategory.BOTTOM,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Bottom',
          wishlist: false
        } as WardrobeItem
      ];

      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Social Outings',
        '2 times per week',
        'spring/fall' as Season,
        ItemCategory.ONE_PIECE,
        items
      );

      const coverage = result as any;
      expect(coverage.currentItems).toBe(2); // Only the 2 one-pieces
      expect(coverage.category).toBe(ItemCategory.ONE_PIECE);
    });
  });

  describe('Other categories (no interchangeability)', () => {
    test('should count only exact matches for footwear', async () => {
      const items: WardrobeItem[] = [
        // 2 footwear items
        {
          id: '1',
          category: ItemCategory.FOOTWEAR,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Black Heels',
          wishlist: false
        } as WardrobeItem,
        {
          id: '2',
          category: ItemCategory.FOOTWEAR,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Sneakers',
          wishlist: false
        } as WardrobeItem,
        
        // These should NOT count
        {
          id: '3',
          category: ItemCategory.ONE_PIECE,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Dress',
          wishlist: false
        } as WardrobeItem
      ];

      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Social Outings', 
        '2 times per week',
        'spring/fall' as Season,
        ItemCategory.FOOTWEAR,
        items
      );

      const coverage = result as any;
      expect(coverage.currentItems).toBe(2); // Only the 2 footwear items
      expect(coverage.category).toBe(ItemCategory.FOOTWEAR);
    });
  });

  describe('Season and scenario filtering with interchangeability', () => {
    test('should apply season filter correctly with dress interchangeability', async () => {
      const items: WardrobeItem[] = [
        // Spring/fall top
        {
          id: '1',
          category: ItemCategory.TOP,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Spring Top',
          wishlist: false
        } as WardrobeItem,
        
        // Summer dress (should NOT count for spring/fall)
        {
          id: '2',
          category: ItemCategory.ONE_PIECE,
          season: ['summer'],
          scenarios: ['test-scenario'],
          name: 'Summer Dress',
          wishlist: false
        } as WardrobeItem,
        
        // Spring/fall dress (should count)
        {
          id: '3',
          category: ItemCategory.ONE_PIECE,
          season: ['spring/fall'],
          scenarios: ['test-scenario'],
          name: 'Spring Dress',
          wishlist: false
        } as WardrobeItem
      ];

      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Social Outings',
        '2 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        items
      );

      const coverage = result as any;
      expect(coverage.currentItems).toBe(2); // 1 spring top + 1 spring dress, NOT summer dress
    });
  });
});
