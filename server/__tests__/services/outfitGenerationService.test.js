/**
 * Unit tests for outfitGenerationService
 */

const {
  generateOutfitCombinations,
  buildOutfitRecommendations,
  buildDressOutfits,
  buildTopOutfits,
  buildBottomOutfits,
  buildFootwearOutfits,
  buildGeneralOutfits
} = require('../../services/outfitGenerationService');

describe('outfitGenerationService', () => {
  
  // Mock console.log to capture and verify logging
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('generateOutfitCombinations', () => {
    const mockItemData = {
      name: 'Test Dress',
      category: 'dress',
      seasons: ['summer']
    };

    const mockCompatibleItems = {
      footwear: [
        { name: 'Black Heels', category: 'footwear', seasons: ['summer'] },
        { name: 'Sandals', category: 'footwear', seasons: ['summer'] }
      ],
      accessory: [
        { name: 'Clutch', category: 'accessory', seasons: ['summer', 'fall'] }
      ]
    };

    describe('Complete Scenarios', () => {
      it('should generate outfits for complete scenarios only', () => {
        const seasonScenarioCombinations = [
          {
            combination: 'summer + Social Outings',
            season: 'summer',
            scenario: 'Social Outings',
            hasItems: true,
            missingCategories: [],
            availableCategories: ['footwear', 'accessory']
          },
          {
            combination: 'winter + Office Work',
            season: 'winter', 
            scenario: 'Office Work',
            hasItems: false,
            missingCategories: ['footwear'],
            availableCategories: ['accessory']
          }
        ];

        const result = generateOutfitCombinations(mockItemData, mockCompatibleItems, seasonScenarioCombinations);

        expect(result).toHaveLength(1);
        expect(result[0].combination).toBe('summer + Social Outings');
        expect(result[0].outfits).toBeDefined();
        expect(result[0].outfits.length).toBeGreaterThan(0);
      });

      it('should log complete scenario outfit generation', () => {
        const seasonScenarioCombinations = [
          {
            combination: 'summer + Social Outings',
            season: 'summer',
            scenario: 'Social Outings', 
            hasItems: true,
            missingCategories: [],
            availableCategories: ['footwear']
          }
        ];

        generateOutfitCombinations(mockItemData, mockCompatibleItems, seasonScenarioCombinations);

        expect(consoleSpy).toHaveBeenCalledWith('\n\n=== 👗 OUTFIT COMBINATIONS GENERATOR ===\n');
        expect(consoleSpy).toHaveBeenCalledWith('✅ GENERATING OUTFITS FOR 1 COMPLETE SCENARIOS\n');
        expect(consoleSpy).toHaveBeenCalledWith('🎯 1) SUMMER + SOCIAL OUTINGS');
      });
    });

    describe('Incomplete Scenarios', () => {
      it('should handle no complete scenarios gracefully', () => {
        const seasonScenarioCombinations = [
          {
            combination: 'winter + Office Work',
            season: 'winter',
            scenario: 'Office Work',
            hasItems: false,
            missingCategories: ['footwear'],
            availableCategories: []
          }
        ];

        const result = generateOutfitCombinations(mockItemData, mockCompatibleItems, seasonScenarioCombinations);

        expect(result).toEqual([]);
        expect(consoleSpy).toHaveBeenCalledWith('❌ NO COMPLETE OUTFIT COMBINATIONS AVAILABLE');
        expect(consoleSpy).toHaveBeenCalledWith('\n🚫 INCOMPLETE SCENARIOS:');
        expect(consoleSpy).toHaveBeenCalledWith('   WINTER + OFFICE WORK - don\'t have footwear to combine with');
      });

      it('should show incomplete scenarios at end when there are complete ones', () => {
        const seasonScenarioCombinations = [
          {
            combination: 'summer + Social Outings',
            season: 'summer',
            scenario: 'Social Outings',
            hasItems: true,
            missingCategories: [],
            availableCategories: ['footwear']
          },
          {
            combination: 'winter + Office Work', 
            season: 'winter',
            scenario: 'Office Work',
            hasItems: false,
            missingCategories: ['footwear', 'outerwear'],
            availableCategories: ['accessory']
          }
        ];

        generateOutfitCombinations(mockItemData, mockCompatibleItems, seasonScenarioCombinations);

        expect(consoleSpy).toHaveBeenCalledWith('\n🚫 INCOMPLETE SCENARIOS:');
        expect(consoleSpy).toHaveBeenCalledWith('   WINTER + OFFICE WORK - don\'t have footwear or outerwear to combine with');
      });
    });

    describe('Season Filtering', () => {
      it('should filter items by matching season', () => {
        const summerWinterItems = {
          footwear: [
            { name: 'Summer Sandals', category: 'footwear', seasons: ['summer'] },
            { name: 'Winter Boots', category: 'footwear', seasons: ['winter'] }
          ]
        };

        const seasonScenarioCombinations = [
          {
            combination: 'summer + Social Outings',
            season: 'summer',
            scenario: 'Social Outings',
            hasItems: true,
            missingCategories: [],
            availableCategories: ['footwear']
          }
        ];

        const result = generateOutfitCombinations(mockItemData, summerWinterItems, seasonScenarioCombinations);

        // Should only include summer items in the outfit
        expect(result[0].outfits[0].items.some(item => item.name === 'Summer Sandals')).toBe(true);
        expect(result[0].outfits[0].items.some(item => item.name === 'Winter Boots')).toBe(false);
      });

      it('should handle no items available for season', () => {
        const winterOnlyItems = {
          footwear: [
            { name: 'Winter Boots', category: 'footwear', seasons: ['winter'] }
          ]
        };

        const seasonScenarioCombinations = [
          {
            combination: 'summer + Social Outings',
            season: 'summer',
            scenario: 'Social Outings',
            hasItems: true,
            missingCategories: [],
            availableCategories: ['footwear']
          }
        ];

        generateOutfitCombinations(mockItemData, winterOnlyItems, seasonScenarioCombinations);

        expect(consoleSpy).toHaveBeenCalledWith('   ❌ No items available for this season');
      });
    });

    describe('Concise Logging Format', () => {
      it('should use Item1 + Item2 + Item3 format', () => {
        const seasonScenarioCombinations = [
          {
            combination: 'summer + Social Outings',
            season: 'summer',
            scenario: 'Social Outings',
            hasItems: true,
            missingCategories: [],
            availableCategories: ['footwear', 'accessory']
          }
        ];

        generateOutfitCombinations(mockItemData, mockCompatibleItems, seasonScenarioCombinations);

        // Should find log entries with + format
        const logCalls = consoleSpy.mock.calls.flat();
        const outfitLogEntry = logCalls.find(call => 
          typeof call === 'string' && call.includes('Test Dress + ') && call.includes(' + ')
        );
        expect(outfitLogEntry).toBeDefined();
      });
    });
  });

  describe('buildOutfitRecommendations', () => {
    const mockItemsByCategory = {
      footwear: [{ name: 'Black Heels', category: 'footwear' }],
      accessory: [{ name: 'Clutch', category: 'accessory' }]
    };

    it('should route to correct outfit builder based on item category', () => {
      const dressData = { name: 'Test Dress', category: 'dress' };
      const topData = { name: 'Test Top', category: 'top' };
      const bottomData = { name: 'Test Bottom', category: 'bottom' };
      const footwearData = { name: 'Test Shoes', category: 'footwear' };

      const dressResult = buildOutfitRecommendations(dressData, mockItemsByCategory, 'summer', 'Social Outings');
      const topResult = buildOutfitRecommendations(topData, { ...mockItemsByCategory, bottoms: [{ name: 'Pants' }] }, 'summer', 'Social Outings');
      const bottomResult = buildOutfitRecommendations(bottomData, { ...mockItemsByCategory, tops: [{ name: 'Shirt' }] }, 'summer', 'Social Outings');
      const footwearResult = buildOutfitRecommendations(footwearData, { tops: [{ name: 'Shirt' }], bottoms: [{ name: 'Pants' }] }, 'summer', 'Social Outings');

      expect(dressResult[0].type).toBe('dress-based');
      expect(topResult[0].type).toBe('top-based');
      expect(bottomResult[0].type).toBe('bottom-based');
      expect(footwearResult[0].type).toBe('footwear-based');
    });

    it('should limit results to max 3 outfits per scenario', () => {
      const itemsByCategory = {
        footwear: [
          { name: 'Heels' }, { name: 'Flats' }, { name: 'Boots' }, 
          { name: 'Sandals' }, { name: 'Sneakers' }
        ]
      };

      const result = buildOutfitRecommendations(
        { name: 'Test Dress', category: 'dress' }, 
        itemsByCategory, 
        'summer', 
        'Social Outings'
      );

      expect(result.length).toBeLessThanOrEqual(3);
    });
  });

  describe('buildDressOutfits', () => {
    const mockItemData = { name: 'Sequin Dress', category: 'dress', compatibilityTypes: ['base-item'] };

    it('should build dress + footwear combinations', () => {
      const itemsByCategory = {
        footwear: [
          { name: 'Black Heels', category: 'footwear' },
          { name: 'Strappy Sandals', category: 'footwear' }
        ]
      };

      const result = buildDressOutfits(mockItemData, itemsByCategory, 'summer', 'Social Outings');

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('dress-based');
      expect(result[0].items).toHaveLength(2); // dress + shoes
      expect(result[0].items[0].name).toBe('Sequin Dress');
      expect(result[0].items[1].name).toBe('Black Heels');
    });

    it('should add outerwear for appropriate seasons', () => {
      const itemsByCategory = {
        footwear: [{ name: 'Boots', category: 'footwear' }],
        outerwear: [{ name: 'Blazer', category: 'outerwear' }]
      };

      const fallResult = buildDressOutfits(mockItemData, itemsByCategory, 'fall', 'Office Work');
      const summerResult = buildDressOutfits(mockItemData, itemsByCategory, 'summer', 'Social Outings');

      expect(fallResult[0].items).toHaveLength(3); // dress + shoes + outerwear
      expect(fallResult[0].items.some(item => item.name === 'Blazer')).toBe(true);
      
      expect(summerResult[0].items).toHaveLength(2); // dress + shoes only
      expect(summerResult[0].items.some(item => item.name === 'Blazer')).toBe(false);
    });

    it('should add accessories when available', () => {
      const itemsByCategory = {
        footwear: [{ name: 'Heels', category: 'footwear' }],
        accessory: [{ name: 'Clutch', category: 'accessory' }]
      };

      const result = buildDressOutfits(mockItemData, itemsByCategory, 'summer', 'Social Outings');

      expect(result[0].items).toHaveLength(3); // dress + shoes + accessory
      expect(result[0].items.some(item => item.name === 'Clutch')).toBe(true);
    });

    it('should handle no footwear gracefully', () => {
      const itemsByCategory = {
        accessory: [{ name: 'Clutch', category: 'accessory' }]
      };

      const result = buildDressOutfits(mockItemData, itemsByCategory, 'summer', 'Social Outings');

      expect(result).toEqual([]);
    });
  });

  describe('buildTopOutfits', () => {
    const mockItemData = { name: 'White Blouse', category: 'top' };

    it('should build top + bottom + footwear combinations', () => {
      const itemsByCategory = {
        bottoms: [{ name: 'Black Trousers', category: 'bottoms' }],
        footwear: [{ name: 'Pumps', category: 'footwear' }]
      };

      const result = buildTopOutfits(mockItemData, itemsByCategory, 'spring', 'Office Work');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('top-based');
      expect(result[0].items).toHaveLength(3); // top + bottom + shoes
      expect(result[0].items[0].name).toBe('White Blouse');
      expect(result[0].items[1].name).toBe('Black Trousers');
      expect(result[0].items[2].name).toBe('Pumps');
    });

    it('should handle both bottoms and bottom category names', () => {
      const itemsByCategory1 = { bottoms: [{ name: 'Skirt' }], footwear: [{ name: 'Heels' }] };
      const itemsByCategory2 = { bottom: [{ name: 'Pants' }], footwear: [{ name: 'Flats' }] };

      const result1 = buildTopOutfits(mockItemData, itemsByCategory1, 'summer', 'Social Outings');
      const result2 = buildTopOutfits(mockItemData, itemsByCategory2, 'summer', 'Social Outings');

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
    });

    it('should add outerwear when available', () => {
      const itemsByCategory = {
        bottoms: [{ name: 'Jeans' }],
        footwear: [{ name: 'Sneakers' }],
        outerwear: [{ name: 'Cardigan' }]
      };

      const result = buildTopOutfits(mockItemData, itemsByCategory, 'fall', 'Casual Outings');

      expect(result[0].items).toHaveLength(4); // top + bottom + shoes + outerwear
      expect(result[0].items.some(item => item.name === 'Cardigan')).toBe(true);
    });
  });

  describe('buildBottomOutfits', () => {
    const mockItemData = { name: 'Navy Trousers', category: 'bottom' };

    it('should build bottom + top + footwear combinations', () => {
      const itemsByCategory = {
        tops: [{ name: 'White Shirt', category: 'top' }],
        footwear: [{ name: 'Loafers', category: 'footwear' }]
      };

      const result = buildBottomOutfits(mockItemData, itemsByCategory, 'spring', 'Office Work');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('bottom-based');
      expect(result[0].items).toHaveLength(3);
      expect(result[0].items[0].name).toBe('Navy Trousers');
      expect(result[0].items[1].name).toBe('White Shirt');
      expect(result[0].items[2].name).toBe('Loafers');
    });

    it('should handle both tops and top category names', () => {
      const itemsByCategory1 = { tops: [{ name: 'Blouse' }], footwear: [{ name: 'Heels' }] };
      const itemsByCategory2 = { top: [{ name: 'T-shirt' }], footwear: [{ name: 'Sneakers' }] };

      const result1 = buildBottomOutfits(mockItemData, itemsByCategory1, 'summer', 'Social Outings');
      const result2 = buildBottomOutfits(mockItemData, itemsByCategory2, 'summer', 'Casual');

      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
    });

    it('should generate multiple combinations with multiple tops and footwear', () => {
      const itemsByCategory = {
        tops: [{ name: 'Shirt' }, { name: 'Blouse' }],
        footwear: [{ name: 'Flats' }, { name: 'Heels' }]
      };

      const result = buildBottomOutfits(mockItemData, itemsByCategory, 'spring', 'Office Work');

      expect(result).toHaveLength(4); // 2 tops × 2 footwear = 4 combinations
    });
  });

  describe('buildFootwearOutfits', () => {
    const mockItemData = { name: 'Brown Boots', category: 'footwear' };

    it('should build footwear + top + bottom combinations', () => {
      const itemsByCategory = {
        tops: [{ name: 'Sweater', category: 'top' }],
        bottoms: [{ name: 'Jeans', category: 'bottom' }]
      };

      const result = buildFootwearOutfits(mockItemData, itemsByCategory, 'fall', 'Casual');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('footwear-based');
      expect(result[0].items).toHaveLength(3);
      expect(result[0].items[0].name).toBe('Brown Boots');
      expect(result[0].items[1].name).toBe('Sweater');
      expect(result[0].items[2].name).toBe('Jeans');
    });

    it('should handle multiple tops and bottoms', () => {
      const itemsByCategory = {
        tops: [{ name: 'T-shirt' }, { name: 'Tank Top' }],
        bottoms: [{ name: 'Shorts' }, { name: 'Skirt' }]
      };

      const result = buildFootwearOutfits(mockItemData, itemsByCategory, 'summer', 'Casual');

      expect(result).toHaveLength(4); // 2 tops × 2 bottoms = 4 combinations
    });
  });

  describe('buildGeneralOutfits', () => {
    const mockItemData = { name: 'Scarf', category: 'accessory' };

    it('should build general combination with available items', () => {
      const itemsByCategory = {
        footwear: [{ name: 'Boots' }],
        tops: [{ name: 'Sweater' }],
        bottoms: [{ name: 'Jeans' }]
      };

      const result = buildGeneralOutfits(mockItemData, itemsByCategory, 'fall', 'Casual');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('general');
      expect(result[0].items).toHaveLength(4); // base item + 3 others (max)
      expect(result[0].items[0].name).toBe('Scarf');
    });

    it('should limit to max 3 additional items', () => {
      const itemsByCategory = {
        footwear: [{ name: 'Boots' }],
        tops: [{ name: 'Sweater' }],
        bottoms: [{ name: 'Jeans' }],
        outerwear: [{ name: 'Coat' }],
        accessory: [{ name: 'Hat' }]
      };

      const result = buildGeneralOutfits(mockItemData, itemsByCategory, 'winter', 'Outdoor');

      expect(result[0].items).toHaveLength(4); // base item + max 3 others
    });

    it('should handle no available items', () => {
      const itemsByCategory = {};

      const result = buildGeneralOutfits(mockItemData, itemsByCategory, 'summer', 'Beach');

      expect(result).toEqual([]);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null/undefined compatible items', () => {
      const seasonScenarioCombinations = [{
        combination: 'summer + Social Outings',
        season: 'summer',
        scenario: 'Social Outings',
        hasItems: true,
        missingCategories: [],
        availableCategories: []
      }];

      const result1 = generateOutfitCombinations({ name: 'Test', category: 'dress' }, null, seasonScenarioCombinations);
      const result2 = generateOutfitCombinations({ name: 'Test', category: 'dress' }, undefined, seasonScenarioCombinations);

      expect(result1).toEqual([]);
      expect(result2).toEqual([]);
    });

    it('should handle empty season scenario combinations', () => {
      const mockItemData = { name: 'Test', category: 'dress' };
      const mockCompatibleItems = { footwear: [{ name: 'Shoes' }] };

      const result = generateOutfitCombinations(mockItemData, mockCompatibleItems, []);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('❌ NO COMPLETE OUTFIT COMBINATIONS AVAILABLE');
    });

    it('should handle items with string season format', () => {
      const itemsByCategory = {
        footwear: [{ name: 'Sandals', category: 'footwear', seasons: 'summer' }] // string instead of array
      };

      const seasonScenarioCombinations = [{
        combination: 'summer + Beach',
        season: 'summer',
        scenario: 'Beach',
        hasItems: true,
        missingCategories: [],
        availableCategories: ['footwear']
      }];

      const result = generateOutfitCombinations(
        { name: 'Swimsuit', category: 'one_piece', seasons: ['summer'] },
        { footwear: itemsByCategory.footwear },
        seasonScenarioCombinations
      );

      expect(result[0].outfits[0].items.some(item => item.name === 'Sandals')).toBe(true);
    });

    it('should handle compound seasons like "spring/fall"', () => {
      const itemsByCategory = {
        footwear: [{ name: 'Boots', category: 'footwear', seasons: ['spring/fall'] }]
      };

      const seasonScenarioCombinations = [{
        combination: 'fall + Office Work',
        season: 'fall',
        scenario: 'Office Work',
        hasItems: true,
        missingCategories: [],
        availableCategories: ['footwear']
      }];

      const result = generateOutfitCombinations(
        { name: 'Blazer', category: 'outerwear', seasons: ['fall'] },
        { footwear: itemsByCategory.footwear },
        seasonScenarioCombinations
      );

      expect(result[0].outfits[0].items.some(item => item.name === 'Boots')).toBe(true);
    });
  });
});
