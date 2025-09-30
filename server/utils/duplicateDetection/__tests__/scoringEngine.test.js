const { calculateSimilarityScore } = require('../scoringEngine');

describe('scoringEngine', () => {
  describe('calculateSimilarityScore', () => {
    test('should return 0 for different categories', () => {
      const newItem = { category: 'top', subcategory: 't-shirt', color: 'Black' };
      const existingItem = { category: 'bottom', subcategory: 'jeans', color: 'Black' };
      
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(0);
    });

    test('should return 0 for different subcategories', () => {
      const newItem = { category: 'top', subcategory: 't-shirt', color: 'Black' };
      const existingItem = { category: 'top', subcategory: 'blouse', color: 'Black' };
      
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(0);
    });

    test('should return 0 when no common attributes', () => {
      const newItem = { category: 'top', subcategory: 't-shirt', pattern: 'Striped' };
      const existingItem = { category: 'top', subcategory: 't-shirt', neckline: 'Crew' };
      
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(0);
    });

    test('should calculate perfect match for identical t-shirts', () => {
      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        pattern: 'solid',
        neckline: 'Crew',
        sleeves: 'Short',
        silhouette: 'Fitted',
        style: 'Casual'
      };
      const existingItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        pattern: 'plain', // Should match 'solid'
        neckline: 'Crew',
        sleeves: 'Short',
        silhouette: 'Regular', // Should match 'Fitted' for t-shirts
        style: 'Casual'
      };
      
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(100);
    });

    test('should handle partial matches correctly', () => {
      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black', // Match (40 points)
        neckline: 'Crew', // Match (15 points)
        sleeves: 'Short', // No match (0 points)
        style: 'Casual' // Match (5 points)
        // Total: 60/70 = 86%
      };
      const existingItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        neckline: 'Crew',
        sleeves: 'Long', // Different
        style: 'Casual'
      };
      
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(86);
    });

    test('should use different weights for footwear', () => {
      const newItem = {
        category: 'footwear',
        subcategory: 'heels',
        color: 'Black', // 35 points
        heelHeight: 'High', // 30 points
        style: 'Elegant' // 10 points
        // Total: 75/75 = 100%
      };
      const existingItem = {
        category: 'footwear',
        subcategory: 'heels',
        color: 'Black',
        heelHeight: 'High',
        style: 'Elegant'
      };
      
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(100);
    });

    test('should not match heels with different heel heights', () => {
      const newItem = {
        category: 'footwear',
        subcategory: 'heels',
        color: 'Black', // Match: 35 points
        heelHeight: 'High', // No match: 0 points
        style: 'Elegant' // Match: 10 points
        // Total: 45/75 = 60%
      };
      const existingItem = {
        category: 'footwear',
        subcategory: 'heels',
        color: 'Black',
        heelHeight: 'Low', // Different
        style: 'Elegant'
      };
      
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(60);
    });

    test('should handle color families correctly', () => {
      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Navy', // Navy is in same family as Blue
        style: 'Casual'
      };
      const existingItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Blue', // Should match Navy (same blues family)
        style: 'Casual'
      };
      
      // Only color (40) + style (5) = 45/45 = 100%
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(100);
    });

    test('should handle case insensitive matching', () => {
      const newItem = {
        category: 'TOP',
        subcategory: 'T-SHIRT',
        color: 'BLACK',
        style: 'CASUAL'
      };
      const existingItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'black',
        style: 'casual'
      };
      
      expect(calculateSimilarityScore(newItem, existingItem)).toBe(100);
    });
  });
});
