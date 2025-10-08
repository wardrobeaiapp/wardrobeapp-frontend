const analyzeScenarioCoverageForScore = require('../../../utils/ai/analyzeScenarioCoverageForScore');

describe('analyzeScenarioCoverageForScore', () => {
  const mockScenarioCoverage = [
    {
      scenarioName: 'Social Outings',
      category: 'tops',
      season: 'summer',
      gapType: 'expansion',
      gapCount: 2,
      coveragePercent: 75
    }
  ];

  const mockFormData = { category: 'top' };
  const mockSuitableScenarios = ['Social Outings'];
  const mockUserGoals = [];

  describe('Basic scoring without outfit data', () => {
    it('should return standard expansion score without outfit adjustments', () => {
      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null // No duplicates
        // No outfit data
      );

      expect(result.score).toBe(8); // Standard expansion score
      expect(result.gapType).toBe('expansion');
      expect(result.reason).toContain('good coverage in tops');
    });
  });

  describe('Outfit-based scoring adjustments', () => {
    it('should apply -3 penalty when no outfits are possible', () => {
      const outfitData = {
        totalOutfits: 0,
        coverageGapsWithNoOutfits: []
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.score).toBe(5); // 8 - 3 = 5
      expect(result.gapType).toBe('expansion');
    });

    it('should apply -2 penalty only when item has limited utility (few outfits + multiple gaps)', () => {
      const outfitData = {
        totalOutfits: 2, // Limited outfits (<=2)
        coverageGapsWithNoOutfits: [
          {
            category: 'tops',
            season: 'summer',
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'tops for summer for Social Outings'
          },
          {
            category: 'footwear',
            season: 'winter', 
            scenarioName: 'Office Work',
            gapType: 'critical',
            description: 'footwear for winter for Office Work'
          }
        ] // Multiple gaps (>=2)
      };

      const outfitDataWithTwoGaps = {
        totalOutfits: 2, // Limited outfits (<=2)
        coverageGapsWithNoOutfits: [
          {
            category: 'tops',
            season: 'summer', 
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'tops for summer for Social Outings'
          },
          {
            category: 'footwear',
            season: 'winter', 
            scenarioName: 'Office Work',
            gapType: 'critical',
            description: 'footwear for winter for Office Work'
          }
        ] // Multiple gaps (>=2) - triggers penalty
      };

      const outfitDataWithFiveGaps = {
        totalOutfits: 2, // Limited outfits (<=2)
        coverageGapsWithNoOutfits: new Array(5).fill({
          category: 'tops',
          season: 'summer',
          scenarioName: 'Social Outings', 
          gapType: 'expansion',
          description: 'tops for summer for Social Outings'
        }) // Multiple gaps (>=2) - triggers penalty
      };

      const resultTwoGaps = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitDataWithTwoGaps
      );

      const resultFiveGaps = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitDataWithFiveGaps
      );

      // Both should have same penalty since both meet the conditions
      expect(resultTwoGaps.score).toBe(6); // 8 - 2 = 6
      expect(resultFiveGaps.score).toBe(6); // 8 - 2 = 6 (same penalty regardless of gap count)
    });

    it('should not apply penalty when item has good utility despite coverage gaps', () => {
      const outfitData = {
        totalOutfits: 3, // Good utility (>2 outfits)
        coverageGapsWithNoOutfits: [
          {
            category: 'tops',
            season: 'summer',
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'tops for summer for Social Outings'
          }
        ] // Single gap
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      // Should not apply penalty - item has good styling utility
      expect(result.score).toBe(8); // No penalty applied
      expect(result.gapType).toBe('expansion');
    });

    it('should not apply coverage gap penalty when no outfits exist', () => {
      const outfitData = {
        totalOutfits: 0, // No outfits available
        coverageGapsWithNoOutfits: [
          {
            category: 'tops',
            season: 'summer',
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'tops for summer for Social Outings'
          }
        ]
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      // Should only apply -3 penalty for no outfits, not additional -2 for coverage gaps
      expect(result.score).toBe(5); // 8 - 3 = 5
      expect(result.gapType).toBe('expansion');
    });

    it('should apply only no outfits penalty when no outfits AND coverage gaps exist', () => {
      const outfitData = {
        totalOutfits: 0,
        coverageGapsWithNoOutfits: [
          {
            category: 'tops',
            season: 'summer',
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'tops for summer for Social Outings'
          }
        ]
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.score).toBe(5); // 8 - 3 (no outfits only, no additional coverage gap penalty) = 5
    });

    it('should not go below minimum score of 1.0', () => {
      const mockOversaturatedCoverage = [{
        ...mockScenarioCoverage[0],
        gapType: 'oversaturated' // Lower base score of 3
      }];

      const outfitData = {
        totalOutfits: 0, // -3 penalty (but no additional coverage gap penalty when totalOutfits = 0)
        coverageGapsWithNoOutfits: [{
          category: 'tops',
          season: 'summer',
          scenarioName: 'Social Outings',
          gapType: 'oversaturated',
          description: 'tops for summer for Social Outings'
        }]
      };

      const result = analyzeScenarioCoverageForScore(
        mockOversaturatedCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.score).toBe(1.0); // 3 - 3 = 0, floored to 1.0
      expect(result.gapType).toBe('oversaturated');
    });

    it('should not apply penalties when outfits are available and no coverage gaps', () => {
      const outfitData = {
        totalOutfits: 5,
        coverageGapsWithNoOutfits: []
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.score).toBe(8); // No penalties applied
    });
  });

  describe('Duplicate handling with outfit data', () => {
    it('should prioritize duplicate detection over outfit adjustments', () => {
      const duplicateAnalysis = {
        duplicate_analysis: {
          found: true,
          count: 1,
          severity: 'HIGH',
          items: ['Similar Black T-Shirt']
        }
      };

      const outfitData = {
        totalOutfits: 0, // Would normally cause penalty
        coverageGapsWithNoOutfits: []
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        duplicateAnalysis,
        outfitData
      );

      expect(result.score).toBe(2.0); // Duplicate score, not outfit-adjusted
      expect(result.gapType).toBe('duplicate');
      expect(result.reason).toContain('very similar item');
    });
  });

  describe('Final reason messaging with outfit data', () => {
    it('should add no outfits message to final reason', () => {
      const outfitData = {
        totalOutfits: 0,
        coverageGapsWithNoOutfits: []
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.reason).toContain('good coverage in tops');
      expect(result.reason).toContain("Unfortunately, you don't have the right pieces in your wardrobe to style this item.");
    });

    it('should add coverage gaps message only when penalty is applied (limited utility)', () => {
      const outfitData = {
        totalOutfits: 2, // Limited outfits (<=2)
        coverageGapsWithNoOutfits: [
          {
            category: 'tops',
            season: 'summer',
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'tops for summer for Social Outings'
          },
          {
            category: 'footwear',
            season: 'winter',
            scenarioName: 'Office Work', 
            gapType: 'critical',
            description: 'footwear for winter for Office Work'
          }
        ] // Multiple gaps (>=2) - triggers penalty
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.reason).toContain('good coverage in tops');
      expect(result.reason).toContain("However, you're missing several key pieces to style this for all occasions.");
    });

    it('should only add no outfits message when no outfits and coverage gaps both exist', () => {
      const outfitData = {
        totalOutfits: 0,
        coverageGapsWithNoOutfits: [
          {
            category: 'tops',
            season: 'summer',
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'tops for summer for Social Outings'
          }
        ]
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.reason).toContain('good coverage in tops');
      expect(result.reason).toContain("Unfortunately, you don't have the right pieces in your wardrobe to style this item.");
      // Should only show "no outfits" message, not coverage gaps message when totalOutfits = 0
      expect(result.reason).not.toContain("However, you're missing");
    });

    it('should use singular form for single coverage gap when penalty applies', () => {
      const outfitData = {
        totalOutfits: 1, // Limited outfits (<=2)
        coverageGapsWithNoOutfits: [
          {
            category: 'tops',
            season: 'summer',
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'tops for summer for Social Outings'
          },
          {
            category: 'footwear',
            season: 'winter',
            scenarioName: 'Office Work',
            gapType: 'critical',
            description: 'footwear for winter for Office Work'
          }
        ] // Multiple gaps (>=2) - triggers penalty
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.reason).toContain("However, you're missing several key pieces to style this for all occasions.");
    });

    it('should not add coverage gap message when item has good utility (like user case)', () => {
      const outfitData = {
        totalOutfits: 3, // Good utility (>2 outfits) - matches user's case
        coverageGapsWithNoOutfits: [
          {
            category: 'one_pieces',
            season: 'summer',
            scenarioName: 'Social Outings',
            gapType: 'expansion',
            description: 'one_pieces for summer for Social Outings'
          }
        ] // Single gap - doesn't meet multiple gap threshold
      };

      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null,
        outfitData
      );

      expect(result.score).toBe(8); // No penalty applied
      expect(result.reason).toContain('good coverage in tops');
      // Should not show any coverage gap message
      expect(result.reason).not.toContain("However, you're missing");
      expect(result.reason).not.toContain("Unfortunately, you don't have");
    });

    it('should not add outfit messages when no outfit data provided', () => {
      const result = analyzeScenarioCoverageForScore(
        mockScenarioCoverage,
        mockSuitableScenarios,
        mockFormData,
        mockUserGoals,
        null
        // No outfit data
      );

      expect(result.reason).toContain('good coverage in tops');
      expect(result.reason).not.toContain("Unfortunately, this item can't be styled");
      expect(result.reason).not.toContain("However,");
    });
  });
});
