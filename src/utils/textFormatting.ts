/**
 * Text formatting utilities for wardrobe items
 */

/**
 * Formats category strings for display (e.g. "one_piece" -> "one piece")
 */
export const formatCategory = (category: string): string => {
  if (!category) return '';
  
  return category
    .split('_')
    .map(word => word.toLowerCase())
    .join(' ');
};

/**
 * Formats category strings for filter dropdowns (e.g. "one_piece" -> "One piece")
 */
export const formatCategoryForFilter = (category: string): string => {
  if (!category) return '';
  
  const words = category.split('_');
  return words
    .map((word, index) => index === 0 
      ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      : word.toLowerCase()
    )
    .join(' ');
};

/**
 * Formats any underscore-separated string for display
 */
export const formatDisplayText = (text: string): string => {
  if (!text) return '';
  
  return text
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
