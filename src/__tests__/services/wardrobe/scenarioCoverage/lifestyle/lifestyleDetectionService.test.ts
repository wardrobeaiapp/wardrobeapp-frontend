import { 
  detectLifestyleType,
  getOuterwearTargets,
  LifestyleAnalysis,
  LifestyleType,
  SEASONAL_OUTERWEAR_TARGETS
} from '../../../../../services/wardrobe/scenarioCoverage/lifestyle/lifestyleDetectionService';
import { Scenario } from '../../../../../types';

/**
 * Test data for indoor-focused scenarios
 */
const createTestScenario = (id: string, name: string, frequency: string = '5 times per week'): Scenario => ({
  id,
  user_id: 'test-user',
  name,
  frequency,
  description: `Test scenario: ${name}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

describe('lifestyleDetectionService - Indoor-Focused Detection', () => {
  describe('detectLifestyleType() - Indoor-Focused Cases', () => {
    
    describe('Remote Work Detection', () => {
      test('should detect indoor_focused for "Remote Work" scenario', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Remote Work', '5 times per week'),
          createTestScenario('2', 'Social Outings', '1 times per month')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors).toHaveLength(1);
        expect(result.factors[0]).toContain('Works from home');
        expect(result.factors[0]).toContain('minimal outerwear needs');
      });

      test('should detect indoor_focused for "remote work" (case insensitive)', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'remote work', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('Works from home');
      });

      test('should detect indoor_focused for "Remote Work" mixed with other indoor activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Remote Work', '5 times per week'),
          createTestScenario('2', 'Staying at Home', '7 times per week'),
          createTestScenario('3', 'Social Outings', '1 times per month')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors).toHaveLength(1);
        expect(result.factors[0]).toContain('Works from home');
      });

      test('should prioritize Remote Work over other activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Remote Work', '3 times per week'),
          createTestScenario('2', 'Office Work', '2 times per week'), // This would normally make it outdoor
          createTestScenario('3', 'Driving Kids to School', '5 times per week') // This would also make it outdoor
        ];

        const result = detectLifestyleType(scenarios);

        // Remote work should take priority and make it indoor_focused
        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('Works from home');
      });
    });

    describe('Housekeeping Without Outdoor Activities Detection', () => {
      test('should detect indoor_focused for "Staying at Home" without outdoor activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Staying at Home', '7 times per week'),
          // NO other scenarios - truly no outdoor activities
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors).toHaveLength(1);
        expect(result.factors[0]).toContain('Home-focused lifestyle');
        expect(result.factors[0]).toContain('without outdoor activities');
        expect(result.factors[0]).toContain('minimal outerwear needs');
      });

      test('should detect indoor_focused for "housekeeping" without outdoor activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Housekeeping', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('Home-focused lifestyle');
      });

      test('should detect indoor_focused for mixed housekeeping scenarios without outdoor activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Staying at Home', '5 times per week'),
          createTestScenario('2', 'Housekeeping', '3 times per week'),
          // NO outdoor activities like driving, playground, school, outdoor activities, or social outings
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('Home-focused lifestyle');
      });
    });

    describe('Indoor Detection Should NOT Trigger', () => {
      test('should NOT detect indoor_focused when housekeeping WITH driving activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Staying at Home', '5 times per week'),
          createTestScenario('2', 'Driving Kids to School', '5 times per week') // This makes it outdoor
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).not.toContain('Home-focused lifestyle');
      });

      test('should NOT detect indoor_focused when housekeeping WITH playground activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Staying at Home', '7 times per week'),
          createTestScenario('2', 'Playground Activities with Kids', '3 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
      });

      test('should NOT detect indoor_focused when housekeeping WITH school activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Staying at Home', '7 times per week'),
          createTestScenario('2', 'Attending Events at Kids School', '2 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
      });

      test('should NOT detect indoor_focused when housekeeping WITH outdoor activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Staying at Home', '7 times per week'),
          createTestScenario('2', 'Light Outdoor Activities', '2 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
      });

      test('should NOT detect indoor_focused when housekeeping WITH social outings (frequent)', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Staying at Home', '5 times per week'),
          createTestScenario('2', 'Social Outings', '4 times per week') // Frequent social outings = outdoor activity
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
      });
    });

    describe('Edge Cases for Indoor Detection', () => {
      test('should handle empty scenario names gracefully', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', '', '5 times per week'),
          createTestScenario('2', 'Remote Work', '3 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('Works from home');
      });

      test('should handle undefined scenario names gracefully', () => {
        const scenarios: Scenario[] = [
          { 
            ...createTestScenario('1', 'Some Valid Scenario', '2 times per week'),
            name: undefined as any
          },
          createTestScenario('2', 'Remote Work', '5 times per week') // This should still work
        ];

        const result = detectLifestyleType(scenarios);

        // Should still detect indoor_focused because of the valid "Remote Work" scenario
        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('Works from home');
      });

      test('should be case-insensitive for scenario name detection', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'REMOTE WORK', '5 times per week'),
          createTestScenario('2', 'staying at home', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('Works from home');
      });

      test('should handle partial matches in scenario names', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Working from Home - Remote Work Setup', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('indoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('Works from home');
      });
    });

    describe('Return Type and Structure Validation', () => {
      test('should return proper LifestyleAnalysis interface for indoor detection', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Remote Work', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        // Type structure validation
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('factors');
        
        // Type validation
        expect(typeof result.type).toBe('string');
        expect(typeof result.confidence).toBe('number');
        expect(Array.isArray(result.factors)).toBe(true);
        
        // Value validation
        expect(['indoor_focused', 'outdoor_focused']).toContain(result.type);
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        expect(result.factors.length).toBeGreaterThan(0);
      });

      test('should return exactly 0.9 confidence for indoor detection', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Remote Work', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.confidence).toBe(0.9);
      });

      test('should return exactly one factor for indoor detection', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Remote Work', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.factors).toHaveLength(1);
        expect(typeof result.factors[0]).toBe('string');
        expect(result.factors[0].length).toBeGreaterThan(0);
      });
    });
  });

  describe('detectLifestyleType() - Outdoor-Focused Cases', () => {
    
    describe('Office Work Detection', () => {
      test('should detect outdoor_focused for "Office Work" scenario', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Office Work', '5 times per week'),
          // NOT including "Staying at Home" to avoid triggering housekeeping logic
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors).toHaveLength(1);
        expect(result.factors[0]).toContain('office commute');
        expect(result.factors[0]).toContain('needs outerwear variety');
      });

      test('should detect outdoor_focused for "office work" (case insensitive)', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'office work', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('office commute');
      });

      test('should detect outdoor_focused for mixed office work scenarios', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Office Work', '3 times per week'),
          createTestScenario('2', 'Staying at Home', '4 times per week'),
          createTestScenario('3', 'Social Outings', '1 times per month')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('office commute');
      });
    });

    describe('Driving Activities Detection', () => {
      test('should detect outdoor_focused for "Driving Kids to School"', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Driving Kids to School', '5 times per week'),
          createTestScenario('2', 'Staying at Home', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('driving kids around');
        expect(result.factors[0]).toContain('needs outerwear variety');
      });

      test('should detect outdoor_focused for any driving activity', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Driving to grocery store', '3 times per week'),
          createTestScenario('2', 'Housekeeping', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('driving kids around');
      });

      test('should detect outdoor_focused for multiple driving scenarios', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Driving Kids to School', '5 times per week'),
          createTestScenario('2', 'Driving to activities', '3 times per week'),
          createTestScenario('3', 'Staying at Home', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('driving kids around');
      });
    });

    describe('Playground Activities Detection', () => {
      test('should detect outdoor_focused for "Playground Activities with Kids"', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Playground Activities with Kids', '3 times per week'),
          createTestScenario('2', 'Staying at Home', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('playground activities');
        expect(result.factors[0]).toContain('needs outerwear variety');
      });

      test('should detect outdoor_focused for any playground activity', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Going to playground', '2 times per week'),
          createTestScenario('2', 'Housekeeping', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('playground activities');
      });
    });

    describe('School Activities Detection', () => {
      test('should detect outdoor_focused for "Attending Events at Kids School"', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Attending Events at Kids School', '2 times per week'),
          createTestScenario('2', 'Staying at Home', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('regular outdoor activities');
        expect(result.factors[0]).toContain('needs outerwear variety');
      });

      test('should detect outdoor_focused for any school activity', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'School pickup and events', '3 times per week'),
          createTestScenario('2', 'Housekeeping', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('regular outdoor activities');
      });
    });

    describe('Outdoor Activities Detection', () => {
      test('should detect outdoor_focused for "Light Outdoor Activities"', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Light Outdoor Activities', '3 times per week'),
          createTestScenario('2', 'Staying at Home', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('regular outdoor activities');
        expect(result.factors[0]).toContain('needs outerwear variety');
      });

      test('should detect outdoor_focused for "Outdoor Activities"', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Outdoor Activities', '2 times per week'),
          createTestScenario('2', 'Housekeeping', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('regular outdoor activities');
      });
    });

    describe('Social Outings Detection', () => {
      test('should detect outdoor_focused for frequent "Social Outings"', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Social Outings', '4 times per week'),
          createTestScenario('2', 'Staying at Home', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('regular outdoor activities');
        expect(result.factors[0]).toContain('needs outerwear variety');
      });

      test('should detect outdoor_focused for "social outings" (case insensitive)', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'social outings', '3 times per week'),
          createTestScenario('2', 'Housekeeping', '7 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('regular outdoor activities');
      });
    });

    describe('Multiple Outdoor Factors Detection', () => {
      test('should detect outdoor_focused with multiple outdoor reasons', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Office Work', '5 times per week'),
          createTestScenario('2', 'Driving Kids to School', '5 times per week'),
          createTestScenario('3', 'Light Outdoor Activities', '2 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors).toHaveLength(1);
        // Should contain multiple reasons
        expect(result.factors[0]).toContain('office commute');
        expect(result.factors[0]).toContain('driving kids around');
        expect(result.factors[0]).toContain('regular outdoor activities');
      });

      test('should list all outdoor factors in single string', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Office Work', '5 times per week'),
          createTestScenario('2', 'Playground Activities with Kids', '2 times per week'),
          createTestScenario('3', 'Social Outings', '3 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors).toHaveLength(1);
        expect(result.factors[0]).toContain('Outdoor lifestyle:');
        expect(result.factors[0]).toContain('office commute, playground activities, regular outdoor activities');
      });
    });

    describe('Default Fallback Detection', () => {
      test('should default to outdoor_focused for unclear activities', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Random Activity', '3 times per week'),
          createTestScenario('2', 'Some Other Thing', '2 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors).toHaveLength(1);
        expect(result.factors[0]).toContain('Mixed or unclear activities');
        expect(result.factors[0]).toContain('defaulting to outdoor lifestyle for safety');
      });

      test('should default to outdoor_focused when no matching patterns', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Cooking', '7 times per week'),
          createTestScenario('2', 'Reading Books', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('defaulting to outdoor lifestyle for safety');
      });

      test('should default to outdoor_focused for empty scenario list', () => {
        const scenarios: Scenario[] = [];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.5);  // Lower confidence for no data
        expect(result.factors).toHaveLength(1);
        expect(result.factors[0]).toContain('No scenarios available');
        expect(result.factors[0]).toContain('defaulting to outdoor lifestyle for safety');
      });
    });

    describe('Edge Cases for Outdoor Detection', () => {
      test('should handle partial matches in outdoor activity names', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Daily office work commute', '5 times per week') // Contains "office work" as substring
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('office commute');
      });

      test('should be case-insensitive for all outdoor detection patterns', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'OFFICE WORK', '3 times per week'),
          createTestScenario('2', 'driving kids around', '2 times per week'),
          createTestScenario('3', 'PLAYGROUND activities', '1 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.9);
        expect(result.factors[0]).toContain('office commute');
        expect(result.factors[0]).toContain('driving kids around');
        expect(result.factors[0]).toContain('playground activities');
      });

      test('should handle null scenarios gracefully', () => {
        const result = detectLifestyleType(null as any);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.5);
        expect(result.factors[0]).toContain('No scenarios available');
      });

      test('should handle undefined scenarios gracefully', () => {
        const result = detectLifestyleType(undefined as any);

        expect(result.type).toBe('outdoor_focused');
        expect(result.confidence).toBe(0.5);
        expect(result.factors[0]).toContain('No scenarios available');
      });
    });

    describe('Return Type and Structure Validation for Outdoor', () => {
      test('should return proper LifestyleAnalysis interface for outdoor detection', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Office Work', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        // Type structure validation
        expect(result).toHaveProperty('type');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('factors');
        
        // Type validation
        expect(typeof result.type).toBe('string');
        expect(typeof result.confidence).toBe('number');
        expect(Array.isArray(result.factors)).toBe(true);
        
        // Value validation
        expect(['indoor_focused', 'outdoor_focused']).toContain(result.type);
        expect(result.confidence).toBeGreaterThan(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
        expect(result.factors.length).toBeGreaterThan(0);
      });

      test('should return exactly 0.9 confidence for outdoor detection with data', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Office Work', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.confidence).toBe(0.9);
      });

      test('should return 0.5 confidence for outdoor detection without data', () => {
        const scenarios: Scenario[] = [];

        const result = detectLifestyleType(scenarios);

        expect(result.confidence).toBe(0.5);
      });

      test('should return exactly one factor for outdoor detection', () => {
        const scenarios: Scenario[] = [
          createTestScenario('1', 'Office Work', '5 times per week')
        ];

        const result = detectLifestyleType(scenarios);

        expect(result.factors).toHaveLength(1);
        expect(typeof result.factors[0]).toBe('string');
        expect(result.factors[0].length).toBeGreaterThan(0);
      });
    });
  });

  describe('getOuterwearTargets() - Seasonal Variations', () => {
    
    describe('Summer Season Targets', () => {
      test('should return correct indoor_focused summer targets', () => {
        const result = getOuterwearTargets('summer', 'indoor_focused');
        
        // Expected: base summer targets (1/2/3) × 0.7 = 0.7/1.4/2.1 → floor to 1/1/2 with minimums
        expect(result.min).toBe(1);  // max(1, floor(1 × 0.7)) = max(1, 0) = 1
        expect(result.ideal).toBe(1); // max(1, floor(2 × 0.7)) = max(1, 1) = 1  
        expect(result.max).toBe(2);   // max(2, floor(3 × 0.7)) = max(2, 2) = 2
        
        // Check it's a proper progression
        expect(result.min).toBeLessThanOrEqual(result.ideal);
        expect(result.ideal).toBeLessThanOrEqual(result.max);
      });

      test('should return correct outdoor_focused summer targets', () => {
        const result = getOuterwearTargets('summer', 'outdoor_focused');
        
        // Expected: full base summer targets (no reduction)
        expect(result.min).toBe(1);
        expect(result.ideal).toBe(2);
        expect(result.max).toBe(3);
        
        // Check it's a proper progression
        expect(result.min).toBeLessThanOrEqual(result.ideal);
        expect(result.ideal).toBeLessThanOrEqual(result.max);
      });

      test('should apply 0.7x lifestyle adjustment correctly for indoor summer', () => {
        const indoorResult = getOuterwearTargets('summer', 'indoor_focused');
        const outdoorResult = getOuterwearTargets('summer', 'outdoor_focused');
        
        // Indoor should have equal or lower targets than outdoor
        expect(indoorResult.min).toBeLessThanOrEqual(outdoorResult.min);
        expect(indoorResult.ideal).toBeLessThanOrEqual(outdoorResult.ideal);
        expect(indoorResult.max).toBeLessThanOrEqual(outdoorResult.max);
      });
    });

    describe('Winter Season Targets', () => {
      test('should return correct indoor_focused winter targets', () => {
        const result = getOuterwearTargets('winter', 'indoor_focused');
        
        // Expected: base winter targets (2/3/4) × 0.7 = 1.4/2.1/2.8 → floor to 1/2/2 with minimums
        expect(result.min).toBe(1);  // max(1, floor(2 × 0.7)) = max(1, 1) = 1
        expect(result.ideal).toBe(2); // max(1, floor(3 × 0.7)) = max(1, 2) = 2
        expect(result.max).toBe(2);   // max(2, floor(4 × 0.7)) = max(2, 2) = 2
        
        // Check it's a proper progression
        expect(result.min).toBeLessThanOrEqual(result.ideal);
        expect(result.ideal).toBeLessThanOrEqual(result.max);
      });

      test('should return correct outdoor_focused winter targets', () => {
        const result = getOuterwearTargets('winter', 'outdoor_focused');
        
        // Expected: full base winter targets (no reduction)
        expect(result.min).toBe(2);
        expect(result.ideal).toBe(3);
        expect(result.max).toBe(4);
        
        // Check it's a proper progression
        expect(result.min).toBeLessThanOrEqual(result.ideal);
        expect(result.ideal).toBeLessThanOrEqual(result.max);
      });

      test('should apply 0.7x lifestyle adjustment correctly for indoor winter', () => {
        const indoorResult = getOuterwearTargets('winter', 'indoor_focused');
        const outdoorResult = getOuterwearTargets('winter', 'outdoor_focused');
        
        // Indoor should have equal or lower targets than outdoor
        expect(indoorResult.min).toBeLessThanOrEqual(outdoorResult.min);
        expect(indoorResult.ideal).toBeLessThanOrEqual(outdoorResult.ideal);
        expect(indoorResult.max).toBeLessThanOrEqual(outdoorResult.max);
      });
    });

    describe('Spring/Fall Season Targets', () => {
      test('should return correct indoor_focused spring/fall targets', () => {
        const result = getOuterwearTargets('spring/fall', 'indoor_focused');
        
        // Expected: base spring/fall targets (3/4/5) × 0.7 = 2.1/2.8/3.5 → floor to 2/2/3 with minimums
        expect(result.min).toBe(2);  // max(1, floor(3 × 0.7)) = max(1, 2) = 2
        expect(result.ideal).toBe(2); // max(1, floor(4 × 0.7)) = max(1, 2) = 2
        expect(result.max).toBe(3);   // max(2, floor(5 × 0.7)) = max(2, 3) = 3
        
        // Check it's a proper progression
        expect(result.min).toBeLessThanOrEqual(result.ideal);
        expect(result.ideal).toBeLessThanOrEqual(result.max);
      });

      test('should return correct outdoor_focused spring/fall targets', () => {
        const result = getOuterwearTargets('spring/fall', 'outdoor_focused');
        
        // Expected: full base spring/fall targets (no reduction)
        expect(result.min).toBe(3);
        expect(result.ideal).toBe(4);
        expect(result.max).toBe(5);
        
        // Check it's a proper progression
        expect(result.min).toBeLessThanOrEqual(result.ideal);
        expect(result.ideal).toBeLessThanOrEqual(result.max);
      });

      test('should apply 0.7x lifestyle adjustment correctly for indoor spring/fall', () => {
        const indoorResult = getOuterwearTargets('spring/fall', 'indoor_focused');
        const outdoorResult = getOuterwearTargets('spring/fall', 'outdoor_focused');
        
        // Indoor should have equal or lower targets than outdoor
        expect(indoorResult.min).toBeLessThanOrEqual(outdoorResult.min);
        expect(indoorResult.ideal).toBeLessThanOrEqual(outdoorResult.ideal);
        expect(indoorResult.max).toBeLessThanOrEqual(outdoorResult.max);
      });

      test('should handle spring/fall as the highest-need season', () => {
        const springFallIndoor = getOuterwearTargets('spring/fall', 'indoor_focused');
        const winterIndoor = getOuterwearTargets('winter', 'indoor_focused');
        const summerIndoor = getOuterwearTargets('summer', 'indoor_focused');
        
        // Spring/fall should generally have highest or equal targets (most variety needed)
        expect(springFallIndoor.ideal).toBeGreaterThanOrEqual(winterIndoor.ideal);
        expect(springFallIndoor.ideal).toBeGreaterThanOrEqual(summerIndoor.ideal);
      });
    });

    describe('Invalid/Default Season Handling', () => {
      test('should use default targets for invalid season', () => {
        const result = getOuterwearTargets('invalid_season', 'outdoor_focused');
        
        // Should use 'default' seasonal targets (2/3/4)
        expect(result.min).toBe(2);
        expect(result.ideal).toBe(3);
        expect(result.max).toBe(4);
      });

      test('should use default targets with indoor adjustment for invalid season', () => {
        const result = getOuterwearTargets('invalid_season', 'indoor_focused');
        
        // Expected: default targets (2/3/4) × 0.7 = 1.4/2.1/2.8 → floor to 1/2/2 with minimums
        expect(result.min).toBe(1);  // max(1, floor(2 × 0.7)) = max(1, 1) = 1
        expect(result.ideal).toBe(2); // max(1, floor(3 × 0.7)) = max(1, 2) = 2
        expect(result.max).toBe(2);   // max(2, floor(4 × 0.7)) = max(2, 2) = 2
      });

      test('should handle empty string season gracefully', () => {
        const result = getOuterwearTargets('', 'outdoor_focused');
        
        // Should use default targets
        expect(result.min).toBe(2);
        expect(result.ideal).toBe(3);
        expect(result.max).toBe(4);
      });

      test('should handle null/undefined season gracefully', () => {
        const result1 = getOuterwearTargets(null as any, 'outdoor_focused');
        const result2 = getOuterwearTargets(undefined as any, 'indoor_focused');
        
        // Both should use default targets
        expect(result1.min).toBe(2);
        expect(result1.ideal).toBe(3);
        expect(result1.max).toBe(4);
        
        expect(result2.min).toBe(1);
        expect(result2.ideal).toBe(2);
        expect(result2.max).toBe(2);
      });
    });

    describe('Lifestyle Multiplier Edge Cases', () => {
      test('should enforce minimum values for indoor lifestyle', () => {
        // Test all seasons to ensure minimums are enforced
        const seasons = ['summer', 'winter', 'spring/fall'];
        
        seasons.forEach(season => {
          const result = getOuterwearTargets(season, 'indoor_focused');
          
          // Should never go below absolute minimums
          expect(result.min).toBeGreaterThanOrEqual(1);
          expect(result.ideal).toBeGreaterThanOrEqual(1);
          expect(result.max).toBeGreaterThanOrEqual(2);
        });
      });

      test('should maintain logical progression after adjustments', () => {
        const seasons = ['summer', 'winter', 'spring/fall'];
        const lifestyles: LifestyleType[] = ['indoor_focused', 'outdoor_focused'];
        
        seasons.forEach(season => {
          lifestyles.forEach(lifestyle => {
            const result = getOuterwearTargets(season, lifestyle);
            
            // Should always maintain min ≤ ideal ≤ max
            expect(result.min).toBeLessThanOrEqual(result.ideal);
            expect(result.ideal).toBeLessThanOrEqual(result.max);
            
            // Should be positive numbers
            expect(result.min).toBeGreaterThan(0);
            expect(result.ideal).toBeGreaterThan(0);
            expect(result.max).toBeGreaterThan(0);
          });
        });
      });

      test('should return integer values only', () => {
        const seasons = ['summer', 'winter', 'spring/fall'];
        const lifestyles: LifestyleType[] = ['indoor_focused', 'outdoor_focused'];
        
        seasons.forEach(season => {
          lifestyles.forEach(lifestyle => {
            const result = getOuterwearTargets(season, lifestyle);
            
            // Should all be integers (no decimals)
            expect(Number.isInteger(result.min)).toBe(true);
            expect(Number.isInteger(result.ideal)).toBe(true);
            expect(Number.isInteger(result.max)).toBe(true);
          });
        });
      });
    });

    describe('Constants Validation', () => {
      test('SEASONAL_OUTERWEAR_TARGETS should have all required seasons', () => {
        expect(SEASONAL_OUTERWEAR_TARGETS).toHaveProperty('summer');
        expect(SEASONAL_OUTERWEAR_TARGETS).toHaveProperty('winter');
        expect(SEASONAL_OUTERWEAR_TARGETS).toHaveProperty('spring/fall');
        expect(SEASONAL_OUTERWEAR_TARGETS).toHaveProperty('default');
      });

      test('SEASONAL_OUTERWEAR_TARGETS should have proper structure', () => {
        const seasons = ['summer', 'winter', 'spring/fall', 'default'];
        
        seasons.forEach(season => {
          const target = SEASONAL_OUTERWEAR_TARGETS[season as keyof typeof SEASONAL_OUTERWEAR_TARGETS];
          
          expect(target).toHaveProperty('min');
          expect(target).toHaveProperty('ideal');
          expect(target).toHaveProperty('max');
          
          // Should be positive integers
          expect(Number.isInteger(target.min)).toBe(true);
          expect(Number.isInteger(target.ideal)).toBe(true);
          expect(Number.isInteger(target.max)).toBe(true);
          
          expect(target.min).toBeGreaterThan(0);
          expect(target.ideal).toBeGreaterThan(0);
          expect(target.max).toBeGreaterThan(0);
          
          // Should maintain progression
          expect(target.min).toBeLessThanOrEqual(target.ideal);
          expect(target.ideal).toBeLessThanOrEqual(target.max);
        });
      });

      test('should have realistic seasonal target values', () => {
        // Summer should have lowest targets (light layering needs)
        expect(SEASONAL_OUTERWEAR_TARGETS.summer.ideal).toBeLessThanOrEqual(
          SEASONAL_OUTERWEAR_TARGETS.winter.ideal
        );
        expect(SEASONAL_OUTERWEAR_TARGETS.summer.ideal).toBeLessThanOrEqual(
          SEASONAL_OUTERWEAR_TARGETS['spring/fall'].ideal
        );
        
        // Spring/fall should have highest targets (most variable weather)
        expect(SEASONAL_OUTERWEAR_TARGETS['spring/fall'].ideal).toBeGreaterThanOrEqual(
          SEASONAL_OUTERWEAR_TARGETS.summer.ideal
        );
        expect(SEASONAL_OUTERWEAR_TARGETS['spring/fall'].ideal).toBeGreaterThanOrEqual(
          SEASONAL_OUTERWEAR_TARGETS.winter.ideal
        );
      });
    });

    describe('Return Type Structure Validation', () => {
      test('should return proper target structure', () => {
        const result = getOuterwearTargets('summer', 'indoor_focused');
        
        expect(result).toHaveProperty('min');
        expect(result).toHaveProperty('ideal');  
        expect(result).toHaveProperty('max');
        
        expect(typeof result.min).toBe('number');
        expect(typeof result.ideal).toBe('number');
        expect(typeof result.max).toBe('number');
      });

      test('should not have additional unexpected properties', () => {
        const result = getOuterwearTargets('winter', 'outdoor_focused');
        
        const keys = Object.keys(result);
        expect(keys).toHaveLength(3);
        expect(keys).toContain('min');
        expect(keys).toContain('ideal');
        expect(keys).toContain('max');
      });
    });
  });
});
