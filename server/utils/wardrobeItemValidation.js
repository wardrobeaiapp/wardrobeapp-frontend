/**
 * Wardrobe Item Field Validation Utility
 * Validates wardrobe item data to ensure all required fields are present and valid
 */

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

/**
 * Validates wardrobe item fields
 * @param {Object} item - The wardrobe item to validate
 * @returns {Object} - Validation result with isValid, errors, and missingFields
 */
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

module.exports = {
  validateWardrobeItemFields,
  VALID_CATEGORIES,
  VALID_SLEEVES,
  VALID_STYLES,
  VALID_SEASONS,
  REQUIRED_FIELDS,
  ALL_POSSIBLE_FIELDS
};
