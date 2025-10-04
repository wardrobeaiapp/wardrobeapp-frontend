const generateObjectiveFinalReason = require('../../../utils/ai/generateObjectiveFinalReason');

describe('generateObjectiveFinalReason', () => {
  describe('Subcategory handling', () => {
    it('should use specific subcategory from formData instead of generic category', () => {
      const relevantCoverage = [{
        subcategory: 'Bag',
        season: 'all_seasons',
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'accessory', subcategory: 'Bag' };
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        [], 
        false, 
        formData, 
        []
      );
      
      expect(result).toContain('Your bags collection');
      expect(result).not.toContain('Your accessory collection');
    });

    it('should make subcategory plural for better readability', () => {
      const relevantCoverage = [{
        subcategory: 'Hat',
        season: 'spring/fall',
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'accessory', subcategory: 'Hat' };
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        [], 
        false, 
        formData, 
        []
      );
      
      expect(result).toContain('Your hats collection');
    });

    it('should handle subcategories that already end in s', () => {
      const relevantCoverage = [{
        subcategory: 'Sunglasses',
        season: 'all_seasons',
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'accessory', subcategory: 'Sunglasses' };
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        [], 
        false, 
        formData, 
        []
      );
      
      expect(result).toContain('Your sunglasses collection');
    });
  });

  describe('Non-seasonal accessory handling', () => {
    const nonSeasonalAccessories = ['bag', 'belt', 'jewelry', 'watch', 'sunglasses'];
    
    nonSeasonalAccessories.forEach(subcategory => {
      it(`should not include season info for ${subcategory}`, () => {
        const relevantCoverage = [{
          subcategory: subcategory,
          season: 'spring/fall', // Even if coverage has season, it should be ignored
          scenarioName: 'All scenarios'
        }];
        const formData = { category: 'accessory', subcategory: subcategory };
        
        const result = generateObjectiveFinalReason(
          relevantCoverage, 
          'improvement', 
          [], 
          false, 
          formData, 
          []
        );
        
        expect(result).not.toContain('for spring/fall');
        expect(result).not.toContain('for summer');
        expect(result).not.toContain('for winter');
      });
    });

    it('should include season info for seasonal accessories like scarfs', () => {
      const relevantCoverage = [{
        subcategory: 'Scarf',
        season: 'spring/fall',
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'accessory', subcategory: 'Scarf' };
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        [], 
        false, 
        formData, 
        []
      );
      
      expect(result).toContain('for spring/fall');
    });
  });

  describe('Scenario handling', () => {
    it('should not include scenarios for "All scenarios" coverage', () => {
      const relevantCoverage = [{
        subcategory: 'Top',
        season: 'summer',
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'top', subcategory: 'T-shirt' };
      const suitableScenarios = ['Office Work', 'Social Outings'];
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        suitableScenarios, 
        false, 
        formData, 
        []
      );
      
      expect(result).not.toContain('especially for');
      expect(result).not.toContain('Office Work');
      expect(result).not.toContain('Social Outings');
    });

    it('should include scenarios for scenario-specific coverage', () => {
      const relevantCoverage = [{
        subcategory: 'Top',
        season: 'summer',
        scenarioName: 'Office Work'
      }];
      const formData = { category: 'top', subcategory: 'Dress Shirt' };
      const suitableScenarios = ['Office Work', 'Social Outings'];
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        suitableScenarios, 
        false, 
        formData, 
        []
      );
      
      expect(result).toContain('especially for Office Work and Social Outings');
    });
  });

  describe('Gap type handling', () => {
    const testCases = [
      {
        gapType: 'critical',
        expectedPhrase: 'missing essential',
        expectedAction: 'great addition to fill that gap'
      },
      {
        gapType: 'improvement',
        expectedPhrase: 'could use some variety',
        expectedAction: 'nice addition'
      },
      {
        gapType: 'expansion',
        expectedPhrase: 'good coverage',
        expectedAction: 'nice-to-have rather than essential'
      },
      {
        gapType: 'satisfied',
        expectedPhrase: 'well-stocked',
        expectedAction: 'truly unique'
      },
      {
        gapType: 'oversaturated',
        expectedPhrase: 'plenty of',
        expectedAction: null
      }
    ];

    testCases.forEach(({ gapType, expectedPhrase, expectedAction }) => {
      it(`should generate appropriate reason for ${gapType} gap`, () => {
        const relevantCoverage = [{
          subcategory: 'Top',
          season: 'summer',
          scenarioName: 'All scenarios'
        }];
        const formData = { category: 'top', subcategory: 'T-shirt' };
        
        const result = generateObjectiveFinalReason(
          relevantCoverage, 
          gapType, 
          [], 
          false, 
          formData, 
          []
        );
        
        expect(result).toContain(expectedPhrase);
        if (expectedAction) {
          expect(result).toContain(expectedAction);
        }
      });
    });

    it('should modify recommendations based on constraint goals', () => {
      const relevantCoverage = [{
        subcategory: 'Top',
        season: 'summer', 
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'top', subcategory: 'T-shirt' };
      const userGoals = ['save-money', 'declutter-downsize'];
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'expansion', 
        [], 
        true, // hasConstraintGoals 
        formData, 
        userGoals
      );
      
      expect(result).toContain('Maybe skip unless it\'s really special');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty relevantCoverage', () => {
      const result = generateObjectiveFinalReason(
        [], 
        'improvement', 
        [], 
        false, 
        { category: 'top' }, 
        []
      );
      
      expect(result).toBe('No coverage data available for analysis.');
    });

    it('should handle missing formData', () => {
      const relevantCoverage = [{
        subcategory: 'Top',
        season: 'summer',
        scenarioName: 'All scenarios'
      }];
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        [], 
        false, 
        null, // missing formData
        []
      );
      
      // When formData is missing, it falls back to coverage subcategory
      expect(result).toContain('this categorys collection');
    });

    it('should handle coverage with all_seasons season value', () => {
      const relevantCoverage = [{
        subcategory: 'Bag',
        season: 'all_seasons',
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'accessory', subcategory: 'Bag' };
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        [], 
        false, 
        formData, 
        []
      );
      
      expect(result).not.toContain('for all_seasons');
      expect(result).not.toContain('for spring/fall');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle outerwear correctly (seasonal only, no scenarios)', () => {
      const relevantCoverage = [{
        subcategory: 'Jacket', 
        season: 'spring/fall',
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'outerwear', subcategory: 'Jacket' };
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'oversaturated', 
        ['Office Work'], // Even with suitable scenarios, shouldn't include them
        false, 
        formData, 
        []
      );
      
      expect(result).toContain('plenty of outerwear for spring/fall');
      expect(result).not.toContain('Office Work');
    });

    it('should handle bags correctly (no season, no scenarios)', () => {
      const relevantCoverage = [{
        subcategory: 'Bag',
        season: 'spring/fall', // Even if coverage has season
        scenarioName: 'All scenarios'
      }];
      const formData = { category: 'accessory', subcategory: 'Bag' };
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        ['Office Work'], // Even with suitable scenarios, shouldn't include them
        false, 
        formData, 
        []
      );
      
      expect(result).toBe('Your bags collection could use some variety. This would be a nice addition!');
      expect(result).not.toContain('spring/fall');
      expect(result).not.toContain('Office Work');
    });

    it('should handle regular items correctly (both season and scenarios)', () => {
      const relevantCoverage = [{
        subcategory: 'Top',
        season: 'summer',
        scenarioName: 'Office Work'
      }];
      const formData = { category: 'top', subcategory: 'Dress Shirt' };
      const suitableScenarios = ['Office Work', 'Social Outings'];
      
      const result = generateObjectiveFinalReason(
        relevantCoverage, 
        'improvement', 
        suitableScenarios,
        false, 
        formData, 
        []
      );
      
      expect(result).toContain('tops collection could use some variety for summer, especially for Office Work and Social Outings');
    });
  });
});
