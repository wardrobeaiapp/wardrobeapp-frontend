/**
 * Unit tests for outerwearCompatibilityPrompt.js
 */

const {
  isItemSuitableForOuterwear,
  getOuterwearItemsFromContext,
  buildOuterwearCompatibilityPrompt,
  parseOuterwearCompatibilityResponse
} = require('../outerwearCompatibilityPrompt');

describe('outerwearCompatibilityPrompt', () => {
  
  describe('isItemSuitableForOuterwear', () => {
    it('should return true for top items', () => {
      const itemData = { category: 'top', subcategory: 'blouse' };
      expect(isItemSuitableForOuterwear(itemData, {})).toBe(true);
    });

    it('should return true for bottom items', () => {
      const itemData = { category: 'bottom', subcategory: 'jeans' };
      expect(isItemSuitableForOuterwear(itemData, {})).toBe(true);
    });

    it('should return true for one_piece items', () => {
      const itemData = { category: 'one_piece', subcategory: 'dress' };
      expect(isItemSuitableForOuterwear(itemData, {})).toBe(true);
    });

    it('should return false for heavy outerwear items', () => {
      const heavyOuterwearItems = [
        { category: 'outerwear', subcategory: 'coat' },
        { category: 'outerwear', subcategory: 'puffer' },
        { category: 'outerwear', subcategory: 'parka' },
        { category: 'outerwear', subcategory: 'trench' }
      ];

      heavyOuterwearItems.forEach(itemData => {
        expect(isItemSuitableForOuterwear(itemData, {})).toBe(false);
      });
    });

    it('should return true for light outerwear items', () => {
      const itemData = { category: 'outerwear', subcategory: 'cardigan' };
      expect(isItemSuitableForOuterwear(itemData, {})).toBe(true);
    });

    it('should return false for other category misc items', () => {
      const itemData = { category: 'other', subcategory: 'misc' };
      expect(isItemSuitableForOuterwear(itemData, {})).toBe(false);
    });

    it('should return true for other category non-misc items', () => {
      const itemData = { category: 'other', subcategory: 'belt' };
      expect(isItemSuitableForOuterwear(itemData, {})).toBe(true);
    });

    it('should handle case insensitive categories', () => {
      const itemData = { category: 'OUTERWEAR', subcategory: 'COAT' };
      expect(isItemSuitableForOuterwear(itemData, {})).toBe(false);
    });

    it('should handle missing subcategory', () => {
      const itemData = { category: 'top' };
      expect(isItemSuitableForOuterwear(itemData, {})).toBe(true);
    });
  });

  describe('getOuterwearItemsFromContext', () => {
    const mockStylingContext = [
      { name: 'Navy Cardigan', category: 'outerwear', subcategory: 'cardigan' },
      { name: 'Winter Coat', category: 'outerwear', subcategory: 'coat' },
      { name: 'Blue Jeans', category: 'bottom', subcategory: 'jeans' },
      { name: 'White Blouse', category: 'top', subcategory: 'blouse' },
      { name: 'Denim Jacket', category: 'outerwear', subcategory: 'jacket' }
    ];

    it('should filter only outerwear items', () => {
      const result = getOuterwearItemsFromContext(mockStylingContext, 'top');
      
      expect(result).toHaveLength(3);
      expect(result.map(item => item.name)).toEqual([
        'Navy Cardigan', 
        'Winter Coat', 
        'Denim Jacket'
      ]);
    });

    it('should handle empty styling context', () => {
      const result = getOuterwearItemsFromContext([], 'top');
      expect(result).toEqual([]);
    });

    it('should handle null styling context', () => {
      const result = getOuterwearItemsFromContext(null, 'top');
      expect(result).toEqual([]);
    });

    it('should handle styling context with no outerwear', () => {
      const noOuterwearContext = [
        { name: 'Blue Jeans', category: 'bottom', subcategory: 'jeans' },
        { name: 'White Blouse', category: 'top', subcategory: 'blouse' }
      ];
      
      const result = getOuterwearItemsFromContext(noOuterwearContext, 'top');
      expect(result).toEqual([]);
    });

    it('should handle case insensitive category matching', () => {
      const mixedCaseContext = [
        { name: 'Navy Cardigan', category: 'OUTERWEAR', subcategory: 'cardigan' },
        { name: 'Winter Coat', category: 'Outerwear', subcategory: 'coat' }
      ];
      
      const result = getOuterwearItemsFromContext(mixedCaseContext, 'top');
      expect(result).toHaveLength(2);
    });
  });

  describe('buildOuterwearCompatibilityPrompt', () => {
    const mockItemData = {
      name: 'Floral Dress',
      category: 'one_piece',
      subcategory: 'dress',
      color: 'blue',
      seasons: ['summer', 'spring/fall'],
      pattern: 'floral',
      fit: 'fitted',
      sleeve: 'short'
    };

    const mockOuterwearItems = [
      {
        name: 'Navy Cardigan',
        category: 'outerwear',
        subcategory: 'cardigan',
        color: 'navy',
        season: ['spring/fall', 'winter']
      },
      {
        name: 'Denim Jacket',
        category: 'outerwear', 
        subcategory: 'jacket',
        color: 'blue',
        season: ['spring/fall']
      }
    ];

    it('should build a complete outerwear compatibility prompt', () => {
      const prompt = buildOuterwearCompatibilityPrompt(mockItemData, mockOuterwearItems);
      
      expect(prompt).toContain('OUTERWEAR COMPATIBILITY CHECK');
      expect(prompt).toContain('CURRENT ITEM DETAILS');
      expect(prompt).toContain('OUTERWEAR ITEMS TO EVALUATE');
      expect(prompt).toContain('ANALYSIS INSTRUCTIONS');
      expect(prompt).toContain('RESPONSE FORMAT');
      expect(prompt).toContain('COMPATIBLE OUTERWEAR ITEMS');
    });

    it('should include current item details in prompt', () => {
      const prompt = buildOuterwearCompatibilityPrompt(mockItemData, mockOuterwearItems);
      
      expect(prompt).toContain('Name: Floral Dress');
      expect(prompt).toContain('Category: one_piece');
      expect(prompt).toContain('Subcategory: dress');
      expect(prompt).toContain('Color: blue');
      expect(prompt).toContain('Seasons: summer, spring/fall');
      expect(prompt).toContain('Pattern: floral');
      expect(prompt).toContain('Fit: fitted');
      expect(prompt).toContain('Sleeves: short');
    });

    it('should include outerwear items to evaluate', () => {
      const prompt = buildOuterwearCompatibilityPrompt(mockItemData, mockOuterwearItems);
      
      expect(prompt).toContain('Navy Cardigan - navy (cardigan, spring/fall/winter)');
      expect(prompt).toContain('Denim Jacket - blue (jacket, spring/fall)');
      expect(prompt).toContain('**OUTERWEAR** (2 items)');
    });

    it('should include analysis instructions', () => {
      const prompt = buildOuterwearCompatibilityPrompt(mockItemData, mockOuterwearItems);
      
      expect(prompt).toContain('PRIMARY: Find outerwear items that would LOOK GOOD and STYLE WELL');
      expect(prompt).toContain('Consider color coordination, style harmony');
      expect(prompt).toContain('Consider seasonal appropriateness');
      expect(prompt).toContain('SECONDARY: Avoid physical incompatibilities');
    });

    it('should include comprehensive requirements in response format', () => {
      const prompt = buildOuterwearCompatibilityPrompt(mockItemData, mockOuterwearItems);
      
      expect(prompt).toContain('Provide ALL good recommendations');
      expect(prompt).toContain('evaluate EVERY SINGLE outerwear item');
      expect(prompt).toContain('Recommend ALL items that work well');
      expect(prompt).toContain('If NO items work well, write "outerwear: none"');
      expect(prompt).toContain('Do NOT give "a few good options" - give ALL good options');
    });

    it('should return empty string for no outerwear items', () => {
      const prompt = buildOuterwearCompatibilityPrompt(mockItemData, []);
      expect(prompt).toBe('');
    });

    it('should return empty string for null outerwear items', () => {
      const prompt = buildOuterwearCompatibilityPrompt(mockItemData, null);
      expect(prompt).toBe('');
    });

    it('should handle item data with missing fields', () => {
      const minimalItemData = {
        name: 'Simple Dress',
        category: 'one_piece'
      };
      
      const prompt = buildOuterwearCompatibilityPrompt(minimalItemData, mockOuterwearItems);
      
      expect(prompt).toContain('Name: Simple Dress');
      expect(prompt).toContain('Category: one_piece');
      expect(prompt).not.toContain('Subcategory:');
      expect(prompt).not.toContain('Color:');
    });

    it('should handle outerwear items with missing season data', () => {
      const outerwearWithoutSeason = [
        {
          name: 'Basic Cardigan',
          category: 'outerwear',
          subcategory: 'cardigan',
          color: 'gray'
          // no season field
        }
      ];
      
      const prompt = buildOuterwearCompatibilityPrompt(mockItemData, outerwearWithoutSeason);
      expect(prompt).toContain('Basic Cardigan - gray (cardigan)');
      expect(prompt).not.toContain('Basic Cardigan - gray (cardigan,');
    });
  });

  describe('parseOuterwearCompatibilityResponse', () => {
    it('should parse a response with compatible outerwear items', () => {
      const claudeResponse = `
COMPATIBLE OUTERWEAR ITEMS:
outerwear: Navy Cardigan, Denim Jacket, Light Blazer

Each item evaluation:
- Navy Cardigan: COMPATIBLE (colors work well together, appropriate for season)
- Denim Jacket: COMPATIBLE (classic pairing, good fit compatibility) 
- Light Blazer: COMPATIBLE (elevates the look while maintaining comfort)
- Winter Coat: EXCLUDED (too heavy for the dress style and season)
      `;
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        outerwear: ['Navy Cardigan', 'Denim Jacket', 'Light Blazer']
      });
    });

    it('should parse a response with no compatible items', () => {
      const claudeResponse = `
COMPATIBLE OUTERWEAR ITEMS:
outerwear: none

All outerwear items were excluded due to seasonal mismatches and style conflicts.
      `;
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      expect(result).toEqual({});
    });

    it('should handle response with single compatible item', () => {
      const claudeResponse = `
COMPATIBLE OUTERWEAR ITEMS:
outerwear: Navy Cardigan

Only the Navy Cardigan works well with this item.
      `;
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        outerwear: ['Navy Cardigan']
      });
    });

    it('should handle response with extra whitespace', () => {
      const claudeResponse = `
COMPATIBLE OUTERWEAR ITEMS:
outerwear:    Navy Cardigan  ,   Denim Jacket   ,  Light Blazer   

Evaluation details follow...
      `;
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        outerwear: ['Navy Cardigan', 'Denim Jacket', 'Light Blazer']
      });
    });

    it('should stop parsing at explanatory text', () => {
      const claudeResponse = `
COMPATIBLE OUTERWEAR ITEMS:
outerwear: Navy Cardigan, Denim Jacket

INCOMPATIBILITIES FOUND:
The winter coat was excluded because...
      `;
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        outerwear: ['Navy Cardigan', 'Denim Jacket']
      });
    });

    it('should handle malformed response gracefully', () => {
      const claudeResponse = `
Some random response without the expected format.
No compatible items section found.
      `;
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      expect(result).toEqual({});
    });

    it('should handle empty response', () => {
      const claudeResponse = '';
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      expect(result).toEqual({});
    });

    it('should handle response with alternative "none" variations', () => {
      const responses = [
        'COMPATIBLE OUTERWEAR ITEMS:\nouterwear: none',
        'COMPATIBLE OUTERWEAR ITEMS:\nouterwear: None',
        'COMPATIBLE OUTERWEAR ITEMS:\nouterwear: NONE',
        'COMPATIBLE OUTERWEAR ITEMS:\nouterwear: -',
        'COMPATIBLE OUTERWEAR ITEMS:\nouterwear: no items'
      ];
      
      responses.forEach(response => {
        const result = parseOuterwearCompatibilityResponse(response);
        expect(result).toEqual({});
      });
    });

    it('should handle response with mixed case category', () => {
      const claudeResponse = `
COMPATIBLE OUTERWEAR ITEMS:
OUTERWEAR: Navy Cardigan, Denim Jacket
      `;
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        outerwear: ['Navy Cardigan', 'Denim Jacket']
      });
    });

    it('should filter out empty items after splitting', () => {
      const claudeResponse = `
COMPATIBLE OUTERWEAR ITEMS:
outerwear: Navy Cardigan, , Denim Jacket, ,
      `;
      
      const result = parseOuterwearCompatibilityResponse(claudeResponse);
      
      expect(result).toEqual({
        outerwear: ['Navy Cardigan', 'Denim Jacket']
      });
    });

    describe('parseOuterwearCompatibilityResponse with styling context (Card Functionality)', () => {
      const mockStylingContext = [
        {
          id: '201',
          name: 'Brown Trench Coat',
          imageUrl: '/uploads/brown-trench.jpg',
          category: 'outerwear',
          subcategory: 'coat',
          color: 'brown',
          brand: 'Burberry',
          season: ['fall', 'winter']
        },
        {
          id: '202', 
          name: 'Black Leather Jacket',
          imageUrl: '/uploads/black-jacket.jpg',
          category: 'outerwear',
          subcategory: 'jacket',
          color: 'black',
          brand: 'Zara',
          season: ['fall', 'spring']
        },
        {
          id: '203',
          name: 'Navy Wool Blazer',
          imageUrl: '/uploads/navy-blazer.jpg',
          category: 'outerwear',
          subcategory: 'blazer', 
          color: 'navy',
          brand: 'Hugo Boss',
          season: ['all']
        }
      ];

      it('should return full item objects for outerwear compatibility with styling context', () => {
        const claudeResponse = `
          Here's my outerwear compatibility analysis...

          COMPATIBLE OUTERWEAR ITEMS:
          outerwear: Brown Trench Coat, Black Leather Jacket, Navy Wool Blazer
          
          These outerwear pieces work well...
        `;
        
        const result = parseOuterwearCompatibilityResponse(claudeResponse, mockStylingContext);
        
        expect(result).toEqual({
          outerwear: [
            expect.objectContaining({
              id: '201',
              name: 'Brown Trench Coat',
              imageUrl: '/uploads/brown-trench.jpg',
              category: 'outerwear',
              color: 'brown',
              compatibilityTypes: ['outerwear']
            }),
            expect.objectContaining({
              id: '202',
              name: 'Black Leather Jacket',
              imageUrl: '/uploads/black-jacket.jpg',
              category: 'outerwear',
              color: 'black',
              compatibilityTypes: ['outerwear']
            }),
            expect.objectContaining({
              id: '203',
              name: 'Navy Wool Blazer',
              imageUrl: '/uploads/navy-blazer.jpg',
              category: 'outerwear',
              color: 'navy',
              compatibilityTypes: ['outerwear']
            })
          ]
        });
      });

      it('should handle partial name matching for outerwear items', () => {
        const claudeResponse = `
          COMPATIBLE OUTERWEAR ITEMS:
          outerwear: Brown Trench, Navy Blazer
        `;
        
        const result = parseOuterwearCompatibilityResponse(claudeResponse, mockStylingContext);
        
        expect(result.outerwear).toHaveLength(2);
        expect(result.outerwear[0]).toEqual(expect.objectContaining({
          id: '201',
          name: 'Brown Trench Coat',
          compatibilityTypes: ['outerwear']
        }));
        
        expect(result.outerwear[1]).toEqual(expect.objectContaining({
          id: '203', 
          name: 'Navy Wool Blazer',
          compatibilityTypes: ['outerwear']
        }));
      });

      it('should fallback to text-only for outerwear when no match found', () => {
        const claudeResponse = `
          COMPATIBLE OUTERWEAR ITEMS:
          outerwear: Red Winter Coat, Green Windbreaker
        `;
        
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        
        const result = parseOuterwearCompatibilityResponse(claudeResponse, mockStylingContext);
        
        expect(result).toEqual({
          outerwear: [
            { name: 'Red Winter Coat', compatibilityTypes: ['outerwear'] },
            { name: 'Green Windbreaker', compatibilityTypes: ['outerwear'] }
          ]
        });
        
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No matching item found for: Red Winter Coat'));
        
        consoleSpy.mockRestore();
      });

      it('should maintain backward compatibility for outerwear when no styling context provided', () => {
        const claudeResponse = `
          COMPATIBLE OUTERWEAR ITEMS:
          outerwear: Navy Cardigan, Denim Jacket
        `;
        
        const result = parseOuterwearCompatibilityResponse(claudeResponse); // No second parameter
        
        expect(result).toEqual({
          outerwear: [
            { name: 'Navy Cardigan', compatibilityTypes: ['outerwear'] },
            { name: 'Denim Jacket', compatibilityTypes: ['outerwear'] }
          ]
        });
      });
    });
  });
});
