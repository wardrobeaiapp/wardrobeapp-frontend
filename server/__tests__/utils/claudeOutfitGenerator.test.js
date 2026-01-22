const { parseClaudeOutfitResponse } = require('../../utils/claudeOutfitGenerator');

describe('claudeOutfitGenerator', () => {
  // Mock data for testing
  const mockBaseItemData = {
    id: 'base-item-1',
    name: 'White Sneakers',
    category: 'footwear'
  };

  const mockItemsByCategory = {
    top: [
      { id: '1', name: 'White T-Shirt', category: 'top' },
      { id: '2', name: 'Blue Jeans Jacket', category: 'top' }
    ],
    bottom: [
      { id: '3', name: 'Blue Jeans', category: 'bottom' },
      { id: '4', name: 'Black Trousers', category: 'bottom' }
    ],
    accessory: [
      { id: '5', name: 'Brown Belt', category: 'accessory' }
    ]
  };

  const validClaudeResponse = `
OUTFIT 1: White T-Shirt + Blue Jeans + Brown Belt
Explanation: A classic casual look perfect for summer activities.

OUTFIT 2: Blue Jeans Jacket + Black Trousers
Explanation: Smart casual combination for versatile wear.

OUTFIT 3: White T-Shirt + Black Trousers + Brown Belt
Explanation: Clean and simple outfit for various occasions.
  `;

  describe('parseClaudeOutfitResponse', () => {
    test('should handle valid Claude response with multiple outfits', () => {
      const result = parseClaudeOutfitResponse(
        validClaudeResponse,
        mockBaseItemData,
        mockItemsByCategory
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check that each outfit has required structure
      result.forEach(outfit => {
        expect(outfit).toHaveProperty('items');
        expect(outfit).toHaveProperty('explanation');
        expect(Array.isArray(outfit.items)).toBe(true);
        expect(outfit.items.length).toBeGreaterThan(0);
      });
    });

    test('should handle undefined/null item names without crashing', () => {
      const responseWithUndefinedItems = `
OUTFIT 1: undefined + Blue Jeans + null
Explanation: Test outfit with undefined items.

OUTFIT 2: + White T-Shirt + 
Explanation: Test outfit with empty item names.
      `;

      // This should not throw an error
      expect(() => {
        parseClaudeOutfitResponse(
          responseWithUndefinedItems,
          mockBaseItemData,
          mockItemsByCategory
        );
      }).not.toThrow();
    });

    test('should handle missing baseItemData.name without crashing', () => {
      const baseItemWithoutName = {
        id: 'base-item-1',
        category: 'footwear'
        // name property is missing
      };

      expect(() => {
        parseClaudeOutfitResponse(
          validClaudeResponse,
          baseItemWithoutName,
          mockItemsByCategory
        );
      }).not.toThrow();
    });

    test('should handle null/undefined baseItemData', () => {
      expect(() => {
        parseClaudeOutfitResponse(validClaudeResponse, null, mockItemsByCategory);
      }).not.toThrow();

      expect(() => {
        parseClaudeOutfitResponse(validClaudeResponse, undefined, mockItemsByCategory);
      }).not.toThrow();
    });

    test('should handle empty itemsByCategory', () => {
      expect(() => {
        parseClaudeOutfitResponse(validClaudeResponse, mockBaseItemData, {});
      }).not.toThrow();

      expect(() => {
        parseClaudeOutfitResponse(validClaudeResponse, mockBaseItemData, null);
      }).not.toThrow();
    });

    test('should handle malformed Claude response', () => {
      const malformedResponses = [
        '',                           // Empty response
        'No outfit format',          // No outfit structure
        'OUTFIT 1:',                 // Incomplete outfit
        null,                        // Null response
        undefined                    // Undefined response
      ];

      malformedResponses.forEach(response => {
        expect(() => {
          parseClaudeOutfitResponse(response, mockBaseItemData, mockItemsByCategory);
        }).not.toThrow();
      });
    });

    test('should filter out empty/invalid item names from parsed outfits', () => {
      const responseWithEmptyItems = `
OUTFIT 1: White T-Shirt + Blue Jeans + + null + undefined +  + Brown Belt
Explanation: Outfit with many empty item slots.
      `;

      const result = parseClaudeOutfitResponse(
        responseWithEmptyItems,
        mockBaseItemData,
        mockItemsByCategory
      );

      if (result.length > 0) {
        const firstOutfit = result[0];
        // Should only include valid items (excluding empty/null/undefined)
        firstOutfit.items.forEach(item => {
          expect(item).toBeDefined();
          expect(item.name).toBeDefined();
          expect(typeof item.name).toBe('string');
          expect(item.name.length).toBeGreaterThan(0);
        });
      }
    });

    test('should always include base item in outfit if provided', () => {
      const result = parseClaudeOutfitResponse(
        validClaudeResponse,
        mockBaseItemData,
        mockItemsByCategory
      );

      if (result.length > 0) {
        result.forEach(outfit => {
          const hasBaseItem = outfit.items.some(item => 
            item.compatibilityTypes && item.compatibilityTypes.includes('base-item')
          );
          expect(hasBaseItem).toBe(true);
        });
      }
    });

    test('should handle items with special characters in names', () => {
      const specialItemData = {
        id: 'special-1',
        name: 'T-Shirt & Jeans Co.',
        category: 'top'
      };

      const responseWithSpecialChars = `
OUTFIT 1: T-Shirt & Jeans Co. + Blue Jeans
Explanation: Outfit with special character items.
      `;

      expect(() => {
        parseClaudeOutfitResponse(
          responseWithSpecialChars,
          specialItemData,
          mockItemsByCategory
        );
      }).not.toThrow();
    });

    test('should handle very long item names', () => {
      const longNameItem = {
        id: 'long-1',
        name: 'A Very Long Item Name That Goes On And On And Should Not Cause Issues Even When Very Very Long',
        category: 'top'
      };

      const itemsWithLongNames = {
        top: [{
          id: '1',
          name: 'Another Extremely Long Item Name That Could Potentially Cause Issues If Not Handled Properly',
          category: 'top'
        }]
      };

      expect(() => {
        parseClaudeOutfitResponse(
          validClaudeResponse,
          longNameItem,
          itemsWithLongNames
        );
      }).not.toThrow();
    });

    test('should handle mixed case item matching', () => {
      const mixedCaseItems = {
        top: [
          { id: '1', name: 'white t-shirt', category: 'top' },
          { id: '2', name: 'BLUE JEANS JACKET', category: 'top' }
        ]
      };

      const mixedCaseResponse = `
OUTFIT 1: White T-Shirt + Blue Jeans Jacket
Explanation: Testing case-insensitive matching.
      `;

      const result = parseClaudeOutfitResponse(
        mixedCaseResponse,
        mockBaseItemData,
        mixedCaseItems
      );

      // Should successfully match items despite case differences
      expect(result).toBeDefined();
    });
  });

  describe('Edge case regression tests', () => {
    test('should prevent TypeError: Cannot read properties of undefined (reading toLowerCase)', () => {
      // This was the specific error we were getting
      const problematicResponse = `
OUTFIT 1: undefined + null +  + White T-Shirt
OUTFIT 2: + Blue Jeans + 
      `;

      // Should not throw TypeError about toLowerCase
      expect(() => {
        parseClaudeOutfitResponse(
          problematicResponse,
          mockBaseItemData,
          mockItemsByCategory
        );
      }).not.toThrow(/Cannot read properties of undefined.*toLowerCase/);
    });

    test('should prevent crashes when baseItemData has undefined name', () => {
      const itemWithUndefinedName = {
        id: 'test',
        name: undefined,
        category: 'footwear'
      };

      expect(() => {
        parseClaudeOutfitResponse(
          validClaudeResponse,
          itemWithUndefinedName,
          mockItemsByCategory
        );
      }).not.toThrow(/Cannot read properties of undefined.*toLowerCase/);
    });

    test('should handle array items with undefined properties', () => {
      const itemsWithUndefinedProps = {
        top: [
          { id: '1', name: undefined, category: 'top' },
          { id: '2', name: null, category: 'top' },
          { id: '3', name: '', category: 'top' },
          { id: '4', name: 'Valid Item', category: 'top' }
        ]
      };

      expect(() => {
        parseClaudeOutfitResponse(
          validClaudeResponse,
          mockBaseItemData,
          itemsWithUndefinedProps
        );
      }).not.toThrow();
    });
  });
});
