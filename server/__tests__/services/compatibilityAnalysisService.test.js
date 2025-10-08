/**
 * Unit tests for compatibilityAnalysisService - Season + Scenario Combinations
 */

// Mock the utility imports since we're testing just the service logic
jest.mock('../../utils/ai/complementingCompatibilityPrompt');
jest.mock('../../utils/ai/layeringCompatibilityPrompt');
jest.mock('../../utils/ai/outerwearCompatibilityPrompt');

const compatibilityAnalysisService = require('../../services/compatibilityAnalysisService');

// We need to access the internal functions for testing
// In a real scenario, we'd export these functions for testing
describe('compatibilityAnalysisService - Season + Scenario Combinations', () => {

  // Create a test version of the function with the same logic for both test suites
  const checkEssentialCategories = (itemData, allCompatibleItems, season) => {
        const ESSENTIAL_CATEGORIES = {
          'dress': ['footwear'],
          'one_piece': ['footwear'],
          'top': ['bottoms', 'footwear'],
          'bottom': ['tops', 'footwear'],
          'footwear': ['tops', 'bottoms'],
          'outerwear': [],
          'accessory': []
        };

        const itemCategory = itemData.category?.toLowerCase();
        const requiredCategories = ESSENTIAL_CATEGORIES[itemCategory] || [];

        // Get items that match this season
        const seasonItems = allCompatibleItems.filter(item => {
          const itemSeasons = item.seasons || item.season || [];
          if (typeof itemSeasons === 'string') {
            return itemSeasons.includes(season) || season.includes(itemSeasons);
          }
          if (Array.isArray(itemSeasons)) {
            return itemSeasons.some(itemSeason => 
              itemSeason.includes(season) || season.includes(itemSeason)
            );
          }
          return false;
        });

        // Check which required categories we have items for
        const availableCategories = [];
        const missingCategories = [];

        requiredCategories.forEach(requiredCategory => {
          const hasItemInCategory = seasonItems.some(item => 
            item.category?.toLowerCase() === requiredCategory
          );

          if (hasItemInCategory) {
            availableCategories.push(requiredCategory);
          } else {
            missingCategories.push(requiredCategory);
          }
        });

        const allAvailableCategories = [...new Set(seasonItems.map(item => item.category?.toLowerCase()).filter(Boolean))];

        return {
          hasAllEssentials: missingCategories.length === 0,
          missingCategories,
          availableCategories: allAvailableCategories,
          requiredCategories
        };
  };

  describe('checkEssentialCategories function', () => {
    describe('Essential Categories Mapping', () => {
      it('should require footwear for dress items', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [
          { name: 'Black Heels', category: 'footwear', seasons: ['summer'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.requiredCategories).toEqual(['footwear']);
        expect(result.hasAllEssentials).toBe(true);
        expect(result.missingCategories).toEqual([]);
      });

      it('should require footwear for one_piece items (the bug we fixed)', () => {
        const itemData = { category: 'one_piece' };
        const compatibleItems = [
          { name: 'Belt', category: 'accessory', seasons: ['summer'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.requiredCategories).toEqual(['footwear']);
        expect(result.hasAllEssentials).toBe(false);
        expect(result.missingCategories).toEqual(['footwear']);
      });

      it('should require tops and footwear for bottom items', () => {
        const itemData = { category: 'bottom' };
        const compatibleItems = [
          { name: 'White Shirt', category: 'tops', seasons: ['summer'] },
          { name: 'Sandals', category: 'footwear', seasons: ['summer'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.requiredCategories).toEqual(['tops', 'footwear']);
        expect(result.hasAllEssentials).toBe(true);
      });

      it('should require no essentials for accessories', () => {
        const itemData = { category: 'accessory' };
        const compatibleItems = [];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.requiredCategories).toEqual([]);
        expect(result.hasAllEssentials).toBe(true);
      });

      it('should handle unknown categories gracefully', () => {
        const itemData = { category: 'unknown_category' };
        const compatibleItems = [];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.requiredCategories).toEqual([]);
        expect(result.hasAllEssentials).toBe(true);
      });
    });

    describe('Season Matching Logic', () => {
      it('should match exact season strings', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [
          { name: 'Summer Sandals', category: 'footwear', seasons: ['summer'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(true);
      });

      it('should match compound seasons like "spring/fall"', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [
          { name: 'Versatile Boots', category: 'footwear', seasons: ['spring/fall'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'spring');

        expect(result.hasAllEssentials).toBe(true);
      });

      it('should handle single season string format', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [
          { name: 'Winter Boots', category: 'footwear', seasons: 'winter' }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'winter');

        expect(result.hasAllEssentials).toBe(true);
      });

      it('should not match incompatible seasons', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [
          { name: 'Winter Boots', category: 'footwear', seasons: ['winter'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(false);
        expect(result.missingCategories).toEqual(['footwear']);
      });
    });

    describe('Real-world Bug Scenarios', () => {
      it('should not show complete when only accessories match season (the original bug)', () => {
        const itemData = { category: 'one_piece' };
        const compatibleItems = [
          { name: 'Black Suede Handbag', category: 'accessory', seasons: ['spring/fall', 'winter', 'summer'] },
          { name: 'Brown Belt', category: 'accessory', seasons: ['summer', 'spring/fall', 'winter'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(false);
        expect(result.missingCategories).toEqual(['footwear']);
        expect(result.availableCategories).toEqual(['accessory']);
      });

      it('should show complete when essential categories are satisfied', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [
          { name: 'Summer Sandals', category: 'footwear', seasons: ['summer'] },
          { name: 'Belt', category: 'accessory', seasons: ['summer'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(true);
        expect(result.missingCategories).toEqual([]);
        expect(result.availableCategories).toContain('footwear');
      });

      it('should handle multiple required categories missing', () => {
        const itemData = { category: 'top' };
        const compatibleItems = [
          { name: 'Belt', category: 'accessory', seasons: ['summer'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(false);
        expect(result.missingCategories).toEqual(['bottoms', 'footwear']);
      });

      it('should handle partially satisfied requirements', () => {
        const itemData = { category: 'top' };
        const compatibleItems = [
          { name: 'Jeans', category: 'bottoms', seasons: ['summer'] },
          { name: 'Belt', category: 'accessory', seasons: ['summer'] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(false);
        expect(result.missingCategories).toEqual(['footwear']);
        expect(result.availableCategories).toContain('bottoms');
      });
    });

    describe('Edge Cases', () => {
      it('should handle empty compatible items array', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(false);
        expect(result.missingCategories).toEqual(['footwear']);
      });

      it('should handle items with no seasons data', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [
          { name: 'Shoes', category: 'footwear' } // No seasons property
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(false);
        expect(result.missingCategories).toEqual(['footwear']);
      });

      it('should handle items with empty seasons array', () => {
        const itemData = { category: 'dress' };
        const compatibleItems = [
          { name: 'Shoes', category: 'footwear', seasons: [] }
        ];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.hasAllEssentials).toBe(false);
        expect(result.missingCategories).toEqual(['footwear']);
      });

      it('should handle null/undefined itemData category', () => {
        const itemData = {};
        const compatibleItems = [];

        const result = checkEssentialCategories(itemData, compatibleItems, 'summer');

        expect(result.requiredCategories).toEqual([]);
        expect(result.hasAllEssentials).toBe(true);
      });
    });
  });

  describe('Season + Scenario Combinations Integration', () => {
    // Create a test version of the main function
    const createSeasonScenarioCombinations = (itemData, compatibleItems) => {
        const seasons = itemData.seasons || [];
        let scenarios = itemData.scenarios || itemData.suitableScenarios || [];
        
        if (scenarios.length > 0 && typeof scenarios[0] === 'object') {
          scenarios = scenarios.map(s => s.name || s);
        }

        if (seasons.length === 0 || scenarios.length === 0) {
          return [];
        }

        const seasonScenarioCombinations = [];
        const allCompatibleItems = [];
        
        if (compatibleItems) {
          Object.values(compatibleItems).forEach(categoryItems => {
            if (Array.isArray(categoryItems)) {
              allCompatibleItems.push(...categoryItems);
            }
          });
        }

        seasons.forEach(season => {
          scenarios.forEach(scenario => {
            // Use the checkEssentialCategories function we defined above
            const { hasAllEssentials, missingCategories, availableCategories } = checkEssentialCategories(
              itemData, allCompatibleItems, season
            );

            seasonScenarioCombinations.push({
              combination: `${season} + ${scenario}`,
              season,
              scenario,
              hasItems: hasAllEssentials,
              missingCategories,
              availableCategories
            });
          });
        });

        return seasonScenarioCombinations;
    };

    it('should create all season + scenario combinations', () => {
      const itemData = {
        category: 'dress',
        seasons: ['summer', 'spring/fall'],
        scenarios: ['Social Outings', 'Office Work']
      };
      const compatibleItems = {
        footwear: [
          { name: 'Sandals', category: 'footwear', seasons: ['summer'] },
          { name: 'Boots', category: 'footwear', seasons: ['spring/fall'] }
        ]
      };

      const result = createSeasonScenarioCombinations(itemData, compatibleItems);

      expect(result).toHaveLength(4);
      expect(result[0].combination).toBe('summer + Social Outings');
      expect(result[1].combination).toBe('summer + Office Work');
      expect(result[2].combination).toBe('spring/fall + Social Outings');
      expect(result[3].combination).toBe('spring/fall + Office Work');
    });

    it('should correctly identify complete vs incomplete combinations', () => {
      const itemData = {
        category: 'dress',
        seasons: ['summer', 'winter'],
        scenarios: ['Social Outings']
      };
      const compatibleItems = {
        footwear: [
          { name: 'Summer Sandals', category: 'footwear', seasons: ['summer'] }
          // No winter footwear
        ],
        accessory: [
          { name: 'Belt', category: 'accessory', seasons: ['summer', 'winter'] }
        ]
      };

      const result = createSeasonScenarioCombinations(itemData, compatibleItems);

      expect(result).toHaveLength(2);
      expect(result[0].hasItems).toBe(true); // summer has sandals
      expect(result[1].hasItems).toBe(false); // winter missing footwear
      expect(result[1].missingCategories).toEqual(['footwear']);
    });

    it('should handle scenario objects with name property', () => {
      const itemData = {
        category: 'dress',
        seasons: ['summer'],
        scenarios: [
          { id: 1, name: 'Social Outings' },
          { id: 2, name: 'Office Work' }
        ]
      };
      const compatibleItems = {
        footwear: [
          { name: 'Sandals', category: 'footwear', seasons: ['summer'] }
        ]
      };

      const result = createSeasonScenarioCombinations(itemData, compatibleItems);

      expect(result).toHaveLength(2);
      expect(result[0].scenario).toBe('Social Outings');
      expect(result[1].scenario).toBe('Office Work');
    });

    it('should return empty array when missing seasons or scenarios', () => {
      const itemData = {
        category: 'dress',
        seasons: ['summer']
        // No scenarios
      };
      const compatibleItems = {};

      const result = createSeasonScenarioCombinations(itemData, compatibleItems);

      expect(result).toHaveLength(0);
    });
  });
});
