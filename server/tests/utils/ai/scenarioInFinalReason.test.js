/**
 * Scenario Names in Final Recommendations Tests
 * 
 * Tests that scenario names are properly included in final recommendations
 * for all gap types (critical, improvement, expansion, satisfied, oversaturated)
 */

const generateObjectiveFinalReason = require('../../../utils/ai/generateObjectiveFinalReason');

describe('Scenario Names in Final Recommendations', () => {
  
  describe('Expansion Gap Type (Fixed Issue)', () => {
    it('should include scenario name in expansion gap reasoning', () => {
      const relevantCoverage = [
        {
          scenarioName: 'Social Outings',
          category: 'one_piece',
          season: 'summer',
          currentItems: 4,
          coveragePercent: 80
        }
      ];

      const reason = generateObjectiveFinalReason(
        relevantCoverage,
        'expansion',
        ['Social Outings'],
        false, // no constraint goals
        { category: 'one_piece' },
        []
      );

      // Should include scenario-based messaging for one_piece items (not category-based)
      expect(reason).toContain('You have good coverage for Social Outings');
      expect(reason).toContain('in summer');
      expect(reason).toContain('nice-to-have rather than essential');
    });

    it('should include scenario name in expansion gap with constraint goals', () => {
      const relevantCoverage = [
        {
          scenarioName: 'Office Work',
          category: 'one_piece',
          season: 'spring/fall',
          currentItems: 3,
          coveragePercent: 75
        }
      ];

      const reason = generateObjectiveFinalReason(
        relevantCoverage,
        'expansion',
        ['Office Work'],
        true, // has constraint goals (saving money, decluttering, etc.)
        { category: 'one_piece' },
        []
      );

      // Should include scenario-based messaging and show constraint-aware message
      expect(reason).toContain('You have good coverage for Office Work');
      expect(reason).toContain('in spring/fall');
      expect(reason).toContain('Maybe skip unless it\'s really special?');
    });
  });

  describe('All Gap Types Include Scenarios', () => {
    const mockCoverage = [
      {
        scenarioName: 'Social Outings',
        category: 'top',
        season: 'summer',
        currentItems: 2,
      }
    ];

    it('should include scenario in critical gap reasoning', () => {
      const reason = generateObjectiveFinalReason(
        mockCoverage,
        'critical',
        ['Social Outings'],
        false,
        { category: 'top' },
        []
      );

      expect(reason).toContain('You\'re missing essential tops pieces');
      expect(reason).toContain('for summer');
      expect(reason).toContain('for Social Outings');
      expect(reason).toContain('great addition to fill that gap');
    });

    it('should include scenario in improvement gap reasoning', () => {
      const reason = generateObjectiveFinalReason(
        mockCoverage,
        'improvement',
        ['Social Outings'],
        false,
        { category: 'top' },
        []
      );

      expect(reason).toContain('Your tops collection could use some variety');
      expect(reason).toContain('for summer');
      expect(reason).toContain('especially for Social Outings');
      expect(reason).toContain('nice addition');
    });

    it('should include scenario in satisfied gap reasoning', () => {
      const reason = generateObjectiveFinalReason(
        mockCoverage,
        'satisfied',
        ['Social Outings'],
        false,
        { category: 'top' },
        []
      );

      expect(reason).toContain('You\'re well-stocked with tops');
      expect(reason).toContain('for summer');
      expect(reason).toContain('for Social Outings');
      expect(reason).toContain('truly unique');
    });

    it('should include scenario in oversaturated gap reasoning', () => {
      const reason = generateObjectiveFinalReason(
        mockCoverage,
        'oversaturated',
        ['Social Outings'],
        false,
        { category: 'top' },
        []
      );

      expect(reason).toContain('You already have plenty of tops');
      expect(reason).toContain('for summer');
      expect(reason).toContain('for Social Outings');
    });
  });

  describe('Special Cases', () => {
    it('should skip scenario name for "All scenarios" coverage', () => {
      const relevantCoverage = [
        {
          scenarioName: 'All scenarios', // Special case - should not be included
          category: 'outerwear',
          season: 'spring/fall',
          currentItems: 6,
          coveragePercent: 200
        }
      ];

      const reason = generateObjectiveFinalReason(
        relevantCoverage,
        'expansion',
        [],
        false,
        { category: 'outerwear' },
        []
      );

      // Should include season but NOT scenario name
      expect(reason).toContain('You have good coverage in outerwear');
      expect(reason).toContain('for spring/fall');
      expect(reason).not.toContain('for All scenarios'); // Should be excluded
    });

    it('should handle non-seasonal accessories correctly', () => {
      const relevantCoverage = [
        {
          scenarioName: 'Office Work',
          category: 'accessory',
          season: 'all_seasons',
          currentItems: 3,
          coveragePercent: 100
        }
      ];

      const reason = generateObjectiveFinalReason(
        relevantCoverage,
        'satisfied',
        ['Office Work'],
        false,
        { category: 'accessory', subcategory: 'bags' },
        []
      );

      // Should include scenario but NOT season for non-seasonal accessories
      expect(reason).toContain('You\'re well-stocked with bags');
      expect(reason).not.toContain('for all_seasons'); // Should be excluded
      expect(reason).toContain('for Office Work'); // Should be included
    });

    it('should handle empty coverage gracefully', () => {
      const reason = generateObjectiveFinalReason(
        [], // No coverage data
        'expansion',
        [],
        false,
        { category: 'top' },
        []
      );

      // Should not crash and provide basic reasoning
      expect(reason).toContain('No coverage data available for analysis');
    });

    it('should handle missing scenario name gracefully', () => {
      const relevantCoverage = [
        {
          // scenarioName missing
          category: 'top',
          season: 'summer',
          currentItems: 2,
          coveragePercent: 40
        }
      ];

      const reason = generateObjectiveFinalReason(
        relevantCoverage,
        'expansion',
        [],
        false,
        { category: 'top' },
        []
      );

      // Should not crash
      expect(reason).toBeDefined();
      expect(reason).toContain('You have good coverage in tops');
      expect(reason).toContain('for summer');
    });
  });

  describe('Constraint Goals Impact', () => {
    const mockCoverage = [
      {
        scenarioName: 'Social Outings',
        category: 'one_piece',
        season: 'summer',
        currentItems: 4,
        coveragePercent: 80
      }
    ];

    it('should show different messages for users with constraint goals', () => {
      const reasonWithGoals = generateObjectiveFinalReason(
        mockCoverage,
        'expansion',
        ['Social Outings'],
        true, // has constraint goals
        { category: 'one_piece' },
        ['save-money', 'declutter']
      );

      const reasonWithoutGoals = generateObjectiveFinalReason(
        mockCoverage,
        'expansion',
        ['Social Outings'],
        false, // no constraint goals
        { category: 'one_piece' },
        []
      );

      // Both should include scenario
      expect(reasonWithGoals).toContain('for Social Outings');
      expect(reasonWithoutGoals).toContain('for Social Outings');

      // But different recommendations
      expect(reasonWithGoals).toContain('Maybe skip unless it\'s really special?');
      expect(reasonWithoutGoals).toContain('nice-to-have rather than essential');
    });
  });
});
