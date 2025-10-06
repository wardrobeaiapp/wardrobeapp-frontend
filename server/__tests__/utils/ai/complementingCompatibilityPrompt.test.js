/**
 * Unit tests for complementingCompatibilityPrompt utilities
 */

const {
  buildCompatibilityCheckingPrompt,
  extractItemDataForCompatibility,
  parseCompatibilityResponse
} = require('../../../utils/ai/complementingCompatibilityPrompt');

describe('complementingCompatibilityPrompt', () => {
  
  describe('extractItemDataForCompatibility', () => {
    it('should extract basic data from formData only', () => {
      const formData = {
        category: 'top',
        subcategory: 'blouse',
        color: 'white',
        seasons: ['summer'],
        name: 'White Blouse'
      };
      
      const result = extractItemDataForCompatibility(formData, null, null);
      
      expect(result).toEqual({
        category: 'top',
        subcategory: 'blouse',
        color: 'white',
        seasons: ['summer'],
        name: 'White Blouse'
      });
    });

    it('should prioritize preFilledData over formData', () => {
      const formData = {
        category: 'top',
        color: 'white',
        name: 'Form Name'
      };
      
      const preFilledData = {
        category: 'bottom',
        color: 'black',
        name: 'Wishlist Name',
        season: ['winter']
      };
      
      const result = extractItemDataForCompatibility(formData, preFilledData, null);
      
      expect(result).toEqual({
        category: 'bottom', // From preFilledData
        subcategory: undefined,
        color: 'black', // From preFilledData
        seasons: ['winter'], // From preFilledData (season -> seasons)
        name: 'Wishlist Name' // From preFilledData
      });
    });

    it('should enhance with image analysis data', () => {
      const formData = {
        category: 'top',
        color: 'white'
      };
      
      const imageAnalysisData = {
        detectedColor: 'cream',
        pattern: 'stripes',
        styleLevel: 'casual',
        formalityLevel: 'relaxed'
      };
      
      const result = extractItemDataForCompatibility(formData, null, imageAnalysisData);
      
      expect(result).toEqual({
        category: 'top',
        subcategory: undefined,
        color: 'cream', // Enhanced from image analysis
        seasons: undefined,
        name: undefined,
        pattern: 'stripes',
        styleLevel: 'casual',
        formalityLevel: 'relaxed'
      });
    });

    it('should handle all data sources together with proper precedence', () => {
      const formData = {
        category: 'top',
        color: 'white',
        name: 'Form Name'
      };
      
      const preFilledData = {
        color: 'black', // Should override formData
        subcategory: 'shirt'
      };
      
      const imageAnalysisData = {
        detectedColor: 'navy', // Should override both
        pattern: 'solid'
      };
      
      const result = extractItemDataForCompatibility(formData, preFilledData, imageAnalysisData);
      
      expect(result).toEqual({
        category: 'top', // From formData
        subcategory: 'shirt', // From preFilledData
        color: 'navy', // From imageAnalysisData (final override)
        seasons: undefined,
        name: 'Form Name', // From formData
        pattern: 'solid'
      });
    });
  });

  describe('buildCompatibilityCheckingPrompt', () => {
    const mockItemData = {
      name: 'Navy Blazer',
      category: 'outerwear',
      subcategory: 'blazer',
      color: 'navy',
      seasons: ['spring/fall', 'winter']
    };

    const mockComplementingItems = [
      {
        name: 'Black Trousers',
        category: 'bottom',
        subcategory: 'trousers',
        color: 'black'
      },
      {
        name: 'White Shirt',
        category: 'top',
        subcategory: 'shirt',
        color: 'white'
      },
      {
        name: 'Brown Belt',
        category: 'accessory',
        subcategory: 'belt',
        color: 'brown'
      }
    ];

    it('should build complete compatibility checking prompt', () => {
      const result = buildCompatibilityCheckingPrompt(mockItemData, mockComplementingItems);
      
      expect(result).toContain('COMPLEMENTING ITEMS COMPATIBILITY CHECK');
      expect(result).toContain('CURRENT ITEM DETAILS');
      expect(result).toContain('Navy Blazer');
      expect(result).toContain('outerwear');
      expect(result).toContain('navy');
      expect(result).toContain('spring/fall, winter');
      
      // Should include complementing items grouped by category
      expect(result).toContain('BOTTOMS');
      expect(result).toContain('Black Trousers');
      expect(result).toContain('TOPS');
      expect(result).toContain('White Shirt');
      expect(result).toContain('ACCESSORIES');
      expect(result).toContain('Brown Belt');
      
      // Should include evaluation criteria
      expect(result).toContain('Color harmony');
      expect(result).toContain('Style cohesion');
      expect(result).toContain('Season appropriateness');
      expect(result).toContain('Occasion compatibility');
      
      // Should include required response format
      expect(result).toContain('REQUIRED RESPONSE FORMAT');
      expect(result).toContain('COMPATIBLE COMPLEMENTING ITEMS');
    });

    it('should handle empty complementing items', () => {
      const result = buildCompatibilityCheckingPrompt(mockItemData, []);
      
      expect(result).toBe('');
    });

    it('should handle null/undefined complementing items', () => {
      expect(buildCompatibilityCheckingPrompt(mockItemData, null)).toBe('');
      expect(buildCompatibilityCheckingPrompt(mockItemData, undefined)).toBe('');
    });

    it('should group items correctly by category', () => {
      const mixedItems = [
        { name: 'Item 1', category: 'bottom', color: 'black' },
        { name: 'Item 2', category: 'footwear', color: 'brown' },
        { name: 'Item 3', category: 'bottom', color: 'navy' },
        { name: 'Item 4', category: 'accessory', color: 'gold' }
      ];
      
      const result = buildCompatibilityCheckingPrompt(mockItemData, mixedItems);
      
      // Should group bottoms together
      expect(result).toMatch(/BOTTOMS.*Item 1.*Item 3/s);
      // Should have footwear section
      expect(result).toContain('FOOTWEAR');
      expect(result).toContain('Item 2');
      // Should have accessories section
      expect(result).toContain('ACCESSORIES');
      expect(result).toContain('Item 4');
    });
  });

  describe('parseCompatibilityResponse', () => {
    it('should parse valid compatibility response correctly', () => {
      const claudeResponse = `
        Here's my analysis of the compatibility...
        
        COMPATIBLE COMPLEMENTING ITEMS:
        bottoms: Navy Trousers, Black Jeans, Gray Slacks
        footwear: Brown Boots, Black Heels
        accessories: Leather Belt, Gold Watch
        
        These items work well together because...
      `;
      
      const result = parseCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        bottoms: ['Navy Trousers', 'Black Jeans', 'Gray Slacks'],
        footwear: ['Brown Boots', 'Black Heels'],
        accessories: ['Leather Belt', 'Gold Watch']
      });
    });

    it('should handle single items per category', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        bottoms: Navy Trousers
        footwear: Brown Boots
        accessories: Leather Belt
      `;
      
      const result = parseCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        bottoms: ['Navy Trousers'],
        footwear: ['Brown Boots'],
        accessories: ['Leather Belt']
      });
    });

    it('should ignore empty or "none" categories', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        bottoms: Navy Trousers, Black Jeans
        footwear: none
        accessories: -
        tops: 
        outerwear: Blazer
      `;
      
      const result = parseCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        bottoms: ['Navy Trousers', 'Black Jeans'],
        outerwear: ['Blazer']
      });
      
      // Should not include empty categories
      expect(result.footwear).toBeUndefined();
      expect(result.accessories).toBeUndefined();
      expect(result.tops).toBeUndefined();
    });

    it('should handle mixed case category names', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        Bottoms: Navy Trousers
        FOOTWEAR: Brown Boots
        accessories: Leather Belt
      `;
      
      const result = parseCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        bottoms: ['Navy Trousers'],
        footwear: ['Brown Boots'],
        accessories: ['Leather Belt']
      });
    });

    it('should handle response without compatibility section', () => {
      const claudeResponse = `
        These items don't work well together.
        The colors clash and the styles are incompatible.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({});
    });

    it('should handle malformed response gracefully', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        invalid format here
        bottoms without colon
        : empty category name
        bottoms: Valid Item
      `;
      
      const result = parseCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        bottoms: ['Valid Item']
      });
    });

    it('should trim whitespace from item names', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        bottoms:   Navy Trousers  ,  Black Jeans  ,  Gray Slacks  
        footwear:    Brown Boots    
      `;
      
      const result = parseCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        bottoms: ['Navy Trousers', 'Black Jeans', 'Gray Slacks'],
        footwear: ['Brown Boots']
      });
    });

    it('should handle response with code block format', () => {
      const claudeResponse = `
        Based on my analysis:
        
        \`\`\`
        COMPATIBLE COMPLEMENTING ITEMS:
        bottoms: Navy Trousers, Black Jeans
        footwear: Brown Boots
        \`\`\`
        
        These combinations work well...
      `;
      
      const result = parseCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        bottoms: ['Navy Trousers', 'Black Jeans'],
        footwear: ['Brown Boots']
      });
    });

    it('should return empty object on parsing error', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const result = parseCompatibilityResponse(null);
      
      expect(result).toEqual({});
      
      consoleSpy.mockRestore();
    });
  });
});
