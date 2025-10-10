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
  buildGeneralOutfits,
  createOutfitSignature,
  distributeOutfitsIntelligently
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
      it('should log outfit generation completion', () => {
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

        // Should log outfit generation and distribution
        expect(consoleSpy).toHaveBeenCalledWith('\n📊 INTELLIGENT OUTFIT DISTRIBUTION:');
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('SUMMER + SOCIAL OUTINGS:'));
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

      // Use summer season without accessories to get base types
      const dressResult = buildOutfitRecommendations(dressData, { footwear: [{ name: 'Heels' }] }, 'summer', 'Social Outings');
      const topResult = buildOutfitRecommendations(topData, { bottoms: [{ name: 'Pants' }], footwear: [{ name: 'Shoes' }] }, 'summer', 'Social Outings');
      const bottomResult = buildOutfitRecommendations(bottomData, { tops: [{ name: 'Shirt' }], footwear: [{ name: 'Shoes' }] }, 'summer', 'Social Outings');
      const footwearResult = buildOutfitRecommendations(footwearData, { tops: [{ name: 'Shirt' }], bottoms: [{ name: 'Pants' }] }, 'summer', 'Social Outings');

      // Expect base types or their complete versions
      expect(dressResult[0].type).toMatch(/dress-based/);
      expect(topResult[0].type).toMatch(/top-based/);
      expect(bottomResult[0].type).toMatch(/bottom-based/);
      expect(footwearResult[0].type).toBe('footwear-based');
    });

    it('should generate all good outfit combinations (no artificial limits)', () => {
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

      // Should generate outfits for each footwear option (5 total)
      expect(result.length).toBe(5);
      expect(result.every(outfit => outfit.items.length >= 2)).toBe(true); // dress + shoes minimum
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

  describe('Professional Stylist Improvements - Duplication Prevention', () => {
    const mockItemData = { name: 'White Blouse', category: 'top' };

    it('should create only layered version when outerwear is available', () => {
      const itemsByCategory = {
        bottoms: [{ name: 'Black Skirt' }],
        footwear: [{ name: 'Heels' }],
        outerwear: [{ name: 'Blazer' }]
      };

      const result = buildTopOutfits(mockItemData, itemsByCategory, 'fall', 'Office Work');

      // Should create only one outfit per combination (layered version)
      expect(result).toHaveLength(1);
      expect(result[0].items).toHaveLength(4); // top + bottom + shoes + outerwear
      expect(result[0].items.some(item => item.name === 'Blazer')).toBe(true);
      expect(result[0].type).toBe('top-based-layered');

      // Should NOT create both base and layered versions
      expect(result.filter(outfit => outfit.type === 'top-based')).toHaveLength(0);
    });

    it('should create only base version when no outerwear is available', () => {
      const itemsByCategory = {
        bottoms: [{ name: 'Black Skirt' }],
        footwear: [{ name: 'Heels' }]
        // No outerwear
      };

      const result = buildTopOutfits(mockItemData, itemsByCategory, 'summer', 'Social Outings');

      expect(result).toHaveLength(1);
      expect(result[0].items).toHaveLength(3); // top + bottom + shoes only
      expect(result[0].type).toBe('top-based');

      // Should NOT try to add outerwear
      expect(result[0].items.some(item => item.category === 'outerwear')).toBe(false);
    });

    it('should prevent dress outfit duplication', () => {
      const mockDressData = { name: 'Cocktail Dress', category: 'dress' };
      const itemsByCategory = {
        footwear: [{ name: 'Pumps' }],
        outerwear: [{ name: 'Cardigan' }],
        accessory: [{ name: 'Clutch' }]
      };

      const result = buildDressOutfits(mockDressData, itemsByCategory, 'spring', 'Social Outings');

      // Should create only one complete outfit per shoe
      expect(result).toHaveLength(1);
      
      // Should prioritize outerwear over accessories for spring
      const outfit = result[0];
      expect(outfit.items.some(item => item.name === 'Cardigan')).toBe(true);
      expect(outfit.type).toBe('dress-based-layered');

      // Should not create multiple versions (base + layered + accessorized)
      expect(result.filter(outfit => outfit.type === 'dress-based')).toHaveLength(0);
    });
  });

  describe('Professional Variety Algorithm', () => {
    const mockItemData = { name: 'White T-Shirt', category: 'top' };

    it('should systematically rotate through outerwear pieces for variety', () => {
      const itemsByCategory = {
        bottoms: [{ name: 'Jeans', category: 'bottoms' }, { name: 'Skirt', category: 'bottoms' }, { name: 'Trousers', category: 'bottoms' }],
        footwear: [{ name: 'Sneakers', category: 'footwear' }, { name: 'Boots', category: 'footwear' }, { name: 'Loafers', category: 'footwear' }],
        outerwear: [{ name: 'Blazer', category: 'outerwear' }, { name: 'Cardigan', category: 'outerwear' }, { name: 'Jacket', category: 'outerwear' }]
      };

      const result = buildTopOutfits(mockItemData, itemsByCategory, 'fall', 'Casual');

      expect(result).toHaveLength(9); // 3 bottoms × 3 footwear = 9 combinations

      // Should rotate through outerwear systematically using modulo logic
      const outerwearUsed = result.map(outfit => 
        outfit.items.find(item => item.name && ['Blazer', 'Cardigan', 'Jacket'].includes(item.name))?.name
      ).filter(Boolean);

      // Should have variety in outerwear choices (rotation based on indices)
      const uniqueOuterwear = [...new Set(outerwearUsed)];
      expect(uniqueOuterwear.length).toBeGreaterThan(1);
      expect(outerwearUsed.length).toBe(9); // All outfits should have outerwear
    });

    it('should rotate through accessories for dress outfits', () => {
      const mockDressData = { name: 'Summer Dress', category: 'dress' };
      const itemsByCategory = {
        footwear: [{ name: 'Sandals', category: 'footwear' }, { name: 'Flats', category: 'footwear' }, { name: 'Wedges', category: 'footwear' }],
        accessory: [{ name: 'Necklace', category: 'accessory' }, { name: 'Bracelet', category: 'accessory' }, { name: 'Earrings', category: 'accessory' }]
      };

      const result = buildDressOutfits(mockDressData, itemsByCategory, 'summer', 'Social Outings');

      expect(result).toHaveLength(3); // 3 footwear options

      // Each outfit should have an accessory (since it's summer, no outerwear)
      const accessoriesUsed = result.map(outfit => 
        outfit.items.find(item => item.name && ['Necklace', 'Bracelet', 'Earrings'].includes(item.name))?.name
      ).filter(Boolean);

      // Should use accessories systematically with rotation
      expect(accessoriesUsed.length).toBe(3); // All outfits should have accessories
      const uniqueAccessories = [...new Set(accessoriesUsed)];
      expect(uniqueAccessories.length).toBeGreaterThan(1);
    });

    it('should ensure each compatible item appears in at least one outfit', () => {
      const itemsByCategory = {
        bottoms: [{ name: 'Jeans' }, { name: 'Trousers' }, { name: 'Skirt' }],
        footwear: [{ name: 'Sneakers' }, { name: 'Loafers' }],
        outerwear: [{ name: 'Blazer' }]
      };

      const result = buildTopOutfits(mockItemData, itemsByCategory, 'fall', 'Casual');

      // Should have 6 combinations (3 bottoms × 2 footwear)
      expect(result).toHaveLength(6);

      // Check that all bottoms appear
      const bottomsUsed = result.map(outfit => outfit.items[1].name);
      expect(bottomsUsed).toContain('Jeans');
      expect(bottomsUsed).toContain('Trousers');
      expect(bottomsUsed).toContain('Skirt');

      // Check that all footwear appears
      const footwearUsed = result.map(outfit => outfit.items[2].name);
      expect(footwearUsed).toContain('Sneakers');
      expect(footwearUsed).toContain('Loafers');
    });
  });

  describe('Intelligent Distribution System', () => {
    it('should create outfit signatures correctly', () => {
      const outfit1 = {
        items: [
          { name: 'White Shirt' },
          { name: 'Black Pants' },
          { name: 'Brown Shoes' }
        ]
      };

      const outfit2 = {
        items: [
          { name: 'Brown Shoes' },
          { name: 'White Shirt' },
          { name: 'Black Pants' }
        ]
      };

      const signature1 = createOutfitSignature(outfit1);
      const signature2 = createOutfitSignature(outfit2);

      // Should create identical signatures regardless of order
      expect(signature1).toBe(signature2);
      expect(signature1).toBe('Black Pants + Brown Shoes + White Shirt');
    });

    it('should distribute outfits intelligently across scenarios', () => {
      const allGeneratedOutfits = [
        {
          combination: 'spring/fall + Office Work',
          season: 'spring/fall',
          scenario: 'Office Work',
          outfits: [
            {
              items: [
                { name: 'White Shirt' },
                { name: 'Black Pants' },
                { name: 'Brown Shoes' }
              ]
            },
            {
              items: [
                { name: 'Blue Blouse' },
                { name: 'Navy Skirt' },
                { name: 'Black Heels' }
              ]
            }
          ]
        },
        {
          combination: 'spring/fall + Social Outings',
          season: 'spring/fall',
          scenario: 'Social Outings',
          outfits: [
            {
              items: [
                { name: 'White Shirt' }, // Same outfit as above
                { name: 'Black Pants' },
                { name: 'Brown Shoes' }
              ]
            },
            {
              items: [
                { name: 'Red Dress' },
                { name: 'Gold Sandals' }
              ]
            }
          ]
        }
      ];

      const completeScenarios = [
        {
          combination: 'spring/fall + Office Work',
          season: 'spring/fall',
          scenario: 'Office Work'
        },
        {
          combination: 'spring/fall + Social Outings',
          season: 'spring/fall',
          scenario: 'Social Outings'
        }
      ];

      const result = distributeOutfitsIntelligently(allGeneratedOutfits, completeScenarios);

      expect(result).toHaveLength(2); // Both scenarios should get results

      // Should distribute outfits across scenarios
      const allOutfitSignatures = result.flatMap(combo => 
        combo.outfits.map(outfit => createOutfitSignature(outfit))
      );
      
      // Expect the algorithm to distribute the available outfits
      expect(allOutfitSignatures.length).toBeGreaterThan(0);
      expect(allOutfitSignatures.length).toBeLessThanOrEqual(4); // Max 4 outfits from input
      
      // Each scenario should get at least one outfit
      expect(result[0].outfits.length).toBeGreaterThan(0);
      expect(result[1].outfits.length).toBeGreaterThan(0);
    });

    it('should respect maximum outfits per scenario limit', () => {
      // Create more than 10 unique outfits for one scenario
      const manyOutfits = [];
      for (let i = 0; i < 15; i++) {
        manyOutfits.push({
          items: [
            { name: `Shirt ${i}` },
            { name: 'Black Pants' },
            { name: 'Brown Shoes' }
          ]
        });
      }

      const allGeneratedOutfits = [
        {
          combination: 'summer + Social Outings',
          season: 'summer',
          scenario: 'Social Outings',
          outfits: manyOutfits
        }
      ];

      const completeScenarios = [
        {
          combination: 'summer + Social Outings',
          season: 'summer',
          scenario: 'Social Outings'
        }
      ];

      const result = distributeOutfitsIntelligently(allGeneratedOutfits, completeScenarios);

      expect(result).toHaveLength(1);
      expect(result[0].outfits.length).toBeLessThanOrEqual(10); // Should cap at 10
    });

    it('should prioritize exclusive outfits over shared ones', () => {
      const exclusiveOutfit = {
        items: [{ name: 'Tuxedo' }, { name: 'Dress Shoes' }]
      };

      const sharedOutfit = {
        items: [{ name: 'White Shirt' }, { name: 'Black Pants' }]
      };

      const allGeneratedOutfits = [
        {
          combination: 'winter + Formal Events',
          season: 'winter',
          scenario: 'Formal Events',
          outfits: [exclusiveOutfit, sharedOutfit]
        },
        {
          combination: 'winter + Office Work',
          season: 'winter',
          scenario: 'Office Work',
          outfits: [sharedOutfit] // Only shared outfit
        }
      ];

      const completeScenarios = [
        {
          combination: 'winter + Formal Events',
          season: 'winter',
          scenario: 'Formal Events'
        },
        {
          combination: 'winter + Office Work',
          season: 'winter',
          scenario: 'Office Work'
        }
      ];

      const result = distributeOutfitsIntelligently(allGeneratedOutfits, completeScenarios);

      // Exclusive outfit should be assigned to its exclusive scenario
      const formalResult = result.find(r => r.scenario === 'Formal Events');
      const officeResult = result.find(r => r.scenario === 'Office Work');

      expect(formalResult.outfits.some(o => o.items.some(i => i.name === 'Tuxedo'))).toBe(true);
      expect(officeResult.outfits.some(o => o.items.some(i => i.name === 'Tuxedo'))).toBe(false);
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
        footwear: [{ name: 'Boots', category: 'footwear', seasons: ['spring/fall'] }],
        tops: [{ name: 'Sweater', category: 'top', seasons: ['fall'] }],
        bottoms: [{ name: 'Jeans', category: 'bottom', seasons: ['fall'] }]
      };

      const seasonScenarioCombinations = [{
        combination: 'fall + Office Work',
        season: 'fall',
        scenario: 'Office Work',
        hasItems: true,
        missingCategories: [],
        availableCategories: ['footwear', 'tops', 'bottoms']
      }];

      const result = generateOutfitCombinations(
        { name: 'Boots', category: 'footwear', seasons: ['fall'] },
        itemsByCategory,
        seasonScenarioCombinations
      );

      expect(result[0].outfits[0].items.some(item => item.name === 'Boots')).toBe(true);
    });
    
    it('should not generate outfits for outerwear items', () => {
      const itemsByCategory = {
        footwear: [{ name: 'Boots', category: 'footwear' }],
        tops: [{ name: 'White Shirt', category: 'top' }]
      };

      const seasonScenarioCombinations = [{
        combination: 'fall + Office Work',
        season: 'fall',
        scenario: 'Office Work',
        hasItems: true,
        missingCategories: [],
        availableCategories: ['footwear', 'tops']
      }];

      const result = generateOutfitCombinations(
        { name: 'Blazer', category: 'outerwear', seasons: ['fall'] },
        itemsByCategory,
        seasonScenarioCombinations
      );

      // Outerwear items should not generate outfit combinations
      expect(result).toHaveLength(0);
    });
    
    it('should not generate outfits for accessory items', () => {
      const itemsByCategory = {
        footwear: [{ name: 'Heels', category: 'footwear' }],
        tops: [{ name: 'Blouse', category: 'top' }]
      };

      const seasonScenarioCombinations = [{
        combination: 'summer + Social Outings',
        season: 'summer',
        scenario: 'Social Outings',
        hasItems: true,
        missingCategories: [],
        availableCategories: ['footwear', 'tops']
      }];

      const result = generateOutfitCombinations(
        { name: 'Gold Necklace', category: 'accessory', seasons: ['summer'] },
        itemsByCategory,
        seasonScenarioCombinations
      );

      // Accessory items should not generate outfit combinations
      expect(result).toHaveLength(0);
    });
  });
});
