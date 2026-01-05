import { calculateOutfitNeeds } from '../categoryNeeds';

describe('calculateOutfitNeeds', () => {
  
  describe('Default behavior (no variety multiplier)', () => {
    test('should work with default variety multiplier of 1.0', () => {
      // These should match the original behavior when no multiplier is provided
      expect(calculateOutfitNeeds(90)).toBe(14); // Daily usage (90/13 = ~7 per week, 7*2 = 14)
      expect(calculateOutfitNeeds(26)).toBe(4);  // Weekly usage (26/13 = 2 per week, 2*2 = 4) 
      expect(calculateOutfitNeeds(12)).toBe(3);  // Monthly usage (12/13 = ~1 per week, 12/4 = 3)
    });

    test('should handle edge cases without multiplier', () => {
      expect(calculateOutfitNeeds(0)).toBe(1);    // Always at least 1 outfit
      expect(calculateOutfitNeeds(1)).toBe(1);    // Very low usage
      expect(calculateOutfitNeeds(5)).toBe(2);    // Low usage: max(1, ceil(5/4)) = 2
    });
  });

  describe('High variety scenarios (multiplier = 1.0)', () => {
    test('should maintain original outfit counts for office work', () => {
      // Office work should get full variety (multiplier = 1.0)
      expect(calculateOutfitNeeds(90, 1.0)).toBe(14); // Daily office: 14 different outfits
      expect(calculateOutfitNeeds(65, 1.0)).toBe(10); // 5 times per week: 10 outfits
      expect(calculateOutfitNeeds(26, 1.0)).toBe(4);  // 2 times per week: 4 outfits
    });

    test('should handle high frequency with full variety', () => {
      expect(calculateOutfitNeeds(117, 1.0)).toBe(18); // Very high usage gets more outfits
      expect(calculateOutfitNeeds(104, 1.0)).toBe(16); // 8 times per week
    });
  });

  describe('Moderate variety scenarios (multiplier = 0.7)', () => {
    test('should reduce outfit needs for social scenarios', () => {
      // Social outings should get 30% reduction (multiplier = 0.7)
      const dailyUsage = 90;
      const adjustedUsage = dailyUsage * 0.7; // 63
      expect(calculateOutfitNeeds(dailyUsage, 0.7)).toBe(calculateOutfitNeeds(63, 1.0)); // ~10 outfits
      
      const weeklyUsage = 26; 
      const adjustedWeekly = weeklyUsage * 0.7; // ~18
      expect(calculateOutfitNeeds(weeklyUsage, 0.7)).toBe(calculateOutfitNeeds(18, 1.0)); // ~3 outfits
    });

    test('should handle moderate variety for social events', () => {
      expect(calculateOutfitNeeds(90, 0.7)).toBe(10); // Daily social: ~10 outfits vs 14 for office
      expect(calculateOutfitNeeds(52, 0.7)).toBe(6);  // 4 times per week: 6 outfits vs 8
    });
  });

  describe('Low variety scenarios (multiplier = 0.4)', () => {
    test('should significantly reduce outfit needs for sports/errands', () => {
      // Sports/errands should get 60% reduction (multiplier = 0.4)
      const dailyUsage = 90;
      const adjustedUsage = dailyUsage * 0.4; // 36
      expect(calculateOutfitNeeds(dailyUsage, 0.4)).toBe(6); // Daily sports: ~6 outfits vs 14 for office
      
      const weeklyUsage = 65; // 5 times per week
      const adjustedWeekly = weeklyUsage * 0.4; // 26
      expect(calculateOutfitNeeds(weeklyUsage, 0.4)).toBe(4); // 4 outfits vs 10 for office
    });

    test('should handle low frequency with low variety', () => {
      expect(calculateOutfitNeeds(26, 0.4)).toBe(3); // Weekly sports: 3 outfits
      expect(calculateOutfitNeeds(12, 0.4)).toBe(2); // Monthly activities: 2 outfits
    });
  });

  describe('Home scenarios (multiplier = 0.6)', () => {
    test('should apply home reduction for remote work scenarios', () => {
      // Home scenarios should get 40% reduction (multiplier = 0.6)
      const dailyUsage = 90;
      const adjustedUsage = dailyUsage * 0.6; // 54
      expect(calculateOutfitNeeds(dailyUsage, 0.6)).toBe(9); // Daily home: ~9 outfits vs 14 for office
      
      const weeklyUsage = 65; 
      const adjustedWeekly = weeklyUsage * 0.6; // 39
      expect(calculateOutfitNeeds(weeklyUsage, 0.6)).toBe(6); // ~6 outfits vs 10 for office
    });

    test('should handle home scenarios with various frequencies', () => {
      expect(calculateOutfitNeeds(90, 0.6)).toBe(9);  // Daily home work: 9 outfits
      expect(calculateOutfitNeeds(52, 0.6)).toBe(5);  // 4 times per week: 5 outfits
      expect(calculateOutfitNeeds(26, 0.6)).toBe(3);  // 2 times per week: 3 outfits
    });
  });

  describe('Mathematical correctness', () => {
    test('should apply variety multiplier before outfit calculation', () => {
      const baseUsage = 65; // 5 times per week
      
      // Test that variety multiplier affects the seasonal usage before outfit calculation
      const highVariety = calculateOutfitNeeds(baseUsage, 1.0);   // 10 outfits
      const moderateVariety = calculateOutfitNeeds(baseUsage, 0.7); // 7 outfits  
      const lowVariety = calculateOutfitNeeds(baseUsage, 0.4);      // 4 outfits
      const homeVariety = calculateOutfitNeeds(baseUsage, 0.6);     // 6 outfits
      
      expect(highVariety).toBeGreaterThan(moderateVariety);
      expect(moderateVariety).toBeGreaterThan(homeVariety);
      expect(homeVariety).toBeGreaterThan(lowVariety);
    });

    test('should handle precise multiplier calculations', () => {
      // Test that we get the expected adjusted uses
      const usage = 100;
      
      // Low variety: 100 * 0.4 = 40 uses
      // 40/13 = ~3 per week, ceil(3*2) = 6 outfits
      expect(calculateOutfitNeeds(usage, 0.4)).toBe(7);
      
      // Home variety: 100 * 0.6 = 60 uses  
      // 60/13 = ~5 per week, ceil(5*2) = 10 outfits
      expect(calculateOutfitNeeds(usage, 0.6)).toBe(10);
      
      // Moderate variety: 100 * 0.7 = 70 uses
      // 70/13 = ~5 per week, ceil(5*2) = 11 outfits  
      expect(calculateOutfitNeeds(usage, 0.7)).toBe(11);
    });
  });

  describe('Edge cases with variety multiplier', () => {
    test('should maintain minimum of 1 outfit even with low variety', () => {
      expect(calculateOutfitNeeds(1, 0.4)).toBe(1);   // Very low usage with low variety
      expect(calculateOutfitNeeds(2, 0.4)).toBe(1);   // Still very low
      expect(calculateOutfitNeeds(0, 0.4)).toBe(1);   // Zero usage
    });

    test('should handle very high variety multiplier', () => {
      // Test with hypothetical higher variety (should work mathematically)
      expect(calculateOutfitNeeds(26, 1.5)).toBe(6); // 26 * 1.5 = 39, 39/13 = 3, 3*2 = 6
      expect(calculateOutfitNeeds(52, 1.2)).toBe(10); // 52 * 1.2 = 62.4, 62.4/13 = 4.8, 4.8*2 = ~10
    });

    test('should handle zero variety multiplier', () => {
      // Edge case: zero multiplier should result in minimal outfits
      expect(calculateOutfitNeeds(90, 0)).toBe(1);   // Always at least 1
      expect(calculateOutfitNeeds(100, 0)).toBe(1);  // Always at least 1
    });

    test('should handle very low usage with variety multipliers', () => {
      const lowUsage = 5; // Very infrequent activity
      
      expect(calculateOutfitNeeds(lowUsage, 1.0)).toBe(2);  // 5 uses, max(1, ceil(5/4)) = 2
      expect(calculateOutfitNeeds(lowUsage, 0.6)).toBe(1);  // 3 uses, max(1, ceil(3/4)) = 1
      expect(calculateOutfitNeeds(lowUsage, 0.4)).toBe(1);  // 2 uses, max(1, ceil(2/4)) = 1
    });
  });

  describe('Real-world scenario validation', () => {
    test('daily gym vs daily office comparison', () => {
      const dailyFrequency = 90; // Daily usage (90 uses per season)
      
      const officeOutfits = calculateOutfitNeeds(dailyFrequency, 1.0); // High variety: 14
      const gymOutfits = calculateOutfitNeeds(dailyFrequency, 0.4);    // Low variety: 6
      
      expect(officeOutfits).toBe(14);
      expect(gymOutfits).toBe(6);
      expect(officeOutfits).toBeGreaterThan(gymOutfits * 2); // Office needs more than 2x gym variety
    });

    test('weekly social vs weekly errands comparison', () => {
      const weeklyFrequency = 13; // Weekly usage (1 time per week)
      
      const socialOutfits = calculateOutfitNeeds(weeklyFrequency, 0.7); // Moderate: 3
      const errandsOutfits = calculateOutfitNeeds(weeklyFrequency, 0.4); // Low: 2
      
      expect(socialOutfits).toBe(3);
      expect(errandsOutfits).toBe(2);
      expect(socialOutfits).toBeGreaterThan(errandsOutfits);
    });

    test('uniform students vs regular students', () => {
      const dailySchool = 90; // Daily school attendance
      
      const regularStudent = calculateOutfitNeeds(dailySchool, 1.0); // High variety: 14
      const uniformStudent = calculateOutfitNeeds(dailySchool, 0.4); // Low variety: 6
      
      expect(regularStudent).toBe(14);
      expect(uniformStudent).toBe(6);
      expect(regularStudent).toBeGreaterThan(uniformStudent * 2);
    });

    test('home scenarios vs office scenarios', () => {
      const dailyWork = 90; // Daily work frequency
      
      const officeWork = calculateOutfitNeeds(dailyWork, 1.0); // Office: 14 outfits
      const homeWork = calculateOutfitNeeds(dailyWork, 0.6);   // Home: 8 outfits
      
      expect(officeWork).toBe(14);
      expect(homeWork).toBe(9);
      expect(officeWork).toBeGreaterThan(homeWork);
    });
  });
});
