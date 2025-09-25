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
});
