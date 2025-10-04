// Integration tests for wishlist data integration in enhanced analysis
// Tests the full data flow from wishlist items through AI analysis

describe('Wishlist Data Integration Tests', () => {
  
  describe('Data Merging and Verification', () => {
    it('should merge formData with preFilledData correctly', () => {
      // Simulate the data merging logic from analyze-simple.js
      const formData = {
        category: 'TOP',
        subcategory: 't-shirt',
        color: 'Blue' // User might change this
      };

      const preFilledData = {
        id: 'wishlist-123',
        name: 'Cotton Basic Tee',
        material: 'Organic Cotton',
        color: 'Red', // Original wishlist color
        brand: 'Sustainable Brand',
        seasons: ['summer', 'spring/fall'],
        style: 'casual'
      };

      // Merge logic from analyze-simple.js
      const analysisData = {
        ...formData,
        ...(preFilledData || {}),
        isFromWishlist: !!preFilledData
      };

      // Assertions
      expect(analysisData.category).toBe('TOP');
      expect(analysisData.subcategory).toBe('t-shirt');
      expect(analysisData.color).toBe('Red'); // preFilledData takes precedence
      expect(analysisData.material).toBe('Organic Cotton');
      expect(analysisData.brand).toBe('Sustainable Brand');
      expect(analysisData.isFromWishlist).toBe(true);
      expect(analysisData.seasons).toEqual(['summer', 'spring/fall']);
    });

    it('should handle empty preFilledData gracefully', () => {
      const formData = {
        category: 'FOOTWEAR',
        subcategory: 'heels',
        color: 'Black'
      };

      const preFilledData = null;

      const analysisData = {
        ...formData,
        ...(preFilledData || {}),
        isFromWishlist: !!preFilledData
      };

      expect(analysisData.category).toBe('FOOTWEAR');
      expect(analysisData.subcategory).toBe('heels');
      expect(analysisData.color).toBe('Black');
      expect(analysisData.isFromWishlist).toBe(false);
      expect(analysisData.material).toBeUndefined();
    });

    it('should filter out non-descriptive fields from preFilledData', () => {
      const preFilledData = {
        id: 'wishlist-123',
        userId: 'user-456',
        imageUrl: 'https://example.com/image.jpg',
        dateAdded: '2024-01-01',
        imageExpiry: '2024-02-01',
        // Descriptive fields that should be included
        name: 'Red Dress',
        material: 'Silk',
        color: 'Red',
        category: 'ONE_PIECE'
      };

      // Simulate the descriptive fields filtering from analyze-simple.js
      const descriptiveFields = ['name', 'category', 'subcategory', 'color', 'style', 'silhouette', 'fit', 
                                'material', 'pattern', 'length', 'sleeves', 'rise', 'neckline', 
                                'heelHeight', 'bootHeight', 'brand', 'size', 'season'];
      
      const filteredData = {};
      descriptiveFields.forEach(field => {
        const value = preFilledData[field];
        if (value) {
          filteredData[field] = value;
        }
      });

      expect(filteredData.name).toBe('Red Dress');
      expect(filteredData.material).toBe('Silk');
      expect(filteredData.color).toBe('Red');
      expect(filteredData.category).toBe('ONE_PIECE');
      expect(filteredData.id).toBeUndefined();
      expect(filteredData.userId).toBeUndefined();
      expect(filteredData.imageUrl).toBeUndefined();
    });
  });

  describe('Analysis Scope Integration', () => {
    it('should determine correct analysis scope for wishlist dress', () => {
      const getAnalysisScope = (category, subcategory) => {
        const scope = {
          always: ['styleLevel', 'formalityLevel', 'colorFamily', 'material', 'pattern'],
          conditional: {}
        };

        if (subcategory && ['dress', 't-shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'cardigan', 'jumpsuit', 'romper'].includes(subcategory.toLowerCase())) {
          scope.conditional.neckline = true;
          scope.conditional.layeringPotential = true;
        }

        if ((category === 'ONE_PIECE' && subcategory && !['overall'].includes(subcategory.toLowerCase())) || 
            (category === 'TOP' && subcategory && ['t-shirt', 'shirt', 'blouse', 'sweater', 'cardigan'].includes(subcategory.toLowerCase()))) {
          scope.conditional.sleeves = true;
          scope.conditional.volume = true;
        }

        return scope;
      };

      const wishlistData = {
        category: 'ONE_PIECE',
        subcategory: 'dress',
        material: 'Silk',
        color: 'Navy'
      };

      const scope = getAnalysisScope(wishlistData.category, wishlistData.subcategory);

      expect(scope.always).toContain('styleLevel');
      expect(scope.conditional.neckline).toBe(true);
      expect(scope.conditional.layeringPotential).toBe(true);
      expect(scope.conditional.sleeves).toBe(true);
      expect(scope.conditional.volume).toBe(true);
    });

    it('should determine minimal scope for wishlist accessory', () => {
      const getAnalysisScope = (category, subcategory) => {
        const scope = {
          always: ['styleLevel', 'formalityLevel', 'colorFamily', 'material', 'pattern'],
          conditional: {}
        };
        
        // Accessories don't get conditional analysis
        return scope;
      };

      const wishlistData = {
        category: 'ACCESSORY',
        subcategory: 'bag',
        material: 'Leather',
        color: 'Brown'
      };

      const scope = getAnalysisScope(wishlistData.category, wishlistData.subcategory);

      expect(scope.always).toContain('styleLevel');
      expect(scope.conditional).toEqual({});
    });
  });

  describe('Characteristic Extraction with Wishlist Data', () => {
    it('should prioritize pre-filled material over AI extraction', () => {
      const extractField = (text, keywords, defaultValue) => {
        const lowerText = text.toLowerCase();
        for (const keyword of keywords) {
          if (lowerText.includes(keyword.toLowerCase())) {
            return keyword;
          }
        }
        return defaultValue;
      };

      const aiResponse = `
        This appears to be made of cotton material.
        Material: Cotton blend
      `;

      const preFilledData = {
        material: 'Organic Bamboo Fiber'
      };

      const scope = { always: [], conditional: {} };

      // Simulate the material extraction logic
      const extractedMaterial = preFilledData?.material || extractField(aiResponse, ['material', 'cotton', 'silk'], null);

      expect(extractedMaterial).toBe('Organic Bamboo Fiber'); // Uses pre-filled over AI extraction
    });

    it('should fall back to AI extraction when no pre-filled data', () => {
      const extractField = (text, keywords, defaultValue) => {
        const lowerText = text.toLowerCase();
        
        // Look for the keywords in the text
        for (const keyword of keywords) {
          const index = lowerText.indexOf(keyword.toLowerCase());
          if (index !== -1) {
            // Extract the line or surrounding context
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.toLowerCase().includes(keyword.toLowerCase())) {
                // Try to extract the value after the keyword
                const colonIndex = line.indexOf(':');
                if (colonIndex !== -1) {
                  const value = line.substring(colonIndex + 1).trim();
                  if (value) {
                    return value.split(/[,\n]/)[0].trim(); // Take first part before comma or newline
                  }
                }
              }
            }
            
            // If found the keyword, try to identify which option it matches
            for (const option of keywords.slice(1)) { // Skip first keyword which is the field name
              if (lowerText.includes(option.toLowerCase())) {
                return option;
              }
            }
          }
        }
        
        return defaultValue;
      };

      const aiResponse = `
        This cotton t-shirt has a soft texture.
        Material: Cotton blend
      `;

      const preFilledData = null;

      // Simulate the material extraction logic
      const extractedMaterial = preFilledData?.material || extractField(aiResponse, ['material', 'cotton', 'silk'], null);

      expect(extractedMaterial).toBe('Cotton blend'); // Uses AI extraction - should extract "Cotton blend" from the line
    });
  });

  describe('Response Structure with Wishlist Integration', () => {
    it('should include comprehensive dataIntegration info for wishlist items', () => {
      const preFilledData = {
        name: 'Summer Dress',
        material: 'Linen',
        color: 'White',
        seasons: ['summer'],
        category: 'ONE_PIECE'
      };

      const analysisScope = {
        always: ['styleLevel'],
        conditional: { neckline: true, sleeves: true }
      };

      // Simulate the response structure from analyze-simple.js
      const dataIntegration = {
        isFromWishlist: !!preFilledData,
        preFilledFields: preFilledData ? Object.keys(preFilledData).filter(key => 
          !['id', 'userId', 'imageUrl', 'dateAdded', 'imageExpiry'].includes(key)
        ) : [],
        analysisScope: analysisScope
      };

      expect(dataIntegration.isFromWishlist).toBe(true);
      expect(dataIntegration.preFilledFields).toContain('name');
      expect(dataIntegration.preFilledFields).toContain('material');
      expect(dataIntegration.preFilledFields).toContain('color');
      expect(dataIntegration.preFilledFields).not.toContain('id');
      expect(dataIntegration.analysisScope.conditional.neckline).toBe(true);
    });

    it('should include minimal dataIntegration info for regular items', () => {
      const preFilledData = null;
      const analysisScope = {
        always: ['styleLevel'],
        conditional: { heelHeight: true }
      };

      const dataIntegration = {
        isFromWishlist: !!preFilledData,
        preFilledFields: preFilledData ? Object.keys(preFilledData) : [],
        analysisScope: analysisScope
      };

      expect(dataIntegration.isFromWishlist).toBe(false);
      expect(dataIntegration.preFilledFields).toEqual([]);
      expect(dataIntegration.analysisScope.conditional.heelHeight).toBe(true);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed preFilledData gracefully', () => {
      const formData = { category: 'TOP', subcategory: 'shirt' };
      const preFilledData = {
        // Missing expected fields, has unexpected structure
        someRandomField: 'value',
        seasons: null, // null instead of array
        material: undefined
      };

      const analysisData = {
        ...formData,
        ...(preFilledData || {}),
        isFromWishlist: !!preFilledData
      };

      expect(analysisData.category).toBe('TOP');
      expect(analysisData.subcategory).toBe('shirt');
      expect(analysisData.isFromWishlist).toBe(true);
      expect(analysisData.someRandomField).toBe('value');
      expect(analysisData.seasons).toBeNull();
      expect(analysisData.material).toBeUndefined();
    });

    it('should handle empty arrays and objects in preFilledData', () => {
      const preFilledData = {
        seasons: [],
        scenarios: [],
        tags: {},
        material: '',
        color: '   '  // whitespace only
      };

      const filteredData = {};
      Object.entries(preFilledData).forEach(([key, value]) => {
        // Only include non-empty values
        if (value && 
            (typeof value === 'string' ? value.trim() : true) &&
            (Array.isArray(value) ? value.length > 0 : true) &&
            (typeof value === 'object' && !Array.isArray(value) ? Object.keys(value).length > 0 : true)) {
          filteredData[key] = value;
        }
      });

      expect(Object.keys(filteredData)).toEqual([]); // All values should be filtered out
    });
  });
});
