/**
 * Comprehensive tests for the new YES/NO compatibility response parser
 * Tests the clean data approach without complex text parsing
 */

const { parseCompatibilityResponse } = require('../../../../utils/ai/compatibility/compatibilityResponseParser');

describe('parseCompatibilityResponse - New YES/NO Approach', () => {
  // Mock styling context for testing
  const mockStylingContext = [
    { 
      id: 'boot1', 
      name: 'Brown Ankle Boots', 
      category: 'footwear', 
      color: 'brown',
      imageUrl: '/uploads/brown-boots.jpg',
      subcategory: 'boots'
    },
    { 
      id: 'boot2', 
      name: 'Brown Loafers', 
      category: 'footwear', 
      color: 'brown',
      imageUrl: '/uploads/loafers.jpg',
      subcategory: 'dress_shoes'
    },
    { 
      id: 'boot3', 
      name: 'Black High Heels', 
      category: 'footwear', 
      color: 'black',
      imageUrl: '/uploads/heels.jpg',
      subcategory: 'heels'
    },
    { 
      id: 'bag1', 
      name: 'Black Suede Handbag', 
      category: 'accessory', 
      color: 'black',
      imageUrl: '/uploads/handbag.jpg',
      subcategory: 'bag'
    },
    { 
      id: 'belt1', 
      name: 'Brown Belt', 
      category: 'accessory', 
      color: 'brown',
      imageUrl: '/uploads/belt.jpg',
      subcategory: 'belt'
    },
    { 
      id: 'skirt1', 
      name: 'Black Skirt', 
      category: 'bottom', 
      color: 'black',
      imageUrl: '/uploads/skirt.jpg',
      subcategory: 'skirt'
    }
  ];

  describe('Basic YES/NO Parsing', () => {
    test('should parse YES/NO responses correctly', () => {
      const claudeResponse = `
**FOOTWEAR:**
1. Brown Ankle Boots: COMPATIBLE
2. Brown Loafers: COMPATIBLE  
3. Black High Heels: NOT_COMPATIBLE

**ACCESSORIES:**
1. Black Suede Handbag: COMPATIBLE
2. Brown Belt: NOT_COMPATIBLE

**BOTTOMS:**
1. Black Skirt: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      // Should return compatible items organized by category
      expect(result.footwear).toHaveLength(2);
      expect(result.accessory).toHaveLength(1);
      expect(result.bottom).toHaveLength(1);

      // Should preserve all original item properties
      expect(result.footwear[0]).toMatchObject({
        id: 'boot1',
        name: 'Brown Ankle Boots',
        category: 'footwear',
        color: 'brown',
        imageUrl: '/uploads/brown-boots.jpg',
        subcategory: 'boots',
        compatibilityTypes: ['complementing']
      });
    });

    test('should handle mixed compatible/not compatible responses', () => {
      const claudeResponse = `
Brown Ankle Boots: COMPATIBLE
Brown Loafers: NOT_COMPATIBLE  
Black High Heels: COMPATIBLE
Black Suede Handbag: NOT_COMPATIBLE
Brown Belt: COMPATIBLE
Black Skirt: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(2); // Brown Ankle Boots + Black High Heels
      expect(result.accessory).toHaveLength(1); // Brown Belt
      expect(result.bottom).toHaveLength(1); // Black Skirt

      const footwearNames = result.footwear.map(item => item.name);
      expect(footwearNames).toContain('Brown Ankle Boots');
      expect(footwearNames).toContain('Black High Heels');
      expect(footwearNames).not.toContain('Brown Loafers');
    });

    test('should handle various response formats', () => {
      const claudeResponse = `
1. Brown Ankle Boots: COMPATIBLE - Great color match
2. Brown Loafers: NOT_COMPATIBLE - Style clash  
3. Black Suede Handbag: COMPATIBLE
4. Brown Belt: COMPATIBLE (perfect match)
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(1);
      expect(result.accessory).toHaveLength(2);
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
      expect(result.accessory.map(item => item.name)).toEqual(['Black Suede Handbag', 'Brown Belt']);
    });
  });

  describe('Data Preservation', () => {
    test('should preserve all item properties from styling context', () => {
      const claudeResponse = `Brown Ankle Boots: COMPATIBLE`;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      const item = result.footwear[0];
      expect(item).toEqual({
        id: 'boot1',
        name: 'Brown Ankle Boots',
        category: 'footwear',
        color: 'brown',
        imageUrl: '/uploads/brown-boots.jpg',
        subcategory: 'boots',
        compatibilityTypes: ['complementing']
      });
    });

    test('should add compatibilityTypes to all compatible items', () => {
      const claudeResponse = `
Brown Ankle Boots: COMPATIBLE
Black Suede Handbag: COMPATIBLE  
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear[0].compatibilityTypes).toEqual(['complementing']);
      expect(result.accessory[0].compatibilityTypes).toEqual(['complementing']);
    });

    test('should sort items within categories by name', () => {
      const claudeResponse = `
Brown Loafers: COMPATIBLE
Brown Ankle Boots: COMPATIBLE
Black High Heels: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      const names = result.footwear.map(item => item.name);
      expect(names).toEqual(['Black High Heels', 'Brown Ankle Boots', 'Brown Loafers']);
    });
  });

  describe('Edge Cases', () => {
    test('should handle items with unclear responses', () => {
      const claudeResponse = `
Brown Ankle Boots: COMPATIBLE
Brown Loafers: Maybe compatible
Black High Heels: UNCLEAR
Black Suede Handbag: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      // Should only include items with clear COMPATIBLE responses
      expect(result.footwear).toHaveLength(1);
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
      expect(result.accessory).toHaveLength(1);
      expect(result.accessory[0].name).toBe('Black Suede Handbag');
    });

    test('should handle partial item name matches', () => {
      const claudeResponse = `
Brown Ankle: COMPATIBLE
Suede Handbag: COMPATIBLE
Belt: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      // Should match items by partial names
      expect(result.footwear).toHaveLength(1);
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
      expect(result.accessory).toHaveLength(2);
      expect(result.accessory.map(item => item.name)).toContain('Black Suede Handbag');
      expect(result.accessory.map(item => item.name)).toContain('Brown Belt');
    });

    test('should handle case-insensitive matching', () => {
      const claudeResponse = `
brown ankle boots: COMPATIBLE
BLACK SUEDE HANDBAG: COMPATIBLE
Brown Belt: compatible
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(1);
      expect(result.accessory).toHaveLength(2);
    });

    test('should handle empty or invalid styling context', () => {
      const claudeResponse = `Brown Ankle Boots: COMPATIBLE`;

      expect(parseCompatibilityResponse(claudeResponse, [])).toEqual({});
      expect(parseCompatibilityResponse(claudeResponse, null)).toEqual({});
      expect(parseCompatibilityResponse(claudeResponse, undefined)).toEqual({});
    });

    test('should handle invalid Claude responses', () => {
      expect(parseCompatibilityResponse(null, mockStylingContext)).toEqual({});
      expect(parseCompatibilityResponse('', mockStylingContext)).toEqual({});
      expect(parseCompatibilityResponse('random text without format', mockStylingContext)).toEqual({});
    });

    test('should handle responses with no compatible items', () => {
      const claudeResponse = `
Brown Ankle Boots: NOT_COMPATIBLE
Brown Loafers: NOT_COMPATIBLE  
Black High Heels: NOT_COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result).toEqual({});
    });
  });

  describe('Complex Scenarios', () => {
    test('should handle mixed categories with varying results', () => {
      const claudeResponse = `
**ANALYSIS**
Here's my detailed analysis...

**FOOTWEAR:**
1. Brown Ankle Boots: COMPATIBLE - Perfect color match
2. Brown Loafers: NOT_COMPATIBLE - Too formal
3. Black High Heels: COMPATIBLE - Versatile choice

**ACCESSORIES:**  
1. Black Suede Handbag: COMPATIBLE
2. Brown Belt: NOT_COMPATIBLE - Color clash

**BOTTOMS:**
1. Black Skirt: NOT_COMPATIBLE - Style mismatch

Additional reasoning text here...
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(2);
      expect(result.accessory).toHaveLength(1); 
      expect(result.bottom).toBeUndefined(); // No compatible items

      expect(result.footwear.map(item => item.name)).toEqual(['Black High Heels', 'Brown Ankle Boots']);
      expect(result.accessory[0].name).toBe('Black Suede Handbag');
    });

    test('should handle responses with extra formatting', () => {
      const claudeResponse = `
        Based on my analysis:

        • Brown Ankle Boots: COMPATIBLE ✓
        • Brown Loafers: NOT_COMPATIBLE ✗ 
        • Black Suede Handbag: COMPATIBLE ✓

        Summary: 2/3 items are compatible
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(1);
      expect(result.accessory).toHaveLength(1);
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
      expect(result.accessory[0].name).toBe('Black Suede Handbag');
    });

    test('should handle responses with special characters in item names', () => {
      const specialContext = [
        { id: '1', name: 'T-Shirt (Cotton)', category: 'top' },
        { id: '2', name: 'Jeans [Slim Fit]', category: 'bottom' },
        { id: '3', name: 'Shoes & Boots', category: 'footwear' }
      ];

      const claudeResponse = `
T-Shirt (Cotton): COMPATIBLE
Jeans [Slim Fit]: COMPATIBLE  
Shoes & Boots: NOT_COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, specialContext);

      expect(result.top).toHaveLength(1);
      expect(result.bottom).toHaveLength(1);
      expect(result.footwear).toBeUndefined();
    });
  });

  describe('Performance & Reliability', () => {
    test('should handle large styling context efficiently', () => {
      const largeContext = [];
      for (let i = 0; i < 100; i++) {
        largeContext.push({
          id: `item${i}`,
          name: `Test Item ${i}`,
          category: 'accessory'
        });
      }

      const claudeResponse = `Test Item 50: COMPATIBLE`;

      const start = Date.now();
      const result = parseCompatibilityResponse(claudeResponse, largeContext);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200); // Should complete in <200ms (adjusted for debugging overhead)
      expect(result.accessory.length).toBeGreaterThanOrEqual(1);
      expect(result.accessory.some(item => item.name === 'Test Item 50')).toBe(true);
    });

    test('should be consistent across multiple calls', () => {
      const claudeResponse = `
Brown Ankle Boots: COMPATIBLE
Black Suede Handbag: COMPATIBLE
      `;

      const result1 = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      const result2 = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result1).toEqual(result2);
    });
  });
});
