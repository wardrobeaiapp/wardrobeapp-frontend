/**
 * Simple tests for the new YES/NO compatibility response parser
 * Tests the clean approach without complex text parsing
 */

const { parseCompatibilityResponse } = require('../../../../utils/ai/compatibility/compatibilityResponseParser');

describe('parseCompatibilityResponse - YES/NO Format', () => {
  // Mock styling context
  const mockStylingContext = [
    { id: 1, name: 'Brown Ankle Boots', category: 'footwear', color: 'brown' },
    { id: 2, name: 'Brown Loafers', category: 'footwear', color: 'brown' },
    { id: 3, name: 'Brown Cowboy Boots', category: 'footwear', color: 'brown' },
    { id: 4, name: 'Black Suede Handbag', category: 'accessory', color: 'black' },
    { id: 5, name: 'Brown Belt', category: 'accessory', color: 'brown' },
    { id: 6, name: 'Black Skirt', category: 'bottom', color: 'black' }
  ];

  test('should parse YES/NO responses and return full item objects', () => {
    const claudeResponse = `
**FOOTWEAR:**
1. Brown Ankle Boots: COMPATIBLE
2. Brown Loafers: COMPATIBLE  
3. Brown Cowboy Boots: NOT_COMPATIBLE

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
      id: 1,
      name: 'Brown Ankle Boots',
      category: 'footwear',
      color: 'brown',
      compatibilityTypes: ['complementing']
    });

    expect(result.accessory[0]).toMatchObject({
      id: 4,
      name: 'Black Suede Handbag',
      category: 'accessory',
      color: 'black',
      compatibilityTypes: ['complementing']
    });
  });

  test('should handle items with no clear response', () => {
    const claudeResponse = `
**FOOTWEAR:**
1. Brown Ankle Boots: COMPATIBLE
2. Brown Loafers: [unclear response]
    `;

    const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

    // Should only include items with clear COMPATIBLE responses
    expect(result.footwear).toHaveLength(1);
    expect(result.footwear[0].name).toBe('Brown Ankle Boots');
  });

  test('should return empty object for empty styling context', () => {
    const claudeResponse = `Brown Ankle Boots: COMPATIBLE`;
    
    const result = parseCompatibilityResponse(claudeResponse, []);
    
    expect(result).toEqual({});
  });

  test('should handle invalid input gracefully', () => {
    expect(parseCompatibilityResponse(null, mockStylingContext)).toEqual({});
    expect(parseCompatibilityResponse('', mockStylingContext)).toEqual({});
    expect(parseCompatibilityResponse('random text', mockStylingContext)).toEqual({});
  });
});
