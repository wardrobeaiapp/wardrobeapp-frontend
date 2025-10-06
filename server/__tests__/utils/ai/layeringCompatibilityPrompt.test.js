/**
 * Unit tests for layeringCompatibilityPrompt utilities
 */

const {
  isItemSuitableForLayering,
  buildLayeringCompatibilityPrompt,
  parseLayeringCompatibilityResponse,
  getLayeringItemsFromContext
} = require('../../../utils/ai/layeringCompatibilityPrompt');

describe('layeringCompatibilityPrompt', () => {
  
  describe('isItemSuitableForLayering', () => {
    it('should identify standalone dresses as not suitable for layering', () => {
      const itemData = {
        category: 'one_piece',
        subcategory: 'dress',
        name: 'Summer Dress'
      };
      
      const result = isItemSuitableForLayering(itemData, null);
      expect(result).toBe(false);
    });

    it('should identify heavy coats as not suitable for layering', () => {
      const itemData = {
        category: 'outerwear',
        subcategory: 'coat',
        name: 'Winter Coat'
      };
      
      const result = isItemSuitableForLayering(itemData, null);
      expect(result).toBe(false);
    });

    it('should identify shorts as not suitable for layering', () => {
      const itemData = {
        category: 'bottom',
        subcategory: 'shorts',
        name: 'Denim Shorts'
      };
      
      const result = isItemSuitableForLayering(itemData, null);
      expect(result).toBe(false);
    });

    it('should identify accessories as not suitable for layering', () => {
      const itemData = {
        category: 'accessory',
        subcategory: 'hat',
        name: 'Baseball Cap'
      };
      
      const result = isItemSuitableForLayering(itemData, null);
      expect(result).toBe(false);
    });

    it('should identify tops as suitable for layering', () => {
      const itemData = {
        category: 'top',
        subcategory: 'shirt',
        name: 'White Shirt'
      };
      
      const result = isItemSuitableForLayering(itemData, null);
      expect(result).toBe(true);
    });

    it('should identify light outerwear as suitable for layering', () => {
      const itemData = {
        category: 'outerwear',
        subcategory: 'cardigan',
        name: 'Light Cardigan'
      };
      
      const result = isItemSuitableForLayering(itemData, null);
      expect(result).toBe(true);
    });

    it('should respect AI characteristics indicating standalone items', () => {
      const itemData = {
        category: 'top',
        subcategory: 'blouse',
        name: 'Structured Blouse'
      };
      
      const extractedCharacteristics = {
        layeringCapability: 'standalone'
      };
      
      const result = isItemSuitableForLayering(itemData, extractedCharacteristics);
      expect(result).toBe(false);
    });

    it('should handle missing category gracefully', () => {
      const itemData = {
        name: 'Mystery Item'
      };
      
      const result = isItemSuitableForLayering(itemData, null);
      expect(result).toBe(true); // Default to suitable if unknown
    });
  });

  describe('getLayeringItemsFromContext', () => {
    const mockStylingContext = [
      { name: 'White Shirt', category: 'top', subcategory: 'shirt' },
      { name: 'Navy Blazer', category: 'outerwear', subcategory: 'blazer' },
      { name: 'Wool Scarf', category: 'accessory', subcategory: 'scarf' },
      { name: 'Leather Belt', category: 'accessory', subcategory: 'belt' },
      { name: 'Black Trousers', category: 'bottom', subcategory: 'trousers' },
      { name: 'Brown Boots', category: 'footwear', subcategory: 'boots' }
    ];

    it('should filter layering items for tops', () => {
      const result = getLayeringItemsFromContext(mockStylingContext, 'top');
      
      expect(result).toHaveLength(2);
      expect(result.map(item => item.name)).toContain('White Shirt');
      expect(result.map(item => item.name)).toContain('Navy Blazer');
      // Should not include belt or other non-layering items
      expect(result.map(item => item.name)).not.toContain('Leather Belt');
      expect(result.map(item => item.name)).not.toContain('Black Trousers');
    });

    it('should filter layering items for outerwear', () => {
      const result = getLayeringItemsFromContext(mockStylingContext, 'outerwear');
      
      expect(result).toHaveLength(1);
      expect(result.map(item => item.name)).toContain('White Shirt');
      // Outerwear shouldn't layer with other outerwear typically
      expect(result.map(item => item.name)).not.toContain('Navy Blazer');
    });

    it('should include layerable accessories like scarves', () => {
      const result = getLayeringItemsFromContext(mockStylingContext, 'accessory');
      
      expect(result).toHaveLength(1);
      expect(result.map(item => item.name)).toContain('Wool Scarf');
      // Should not include non-layerable accessories
      expect(result.map(item => item.name)).not.toContain('Leather Belt');
    });

    it('should return empty for non-layerable categories', () => {
      const result = getLayeringItemsFromContext(mockStylingContext, 'footwear');
      
      expect(result).toHaveLength(0);
    });

    it('should handle empty styling context', () => {
      const result = getLayeringItemsFromContext([], 'top');
      
      expect(result).toHaveLength(0);
    });

    it('should handle null styling context', () => {
      const result = getLayeringItemsFromContext(null, 'top');
      
      expect(result).toHaveLength(0);
    });
  });

  describe('buildLayeringCompatibilityPrompt', () => {
    const mockItemData = {
      name: 'White Shirt',
      category: 'top',
      subcategory: 'shirt',
      color: 'white',
      seasons: ['summer', 'spring/fall'],
      fit: 'fitted',
      sleeve: 'long'
    };

    const mockLayeringItems = [
      {
        name: 'Navy Blazer',
        category: 'outerwear',
        subcategory: 'blazer',
        color: 'navy',
        fit: 'fitted',
        sleeve: 'long'
      },
      {
        name: 'Gray Cardigan',
        category: 'outerwear',
        subcategory: 'cardigan',
        color: 'gray',
        fit: 'loose',
        sleeve: 'long'
      }
    ];

    it('should build complete layering compatibility prompt', () => {
      const result = buildLayeringCompatibilityPrompt(mockItemData, mockLayeringItems);
      
      expect(result).toContain('LAYERING ITEMS COMPATIBILITY CHECK');
      expect(result).toContain('CURRENT ITEM DETAILS');
      expect(result).toContain('White Shirt');
      expect(result).toContain('fitted');
      expect(result).toContain('long');
      
      // Should include layering items grouped by category
      expect(result).toContain('OUTERWEAR');
      expect(result).toContain('Navy Blazer');
      expect(result).toContain('Gray Cardigan');
      
      // Should include physical wearability criteria
      expect(result).toContain('PHYSICAL WEARABILITY');
      expect(result).toContain('Sleeve compatibility');
      expect(result).toContain('Puffy/voluminous sleeves under fitted blazers/jackets ❌');
      expect(result).toContain('Fit compatibility');
      expect(result).toContain('Fitted items under loose items ✓');
      
      // Should include required response format
      expect(result).toContain('REQUIRED RESPONSE FORMAT');
      expect(result).toContain('COMPATIBLE LAYERING ITEMS');
    });

    it('should handle empty layering items', () => {
      const result = buildLayeringCompatibilityPrompt(mockItemData, []);
      
      expect(result).toBe('');
    });

    it('should handle null layering items', () => {
      const result = buildLayeringCompatibilityPrompt(mockItemData, null);
      
      expect(result).toBe('');
    });

    it('should include detailed item information when available', () => {
      const detailedItem = {
        ...mockItemData,
        pattern: 'solid',
        sleeve: 'puffy'
      };

      const result = buildLayeringCompatibilityPrompt(detailedItem, mockLayeringItems);
      
      expect(result).toContain('Pattern: solid');
      expect(result).toContain('Sleeves: puffy');
    });
  });

  describe('parseLayeringCompatibilityResponse', () => {
    it('should parse valid layering compatibility response correctly', () => {
      const claudeResponse = `
        Here's my analysis of the layering compatibility...
        
        COMPATIBLE LAYERING ITEMS:
        tops: White Shirt, Blue Sweater
        outerwear: Gray Cardigan, Light Blazer
        
        These combinations work well because the fits are compatible...
      `;
      
      const result = parseLayeringCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        tops: ['White Shirt', 'Blue Sweater'],
        outerwear: ['Gray Cardigan', 'Light Blazer']
      });
    });

    it('should handle single items per category', () => {
      const claudeResponse = `
        COMPATIBLE LAYERING ITEMS:
        tops: White Shirt
        outerwear: Gray Cardigan
      `;
      
      const result = parseLayeringCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        tops: ['White Shirt'],
        outerwear: ['Gray Cardigan']
      });
    });

    it('should ignore empty or "none" categories', () => {
      const claudeResponse = `
        COMPATIBLE LAYERING ITEMS:
        tops: White Shirt, Blue Sweater
        outerwear: none
        accessories: -
      `;
      
      const result = parseLayeringCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        tops: ['White Shirt', 'Blue Sweater']
      });
      
      // Should not include empty categories
      expect(result.outerwear).toBeUndefined();
      expect(result.accessories).toBeUndefined();
    });

    it('should handle mixed case category names', () => {
      const claudeResponse = `
        COMPATIBLE LAYERING ITEMS:
        Tops: White Shirt
        OUTERWEAR: Gray Cardigan
        accessories: Silk Scarf
      `;
      
      const result = parseLayeringCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        tops: ['White Shirt'],
        outerwear: ['Gray Cardigan'],
        accessories: ['Silk Scarf']
      });
    });

    it('should handle response without layering section', () => {
      const claudeResponse = `
        These items don't work well for layering.
        The physical constraints make combinations impossible.
      `;
      
      const result = parseLayeringCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({});
    });

    it('should stop parsing at explanatory text', () => {
      const claudeResponse = `
        COMPATIBLE LAYERING ITEMS:
        tops: White Shirt
        outerwear: Gray Cardigan
        
        These combinations work well because the sleeves fit properly under the blazer.
        invalid: This Should Not Be Parsed
      `;
      
      const result = parseLayeringCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        tops: ['White Shirt'],
        outerwear: ['Gray Cardigan']
      });
    });

    it('should trim whitespace from item names', () => {
      const claudeResponse = `
        COMPATIBLE LAYERING ITEMS:
        tops:   White Shirt  ,  Blue Sweater  
        outerwear:    Gray Cardigan    
      `;
      
      const result = parseLayeringCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        tops: ['White Shirt', 'Blue Sweater'],
        outerwear: ['Gray Cardigan']
      });
    });

    it('should handle response with code block format', () => {
      const claudeResponse = `
        Based on physical compatibility analysis:
        
        \`\`\`
        COMPATIBLE LAYERING ITEMS:
        tops: White Shirt
        outerwear: Gray Cardigan
        \`\`\`
        
        These combinations are physically wearable...
      `;
      
      const result = parseLayeringCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        tops: ['White Shirt'],
        outerwear: ['Gray Cardigan']
      });
    });

    it('should return empty object on parsing error', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = parseLayeringCompatibilityResponse(null);
      
      expect(result).toEqual({});
      
      consoleSpy.mockRestore();
    });
  });
});
