// @ts-nocheck
/**
 * Tests for scenario-based filtering in wardrobe context helpers
 * Verifies that wishlist items with pre-selected scenarios only show relevant wardrobe items
 */

// Define test constants inline to avoid TypeScript parsing issues
const ItemCategory = {
  TOP: 'top',
  BOTTOM: 'bottom',
  ONE_PIECE: 'one_piece',
  FOOTWEAR: 'footwear',
  OUTERWEAR: 'outerwear',
  ACCESSORY: 'accessory',
  OTHER: 'other'
};

const Season = {
  SUMMER: 'summer',
  WINTER: 'winter',
  TRANSITIONAL: 'transitional'
};

const { filterStylingContext } = require('../../../services/ai/wardrobeContextHelpers');

describe('WardrobeContextHelpers - Scenario Filtering', () => {
  const mockWardrobeItems = [
    {
      id: '1',
      name: 'Comfy Pajama Top',
      category: ItemCategory.TOP,
      subcategory: 'pajamas',
      color: 'pink',
      brand: '',
      size: '',
      material: '',
      season: [Season.SUMMER],
      scenarios: ['Staying at Home'], // Only suitable for staying home
      dateAdded: '2024-01-01',
      wishlist: false,
      userId: 'user-123'
    },
    {
      id: '2',
      name: 'Business Blazer',
      category: ItemCategory.OUTERWEAR,
      subcategory: 'blazer',
      color: 'navy',
      brand: '',
      size: '',
      material: '',
      season: [Season.SUMMER],
      scenarios: ['Office Work', 'Social Outings'], // Professional scenarios
      dateAdded: '2024-01-01',
      wishlist: false,
      userId: 'user-123'
    },
    {
      id: '3',
      name: 'Casual Sneakers',
      category: ItemCategory.FOOTWEAR,
      subcategory: 'sneakers',
      color: 'white',
      brand: '',
      size: '',
      material: '',
      season: [Season.SUMMER],
      scenarios: ['Staying at Home', 'Light Outdoor Activities'], // Casual scenarios
      dateAdded: '2024-01-01',
      wishlist: false,
      userId: 'user-123'
    },
    {
      id: '4',
      name: 'Formal Heels',
      category: ItemCategory.FOOTWEAR,
      subcategory: 'heels',
      color: 'black',
      brand: '',
      size: '',
      material: '',
      season: [Season.SUMMER],
      scenarios: ['Office Work', 'Social Outings'], // Formal scenarios
      dateAdded: '2024-01-01',
      wishlist: false,
      userId: 'user-123'
    },
    {
      id: '5',
      name: 'Versatile Jeans',
      category: ItemCategory.BOTTOM,
      subcategory: 'jeans',
      color: 'blue',
      brand: '',
      size: '',
      material: '',
      season: [Season.SUMMER],
      scenarios: ['Staying at Home', 'Social Outings', 'Light Outdoor Activities'], // Multiple scenarios
      dateAdded: '2024-01-01',
      wishlist: false,
      userId: 'user-123'
    }
  ];

  describe('Scenario-based filtering for wishlist items', () => {
    it('should filter styling context to only "Staying at Home" items for wishlist item with that scenario', () => {
      const formData = {
        category: 'one_piece',
        subcategory: 'dress',
        seasons: ['summer'],
        scenarios: ['Staying at Home'] // Wishlist item scenario
      };

      const result = filterStylingContext(mockWardrobeItems, formData);
      
      // For dress (one_piece), tops appear in layering, footwear in complementing
      const complementingItems = Object.values(result.complementing).flat();
      const layeringItems = result.layering;
      const outerwearItems = result.outerwear;
      const allItems = [...complementingItems, ...layeringItems, ...outerwearItems];

      // Should only include items suitable for "Staying at Home"
      const itemNames = allItems.map(item => item.name);
      
      // Tops can layer over dresses, so pajama top should be in layering
      expect(layeringItems.map(i => i.name)).toContain('Comfy Pajama Top'); // ✅ Has "Staying at Home" - layering
      expect(complementingItems.map(i => i.name)).toContain('Casual Sneakers'); // ✅ Has "Staying at Home" - complementing footwear
      
      // Versatile Jeans won't complement a dress (bottoms don't complement one_piece)
      expect(itemNames).not.toContain('Versatile Jeans'); // ❌ Bottoms don't complement dresses
      expect(itemNames).not.toContain('Business Blazer'); // ❌ Office/Social only
      expect(itemNames).not.toContain('Formal Heels'); // ❌ Office/Social only
    });

    it('should filter styling context to only "Office Work" items for business scenarios', () => {
      const formData = {
        category: 'top',
        subcategory: 'blouse',
        seasons: ['summer'],
        scenarios: ['Office Work'] // Professional wishlist item
      };

      const result = filterStylingContext(mockWardrobeItems, formData);
      
      // For top item: bottoms, footwear, accessories complement; outerwear can layer
      const complementingItems = Object.values(result.complementing).flat();
      const outerwearItems = result.outerwear;
      const allItems = [...complementingItems, ...result.layering, ...outerwearItems];

      const itemNames = allItems.map(item => item.name);
      
      // Business blazer is outerwear, formal heels are footwear - both should be included
      expect(outerwearItems.map(i => i.name)).toContain('Business Blazer'); // ✅ Has "Office Work" - outerwear
      expect(complementingItems.map(i => i.name)).toContain('Formal Heels'); // ✅ Has "Office Work" - footwear
      
      expect(itemNames).not.toContain('Comfy Pajama Top'); // ❌ Home only
      expect(itemNames).not.toContain('Casual Sneakers'); // ❌ Casual scenarios only
    });

    it('should include items with overlapping scenarios', () => {
      const formData = {
        category: 'top',
        subcategory: 'blouse', 
        seasons: ['summer'],
        scenarios: ['Social Outings'] // Social scenario
      };

      const result = filterStylingContext(mockWardrobeItems, formData);
      
      // For top item: bottoms, footwear, accessories complement; outerwear separate
      const complementingItems = Object.values(result.complementing).flat();
      const outerwearItems = result.outerwear;
      const allItems = [...complementingItems, ...result.layering, ...outerwearItems];

      const itemNames = allItems.map(item => item.name);
      
      // Items that have "Social Outings" in their scenarios
      expect(outerwearItems.map(i => i.name)).toContain('Business Blazer'); // ✅ Has "Social Outings" - outerwear
      expect(complementingItems.map(i => i.name)).toContain('Formal Heels'); // ✅ Has "Social Outings" - footwear
      expect(complementingItems.map(i => i.name)).toContain('Versatile Jeans'); // ✅ Has "Social Outings" - bottoms
      
      expect(itemNames).not.toContain('Comfy Pajama Top'); // ❌ Home only
      expect(itemNames).not.toContain('Casual Sneakers'); // ❌ No "Social Outings"
    });

    it('should include all items when no scenarios are specified (regular item analysis)', () => {
      const formData = {
        category: 'one_piece',
        subcategory: 'dress',
        seasons: ['summer']
        // No scenarios - regular item analysis
      };

      const result = filterStylingContext(mockWardrobeItems, formData);
      
      // For one_piece: only footwear and accessories complement; tops can layer; outerwear separate
      const complementingItems = Object.values(result.complementing).flat();
      const layeringItems = result.layering;
      const outerwearItems = result.outerwear;
      const allItems = [...complementingItems, ...layeringItems, ...outerwearItems];

      // Should include all items that match category/season criteria (no scenario filtering)
      expect(allItems.length).toBeGreaterThan(0);
      
      // All footwear should be included in complementing
      const footwearItems = complementingItems.filter(item => item.category === ItemCategory.FOOTWEAR);
      expect(footwearItems.map(i => i.name)).toContain('Casual Sneakers');
      expect(footwearItems.map(i => i.name)).toContain('Formal Heels');
      
      // Outerwear should be in outerwear section
      expect(outerwearItems.map(i => i.name)).toContain('Business Blazer');
      
      // Tops should be in layering section
      expect(layeringItems.map(i => i.name)).toContain('Comfy Pajama Top');
    });

    it('should exclude items with no scenarios when scenario filtering is active', () => {
      // Add an item with no scenarios
      const itemsWithUntagged = [
        ...mockWardrobeItems,
        {
          id: '6',
          name: 'Untagged Item',
          category: ItemCategory.TOP,
          subcategory: 'shirt',
          color: 'white',
          season: [Season.SUMMER],
          scenarios: [], // No scenarios
          dateAdded: '2024-01-01',
          wishlist: false
        } as WardrobeItem
      ];

      const formData = {
        category: 'bottom',
        subcategory: 'pants',
        seasons: ['summer'],
        scenarios: ['Staying at Home'] // Scenario filtering active
      };

      const result = filterStylingContext(itemsWithUntagged, formData);
      
      // For bottom item: tops, footwear, accessories complement; outerwear separate
      const complementingItems = Object.values(result.complementing).flat();
      const allItems = [...complementingItems, ...result.layering, ...result.outerwear];

      const itemNames = allItems.map(item => item.name);
      
      // Should include items with "Staying at Home" scenario
      expect(itemNames).toContain('Comfy Pajama Top'); // ✅ Has "Staying at Home"
      expect(itemNames).toContain('Casual Sneakers'); // ✅ Has "Staying at Home"
      
      // Should exclude item with no scenarios
      expect(itemNames).not.toContain('Untagged Item'); // ❌ No scenarios when filtering is active
    });
  });
});
