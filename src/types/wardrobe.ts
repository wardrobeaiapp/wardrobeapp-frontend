/**
 * Types related to wardrobe items
 */

/**
 * Interface for detected tags from image analysis
 */
export interface DetectedTags {
  [key: string]: string | number | boolean | null;
}

/**
 * Wardrobe item interface
 */
export interface WardrobeItem {
  id?: string;
  name: string;
  category: string;
  subcategory?: string;
  color?: string;
  pattern?: string;
  material?: string;
  brand?: string;
  size?: string;
  style?: string;
  imageUrl?: string;
  [key: string]: any; // For additional properties
}
