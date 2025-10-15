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
        bottoms: [
          { name: 'Navy Trousers', compatibilityTypes: ['complementing'] },
          { name: 'Black Jeans', compatibilityTypes: ['complementing'] },
          { name: 'Gray Slacks', compatibilityTypes: ['complementing'] }
        ],
        footwear: [
          { name: 'Brown Boots', compatibilityTypes: ['complementing'] },
          { name: 'Black Heels', compatibilityTypes: ['complementing'] }
        ],
        accessories: [
          { name: 'Leather Belt', compatibilityTypes: ['complementing'] },
          { name: 'Gold Watch', compatibilityTypes: ['complementing'] }
        ]
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
        bottoms: [{ name: 'Navy Trousers', compatibilityTypes: ['complementing'] }],
        footwear: [{ name: 'Brown Boots', compatibilityTypes: ['complementing'] }],
        accessories: [{ name: 'Leather Belt', compatibilityTypes: ['complementing'] }]
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
        bottoms: [
          { name: 'Navy Trousers', compatibilityTypes: ['complementing'] },
          { name: 'Black Jeans', compatibilityTypes: ['complementing'] }
        ],
        outerwear: [
          { name: 'Blazer', compatibilityTypes: ['complementing'] }
        ]
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
        bottoms: [{ name: 'Navy Trousers', compatibilityTypes: ['complementing'] }],
        footwear: [{ name: 'Brown Boots', compatibilityTypes: ['complementing'] }],
        accessories: [{ name: 'Leather Belt', compatibilityTypes: ['complementing'] }]
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
        bottoms: [{ name: 'Valid Item', compatibilityTypes: ['complementing'] }]
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
        bottoms: [
          { name: 'Navy Trousers', compatibilityTypes: ['complementing'] },
          { name: 'Black Jeans', compatibilityTypes: ['complementing'] },
          { name: 'Gray Slacks', compatibilityTypes: ['complementing'] }
        ],
        footwear: [
          { name: 'Brown Boots', compatibilityTypes: ['complementing'] }
        ]
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
        bottoms: [
          { name: 'Navy Trousers', compatibilityTypes: ['complementing'] },
          { name: 'Black Jeans', compatibilityTypes: ['complementing'] }
        ],
        footwear: [
          { name: 'Brown Boots', compatibilityTypes: ['complementing'] }
        ]
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
        Here's my analysis of the compatibility...

        COMPATIBLE COMPLEMENTING ITEMS:
        bottoms: Navy Cotton Trousers
        footwear: Brown Leather Boots
        accessories: Brown Leather Belt
        
        These items work well together because...
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
        COMPATIBLE COMPLEMENTING ITEMS:
        footwear: Brown Boots
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result.footwear).toHaveLength(1);
      expect(result.footwear[0]).toEqual(expect.objectContaining({
        id: '123',
        name: 'Brown Leather Boots',
        compatibilityTypes: ['complementing']
      }));
    });

    it('should fallback to text-only objects when no match found in styling context', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        footwear: Pink High Heels
        bottoms: White Shorts
      `;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result).toEqual({
        footwear: [expect.objectContaining({
          name: 'Pink High Heels',
          compatibilityTypes: ['complementing']
          // Should NOT have id, imageUrl, etc.
        })],
        bottoms: [expect.objectContaining({
          name: 'White Shorts',
          compatibilityTypes: ['complementing']
        })]
      });
      
      // Should log warnings for no matches found
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No matching item found for: "Pink High Heels"'));
      
      consoleSpy.mockRestore();
    });

    it('should handle mixed results - some matches, some fallbacks', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        footwear: Brown Boots, Pink Sneakers
        bottoms: Navy Cotton Trousers
      `;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result.footwear).toHaveLength(2);
      
      // First item should have full object (matched)
      expect(result.footwear[0]).toEqual(expect.objectContaining({
        id: '123',
        name: 'Brown Leather Boots',
        imageUrl: '/uploads/brown-boots.jpg'
      }));
      
      // Second item should be text-only (no match)
      expect(result.footwear[1]).toEqual({
        name: 'Pink Sneakers',
        compatibilityTypes: ['complementing']
      });
      
      // Bottoms should have full object (matched)
      expect(result.bottoms[0]).toEqual(expect.objectContaining({
        id: '456',
        name: 'Navy Cotton Trousers'
      }));
      
      consoleSpy.mockRestore();
    });

    it('should work with empty styling context (fallback to text-only)', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        bottoms: Navy Trousers
        footwear: Brown Boots
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, []);
      
      expect(result).toEqual({
        bottoms: [{ name: 'Navy Trousers', compatibilityTypes: ['complementing'] }],
        footwear: [{ name: 'Brown Boots', compatibilityTypes: ['complementing'] }]
      });
    });

    it('should maintain backward compatibility when no styling context provided', () => {
      const claudeResponse = `
        COMPATIBLE COMPLEMENTING ITEMS:
        bottoms: Navy Trousers
        footwear: Brown Boots
      `;
      
      const result = parseCompatibilityResponse(claudeResponse); // No second parameter
      
      expect(result).toEqual({
        bottoms: [{ name: 'Navy Trousers', compatibilityTypes: ['complementing'] }],
        footwear: [{ name: 'Brown Boots', compatibilityTypes: ['complementing'] }]
      });
    });
  });

  describe('parseCompatibilityResponse - Fallback Parsing (New Functionality)', () => {
    const mockStylingContext = [
      {
        id: '123',
        name: 'Brown Cardigan',
        imageUrl: '/uploads/brown-cardigan.jpg',
        category: 'top',
        subcategory: 'cardigan',
        color: 'brown'
      },
      {
        id: '456', 
        name: 'Burgundy Sweater',
        imageUrl: '/uploads/burgundy-sweater.jpg',
        category: 'top',
        subcategory: 'sweater',
        color: 'burgundy'
      },
      {
        id: '789',
        name: 'Black Jacket',
        imageUrl: '/uploads/black-jacket.jpg',
        category: 'top',
        subcategory: 'jacket',
        color: 'black'
      },
      {
        id: '999',
        name: 'Pink Shirt',
        imageUrl: '/uploads/pink-shirt.jpg',
        category: 'top',
        subcategory: 'shirt',
        color: 'pink'
      }
    ];

    it('should use fallback parsing when final summary section is missing', () => {
      // Mock console methods to avoid noise during testing
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const claudeResponse = `
        Here's my analysis of the compatibility...
        
        COMPATIBILITY ANALYSIS:
        
        **TOPS:**
        Brown Cardigan: COMPATIBLE - The brown color of the cardigan complements the brown color of the heels well, creating a cohesive and harmonious look.
        Burgundy Sweater: COMPATIBLE - The burgundy color of the sweater works nicely with the brown heels, providing a rich and elegant color combination.
        Black Jacket: COMPATIBLE - The black jacket can create a chic, monochromatic look when paired with the brown heels.
        Pink Shirt: EXCLUDED - The pink color of the shirt clashes with the brown heels, creating a disharmonious color combination.
        
        These are my recommendations based on style harmony and color coordination.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      // Should have extracted compatible items using fallback parsing
      expect(result).toEqual({
        top: [
          expect.objectContaining({
            id: '123',
            name: 'Brown Cardigan',
            compatibilityTypes: ['complementing']
          }),
          expect.objectContaining({
            id: '456',
            name: 'Burgundy Sweater',
            compatibilityTypes: ['complementing']
          }),
          expect.objectContaining({
            id: '789',
            name: 'Black Jacket',
            compatibilityTypes: ['complementing']
          })
        ]
      });
      
      // Pink Shirt should be excluded (not in results)
      const allItemNames = result.tops?.map(item => item.name) || [];
      expect(allItemNames).not.toContain('Pink Shirt');
      
      // Should log fallback usage
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[DEBUG] Trying fallback: extracting from detailed analysis...'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[FALLBACK] Extracting from detailed analysis section...'));
      
      consoleLogSpy.mockRestore();
    });

    it('should handle fallback parsing with multiple categories', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const extendedStylingContext = [
        ...mockStylingContext,
        {
          id: '111',
          name: 'Navy Trousers',
          category: 'bottom',
          color: 'navy'
        },
        {
          id: '222',
          name: 'Brown Boots',
          category: 'footwear',
          color: 'brown'
        }
      ];
      
      const claudeResponse = `
        COMPATIBILITY ANALYSIS:
        
        **TOPS:**
        Brown Cardigan: COMPATIBLE - Great color harmony with brown heels.
        
        **BOTTOMS:**
        Navy Trousers: COMPATIBLE - Navy works well with brown for a classic look.
        
        **FOOTWEAR:**
        Brown Boots: COMPATIBLE - Tone-on-tone brown creates cohesive styling.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, extendedStylingContext);
      
      expect(result).toEqual({
        top: [expect.objectContaining({
          id: '123',
          name: 'Brown Cardigan',
          compatibilityTypes: ['complementing']
        })],
        bottom: [expect.objectContaining({
          id: '111', 
          name: 'Navy Trousers',
          compatibilityTypes: ['complementing']
        })],
        footwear: [expect.objectContaining({
          id: '222',
          name: 'Brown Boots', 
          compatibilityTypes: ['complementing']
        })]
      });
      
      consoleLogSpy.mockRestore();
    });

    it('should handle fallback parsing when detailed analysis section is also missing', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const claudeResponse = `
        I cannot provide compatibility analysis for this item.
        The styles are too different to work together.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result).toEqual({});
      
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[FALLBACK] No detailed analysis section found'));
      
      consoleLogSpy.mockRestore();
    });

    it('should handle fallback parsing with partial name matching', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const claudeResponse = `
        COMPATIBILITY ANALYSIS:
        
        **TOPS:**
        Brown Cardigan: COMPATIBLE - Excellent color coordination.
        Burgundy: COMPATIBLE - Rich color works well.
        Black: COMPATIBLE - Classic and versatile.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result.top).toHaveLength(3);
      
      // Should match full names from context
      const itemNames = result.top.map(item => item.name);
      expect(itemNames).toContain('Brown Cardigan');
      expect(itemNames).toContain('Burgundy Sweater'); // Partial match: "Burgundy" -> "Burgundy Sweater"
      expect(itemNames).toContain('Black Jacket'); // Partial match: "Black" -> "Black Jacket"
      
      consoleLogSpy.mockRestore();
    });

    it('should handle fallback parsing with mixed compatible and excluded items', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const claudeResponse = `
        COMPATIBILITY ANALYSIS:
        
        **TOPS:**
        Brown Cardigan: COMPATIBLE - Perfect color match.
        Burgundy Sweater: EXCLUDED - Too formal for this casual item.
        Black Jacket: COMPATIBLE - Versatile and works well.
        Pink Shirt: EXCLUDED - Color clash issues.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      expect(result.top).toHaveLength(2);
      
      const itemNames = result.top.map(item => item.name);
      expect(itemNames).toContain('Brown Cardigan');
      expect(itemNames).toContain('Black Jacket');
      expect(itemNames).not.toContain('Burgundy Sweater');
      expect(itemNames).not.toContain('Pink Shirt');
      
      // Should log excluded items
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[FALLBACK] Excluded item: Burgundy Sweater'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[FALLBACK] Excluded item: Pink Shirt'));
      
      consoleLogSpy.mockRestore();
    });

    it('should handle fallback parsing when no matches found in styling context', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const claudeResponse = `
        COMPATIBILITY ANALYSIS:
        
        **TOPS:**
        Red Blouse: COMPATIBLE - Beautiful color combination.
        Green Sweater: COMPATIBLE - Nature-inspired pairing.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      // Should return empty since no items matched
      expect(result).toEqual({});
      
      // Should log warnings for items not found
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[FALLBACK] No matching item found for: "Red Blouse"'));
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[FALLBACK] No matching item found for: "Green Sweater"'));
      
      consoleLogSpy.mockRestore();
    });

    it('should handle fallback parsing with malformed analysis sections gracefully', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const claudeResponse = `
        COMPATIBILITY ANALYSIS:
        
        **TOPS:**
        Brown Cardigan - Missing colon separator
        : Missing item name
        Burgundy Sweater: COMPATIBLE - This should work.
        
        **INVALID_CATEGORY:**
        Some Item: COMPATIBLE - Should be ignored.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      // Should only extract the properly formatted item
      expect(result.top).toHaveLength(1);
      expect(result.top[0].name).toBe('Burgundy Sweater');
      
      // Should not have invalid category
      expect(result.invalid_category).toBeUndefined();
      
      consoleLogSpy.mockRestore();
    });

    it('should prioritize normal parsing over fallback when both sections exist', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const claudeResponse = `
        COMPATIBILITY ANALYSIS:
        
        **TOPS:**
        Brown Cardigan: COMPATIBLE - From detailed analysis.
        Burgundy Sweater: COMPATIBLE - From detailed analysis.
        
        COMPATIBLE COMPLEMENTING ITEMS:
        tops: Black Jacket
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      // Should use normal parsing (final summary), not fallback
      expect(result.tops).toHaveLength(1);
      expect(result.tops[0].name).toBe('Black Jacket');
      
      // Should not have used fallback
      expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('[FALLBACK]'));
      
      consoleLogSpy.mockRestore();
    });

    it('should handle edge case: fallback with empty category names gracefully', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      const claudeResponse = `
        COMPATIBILITY ANALYSIS:
        
        ****:
        Some Item: COMPATIBLE - Empty category name.
        
        **TOPS:**
        Brown Cardigan: COMPATIBLE - This should work.
      `;
      
      const result = parseCompatibilityResponse(claudeResponse, mockStylingContext);
      
      // Should only extract valid categories and ignore empty category names
      expect(result.top).toHaveLength(1);
      expect(result.top[0].name).toBe('Brown Cardigan');
      
      // Should not create category with empty name
      expect(result['']).toBeUndefined();
      
      consoleLogSpy.mockRestore();
    });
  });
});
