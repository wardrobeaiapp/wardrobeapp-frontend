import { 
  detectLifestyleType,
  LifestyleAnalysis,
  LifestyleType
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
});
