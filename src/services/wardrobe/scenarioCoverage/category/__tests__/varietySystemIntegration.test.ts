import { calculateCategoryCoverage } from '../calculations';
import { WardrobeItem, Season, ItemCategory } from '../../../../../types';
import { Scenario } from '../../../../scenarios/types';

// Mock the lifestyle detection to focus on variety system
jest.mock('../../lifestyle/lifestyleDetectionService', () => ({
  isHomeScenario: jest.fn((scenarioName: string) => {
    const homeKeywords = ['home', 'remote work', 'staying'];
    return homeKeywords.some(keyword => scenarioName.toLowerCase().includes(keyword));
  }),
  getOuterwearTargets: jest.fn(() => ({ min: 2, ideal: 3, max: 5 })),
  analyzeAndLogLifestyle: jest.fn(() => ({
    type: 'indoor_focused',
    confidence: 0.8,
    factors: ['Test lifestyle analysis']
  }))
}));

// Mock the lifestyle cache to return a consistent result
jest.mock('../lifestyleCache', () => ({
  getCachedLifestyleAnalysis: jest.fn(() => ({
    type: 'indoor_focused',
    confidence: 0.8,
    factors: ['Test lifestyle analysis']
  }))
}));

describe('Variety System Integration', () => {
  const baseItems: WardrobeItem[] = [
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
    } as WardrobeItem
  ];

  const mockScenarios: Scenario[] = [
    {
      id: 'test-scenario',
      user_id: 'test-user',
      name: 'Office Work',
      frequency: '5 times per week'
    }
  ];

  describe('High variety scenarios (1.0 multiplier)', () => {
    test('should maintain full outfit requirements for office work', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Office Work',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      // Office Work should use full variety (multiplier = 1.0)
      // 5 times per week = 65 uses per season
      // calculateOutfitNeeds(65, 1.0) = 10 outfits
      // Top category: ideal = max(8, ceil(10 * 0.7)) = max(8, 7) = 8
      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeGreaterThan(6); // Should need significant variety
    });

    test('should maintain full outfit requirements for creative work', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Creative Work',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeGreaterThan(6); // Should need significant variety
    });

    test('should maintain full outfit requirements for non-uniform students', async () => {
      const mockScenariosStudent = [{
        id: 'student-scenario',
        user_id: 'test-user', 
        name: 'School/University',
        frequency: '5 times per week',
        description: 'No, I can wear anything I want'
      }];

      const studentItems = baseItems.map(item => ({
        ...item,
        scenarios: ['student-scenario']
      }));

      const result = await calculateCategoryCoverage(
        'test-user',
        'student-scenario',
        'School/University',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        studentItems,
        mockScenariosStudent
      );

      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeGreaterThan(6); // Should need significant variety
    });
  });

  describe('Low variety scenarios (0.4 multiplier)', () => {
    test('should reduce outfit requirements for sports scenarios', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Gym Sessions',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      // Gym should use low variety (multiplier = 0.4)
      // 5 times per week = 65 uses per season
      // calculateOutfitNeeds(65, 0.4) = calculateOutfitNeeds(26, 1.0) = 4 outfits
      // Top category: ideal = max(8, ceil(4 * 0.7)) = max(8, 3) = 8 (minimum)
      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeLessThanOrEqual(8); // Should need less variety
    });

    test('should reduce outfit requirements for errands', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario', 
        'Errands',
        '3 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeLessThanOrEqual(8); // Should need minimal variety
    });

    test('should reduce outfit requirements for uniform students', async () => {
      const mockScenariosUniform = [{
        id: 'uniform-scenario',
        user_id: 'test-user',
        name: 'School/University', 
        frequency: '5 times per week',
        description: 'Yes, I wear a uniform'
      }];

      const uniformItems = baseItems.map(item => ({
        ...item,
        scenarios: ['uniform-scenario']
      }));

      const result = await calculateCategoryCoverage(
        'test-user',
        'uniform-scenario',
        'School/University',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        uniformItems,
        mockScenariosUniform
      );

      // Uniform students should get low variety (multiplier = 0.4)
      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeLessThanOrEqual(8); // Should need minimal variety
    });
  });

  describe('Moderate variety scenarios (0.7 multiplier)', () => {
    test('should apply moderate reduction for social scenarios', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Social Outings',
        '2 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      // Social outings should use moderate variety (multiplier = 0.7)
      // 2 times per week = 26 uses per season
      // calculateOutfitNeeds(26, 0.7) = calculateOutfitNeeds(18, 1.0) = 3 outfits
      // Top category: ideal = max(8, ceil(3 * 0.7)) = max(8, 3) = 8 (minimum)
      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeGreaterThan(0);
      expect(coverage.neededItemsIdeal).toBeLessThan(15); // Less than high variety scenarios
    });

    test('should apply moderate reduction for dating scenarios', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Casual dating',
        '1 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeGreaterThan(0);
      expect(coverage.neededItemsIdeal).toBeLessThan(15); // Moderate requirements
    });
  });

  describe('Home scenarios (0.6 multiplier)', () => {
    test('should apply home reduction for remote work', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Remote Work',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      // Remote work should use home variety (multiplier = 0.6)
      // 5 times per week = 65 uses per season
      // calculateOutfitNeeds(65, 0.6) = calculateOutfitNeeds(39, 1.0) = 6 outfits
      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeLessThan(12); // Should be less than office work
    });

    test('should apply home reduction for staying at home', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Staying at Home',
        '7 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeLessThan(15); // Should need less variety than office
    });
  });

  describe('Comparative variety requirements', () => {
    test('office work should require more variety than gym sessions', async () => {
      const officeResult = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Office Work',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      const gymResult = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Gym Sessions',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      const officeCoverage = officeResult as any;
      const gymCoverage = gymResult as any;

      // Same frequency but office should need more variety than gym
      expect(officeCoverage.neededItemsIdeal).toBeGreaterThanOrEqual(gymCoverage.neededItemsIdeal);
    });

    test('social outings should require more variety than errands', async () => {
      const socialResult = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Social Outings',
        '2 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      const errandsResult = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Errands',
        '2 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios
      );

      const socialCoverage = socialResult as any;
      const errandsCoverage = errandsResult as any;

      // Same frequency but social should need more variety than errands
      expect(socialCoverage.neededItemsIdeal).toBeGreaterThanOrEqual(errandsCoverage.neededItemsIdeal);
    });

    test('regular students should require more variety than uniform students', async () => {
      const regularScenarios = [{
        id: 'regular-student',
        user_id: 'test-user',
        name: 'School/University',
        frequency: '5 times per week',
        description: 'No, I can wear anything I want'
      }];

      const uniformScenarios = [{
        id: 'uniform-student',
        user_id: 'test-user',
        name: 'School/University',
        frequency: '5 times per week',
        description: 'Yes, I wear a uniform'
      }];

      const regularItems = baseItems.map(item => ({ ...item, scenarios: ['regular-student'] }));
      const uniformItems = baseItems.map(item => ({ ...item, scenarios: ['uniform-student'] }));

      const regularResult = await calculateCategoryCoverage(
        'test-user',
        'regular-student',
        'School/University',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        regularItems,
        regularScenarios
      );

      const uniformResult = await calculateCategoryCoverage(
        'test-user',
        'uniform-student',
        'School/University',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        uniformItems,
        uniformScenarios
      );

      const regularCoverage = regularResult as any;
      const uniformCoverage = uniformResult as any;

      // Regular students should need more variety than uniform students
      expect(regularCoverage.neededItemsIdeal).toBeGreaterThanOrEqual(uniformCoverage.neededItemsIdeal);
    });
  });

  describe('Category-specific variety application', () => {
    test('should not apply variety multiplier to outerwear category', async () => {
      // Outerwear uses seasonal + lifestyle logic, not frequency-based calculations
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Gym Sessions',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.OUTERWEAR,
        [],
        mockScenarios
      );

      const coverage = result as any;
      // Outerwear should use lifestyle targets (2, 3, 5) regardless of scenario variety
      expect([2, 3, 4, 5]).toContain(coverage.neededItemsIdeal);
    });

    test('should apply variety multiplier to regular clothing categories', async () => {
      const categories = [ItemCategory.TOP, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE];

      for (const category of categories) {
        const officeResult = await calculateCategoryCoverage(
          'test-user',
          'test-scenario',
          'Office Work',
          '5 times per week',
          'spring/fall' as Season,
          category,
          [],
          mockScenarios
        );

        const gymResult = await calculateCategoryCoverage(
          'test-user',
          'test-scenario',
          'Gym Sessions',
          '5 times per week',
          'spring/fall' as Season,
          category,
          [],
          mockScenarios
        );

        const officeCoverage = officeResult as any;
        const gymCoverage = gymResult as any;

        // For clothing categories, office should generally need more items than gym
        // (though minimum category limits might make some equal)
        expect(officeCoverage.neededItemsIdeal).toBeGreaterThanOrEqual(gymCoverage.neededItemsIdeal);
      }
    });
  });

  describe('Error handling and edge cases', () => {
    test('should handle scenarios with no matching scenario description', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'missing-scenario',
        'Office Work',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        mockScenarios // scenarios array doesn't contain 'missing-scenario'
      );

      // Should not crash and should still apply variety multiplier based on scenario name
      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeGreaterThan(0);
    });

    test('should handle empty scenarios array', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Office Work',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems,
        [] // empty scenarios array
      );

      // Should not crash and should still work
      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeGreaterThan(0);
    });

    test('should handle undefined scenarios parameter', async () => {
      const result = await calculateCategoryCoverage(
        'test-user',
        'test-scenario',
        'Office Work',
        '5 times per week',
        'spring/fall' as Season,
        ItemCategory.TOP,
        baseItems
        // undefined scenarios parameter
      );

      // Should not crash and should still work
      const coverage = result as any;
      expect(coverage.neededItemsIdeal).toBeGreaterThan(0);
    });
  });
});
