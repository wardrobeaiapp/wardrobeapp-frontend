const { parseCompatibilityResponse } = require('../../../../utils/ai/compatibility/compatibilityResponseParser');

describe('parseCompatibilityResponse', () => {
  const mockStylingContext = [
    { id: 1, name: 'Brown Ankle Boots', category: 'footwear' },
    { id: 2, name: 'Brown Loafers', category: 'footwear' },
    { id: 3, name: 'Brown Cowboy Boots', category: 'footwear' },
    { id: 4, name: 'Black Suede Handbag', category: 'accessory' },
    { id: 5, name: 'Brown Belt', category: 'accessory' },
    { id: 6, name: 'Black Skirt', category: 'bottom' },
    { id: 7, name: 'Plain Trousers', category: 'bottom' },
    { id: 8, name: 'Suede Skirt', category: 'bottom' }
  ];

  describe('Multi-line format parsing (bug fix)', () => {
    test('should parse multi-line format correctly with various section formatting', () => {
      const claudeResponse = `
**FOOTWEAR:**
Brown Ankle Boots: COMPATIBLE
Brown Loafers: COMPATIBLE

**ACCESSORIES:**
Black Suede Handbag: COMPATIBLE
Brown Belt: COMPATIBLE

**BOTTOMS:**
Black Skirt: COMPATIBLE
Plain Trousers: COMPATIBLE
Suede Skirt: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result).toMatchObject({
        footwear: expect.arrayContaining([
          expect.objectContaining({ name: 'Brown Ankle Boots', compatibilityTypes: ['complementing'] }),
          expect.objectContaining({ name: 'Brown Loafers', compatibilityTypes: ['complementing'] })
        ]),
        accessory: expect.arrayContaining([
          expect.objectContaining({ name: 'Black Suede Handbag', compatibilityTypes: ['complementing'] }),
          expect.objectContaining({ name: 'Brown Belt', compatibilityTypes: ['complementing'] })
        ]),
        bottom: expect.arrayContaining([
          expect.objectContaining({ name: 'Black Skirt', compatibilityTypes: ['complementing'] }),
          expect.objectContaining({ name: 'Plain Trousers', compatibilityTypes: ['complementing'] }),
          expect.objectContaining({ name: 'Suede Skirt', compatibilityTypes: ['complementing'] })
        ])
      });
    });
  });

  describe('Edge cases and filtering', () => {
    test('should handle responses with no compatible items', () => {
      const claudeResponse = `
**FOOTWEAR:**
Brown Ankle Boots: NOT_COMPATIBLE
Brown Loafers: NOT_COMPATIBLE

**ACCESSORIES:**
Black Suede Handbag: COMPATIBLE

**BOTTOMS:**
Black Skirt: NOT_COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toBeUndefined();
      expect(result.bottom).toBeUndefined();
      expect(result.accessory).toHaveLength(1);
      expect(result.accessory[0].name).toBe('Black Suede Handbag');
    });

    test('should handle mixed compatible and not compatible responses', () => {
      const claudeResponse = `
Brown Ankle Boots: NOT_COMPATIBLE
Black Suede Handbag: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toBeUndefined();
      expect(result.accessory).toHaveLength(1);
      expect(result.accessory[0].name).toBe('Black Suede Handbag');
    });
  });

  describe('Error handling', () => {
    test('should handle malformed responses gracefully', () => {
      const claudeResponse = 'Invalid response format';

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result).toEqual({});
    });

    test('should handle empty response', () => {
      const result = parseCompatibilityResponse('', mockStylingContext);

      expect(result).toEqual({});
    });

    test('should handle undefined styling context', () => {
      const claudeResponse = `
Brown Ankle Boots: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, undefined);
      
      // With no styling context, should return empty object
      expect(result).toEqual({});
    });
  });
});
