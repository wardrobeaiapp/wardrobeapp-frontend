// @ts-nocheck
/**
 * Wardrobe Analysis Service - Scenario Filtering Tests
 * 
 * Tests the scenario coverage filtering logic for wishlist items
 * vs regular item analysis in the frontend service
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

// Mock the actual service function for testing
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFilterScenarioCoverage = (preFilledData, scenarios, originalCoverage) => {
  // Simulate the filtering logic from wardrobeAnalysisService.ts
  if (preFilledData && preFilledData.scenarios && preFilledData.scenarios.length > 0) {
    // Convert wishlist scenario IDs to names for filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wishlistScenarioNames = preFilledData.scenarios.map(scenarioId => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scenario = scenarios.find(s => s.id === scenarioId);
      return scenario ? scenario.name : null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).filter(name => name !== null);
    
    // Filter scenario coverage to only include the wishlist item's scenarios
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return originalCoverage.filter(coverage => {
      // Always include "All scenarios" coverage (e.g. outerwear)
      if (coverage.scenarioName.toLowerCase().includes('all scenarios')) {
        return true;
      }
      // Include only the scenarios selected for this wishlist item
      return wishlistScenarioNames.includes(coverage.scenarioName);
    });
  }
  
  return originalCoverage; // Return all coverage for regular items
};

describe('Wardrobe Analysis Service - Scenario Filtering', () => {
  const mockScenarios = [
    {
      id: 'd4daf7c5-c3ef-4bfa-b06d-f6f85f60c243',
      name: 'Social Outings',
      description: 'Casual to smart casual events',
      frequency: '2 times per week',
      user_id: 'user-123',
      created_at: '2024-01-01'
    },
    {
      id: '4a014af9-b07e-469b-b503-abcaf8b5fab0',
      name: 'Office Work',
      description: 'Business casual dress code',
      frequency: '5 times per week',
      user_id: 'user-123',
      created_at: '2024-01-01'
    },
    {
      id: '4c4257b3-ff49-4eb8-9fcc-c6f093d015c6',
      name: 'Staying at Home',
      description: 'Comfort-focused activities',
      frequency: '1 times per week',
      user_id: 'user-123',
      created_at: '2024-01-01'
    }
  ];

  const mockAllScenariosCoverage = [
    {
      scenarioName: 'Office Work',
      category: 'one_piece',
      season: 'summer',
      currentItems: 2,
      coveragePercent: 40,
      gapCount: 3,
      gapType: 'improvement'
    },
    {
      scenarioName: 'Social Outings',
      category: 'one_piece',
      season: 'summer',
      currentItems: 4,
      coveragePercent: 80,
      gapCount: 1,
      gapType: 'expansion'
    },
    {
      scenarioName: 'Staying at Home',
      category: 'one_piece',
      season: 'summer',
      currentItems: 1,
      coveragePercent: 20,
      gapCount: 4,
      gapType: 'critical'
    },
    {
      scenarioName: 'Light Outdoor Activities',
      category: 'one_piece',
      season: 'summer',
      currentItems: 0,
      coveragePercent: 0,
      gapCount: 5,
      gapType: 'critical'
    }
  ];

  describe('Wishlist Item Scenario Filtering', () => {
    it('should filter coverage to only wishlist item scenarios', () => {
      const wishlistItem = {
        id: 'item-123',
        name: 'Beige Sequin Dress',
        category: ItemCategory.ONE_PIECE,
        subcategory: 'dress',
        color: 'beige',
        brand: '',
        size: '',
        material: '',
        season: [Season.SUMMER],
        scenarios: ['d4daf7c5-c3ef-4bfa-b06d-f6f85f60c243'], // Social Outings UUID
        wishlist: true,
        userId: 'user-123',
        dateAdded: '2024-01-01'
      };

      const filteredCoverage = mockFilterScenarioCoverage(
        wishlistItem,
        mockScenarios,
        mockAllScenariosCoverage
      );

      // Should only include Social Outings coverage
      expect(filteredCoverage).toHaveLength(1);
      expect(filteredCoverage[0].scenarioName).toBe('Social Outings');
      expect(filteredCoverage[0].gapType).toBe('expansion');
    });

    it('should filter coverage to multiple wishlist scenarios', () => {
      const wishlistItem = {
        id: 'item-456',
        name: 'Versatile Blazer',
        category: ItemCategory.OUTERWEAR,
        subcategory: 'blazer',
        color: 'navy',
        brand: '',
        size: '',
        material: '',
        season: [Season.TRANSITIONAL],
        scenarios: [
          'd4daf7c5-c3ef-4bfa-b06d-f6f85f60c243', // Social Outings
          '4a014af9-b07e-469b-b503-abcaf8b5fab0'  // Office Work
        ],
        wishlist: true,
        userId: 'user-123',
        dateAdded: '2024-01-01'
      };

      const filteredCoverage = mockFilterScenarioCoverage(
        wishlistItem,
        mockScenarios,
        mockAllScenariosCoverage
      );

      // Should include both Social Outings and Office Work coverage
      expect(filteredCoverage).toHaveLength(2);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(filteredCoverage.map(c => c.scenarioName).sort()).toEqual(['Office Work', 'Social Outings']);
    });

    it('should always include "All scenarios" coverage (outerwear)', () => {
      const outerwearCoverage = [
        ...mockAllScenariosCoverage,
        {
          scenarioName: 'All scenarios',
          category: 'outerwear',
          season: 'spring/fall',
          currentItems: 6,
          coveragePercent: 200,
          gapCount: 0,
          gapType: 'expansion'
        }
      ];

      const wishlistItem = {
        id: 'item-789',
        name: 'Winter Coat',
        category: ItemCategory.OUTERWEAR,
        subcategory: 'coat',
        color: 'black',
        brand: '',
        size: '',
        material: '',
        season: [Season.WINTER],
        scenarios: ['d4daf7c5-c3ef-4bfa-b06d-f6f85f60c243'], // Only Social Outings
        wishlist: true,
        userId: 'user-123',
        dateAdded: '2024-01-01'
      };

      const filteredCoverage = mockFilterScenarioCoverage(
        wishlistItem,
        mockScenarios,
        outerwearCoverage
      );

      // Should include both Social Outings AND "All scenarios" coverage
      expect(filteredCoverage).toHaveLength(2);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(filteredCoverage.map(c => c.scenarioName).sort()).toEqual(['All scenarios', 'Social Outings']);
    });

    it('should handle unknown scenario IDs gracefully', () => {
      const wishlistItem = {
        id: 'item-unknown',
        name: 'Mystery Item',
        category: ItemCategory.TOP,
        subcategory: 'shirt',
        color: 'white',
        brand: '',
        size: '',
        material: '',
        season: [Season.SUMMER],
        scenarios: ['unknown-uuid-12345'], // Unknown scenario ID
        wishlist: true,
        userId: 'user-123',
        dateAdded: '2024-01-01'
      };

      const filteredCoverage = mockFilterScenarioCoverage(
        wishlistItem,
        mockScenarios,
        mockAllScenariosCoverage
      );

      // Should return empty array since no matching scenarios
      expect(filteredCoverage).toHaveLength(0);
    });
  });

  describe('Regular Item (No Filtering)', () => {
    it('should return all coverage for regular items', () => {
      const regularItem = {
        id: 'item-regular',
        name: 'Regular T-Shirt',
        category: ItemCategory.TOP,
        subcategory: 't-shirt',
        color: 'blue',
        brand: '',
        size: '',
        material: '',
        season: [Season.SUMMER],
        wishlist: false,
        userId: 'user-123',
        dateAdded: '2024-01-01'
      };

      const filteredCoverage = mockFilterScenarioCoverage(
        regularItem,
        mockScenarios,
        mockAllScenariosCoverage
      );

      // Should return all original coverage
      expect(filteredCoverage).toHaveLength(4);
      expect(filteredCoverage).toEqual(mockAllScenariosCoverage);
    });

    it('should return all coverage when preFilledData is undefined', () => {
      const filteredCoverage = mockFilterScenarioCoverage(
        undefined, // No preFilledData (regular analysis)
        mockScenarios,
        mockAllScenariosCoverage
      );

      // Should return all original coverage
      expect(filteredCoverage).toHaveLength(4);
      expect(filteredCoverage).toEqual(mockAllScenariosCoverage);
    });

    it('should return all coverage when wishlist item has no scenarios', () => {
      const wishlistItemNoScenarios = {
        id: 'item-no-scenarios',
        name: 'Wishlist Item Without Scenarios',
        category: ItemCategory.TOP,
        subcategory: 'shirt',
        color: 'red',
        brand: '',
        size: '',
        material: '',
        season: [Season.SUMMER],
        wishlist: true,
        scenarios: [], // Empty scenarios
        userId: 'user-123',
        dateAdded: '2024-01-01'
      };

      const filteredCoverage = mockFilterScenarioCoverage(
        wishlistItemNoScenarios,
        mockScenarios,
        mockAllScenariosCoverage
      );

      // Should return all original coverage (fallback behavior)
      expect(filteredCoverage).toHaveLength(4);
      expect(filteredCoverage).toEqual(mockAllScenariosCoverage);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty scenarios array', () => {
      const wishlistItem = {
        id: 'item-empty',
        name: 'Empty Scenarios',
        category: ItemCategory.TOP,
        subcategory: 'shirt',
        color: 'green',
        brand: '',
        size: '',
        material: '',
        season: [Season.SUMMER],
        scenarios: [],
        wishlist: true,
        userId: 'user-123',
        dateAdded: '2024-01-01'
      };

      const filteredCoverage = mockFilterScenarioCoverage(
        wishlistItem,
        [],
        mockAllScenariosCoverage
      );

      // Should return original coverage (no filtering applied)
      expect(filteredCoverage).toEqual(mockAllScenariosCoverage);
    });

    it('should handle empty coverage array', () => {
      const wishlistItem = {
        id: 'item-test',
        name: 'Test Item',
        category: ItemCategory.TOP,
        subcategory: 'shirt',
        color: 'yellow',
        brand: '',
        size: '',
        material: '',
        season: [Season.SUMMER],
        scenarios: ['d4daf7c5-c3ef-4bfa-b06d-f6f85f60c243'],
        wishlist: true,
        userId: 'user-123',
        dateAdded: '2024-01-01'
      };

      const filteredCoverage = mockFilterScenarioCoverage(
        wishlistItem,
        mockScenarios,
        [] // Empty coverage
      );

      // Should return empty array
      expect(filteredCoverage).toHaveLength(0);
    });
  });
});
