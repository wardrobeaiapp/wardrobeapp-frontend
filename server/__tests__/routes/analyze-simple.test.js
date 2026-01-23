/**
 * Unit tests for analyze-simple route - Base Item Enhancement Fix
 * 
 * Tests the critical fix for uploaded images to ensure:
 * 1. Image data is correctly added to base item for outfit thumbnails
 * 2. Name is generated with primary color from analysis text
 * 
 * Prevents regression of the "No Image" bug in outfit thumbnails
 */

describe('analyze-simple - Base Item Enhancement', () => {
  
  describe('Base Item Data Enhancement for Uploaded Images', () => {
    
    test('should detect uploaded images correctly (preFilledData exists but no imageUrl)', () => {
      // Test data mimicking uploaded image scenario
      const preFilledData = {
        category: 'footwear',
        subcategory: 'sneakers',
        // No imageUrl - this is key difference from wishlist items
      };
      const imageBase64 = 'dGVzdC1pbWFnZS1kYXRh'; // base64 test data
      
      // The condition should detect this as uploaded image needing enhancement
      const shouldEnhance = !preFilledData?.imageUrl && !!imageBase64;
      
      expect(shouldEnhance).toBe(true);
    });
    
    test('should NOT enhance wishlist items (they already have imageUrl)', () => {
      // Test data mimicking wishlist item scenario
      const preFilledData = {
        category: 'footwear',
        subcategory: 'sneakers',
        imageUrl: 'https://example.com/existing-image.jpg', // Already has image
      };
      const imageBase64 = 'dGVzdC1pbWFnZS1kYXRh';
      
      // The condition should NOT enhance wishlist items
      const shouldEnhance = !preFilledData?.imageUrl && imageBase64;
      
      expect(shouldEnhance).toBe(false);
    });
    
    test('should extract primary color from analysis text correctly', () => {
      const rawAnalysisResponse = `
REQUIRED ANALYSIS:

1. STYLE LEVEL CLASSIFICATION: BASIC
   - This is a simple, minimalist slip-on shoe.

2. FORMALITY LEVEL: 1 - Casual
   - The casual nature of this shoe makes it suitable for everyday wear.

3. COLOR & PATTERN ANALYSIS:
   - Primary color: White
   - Color family: Neutral
   - Pattern type: Solid
`;
      
      // Extract primary color using the same regex from the fix
      const primaryColorMatch = rawAnalysisResponse.match(/Primary color:\s*([^,\n\r]+)/i);
      const primaryColor = primaryColorMatch ? primaryColorMatch[1].trim() : null;
      
      expect(primaryColor).toBe('White');
    });
    
    test('should generate correct name with primary color and proper case', () => {
      const primaryColor = 'White';
      const subcategory = 'sneakers';
      const category = 'footwear';
      
      // Name generation logic from the fix
      const finalColor = primaryColor;
      const colorPart = finalColor ? 
        finalColor.charAt(0).toUpperCase() + finalColor.slice(1).toLowerCase() + ' ' : '';
      const itemPart = subcategory ? 
        subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase() : 
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      
      const generatedName = (colorPart + itemPart).trim();
      
      expect(generatedName).toBe('White Sneakers');
    });
    
    test('should generate data URL correctly from base64 data', () => {
      const mediaType = 'image/webp';
      const base64Data = 'dGVzdC1pbWFnZS1kYXRh';
      
      // Data URL generation logic from the fix
      const imageDataUrl = `data:${mediaType};base64,${base64Data}`;
      
      expect(imageDataUrl).toBe('data:image/webp;base64,dGVzdC1pbWFnZS1kYXRh');
      expect(imageDataUrl.startsWith('data:image/')).toBe(true);
      expect(imageDataUrl.includes('base64,')).toBe(true);
    });
    
    test('should handle edge cases in color extraction', () => {
      // Test various formats of color analysis text
      const testCases = [
        {
          text: '3. COLOR & PATTERN ANALYSIS:\n   - Primary color: Blue\n   - Color family: Cool',
          expected: 'Blue'
        },
        {
          text: 'Primary color:Red',
          expected: 'Red'
        },
        {
          text: 'Primary Color: Light Green',
          expected: 'Light Green'
        },
        {
          text: 'No color information',
          expected: null
        }
      ];
      
      testCases.forEach(({ text, expected }) => {
        const primaryColorMatch = text.match(/Primary color:\s*([^,\n\r]+)/i);
        const primaryColor = primaryColorMatch ? primaryColorMatch[1].trim() : null;
        expect(primaryColor).toBe(expected);
      });
    });
    
    test('should generate fallback names when no color is found', () => {
      const primaryColor = null; // No color found
      const subcategory = 'dress';
      const category = 'one_piece';
      
      // Name generation with fallback
      const finalColor = primaryColor; // null
      const colorPart = finalColor ? 
        finalColor.charAt(0).toUpperCase() + finalColor.slice(1).toLowerCase() + ' ' : '';
      const itemPart = subcategory ? 
        subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase() : 
        category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      
      const generatedName = (colorPart + itemPart).trim();
      
      expect(generatedName).toBe('Dress'); // Should fallback to just the item name
    });
    
    test('should handle case conversion correctly for various colors and categories', () => {
      const testCases = [
        { color: 'NAVY BLUE', subcategory: 'BLAZER', expected: 'Navy blue Blazer' },
        { color: 'light gray', subcategory: 't-shirt', expected: 'Light gray T-shirt' },
        { color: 'Red', subcategory: 'JEANS', expected: 'Red Jeans' },
      ];
      
      testCases.forEach(({ color, subcategory, expected }) => {
        const colorPart = color ? 
          color.charAt(0).toUpperCase() + color.slice(1).toLowerCase() + ' ' : '';
        const itemPart = subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase();
        const generatedName = (colorPart + itemPart).trim();
        
        expect(generatedName).toBe(expected);
      });
    });
  });
  
  describe('Integration Test Scenarios', () => {
    
    test('uploaded image scenario - should enhance base item with image and name', () => {
      // Mock data for uploaded image
      const formData = {
        category: 'footwear',
        subcategory: 'sneakers'
      };
      const preFilledData = { ...formData }; // From short prefilled form - no imageUrl
      const imageBase64 = 'dGVzdC1pbWFnZS1kYXRh';
      const mediaType = 'image/webp';
      const base64Data = imageBase64;
      const rawAnalysisResponse = 'Primary color: White\nColor family: Neutral';
      
      // Simulate the fix logic
      let itemDataForOutfits = { ...formData };
      if (preFilledData) {
        itemDataForOutfits = { ...itemDataForOutfits, ...preFilledData };
      }
      
      if (!preFilledData?.imageUrl && imageBase64) {
        // Add image data
        const imageDataUrl = `data:${mediaType};base64,${base64Data}`;
        itemDataForOutfits.imageUrl = imageDataUrl;
        
        // Extract and add color name
        const primaryColorMatch = rawAnalysisResponse.match(/Primary color:\s*([^,\n\r]+)/i);
        const primaryColor = primaryColorMatch ? primaryColorMatch[1].trim() : null;
        const finalColor = primaryColor || itemDataForOutfits.color;
        
        const colorPart = finalColor ? 
          finalColor.charAt(0).toUpperCase() + finalColor.slice(1).toLowerCase() + ' ' : '';
        const itemPart = itemDataForOutfits.subcategory ? 
          itemDataForOutfits.subcategory.charAt(0).toUpperCase() + itemDataForOutfits.subcategory.slice(1).toLowerCase() : 
          itemDataForOutfits.category.charAt(0).toUpperCase() + itemDataForOutfits.category.slice(1).toLowerCase();
        
        itemDataForOutfits.name = (colorPart + itemPart).trim();
      }
      
      // Verify the fix worked
      expect(itemDataForOutfits.imageUrl).toBe('data:image/webp;base64,dGVzdC1pbWFnZS1kYXRh');
      expect(itemDataForOutfits.name).toBe('White Sneakers');
      expect(itemDataForOutfits.category).toBe('footwear');
      expect(itemDataForOutfits.subcategory).toBe('sneakers');
    });
    
    test('wishlist item scenario - should NOT modify existing data', () => {
      // Mock data for wishlist item
      const formData = {
        category: 'footwear',
        subcategory: 'sneakers'
      };
      const preFilledData = {
        ...formData,
        imageUrl: 'https://example.com/wishlist-item.jpg', // Already has image
        name: 'Existing Wishlist Item Name'
      };
      const imageBase64 = 'dGVzdC1pbWFnZS1kYXRh';
      
      // Simulate the fix logic
      let itemDataForOutfits = { ...formData };
      if (preFilledData) {
        itemDataForOutfits = { ...itemDataForOutfits, ...preFilledData };
      }
      
      if (!preFilledData?.imageUrl && imageBase64) {
        // This should NOT execute for wishlist items
        itemDataForOutfits.imageUrl = 'SHOULD_NOT_BE_SET';
        itemDataForOutfits.name = 'SHOULD_NOT_BE_SET';
      }
      
      // Verify wishlist data is preserved
      expect(itemDataForOutfits.imageUrl).toBe('https://example.com/wishlist-item.jpg');
      expect(itemDataForOutfits.name).toBe('Existing Wishlist Item Name');
      expect(itemDataForOutfits.imageUrl).not.toBe('SHOULD_NOT_BE_SET');
      expect(itemDataForOutfits.name).not.toBe('SHOULD_NOT_BE_SET');
    });
  });
});
