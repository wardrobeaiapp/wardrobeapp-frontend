const { validateWardrobeItemFields } = require('../../utils/wardrobeItemValidation');

/**
 * Field validation utility tests
 * These tests ensure that wardrobe item validation catches missing or invalid fields
 */
describe('Wardrobe Item Field Validation', () => {
  const VALID_COMPLETE_ITEM = {
    name: 'Valid Item',
    category: 'top',
    subcategory: 't-shirt',
    color: 'navy',
    pattern: 'solid',
    material: 'cotton',
    brand: 'Test Brand',
    silhouette: 'relaxed',
    length: 'regular',
    sleeves: 'short sleeves',
    style: 'casual',
    rise: undefined,
    neckline: 'crew neck',
    heelHeight: undefined,
    bootHeight: undefined,
    type: undefined,
    season: ['summer'],
    scenarios: ['staying_at_home'],
    wishlist: false,
    imageUrl: 'https://example.com/image.jpg',
    tags: {}
  };

  describe('Required Field Validation', () => {
    it('should pass validation for complete valid item', () => {
      const result = validateWardrobeItemFields(VALID_COMPLETE_ITEM);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for missing required fields', () => {
      const incompleteItem = {
        name: 'Incomplete Item'
        // missing category, color, season
      };

      const result = validateWardrobeItemFields(incompleteItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveProperty('category');
      expect(result.errors).toHaveProperty('color');
      expect(result.errors).toHaveProperty('season');
    });

    it('should fail validation for empty required string fields', () => {
      const itemWithEmptyFields = {
        ...VALID_COMPLETE_ITEM,
        name: '',
        category: '',
        color: ''
      };

      const result = validateWardrobeItemFields(itemWithEmptyFields);
      expect(result.isValid).toBe(false);
      expect(result.errors.name).toContain('required');
      expect(result.errors.category).toContain('required');
      expect(result.errors.color).toContain('required');
    });

    it('should fail validation for empty season array', () => {
      const itemWithEmptySeasons = {
        ...VALID_COMPLETE_ITEM,
        season: []
      };

      const result = validateWardrobeItemFields(itemWithEmptySeasons);
      expect(result.isValid).toBe(false);
      expect(result.errors.season).toContain('At least one season');
    });
  });

  describe('Category-Specific Field Validation', () => {
    it('should require sleeves for applicable top subcategories', () => {
      const topWithoutSleeves = {
        ...VALID_COMPLETE_ITEM,
        category: 'top',
        subcategory: 't-shirt',
        sleeves: undefined
      };

      const result = validateWardrobeItemFields(topWithoutSleeves);
      expect(result.isValid).toBe(false);
      expect(result.errors.sleeves).toContain('required');
    });

    it('should not require sleeves for non-applicable categories', () => {
      const bottomWithoutSleeves = {
        ...VALID_COMPLETE_ITEM,
        category: 'bottom',
        subcategory: 'jeans',
        sleeves: undefined
      };

      const result = validateWardrobeItemFields(bottomWithoutSleeves);
      expect(result.isValid).toBe(true);
    });

    it('should validate sleeve values are from allowed list', () => {
      const topWithInvalidSleeves = {
        ...VALID_COMPLETE_ITEM,
        category: 'top',
        subcategory: 't-shirt',
        sleeves: 'invalid-sleeve-type'
      };

      const result = validateWardrobeItemFields(topWithInvalidSleeves);
      expect(result.isValid).toBe(false);
      expect(result.errors.sleeves).toContain('must be one of');
    });

    it('should validate style values are from allowed list', () => {
      const itemWithInvalidStyle = {
        ...VALID_COMPLETE_ITEM,
        style: 'invalid-style'
      };

      const result = validateWardrobeItemFields(itemWithInvalidStyle);
      expect(result.isValid).toBe(false);
      expect(result.errors.style).toContain('must be one of');
    });
  });

  describe('Field Presence Detection', () => {
    it('should detect when critical fields are missing from object', () => {
      const itemMissingFields = {
        name: 'Missing Fields Item',
        category: 'top',
        color: 'blue'
        // missing many fields including sleeves, style
      };

      const criticalFields = ['sleeves', 'style', 'neckline', 'silhouette', 'length'];
      const result = validateWardrobeItemFields(itemMissingFields);
      
      // Should detect missing fields (even if they're not required for this category)
      const missingFields = result.missingFields || [];
      criticalFields.forEach(field => {
        expect(missingFields).toContain(field);
      });
    });

    it('should pass when all fields are present even if undefined', () => {
      const itemWithAllFieldsUndefined = {
        name: 'All Fields Present',
        category: 'top',
        subcategory: 't-shirt',
        color: 'blue',
        pattern: undefined,
        material: undefined,
        brand: undefined,
        silhouette: undefined,
        length: undefined,
        sleeves: 'short sleeves', // Required for t-shirts
        style: undefined,
        rise: undefined,
        neckline: undefined,
        heelHeight: undefined,
        bootHeight: undefined,
        type: undefined,
        season: ['summer'],
        scenarios: [],
        wishlist: false,
        imageUrl: undefined,
        tags: {}
      };

      const result = validateWardrobeItemFields(itemWithAllFieldsUndefined);
      expect(result.missingFields).toEqual([]);
    });
  });

  describe('Data Type Validation', () => {
    it('should validate season is an array', () => {
      const itemWithInvalidSeason = {
        ...VALID_COMPLETE_ITEM,
        season: 'summer' // Should be array
      };

      const result = validateWardrobeItemFields(itemWithInvalidSeason);
      expect(result.isValid).toBe(false);
      expect(result.errors.season).toContain('array');
    });

    it('should validate scenarios is an array', () => {
      const itemWithInvalidScenarios = {
        ...VALID_COMPLETE_ITEM,
        scenarios: 'home' // Should be array
      };

      const result = validateWardrobeItemFields(itemWithInvalidScenarios);
      expect(result.isValid).toBe(false);
      expect(result.errors.scenarios).toContain('array');
    });

    it('should validate wishlist is boolean', () => {
      const itemWithInvalidWishlist = {
        ...VALID_COMPLETE_ITEM,
        wishlist: 'true' // Should be boolean
      };

      const result = validateWardrobeItemFields(itemWithInvalidWishlist);
      expect(result.isValid).toBe(false);
      expect(result.errors.wishlist).toContain('boolean');
    });

    it('should validate tags is an object', () => {
      const itemWithInvalidTags = {
        ...VALID_COMPLETE_ITEM,
        tags: 'tag1,tag2' // Should be object
      };

      const result = validateWardrobeItemFields(itemWithInvalidTags);
      expect(result.isValid).toBe(false);
      expect(result.errors.tags).toContain('object');
    });
  });
});

// Create the validation utility if it doesn't exist
// This test file will guide the implementation
const createValidationUtility = () => {
  const VALID_CATEGORIES = ['top', 'bottom', 'outerwear', 'one_piece', 'accessory', 'footwear', 'other'];
  const VALID_SLEEVES = ['sleeveless', 'short sleeves', 'long sleeves', '3/4 sleeves', 'one sleeve'];
  const VALID_STYLES = ['casual', 'elegant', 'special', 'sport'];
  const VALID_SEASONS = ['summer', 'winter', 'spring/fall'];

  const REQUIRED_FIELDS = ['name', 'category', 'color', 'season'];
  const ALL_POSSIBLE_FIELDS = [
    'name', 'category', 'subcategory', 'color', 'pattern', 'material', 'brand',
    'silhouette', 'length', 'sleeves', 'style', 'rise', 'neckline', 
    'heelHeight', 'bootHeight', 'type', 'season', 'scenarios', 'wishlist', 'imageUrl', 'tags'
  ];

  const SLEEVES_REQUIRED_SUBCATEGORIES = ['t-shirt', 'shirt', 'blouse', 'sweater', 'cardigan'];

  function validateWardrobeItemFields(item) {
    const errors = {};
    const missingFields = [];

    // Check for missing critical fields
    ALL_POSSIBLE_FIELDS.forEach(field => {
      if (!(field in item)) {
        missingFields.push(field);
      }
    });

    // Validate required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!item[field] || (typeof item[field] === 'string' && item[field].trim() === '')) {
        errors[field] = `${field} is required`;
      }
    });

    // Validate season array
    if (!Array.isArray(item.season) || item.season.length === 0) {
      errors.season = 'At least one season must be selected';
    }

    // Category-specific validations
    if (item.category === 'top' && SLEEVES_REQUIRED_SUBCATEGORIES.includes(item.subcategory)) {
      if (!item.sleeves) {
        errors.sleeves = 'Sleeve type is required for this item';
      }
    }

    // Validate enum values
    if (item.category && !VALID_CATEGORIES.includes(item.category)) {
      errors.category = `Category must be one of: ${VALID_CATEGORIES.join(', ')}`;
    }

    if (item.sleeves && !VALID_SLEEVES.includes(item.sleeves)) {
      errors.sleeves = `Sleeves must be one of: ${VALID_SLEEVES.join(', ')}`;
    }

    if (item.style && !VALID_STYLES.includes(item.style)) {
      errors.style = `Style must be one of: ${VALID_STYLES.join(', ')}`;
    }

    // Validate data types
    if (item.season && !Array.isArray(item.season)) {
      errors.season = 'Season must be an array';
    }

    if (item.scenarios && !Array.isArray(item.scenarios)) {
      errors.scenarios = 'Scenarios must be an array';
    }

    if (item.wishlist !== undefined && typeof item.wishlist !== 'boolean') {
      errors.wishlist = 'Wishlist must be a boolean';
    }

    if (item.tags && typeof item.tags !== 'object') {
      errors.tags = 'Tags must be an object';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      missingFields
    };
  }

  return { validateWardrobeItemFields };
};

// Export the utility for use in actual implementation
module.exports = createValidationUtility();
