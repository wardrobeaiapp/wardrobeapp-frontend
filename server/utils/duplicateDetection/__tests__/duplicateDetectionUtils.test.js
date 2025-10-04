const {
  findCriticalDuplicates,
  analyzeDuplicatesForAI
} = require('../../duplicateDetectionUtils');

describe('duplicateDetectionUtils', () => {
  describe('findCriticalDuplicates', () => {
    const mockWardrobeItems = [
      {
        name: 'Black T-Shirt 1',
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        style: 'Casual'
      },
      {
        name: 'Black T-Shirt 2',
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        style: 'Casual'
      },
      {
        name: 'White T-Shirt',
        category: 'top',
        subcategory: 't-shirt',
        color: 'White',
        style: 'Casual'
      },
      {
        name: 'Black Jeans',
        category: 'bottom',
        subcategory: 'jeans',
        color: 'Black',
        style: 'Casual'
      }
    ];

    test('should find high similarity duplicates', () => {
      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        style: 'Casual'
      };

      const duplicates = findCriticalDuplicates(newItem, mockWardrobeItems);
      
      expect(duplicates).toHaveLength(2); // Both black t-shirts
      expect(duplicates[0].similarity_score).toBeGreaterThanOrEqual(85);
      expect(duplicates[0].item.name).toMatch(/Black T-Shirt/);
    });

    test('should not find duplicates in different categories', () => {
      const newItem = {
        category: 'footwear',
        subcategory: 'sneakers',
        color: 'Black',
        style: 'Casual'
      };

      const duplicates = findCriticalDuplicates(newItem, mockWardrobeItems);
      
      expect(duplicates).toHaveLength(0);
    });

    test('should not find duplicates below threshold', () => {
      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Red', // Different color
        style: 'Casual'
      };

      const duplicates = findCriticalDuplicates(newItem, mockWardrobeItems);
      
      expect(duplicates).toHaveLength(0);
    });

    test('should sort duplicates by similarity score (highest first)', () => {
      const mockItems = [
        {
          name: 'Partial Match',
          category: 'top',
          subcategory: 't-shirt',
          color: 'Black',
          style: 'Formal' // Different style
        },
        {
          name: 'Perfect Match',
          category: 'top',
          subcategory: 't-shirt',
          color: 'Black',
          style: 'Casual'
        }
      ];

      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        style: 'Casual'
      };

      const duplicates = findCriticalDuplicates(newItem, mockItems);
      
      expect(duplicates[0].item.name).toBe('Perfect Match');
      expect(duplicates[0].similarity_score).toBeGreaterThan(duplicates[1]?.similarity_score || 0);
    });
  });

  describe('analyzeDuplicatesForAI', () => {
    const mockWardrobeItems = [
      { category: 'top', subcategory: 't-shirt', color: 'Black', name: 'Black T-Shirt 1', style: 'Casual' },
      { category: 'top', subcategory: 't-shirt', color: 'Black', name: 'Black T-Shirt 2', style: 'Casual' },
      { category: 'top', subcategory: 't-shirt', color: 'White', name: 'White T-Shirt', style: 'Casual' },
      { category: 'top', subcategory: 'blouse', color: 'Blue', name: 'Blue Shirt', style: 'Elegant' }
    ];

    test('should identify duplicate situation correctly', () => {
      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        style: 'Casual'
      };

      const result = analyzeDuplicatesForAI(newItem, mockWardrobeItems);
      
      expect(result.duplicate_analysis.found).toBe(true);
      expect(result.duplicate_analysis.count).toBeGreaterThan(0);
      expect(result.duplicate_analysis.severity).toMatch(/MODERATE|HIGH|EXCESSIVE/);
    });

    test('should focus on duplicate detection only', () => {
      const newItem = {
        category: 'top',
        color: 'Black' // Adding 3rd black item out of 5 total
      };

      const result = analyzeDuplicatesForAI(newItem, mockWardrobeItems);
      
      // Function now only returns duplicate analysis, not variety impact
      expect(result.duplicate_analysis).toBeDefined();
      expect(result.duplicate_analysis.found).toBe(false); // Black items aren't exact duplicates
      expect(result.duplicate_analysis.severity).toBe('NONE');
    });

    test('should analyze duplicate structure correctly', () => {
      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Black',
        style: 'Casual'
      };

      const result = analyzeDuplicatesForAI(newItem, mockWardrobeItems);
      
      // Function returns structured duplicate analysis without recommendations
      expect(result.duplicate_analysis).toBeDefined();
      expect(result.duplicate_analysis.found).toEqual(expect.any(Boolean));
      expect(result.duplicate_analysis.count).toEqual(expect.any(Number));
      expect(result.duplicate_analysis.severity).toMatch(/NONE|MODERATE|HIGH|EXCESSIVE/);
    });

    test('should handle no duplicates case', () => {
      const newItem = {
        category: 'top',
        subcategory: 't-shirt',
        color: 'Green', // Unique color
        style: 'Casual'
      };

      const result = analyzeDuplicatesForAI(newItem, []);
      
      expect(result.duplicate_analysis.found).toBe(false);
      expect(result.duplicate_analysis.count).toBe(0);
      expect(result.duplicate_analysis.severity).toBe('NONE');
      expect(result.duplicate_analysis.items).toEqual([]);
    });
  });
});
