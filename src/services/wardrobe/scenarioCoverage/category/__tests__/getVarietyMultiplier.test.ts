import { getVarietyMultiplier } from '../categoryNeeds';

describe('getVarietyMultiplier', () => {
  
  describe('Home scenarios', () => {
    test('should return 0.6 for home scenarios', () => {
      // Home scenarios should get 40% reduction (0.6 multiplier)
      expect(getVarietyMultiplier('Staying at Home')).toBe(0.6);
      expect(getVarietyMultiplier('Remote Work')).toBe(0.6);
      expect(getVarietyMultiplier('Staying at Home (Casual)')).toBe(0.6);
      expect(getVarietyMultiplier('Working from Home')).toBe(0.6);
      expect(getVarietyMultiplier('Housekeeping at Home')).toBe(0.6);
    });
    
    test('should handle home scenarios regardless of description', () => {
      expect(getVarietyMultiplier('Staying at Home', 'Any description')).toBe(0.6);
      expect(getVarietyMultiplier('Remote Work', 'Looking presentable')).toBe(0.6);
    });
  });

  describe('High variety scenarios', () => {
    test('should return 1.0 for office work', () => {
      expect(getVarietyMultiplier('Office Work')).toBe(1.0);
      expect(getVarietyMultiplier('Office Work', 'Business casual')).toBe(1.0);
      expect(getVarietyMultiplier('Office Work', 'Strict dress code')).toBe(1.0);
    });

    test('should return 1.0 for creative work', () => {
      expect(getVarietyMultiplier('Creative Work')).toBe(1.0);
      expect(getVarietyMultiplier('Creative Work', 'Client meetings')).toBe(1.0);
    });

    test('should return 1.0 for non-uniform students', () => {
      expect(getVarietyMultiplier('School/University')).toBe(1.0);
      expect(getVarietyMultiplier('School/University', 'No dress code')).toBe(1.0);
      expect(getVarietyMultiplier('School/University', 'Yes, there\'s a dress code')).toBe(1.0);
    });
  });

  describe('Uniform students (special case)', () => {
    test('should return 0.4 for uniform students', () => {
      expect(getVarietyMultiplier('School/University', 'Yes, I wear a uniform')).toBe(0.4);
      expect(getVarietyMultiplier('School/University', 'uniform required')).toBe(0.4);
      expect(getVarietyMultiplier('School/University', 'School has uniform policy')).toBe(0.4);
    });

    test('should be case insensitive for uniform detection', () => {
      expect(getVarietyMultiplier('School/University', 'UNIFORM required')).toBe(0.4);
      expect(getVarietyMultiplier('School/University', 'Uniform Policy')).toBe(0.4);
      expect(getVarietyMultiplier('School/University', 'yes, uniform')).toBe(0.4);
    });

    test('should not trigger uniform reduction for non-uniform descriptions', () => {
      expect(getVarietyMultiplier('School/University', 'Business casual')).toBe(1.0);
      expect(getVarietyMultiplier('School/University', 'Casual dress')).toBe(1.0);
      expect(getVarietyMultiplier('School/University', 'No specific dress code')).toBe(1.0);
    });
  });

  describe('Moderate variety scenarios', () => {
    test('should return 0.7 for social scenarios', () => {
      expect(getVarietyMultiplier('Social Outings')).toBe(0.7);
      expect(getVarietyMultiplier('Weekend social events')).toBe(0.7);
      expect(getVarietyMultiplier('Casual dating')).toBe(0.7);
    });

    test('should handle social keyword variations', () => {
      expect(getVarietyMultiplier('Meeting friends socially')).toBe(0.7); // contains 'social'
      expect(getVarietyMultiplier('Dating activities')).toBe(0.4); // no 'social' or 'dating' substring
      expect(getVarietyMultiplier('Social gatherings')).toBe(0.4); // 'Social' != 'social' (case sensitive)
    });
  });

  describe('Low variety scenarios (default)', () => {
    test('should return 0.4 for sports scenarios', () => {
      expect(getVarietyMultiplier('Gym Sessions')).toBe(0.4);
      expect(getVarietyMultiplier('Running')).toBe(0.4);
      expect(getVarietyMultiplier('Sports Activities')).toBe(0.4);
      expect(getVarietyMultiplier('Fitness')).toBe(0.4);
    });

    test('should return 0.4 for errands scenarios', () => {
      expect(getVarietyMultiplier('Errands')).toBe(0.4);
      expect(getVarietyMultiplier('Shopping for groceries')).toBe(0.4);
      expect(getVarietyMultiplier('Quick errands')).toBe(0.4);
    });

    test('should return 0.4 for physical work', () => {
      expect(getVarietyMultiplier('Physical Work')).toBe(0.4);
      expect(getVarietyMultiplier('Manual labor')).toBe(0.4);
      expect(getVarietyMultiplier('Construction work')).toBe(0.4);
    });

    test('should return 0.4 for outdoor activities', () => {
      expect(getVarietyMultiplier('Outdoor Activities')).toBe(0.4);
      expect(getVarietyMultiplier('Hiking')).toBe(0.4);
      expect(getVarietyMultiplier('Gardening')).toBe(0.4);
    });

    test('should return 0.4 for any unrecognized scenario', () => {
      expect(getVarietyMultiplier('Random Activity')).toBe(0.4);
      expect(getVarietyMultiplier('Unknown Scenario')).toBe(0.4);
      expect(getVarietyMultiplier('Testing')).toBe(0.4);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty scenario names', () => {
      expect(getVarietyMultiplier('')).toBe(0.4);
      expect(getVarietyMultiplier('   ')).toBe(0.4); // whitespace only
    });

    test('should handle missing description parameter', () => {
      expect(getVarietyMultiplier('Office Work', undefined)).toBe(1.0);
      expect(getVarietyMultiplier('School/University', undefined)).toBe(1.0);
      expect(getVarietyMultiplier('Social Outings', undefined)).toBe(0.7);
    });

    test('should handle empty description strings', () => {
      expect(getVarietyMultiplier('School/University', '')).toBe(1.0);
      expect(getVarietyMultiplier('School/University', '   ')).toBe(1.0);
    });

    test('should match exact scenario names (case sensitive)', () => {
      expect(getVarietyMultiplier('office work')).toBe(0.4); // Not exact match for 'Office Work'
      expect(getVarietyMultiplier('OFFICE WORK')).toBe(0.4); // Not exact match for 'Office Work'
      expect(getVarietyMultiplier('Office Work')).toBe(1.0); // Exact match
      expect(getVarietyMultiplier('SOCIAL OUTINGS')).toBe(0.4); // Not exact match for 'Social Outings'
    });

    test('should handle partial matches correctly', () => {
      expect(getVarietyMultiplier('Office Work Meeting')).toBe(0.4); // Not exact match for 'Office Work'
      expect(getVarietyMultiplier('Creative Work Session')).toBe(0.4); // Not exact match for 'Creative Work'
      expect(getVarietyMultiplier('Social Outings with Friends')).toBe(0.7); // Contains 'Social Outings'
    });
  });

  describe('Scenario priority order', () => {
    test('home scenarios should take priority over other matches', () => {
      // If a scenario could match both home and another category, home should win
      expect(getVarietyMultiplier('Remote Work from Home')).toBe(0.6); // Home wins over work
      expect(getVarietyMultiplier('Working from Home Office')).toBe(0.6); // Home wins over office
    });

    test('uniform detection should take priority over general student category', () => {
      // Uniform students should get 0.4, not 1.0
      expect(getVarietyMultiplier('School/University', 'Yes, I wear a uniform')).toBe(0.4);
      expect(getVarietyMultiplier('School/University', 'No dress code')).toBe(1.0);
    });
  });

  describe('Real-world scenario examples', () => {
    test('should handle common onboarding-generated scenario names', () => {
      // These match the exact names generated by onboarding
      expect(getVarietyMultiplier('Office Work', 'Business casual')).toBe(1.0);
      expect(getVarietyMultiplier('Creative Work', 'Client meetings required')).toBe(1.0);
      expect(getVarietyMultiplier('Remote Work (Presentable)', 'Zoom meetings')).toBe(0.6); // Home scenario
      expect(getVarietyMultiplier('School/University', 'Yes, I wear a uniform')).toBe(0.4);
      expect(getVarietyMultiplier('School/University', 'No, I can wear anything I want')).toBe(1.0);
      expect(getVarietyMultiplier('Physical Work', 'Manual labor')).toBe(0.4);
    });
  });
});
