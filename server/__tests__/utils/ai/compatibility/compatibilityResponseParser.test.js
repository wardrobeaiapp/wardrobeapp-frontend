/**
 * Unit tests for compatibility response parser
 * Tests both single-line and multi-line category formats, plus truncated headers
 */

const { parseCompatibilityResponse, extractFromDetailedAnalysis } = require('../../../../utils/ai/compatibility/compatibilityResponseParser');

describe('parseCompatibilityResponse', () => {
  // Mock styling context for testing
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

  describe('Single-line format parsing', () => {
    test('should parse single-line category format correctly', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots, Brown Loafers
accessory: Black Suede Handbag, Brown Belt
bottom: Black Skirt, Plain Trousers

ANALYSIS:
Some analysis text here.
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
          expect.objectContaining({ name: 'Plain Trousers', compatibilityTypes: ['complementing'] })
        ])
      });
    });
  });

  describe('Multi-line format parsing (bug fix)', () => {
    test('should parse multi-line category format correctly', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: 
Brown Ankle Boots, Brown Loafers

accessory:
Black Suede Handbag, Brown Belt

bottom:
Black Skirt, Plain Trousers, Suede Skirt

ANALYSIS:
Some analysis text here.
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

    test('should handle mixed single-line and multi-line formats', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots, Brown Loafers
accessory:
Black Suede Handbag
bottom: Black Skirt, Plain Trousers

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(2);
      expect(result.accessory).toHaveLength(1);
      expect(result.bottom).toHaveLength(2);
    });
  });

  describe('Truncated header handling', () => {
    test('should handle truncated header (missing C)', () => {
      const claudeResponse = `
OMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots, Brown Loafers
accessory: Black Suede Handbag

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result).toMatchObject({
        footwear: expect.arrayContaining([
          expect.objectContaining({ name: 'Brown Ankle Boots' }),
          expect.objectContaining({ name: 'Brown Loafers' })
        ]),
        accessory: expect.arrayContaining([
          expect.objectContaining({ name: 'Black Suede Handbag' })
        ])
      });
    });

    test('should handle flexible header pattern matching', () => {
      const claudeResponse = `
MPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots
accessory: Black Suede Handbag

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(1);
      expect(result.accessory).toHaveLength(1);
    });
  });

  describe('Item name matching', () => {
    test('should match items with exact names', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result.footwear[0]).toMatchObject({
        id: 1,
        name: 'Brown Ankle Boots',
        category: 'footwear',
        compatibilityTypes: ['complementing']
      });
    });

    test('should match items with partial names', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots
accessory: Suede Handbag
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
      expect(result.accessory[0].name).toBe('Black Suede Handbag');
    });

    test('should create fallback objects for unmatched items', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Unknown Boot Item
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result.footwear[0]).toMatchObject({
        name: 'Unknown Boot Item',
        compatibilityTypes: ['complementing']
      });
      expect(result.footwear[0].id).toBeUndefined();
    });

    test('should handle partial name matching creating fallbacks', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ancle Boots
accessory: Suede Handbag
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      // Should find matching items via partial name matching
      expect(result.footwear[0].name).toBe('Brown Ancle Boots'); // Creates fallback for typo
      expect(result.accessory[0].name).toBe('Black Suede Handbag'); // Finds partial match
    });
  });

  describe('Edge cases and filtering', () => {
    test('should filter out "none" responses', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: none
accessory: Black Suede Handbag
bottom: n/a
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toBeUndefined();
      expect(result.bottom).toBeUndefined();
      expect(result.accessory).toHaveLength(1);
    });

    test('should filter out "no compatible" responses', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: no compatible options
accessory: Black Suede Handbag
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toBeUndefined();
      expect(result.accessory).toHaveLength(1);
    });

    test('should stop processing at analysis section', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots
These items work well because they complement the style.
accessory: This analysis text should be ignored
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(1);
      expect(result.accessory).toBeUndefined();
    });

    test('should handle empty compatible items section', () => {
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result).toEqual({});
    });
  });

  describe('Fallback to detailed analysis', () => {
    test('should use fallback parsing when no compatible section found', () => {
      const claudeResponse = `
COMPATIBILITY ANALYSIS:

**FOOTWEAR:**
- Brown Ankle Boots: COMPATIBLE - Good match with the item
- Black Cowboy Boots: EXCLUDED - Too casual for the style

**ACCESSORIES:**  
- Black Suede Handbag: COMPATIBLE - Works well with the color scheme
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result.footwear).toHaveLength(1);
      expect(result.accessory).toHaveLength(1);
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
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
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots
      `;

      const result = parseCompatibilityResponse(claudeResponse, undefined);

      expect(result.footwear[0]).toMatchObject({
        name: 'Brown Ankle Boots',
        compatibilityTypes: ['complementing']
      });
    });
  });
});

describe('extractFromDetailedAnalysis', () => {
  const mockStylingContext = [
    { id: 1, name: 'Brown Ankle Boots', category: 'footwear' },
    { id: 2, name: 'Black Suede Handbag', category: 'accessory' }
  ];

  test('should extract compatible items from detailed analysis', () => {
    const claudeResponse = `
COMPATIBILITY ANALYSIS:

**FOOTWEAR:**
- Brown Ankle Boots: COMPATIBLE - Good match
- Black Cowboy Boots: EXCLUDED - Too casual

**ACCESSORIES:**
- Black Suede Handbag: COMPATIBLE - Works well
- Brown Belt: EXCLUDED - Color clash
    `;

    const result = extractFromDetailedAnalysis(claudeResponse, mockStylingContext);

    expect(result.footwear).toHaveLength(1);
    expect(result.accessory).toHaveLength(1);
    expect(result.footwear[0].name).toBe('Brown Ankle Boots');
    expect(result.accessory[0].name).toBe('Black Suede Handbag');
  });

  test('should handle various compatibility keywords', () => {
    const claudeResponse = `
COMPATIBILITY ANALYSIS:

**FOOTWEAR:**
- Brown Ankle Boots: WORKS WELL - Good match
- Black Boots: GOOD MATCH - Also suitable
- Red Boots: SUITABLE - Works for the occasion
    `;

    const result = extractFromDetailedAnalysis(claudeResponse, mockStylingContext);

    expect(result.footwear).toHaveLength(1); // Only one matches styling context
  });

  describe('Reasoning text filtering', () => {
    test('should filter out reasoning text mixed with items', () => {
      // This tests the specific issue where Claude returns reasoning text as items
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots, Brown Loafers

bottom:
- Plain Trousers: The elegant style would work well with the elegant top
- Suede Skirt: The brown suede skirt would add sophistication

The selected items consider color harmony, style cohesion, season appropriateness, occasion compatibility, proportion and silhouette, material compatibility, and practical wearability. These combinations would create well-balanced, stylish outfits suitable for the intended use cases.

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      // Should extract only the actual item names, not the reasoning text
      expect(result.footwear).toHaveLength(2);
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
      expect(result.footwear[1].name).toBe('Brown Loafers');

      expect(result.bottom).toHaveLength(2);
      expect(result.bottom[0].name).toBe('Plain Trousers');
      expect(result.bottom[1].name).toBe('Suede Skirt');

      // Should NOT include reasoning text fragments
      expect(result.bottom.some(item => item.name?.includes('color harmony'))).toBe(false);
      expect(result.bottom.some(item => item.name?.includes('style cohesion'))).toBe(false);
      expect(result.bottom.some(item => item.name?.includes('selected items consider'))).toBe(false);
    });

    test('should handle comma-separated reasoning text properly', () => {
      // Test the specific case where reasoning text has commas and gets split
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

bottom: Plain Trousers, The selected items consider color harmony, style cohesion, season appropriateness, occasion compatibility, practical wearability

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      // Should only extract the actual item, not the reasoning fragments
      expect(result.bottom).toHaveLength(1);
      expect(result.bottom[0].name).toBe('Plain Trousers');

      // Should NOT include reasoning text fragments
      expect(result.bottom.some(item => item.name?.includes('color harmony'))).toBe(false);
      expect(result.bottom.some(item => item.name?.includes('selected items consider'))).toBe(false);
    });

    test('should filter out dash-formatted reasoning text like "- The brown colors also harmonize"', () => {
      // Test the specific case from user's screenshot
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

accessory: Black Belt, - The brown colors also harmonize nicely with the white top.

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      // Should only extract actual accessories, not reasoning text
      expect(result.accessory).toHaveLength(1);
      expect(result.accessory[0].name).toBe('Black Belt'); // This will be a fallback since Black Belt isn't in mock context

      // Should NOT include reasoning text that starts with "- The"
      expect(result.accessory.some(item => item.name?.includes('brown colors also harmonize'))).toBe(false);
      expect(result.accessory.some(item => item.name?.includes('- The'))).toBe(false);
    });

    test('should filter out seasonal appropriateness reasoning text', () => {
      // Test the latest case from user's screenshot with "aligning with the stated seasonal appropriateness"
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots, Brown Loafers, aligning with the stated seasonal appropriateness of the top.

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      // Should only extract actual footwear items, not reasoning text
      expect(result.footwear).toHaveLength(2);
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
      expect(result.footwear[1].name).toBe('Brown Loafers');

      // Should NOT include reasoning text about seasonal appropriateness
      expect(result.footwear.some(item => item.name?.includes('aligning with'))).toBe(false);
      expect(result.footwear.some(item => item.name?.includes('seasonal appropriateness'))).toBe(false);
      expect(result.footwear.some(item => item.name?.includes('of the top'))).toBe(false);
    });

    test('should filter out "while stylish" and similar conjunction reasoning fragments', () => {
      // Test the latest case from user's screenshot with "while stylish"
      const claudeResponse = `
COMPATIBLE COMPLEMENTING ITEMS:

footwear: Brown Ankle Boots, Brown Loafers, Brown Cowboy Boots, while stylish, and stylish

ANALYSIS:
Some analysis text here.
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      // Should only extract actual footwear items, not reasoning fragments
      expect(result.footwear).toHaveLength(3);
      expect(result.footwear[0].name).toBe('Brown Ankle Boots');
      expect(result.footwear[1].name).toBe('Brown Loafers');
      expect(result.footwear.some(item => item.name?.includes('Brown Cowboy Boots'))).toBe(true); // This should match from mock context

      // Should NOT include reasoning fragments
      expect(result.footwear.some(item => item.name?.includes('while stylish'))).toBe(false);
      expect(result.footwear.some(item => item.name?.includes('and stylish'))).toBe(false);
      expect(result.footwear.some(item => item.name === 'while stylish')).toBe(false);
    });
  });
});
