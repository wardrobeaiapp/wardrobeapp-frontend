/**
 * Validation utilities for wardrobe items
 */

/**
 * Validate item ID format and security
 * @param {string} itemId - Item ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidItemId = (itemId) => {
  if (!itemId || 
      itemId.trim() === '' || 
      itemId === 'null' || 
      itemId === 'undefined' ||
      itemId.length > 100 ||  // Too long
      /[<>\"'%;()&+]/.test(itemId)) {  // Contains suspicious characters
    return false;
  }
  return true;
};

/**
 * Validate required fields for creating a wardrobe item
 * @param {Object} body - Request body
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateRequiredFields = (body) => {
  const errors = [];
  
  if (!body.name || body.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!body.category || body.category.trim() === '') {
    errors.push('Category is required');
  }
  
  if (!body.color || body.color.trim() === '') {
    errors.push('Color is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate image data format
 * @param {string} imageData - Base64 image data
 * @returns {Object} - { isValid: boolean, error?: string }
 */
const validateImageData = (imageData) => {
  if (!imageData) {
    return { isValid: false, error: 'No image data provided' };
  }
  
  const matches = imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
    return { isValid: false, error: 'Invalid image format' };
  }
  
  return { isValid: true };
};

/**
 * Check if user owns the item
 * @param {Object} item - Item object
 * @param {string} userId - User ID
 * @returns {boolean} - True if user owns item
 */
const userOwnsItem = (item, userId) => {
  return item && item.user === userId;
};

module.exports = {
  isValidItemId,
  validateRequiredFields,
  validateImageData,
  userOwnsItem
};
