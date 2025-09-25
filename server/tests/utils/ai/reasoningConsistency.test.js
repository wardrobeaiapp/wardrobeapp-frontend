const generateObjectiveFinalReason = require('../../../utils/ai/generateObjectiveFinalReason');

describe('Reasoning Consistency Fix', () => {
  
  test('should use category-level reasoning for tops (not t-shirt subcategory)', () => {
    const relevantCoverage = [{
      scenarioName: 'Social Outings',
      season: 'spring/fall',
      category: 'top',
      currentItems: 2,
      neededItemsIdeal: 8,
      gapType: 'critical'
    }];
    
    const formData = {
      category: 'top',
      subcategory: 't-shirt'  // This should be IGNORED
    };
    
    const result = generateObjectiveFinalReason(
      relevantCoverage,
      'critical',
      ['Social Outings'],
      false,
      formData,
      []
    );
    
    // Should say "tops", not "t-shirts"
    expect(result).toContain('tops');
    expect(result).not.toContain('t-shirts');
  });

  test('should use category-level reasoning for bottoms (not jeans subcategory)', () => {
    const relevantCoverage = [{
      scenarioName: 'Office Work',
      category: 'bottom',
      currentItems: 1,
      neededItemsIdeal: 5,
      gapType: 'critical'
    }];
    
    const formData = {
      category: 'bottom',
      subcategory: 'jeans'  // This should be IGNORED
    };
    
    const result = generateObjectiveFinalReason(
      relevantCoverage,
      'critical',
      ['Office Work'],
      false,
      formData,
      []
    );
    
    // Should say "bottoms", not "jeans"
    expect(result).toContain('bottoms');
    expect(result).not.toContain('jeans');
  });

  test('should use subcategory-level reasoning for accessories (bags)', () => {
    const relevantCoverage = [{
      scenarioName: 'All scenarios',
      category: 'accessory',
      subcategory: 'Bag',
      currentItems: 1,
      neededItemsIdeal: 4,
      gapType: 'improvement'
    }];
    
    const formData = {
      category: 'accessory',
      subcategory: 'bag'  // This SHOULD be used for accessories
    };
    
    const result = generateObjectiveFinalReason(
      relevantCoverage,
      'improvement',
      [],
      false,
      formData,
      []
    );
    
    // Should say "bags" for accessories, not generic "accessories"
    expect(result).toContain('bags');
    expect(result).not.toContain('accessories');
  });

  test('should use category-level reasoning for outerwear (not jacket subcategory)', () => {
    const relevantCoverage = [{
      scenarioName: 'All scenarios',
      season: 'spring/fall',
      category: 'outerwear',
      currentItems: 5,
      neededItemsIdeal: 3,
      gapType: 'oversaturated'
    }];
    
    const formData = {
      category: 'outerwear',
      subcategory: 'jacket'  // This should be IGNORED
    };
    
    const result = generateObjectiveFinalReason(
      relevantCoverage,
      'oversaturated',
      [],
      false,
      formData,
      []
    );
    
    // Should say "outerwear", not "jackets"
    expect(result).toContain('outerwear');
    expect(result).not.toContain('jackets');
  });

  test('should pluralize category names correctly', () => {
    const testCases = [
      { category: 'top', expected: 'tops' },
      { category: 'bottom', expected: 'bottoms' },
      { category: 'one_piece', expected: 'one_pieces' }
    ];

    testCases.forEach(({ category, expected }) => {
      const relevantCoverage = [{
        scenarioName: 'Test Scenario',
        category: category,
        currentItems: 1,
        neededItemsIdeal: 3,
        gapType: 'improvement'
      }];
      
      const formData = { category: category };
      
      const result = generateObjectiveFinalReason(
        relevantCoverage,
        'improvement',
        [],
        false,
        formData,
        []
      );
      
      expect(result).toContain(expected);
    });
  });
});
