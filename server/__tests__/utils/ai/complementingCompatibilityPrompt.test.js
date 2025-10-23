const { 
  extractItemDataForCompatibility, 
  buildCompatibilityCheckingPrompt, 
  parseCompatibilityResponse 
} = require('../../../utils/ai/complementingCompatibilityPrompt');

describe('complementingCompatibilityPrompt', () => {
  describe('extractItemDataForCompatibility', () => {
    it('should extract basic data from formData only', () => {
      const formData = {
        name: 'Black Dress',
        category: 'one_piece',
        color: 'black'
      };

      const result = extractItemDataForCompatibility(formData);
      
      expect(result).toEqual({
        name: 'Black Dress',
        category: 'one_piece', 
        color: 'black'
      });
    });

    it('should prioritize preFilledData over formData', () => {
      const formData = {
        name: 'Black Dress',
        category: 'one_piece',
        color: 'black'
      };

      const preFilledData = {
        color: 'navy', // This should override formData.color
        brand: 'Zara'  // This should be added
      };

      const result = extractItemDataForCompatibility(formData, preFilledData);
      
      expect(result).toEqual({
        name: 'Black Dress',
        category: 'one_piece',
        color: 'navy' // Overridden
      });
    });

    it('should enhance with image analysis data', () => {
      const formData = {
        name: 'Black Dress',
        category: 'one_piece'
      };

      const imageAnalysisData = {
        color: 'black',
        pattern: 'solid',
        style: 'elegant'
      };

      const result = extractItemDataForCompatibility(formData, null, imageAnalysisData);
      
      expect(result).toEqual({
        name: 'Black Dress',
        category: 'one_piece',
        color: 'black',
        pattern: 'solid', 
        style: 'elegant'
      });
    });

    it('should handle all data sources together with proper precedence', () => {
      const formData = {
        name: 'Black Dress',
        category: 'one_piece',
        color: 'black'
      };

      const preFilledData = {
        color: 'navy',
        brand: 'Zara'
      };

      const imageAnalysisData = {
        color: 'midnight blue', // Should not override preFilledData
        pattern: 'solid',
        style: 'elegant'
      };

      const result = extractItemDataForCompatibility(formData, preFilledData, imageAnalysisData);
      
      expect(result).toEqual({
        name: 'Black Dress',
        category: 'one_piece',
        color: 'navy', // preFilledData takes precedence over imageAnalysisData
        pattern: 'solid',
        style: 'elegant'
      });
    });
  });

  describe('buildCompatibilityCheckingPrompt', () => {
    const mockItemData = {
      name: 'Black Dress',
      category: 'one_piece',
      color: 'black',
      style: 'elegant'
    };

    it('should build complete compatibility checking prompt', () => {
      const complementingItems = [
        { name: 'Black Trousers', category: 'bottom' },
        { name: 'White Shirt', category: 'top' },
        { name: 'Brown Belt', category: 'accessory' }
      ];
      
      const result = buildCompatibilityCheckingPrompt(mockItemData, complementingItems);
      
      expect(result).toContain('Black Dress');
      expect(result).toContain('BOTTOM:');
      expect(result).toContain('Black Trousers');
      expect(result).toContain('TOP:');
      expect(result).toContain('White Shirt');
      expect(result).toContain('ACCESSORIES');
      expect(result).toContain('Brown Belt');
      
      // Should include evaluation criteria
      expect(result).toContain('Color harmony');
      expect(result).toContain('THINK LIKE A PROFESSIONAL STYLIST');
      expect(result).toContain('ITEM NECESSITY');
      expect(result).toContain('STYLING SOPHISTICATION');
      
      // Should include required response format for YES/NO compatibility
      expect(result).toContain('REQUIRED RESPONSE FORMAT');
      expect(result).toContain('COMPATIBLE or NOT_COMPATIBLE');
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
      const complementingItems = [
        { name: 'Item 1', category: 'bottom' },
        { name: 'Item 2', category: 'top' }, 
        { name: 'Item 3', category: 'bottom' },
        { name: 'Item 4', category: 'accessory' }
      ];
      
      const result = buildCompatibilityCheckingPrompt(mockItemData, complementingItems);
      
      // Should group bottoms together
      const bottomsSection = result.split('**TOP:**')[0];
      expect(bottomsSection).toContain('Item 1');
      expect(bottomsSection).toContain('Item 3');
      
      // Should have separate sections
      expect(result).toContain('**BOTTOM:**');
      expect(result).toContain('**TOP:**'); 
      expect(result).toContain('**ACCESSORY:**');
    });
  });

  describe('parseCompatibilityResponse', () => {
    const mockStylingContext = [
      { id: '1', name: 'Navy Trousers', category: 'bottom' },
      { id: '2', name: 'Black Jeans', category: 'bottom' },
      { id: '3', name: 'Brown Boots', category: 'footwear' },
      { id: '4', name: 'Leather Belt', category: 'accessory' },
      { id: '5', name: 'Gold Watch', category: 'accessory' }
    ];

    it('should parse YES/NO responses correctly', () => {
      const claudeResponse = `
**BOTTOMS:**
Navy Trousers: COMPATIBLE

**FOOTWEAR:**
Brown Boots: COMPATIBLE

**ACCESSORIES:**
Leather Belt: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);

      expect(result).toEqual({
        bottom: [expect.objectContaining({ name: 'Navy Trousers', compatibilityTypes: ['complementing'] })],
        footwear: [expect.objectContaining({ name: 'Brown Boots', compatibilityTypes: ['complementing'] })],
        accessory: [expect.objectContaining({ name: 'Leather Belt', compatibilityTypes: ['complementing'] })]
      });
    });

    it('should only include compatible items', () => {
      const claudeResponse = `
**BOTTOMS:**
Navy Trousers: COMPATIBLE
Black Jeans: COMPATIBLE

**FOOTWEAR:**
Brown Boots: NOT_COMPATIBLE

**ACCESSORIES:**
Belt: NOT_COMPATIBLE

**OUTERWEAR:**
Blazer: COMPATIBLE
      `;
      
      const mockStylingContext = [
        { id: '1', name: 'Navy Trousers', category: 'bottom' },
        { id: '2', name: 'Black Jeans', category: 'bottom' },
        { id: '3', name: 'Brown Boots', category: 'footwear' },
        { id: '4', name: 'Belt', category: 'accessory' },
        { id: '5', name: 'Blazer', category: 'outerwear' }
      ];
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result).toEqual({
        bottom: expect.arrayContaining([
          expect.objectContaining({ name: 'Navy Trousers', compatibilityTypes: ['complementing'] }),
          expect.objectContaining({ name: 'Black Jeans', compatibilityTypes: ['complementing'] })
        ]),
        outerwear: [
          expect.objectContaining({ name: 'Blazer', compatibilityTypes: ['complementing'] })
        ]
      });
      
      // Should not include NOT_COMPATIBLE items
      expect(result.footwear).toBeUndefined();
      expect(result.accessory).toBeUndefined();
    });

    it('should handle response without compatibility section', () => {
      const claudeResponse = `
        These items don't work well together.
        The colors clash and the styles are incompatible.
      `;
      
      const mockStylingContext = [
        { id: '1', name: 'Test Item', category: 'top' }
      ];
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result).toEqual({});
    });

    it('should handle malformed response gracefully', () => {
      const claudeResponse = `
        **ANALYSIS:**
        invalid format here
        bottoms without colon
        : empty category name
        Valid Item: COMPATIBLE
      `;
      
      const mockStylingContext = [
        { id: '1', name: 'Valid Item', category: 'top' }
      ];
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result).toEqual({
        top: [expect.objectContaining({ name: 'Valid Item', compatibilityTypes: ['complementing'] })]
      });
    });

    it('should return empty object on parsing error', () => {
      const mockStylingContext = [
        { id: '1', name: 'Test Item', category: 'top' }
      ];
      
      expect(parseCompatibilityResponse(null, mockStylingContext)).toEqual({});
      expect(parseCompatibilityResponse(undefined, mockStylingContext)).toEqual({});
      expect(parseCompatibilityResponse('', mockStylingContext)).toEqual({});
    });
  });

  describe('parseCompatibilityResponse with styling context (Card Functionality)', () => {
    const mockStylingContext = [
      {
        id: '123',
        name: 'Brown Leather Boots',
        imageUrl: '/uploads/brown-boots.jpg',
        category: 'footwear',
        subcategory: 'boots',
        color: 'brown',
        brand: 'Nike',
        season: ['fall', 'winter']
      },
      {
        id: '456', 
        name: 'Navy Cotton Trousers',
        imageUrl: '/uploads/navy-trousers.jpg',
        category: 'bottoms',
        subcategory: 'trousers',
        color: 'navy',
        brand: 'Zara',
        season: ['all']
      },
      {
        id: '789',
        name: 'Brown Leather Belt',
        imageUrl: '/uploads/brown-belt.jpg',
        category: 'accessories',
        subcategory: 'belt', 
        color: 'brown',
        brand: 'Gucci',
        season: ['all']
      }
    ];

    it('should return full item objects when styling context matches Claude response', () => {
      const claudeResponse = `
        Here's my detailed analysis of the compatibility...
        
        **BOTTOMS:**
        Navy Cotton Trousers: COMPATIBLE
        
        **FOOTWEAR:**
        Brown Leather Boots: COMPATIBLE
        
        **ACCESSORIES:**
        Brown Leather Belt: COMPATIBLE
        
        These items work beautifully together...
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result).toEqual({
        bottoms: [expect.objectContaining({
          id: '456',
          name: 'Navy Cotton Trousers',
          imageUrl: '/uploads/navy-trousers.jpg',
          category: 'bottoms',
          color: 'navy',
          compatibilityTypes: ['complementing']
        })],
        footwear: [expect.objectContaining({
          id: '123',
          name: 'Brown Leather Boots',
          imageUrl: '/uploads/brown-boots.jpg',
          category: 'footwear',
          color: 'brown',
          compatibilityTypes: ['complementing']
        })],
        accessories: [expect.objectContaining({
          id: '789',
          name: 'Brown Leather Belt',
          imageUrl: '/uploads/brown-belt.jpg',
          category: 'accessories',
          color: 'brown',
          compatibilityTypes: ['complementing']
        })]
      });
    });

    it('should handle partial name matching (Claude says "Brown Boots", item is "Brown Leather Boots")', () => {
      const claudeResponse = `
        **FOOTWEAR:**
        Brown Boots: COMPATIBLE
      `;

      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result.footwear).toHaveLength(1);
      expect(result.footwear[0]).toEqual(expect.objectContaining({
        id: '123',
        name: 'Brown Leather Boots',
        compatibilityTypes: ['complementing']
      }));
    });

    it('should return empty object with empty styling context', () => {
      const claudeResponse = `
        Navy Trousers: COMPATIBLE
        Brown Boots: COMPATIBLE
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, []);
      
      // With no styling context, should return empty object (correct behavior)
      expect(result).toEqual({});
    });

    it('should return empty object when no styling context provided', () => {
      const claudeResponse = `
        Brown Boots: COMPATIBLE
      `;
      
      const result = parseCompatibilityResponse(claudeResponse); // No second parameter
      
      // With no styling context, should return empty object
      expect(result).toEqual({});
    });
  });
});
