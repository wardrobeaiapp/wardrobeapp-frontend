const { getCategoryWeights } = require('../categoryWeights');

describe('categoryWeights', () => {
  describe('getCategoryWeights', () => {
    test('should return t-shirt weights for t-shirts', () => {
      const weights = getCategoryWeights('top', 't-shirt');
      
      expect(weights).toEqual({
        color: 40,
        pattern: 20,
        neckline: 15,
        sleeves: 10,
        silhouette: 10,
        style: 5
      });
    });

    test('should return t-shirt weights for tank tops', () => {
      const weights = getCategoryWeights('top', 'tank top');
      
      expect(weights).toEqual({
        color: 40,
        pattern: 20,
        neckline: 15,
        sleeves: 10,
        silhouette: 10,
        style: 5
      });
    });

    test('should return bottom weights for bottoms', () => {
      const weights = getCategoryWeights('bottom', 'jeans');
      
      expect(weights).toEqual({
        color: 40,
        silhouette: 35,
        style: 15,
        material: 10,
        rise: 10,
        length: 10
      });
    });

    test('should return outerwear weights for outerwear', () => {
      const weights = getCategoryWeights('outerwear', 'jacket');
      
      expect(weights).toEqual({
        color: 35,
        silhouette: 30,
        style: 25,
        material: 10,
        length: 10
      });
    });

    test('should return footwear weights for footwear', () => {
      const weights = getCategoryWeights('footwear', 'heels');
      
      expect(weights).toEqual({
        color: 35,
        heelHeight: 30,
        bootHeight: 20,
        style: 10,
        material: 5
      });
    });

    test('should return default weights for unknown category', () => {
      const weights = getCategoryWeights('accessories', 'belt');
      
      expect(weights).toEqual({
        color: 50,
        silhouette: 30,
        style: 10,
        material: 10
      });
    });

    test('should handle case insensitive categories', () => {
      const weights1 = getCategoryWeights('TOP', 'T-SHIRT');
      const weights2 = getCategoryWeights('top', 't-shirt');
      
      expect(weights1).toEqual(weights2);
    });

    test('should handle null/undefined categories', () => {
      const weights = getCategoryWeights(null, undefined);
      
      expect(weights).toEqual({
        color: 50,
        silhouette: 30,
        style: 10,
        material: 10
      });
    });

    test('weights should always sum to a reasonable total', () => {
      const categories = [
        ['top', 't-shirt'],
        ['bottom', 'jeans'],
        ['outerwear', 'jacket'],
        ['footwear', 'heels'],
        ['unknown', 'item']
      ];

      categories.forEach(([category, subcategory]) => {
        const weights = getCategoryWeights(category, subcategory);
        const total = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
        
        expect(total).toBeGreaterThan(50); // Reasonable minimum
        expect(total).toBeLessThan(200); // Reasonable maximum
      });
    });
  });
});
