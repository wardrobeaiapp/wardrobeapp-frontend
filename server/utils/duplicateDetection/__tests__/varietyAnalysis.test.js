const {
  shouldSkipVarietyAnalysis,
  calculateVarietyScoreModifier,
} = require('../../duplicateDetectionUtils');
const { formatVarietyMessage } = require('../../ai/analyzeScenarioCoverageForScore');

describe('Variety Analysis', () => {
  describe('shouldSkipVarietyAnalysis', () => {
    test('should skip for critical gap', () => {
      expect(shouldSkipVarietyAnalysis('critical')).toBe(true);
    });

    test('should skip for improvement gap', () => {
      expect(shouldSkipVarietyAnalysis('improvement')).toBe(true);
    });

    test('should NOT skip for expansion gap', () => {
      expect(shouldSkipVarietyAnalysis('expansion')).toBe(false);
    });

    test('should skip for satisfied gap', () => {
      expect(shouldSkipVarietyAnalysis('satisfied')).toBe(true);
    });

    test('should skip for oversaturated gap', () => {
      expect(shouldSkipVarietyAnalysis('oversaturated')).toBe(true);
    });

    test('should skip for null gap type', () => {
      expect(shouldSkipVarietyAnalysis(null)).toBe(true);
    });

    test('should skip for undefined gap type', () => {
      expect(shouldSkipVarietyAnalysis(undefined)).toBe(true);
    });
  });

  describe('calculateVarietyScoreModifier', () => {
    const mockExistingItems = [
      {
        category: 'top',
        seasons: ['spring'],
        style: 'casual',
        silhouette: 'regular',
        color: 'black'
      },
      {
        category: 'top',
        seasons: ['spring'],
        style: 'casual',
        silhouette: 'regular',
        color: 'white'
      },
      {
        category: 'top',
        seasons: ['spring'],
        style: 'casual',
        silhouette: 'oversize',
        color: 'gray'
      }
    ];

    test('should skip variety analysis for critical gap', () => {
      const newItem = {
        category: 'top',
        seasons: ['spring'],
        style: 'elegant',
        silhouette: 'fitted',
        color: 'red'
      };

      const result = calculateVarietyScoreModifier(newItem, mockExistingItems, 'critical');
      
      expect(result.impact).toBe('SKIPPED');
      expect(result.modifier).toBe(0);
      expect(result.skipped_reason).toBe('Gap type "critical" doesn\'t require variety analysis');
    });

    test('should run variety analysis for expansion gap', () => {
      const newItem = {
        category: 'top',
        seasons: ['spring'],
        style: 'elegant', // NEW
        silhouette: 'fitted', // NEW
        color: 'red' // NEW
      };

      const result = calculateVarietyScoreModifier(newItem, mockExistingItems, 'expansion');
      
      expect(result.impact).toBe('ENRICHES');
      expect(result.modifier).toBe(2); // Major variety boost (3 new dimensions)
      expect(result.variety_boosts).toEqual(['NEW_STYLE', 'NEW_SILHOUETTE', 'NEW_COLOR']);
      expect(result.reasoning).toContain('MAJOR_VARIETY: Adds new style + silhouette + color');
    });

    test('should give +1 for 2 new variety dimensions', () => {
      const newItem = {
        category: 'top',
        seasons: ['spring'],
        style: 'elegant', // NEW
        silhouette: 'fitted', // NEW  
        color: 'black' // EXISTING
      };

      const result = calculateVarietyScoreModifier(newItem, mockExistingItems, 'expansion');
      
      expect(result.modifier).toBe(1);
      expect(result.variety_boosts).toEqual(['NEW_STYLE', 'NEW_SILHOUETTE']);
      expect(result.reasoning).toContain('GOOD_VARIETY: Adds new_style + new_silhouette');
    });

    test('should give +1 for 1 new variety dimension', () => {
      const newItem = {
        category: 'top',
        seasons: ['spring'],
        style: 'elegant', // NEW
        silhouette: 'regular', // EXISTING
        color: 'black' // EXISTING
      };

      const result = calculateVarietyScoreModifier(newItem, mockExistingItems, 'expansion');
      
      expect(result.modifier).toBe(1);
      expect(result.variety_boosts).toEqual(['NEW_STYLE']);
      expect(result.reasoning).toContain('MINOR_VARIETY: Adds new_style');
    });

    test('should detect style dominance monotony', () => {
      const manyItems = Array(10).fill().map(() => ({
        category: 'top',
        seasons: ['spring'],
        style: 'casual',
        silhouette: 'regular',
        color: 'black'
      }));

      const newItem = {
        category: 'top',
        seasons: ['spring'],
        style: 'casual', // Would make 91% casual
        silhouette: 'fitted', // NEW
        color: 'red' // NEW
      };

      const result = calculateVarietyScoreModifier(newItem, manyItems, 'expansion');
      
      // Should still get +1 for new dimensions but not penalize for dominance yet
      expect(result.modifier).toBe(1); 
      expect(result.monotony_warnings).toContain('STYLE_DOMINANCE');
    });

    test('should handle items without seasons', () => {
      const newItem = {
        category: 'accessory',
        style: 'elegant',
        color: 'gold'
      };

      const existingAccessories = [
        { category: 'accessory', style: 'casual', color: 'silver' }
      ];

      const result = calculateVarietyScoreModifier(newItem, existingAccessories, 'expansion');
      
      expect(result.modifier).toBe(1);
      expect(result.variety_boosts).toContain('NEW_STYLE');
      expect(result.variety_boosts).toContain('NEW_COLOR');
    });

    test('should give -1 modifier when no new variety added and creates dominance', () => {
      // Adding another casual regular black top to existing casual items
      const newItem = {
        category: 'top',
        seasons: ['spring'],
        style: 'casual', // EXISTING - would be 3/4 = 75% casual (>70% threshold)
        silhouette: 'regular', // EXISTING  
        color: 'black' // EXISTING
      };

      const result = calculateVarietyScoreModifier(newItem, mockExistingItems, 'expansion');
      
      expect(result.modifier).toBe(-1); // Penalized for style dominance
      expect(result.impact).toBe('MONOTONOUS');
      expect(result.variety_boosts).toEqual([]);
      expect(result.monotony_warnings).toContain('STYLE_DOMINANCE');
    });

    test('should give 0 modifier when no new variety but no dominance', () => {
      // Add item that matches existing but doesn't create dominance
      const diverseItems = [
        { category: 'top', seasons: ['spring'], style: 'casual', silhouette: 'regular', color: 'black' },
        { category: 'top', seasons: ['spring'], style: 'elegant', silhouette: 'fitted', color: 'white' },
        { category: 'top', seasons: ['spring'], style: 'sporty', silhouette: 'oversize', color: 'gray' },
        { category: 'top', seasons: ['spring'], style: 'boho', silhouette: 'loose', color: 'blue' },
      ];

      const newItem = {
        category: 'top',
        seasons: ['spring'],
        style: 'casual', // Would be 2/5 = 40% (below 70% threshold)
        silhouette: 'regular',
        color: 'black'
      };

      const result = calculateVarietyScoreModifier(newItem, diverseItems, 'expansion');
      
      expect(result.modifier).toBe(0);
      expect(result.impact).toBe('NEUTRAL');
      expect(result.variety_boosts).toEqual([]);
    });
  });

  describe('formatVarietyMessage', () => {
    test('should return empty string for neutral impact', () => {
      const varietyModifier = {
        impact: 'NEUTRAL',
        modifier: 0,
        variety_boosts: []
      };

      const result = formatVarietyMessage(varietyModifier);
      expect(result).toBe('');
    });

    test('should return empty string for skipped analysis', () => {
      const varietyModifier = {
        impact: 'SKIPPED',
        modifier: 0
      };

      const result = formatVarietyMessage(varietyModifier);
      expect(result).toBe('');
    });

    test('should format single variety boost', () => {
      const varietyModifier = {
        impact: 'ENRICHES',
        modifier: 1,
        variety_boosts: ['NEW_COLOR']
      };

      const result = formatVarietyMessage(varietyModifier);
      expect(result).toBe(' This piece would expand your styling options by adding a new color.');
    });

    test('should format two variety boosts', () => {
      const varietyModifier = {
        impact: 'ENRICHES',
        modifier: 1,
        variety_boosts: ['NEW_STYLE', 'NEW_COLOR']
      };

      const result = formatVarietyMessage(varietyModifier);
      expect(result).toBe(' This piece would expand your styling options by adding new style and color.');
    });

    test('should format three variety boosts', () => {
      const varietyModifier = {
        impact: 'ENRICHES',
        modifier: 2,
        variety_boosts: ['NEW_STYLE', 'NEW_SILHOUETTE', 'NEW_COLOR']
      };

      const result = formatVarietyMessage(varietyModifier);
      expect(result).toBe(' This piece would expand your styling options with new style, silhouette and color.');
    });

    test('should format negative variety impact', () => {
      const varietyModifier = {
        impact: 'MONOTONOUS',
        modifier: -1,
        monotony_warnings: ['STYLE_DOMINANCE']
      };

      const result = formatVarietyMessage(varietyModifier);
      expect(result).toBe(', but this would limit your styling variety as you already have many similar pieces.');
    });

    test('should handle null varietyModifier', () => {
      const result = formatVarietyMessage(null);
      expect(result).toBe('');
    });

    test('should handle undefined varietyModifier', () => {
      const result = formatVarietyMessage(undefined);
      expect(result).toBe('');
    });
  });
});
