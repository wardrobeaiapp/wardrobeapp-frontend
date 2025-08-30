import { ItemCategory } from '../../../types';
import { DetectedTags, FieldExtractorFn } from '../types';
import { categoryMappings } from '../mappings/categoryMappings';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Extractor class for item category-related fields
 */
export class CategoryExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the item category from detected tags
   */
  extractCategory: FieldExtractorFn<ItemCategory> = (tags) => {
    this.logger.debug('Extracting category from tags');
    
    // Check if category is directly specified
    const categoryTag = ExtractionHelpers.extractFromTags(tags, 'category', [
      'type', 'item', 'clothing', 'garment'
    ]);
    
    if (categoryTag) {
      const mappedCategory = this.mapToCategory(categoryTag);
      if (mappedCategory) {
        this.logger.debug('Found category from category tag:', mappedCategory);
        return mappedCategory;
      }
    }
    
    // If no direct category tag, analyze all other tags
    this.logger.debug('No direct category tag found, analyzing all tags');
    
    // Try to infer from object tags
    const objectTags = this.extractObjectTags(tags);
    this.logger.debug('Object tags found:', objectTags);
    
    for (const tag of objectTags) {
      const mappedCategory = this.mapToCategory(tag);
      if (mappedCategory) {
        this.logger.debug('Inferred category from object tag:', tag, '=>', mappedCategory);
        return mappedCategory;
      }
    }
    
    // Default to 'OTHER' if no category can be determined
    this.logger.debug('Could not determine category, defaulting to OTHER');
    return ItemCategory.OTHER;
  };

  /**
   * Extracts the item subcategory from detected tags, using the detected category
   */
  extractSubcategory: FieldExtractorFn<string> = (tags: DetectedTags, category?: ItemCategory) => {
    if (!category) {
      this.logger.debug('Cannot extract subcategory without a category');
      return null;
    }
    
    this.logger.debug('Extracting subcategory for category:', category);
    console.log('[DEBUG] Extracting subcategory for category:', category, 'with tags:', tags);
    
    // Get valid subcategories for this category
    const { getSubcategoriesForCategory } = require('../mappings/subcategoryMappings');
    const validSubcategories = getSubcategoriesForCategory(category);
    
    // First check for direct subcategory tag
    const subcategoryTag = ExtractionHelpers.extractFromTags(tags, 'subcategory', [
      'subtype', 'sub-category', 'sub-type'
    ]);
    
    if (subcategoryTag) {
      this.logger.debug('Found direct subcategory tag:', subcategoryTag);
      const mapped = this.mapToValidSubcategory(subcategoryTag, validSubcategories);
      if (mapped) {
        this.logger.debug('Mapped subcategory:', subcategoryTag, '=>', mapped);
        return mapped;
      }
    }
    
    // Check for slash-separated category tags (e.g., 'Clothing/Dresses')
    // This handles the case where the subcategory is included in the category tag
    for (const [key, value] of Object.entries(tags)) {
      const keyLower = key.toLowerCase();
      if ((keyLower.includes('category') || keyLower.includes('type')) && typeof value === 'string') {
        const valueLower = value.toLowerCase();
        if (valueLower.includes('/')) {
          console.log('[CategoryExtractor] Found slash-separated category tag:', key, '=', value);
          const parts = valueLower.split('/');
          if (parts.length > 1) {
            // The part after the slash is likely our subcategory
            const potentialSubcategory = parts[parts.length - 1].trim();
            console.log('[CategoryExtractor] Extracted potential subcategory from slash part:', potentialSubcategory);
            
            const mapped = this.mapToValidSubcategory(potentialSubcategory, validSubcategories);
            if (mapped) {
              console.log('[CategoryExtractor] Mapped subcategory from slash part:', potentialSubcategory, '=>', mapped);
              return mapped;
            }
          }
        }
      }
    }
    
    // Then try to infer from object tags
    const objectTags = this.extractObjectTags(tags);
    
    // For each object tag, check if it could be a subcategory
    for (const tag of objectTags) {
      // We've already used this tag for the category, so it's not a subcategory
      const mappedCategory = this.mapToCategory(tag);
      if (mappedCategory === category) continue;
      
      // Try to map this tag to a valid subcategory
      const mapped = this.mapToValidSubcategory(tag, validSubcategories);
      if (mapped) {
        this.logger.debug('Mapped object tag to subcategory:', tag, '=>', mapped);
        return mapped;
      }
    }
    
    // If we couldn't determine a subcategory, return null (don't auto-fill)
    this.logger.debug('Could not determine subcategory');
    return null;
  };

  /**
   * Maps a string value to a category using the category mappings
   */
  private mapToCategory(value: string): ItemCategory | null {
    let lowerValue = value.toLowerCase();
    
    // Handle cases like "Clothing/Upper" - extract the part after "/"
    if (lowerValue.includes('/')) {
      const parts = lowerValue.split('/');
      if (parts.length > 1) {
        lowerValue = parts[parts.length - 1].trim(); // Take the last part after "/"
        this.logger.debug('Extracted category part after "/":', lowerValue);
      }
    }
    
    // Check for direct mapping
    if (lowerValue in categoryMappings) {
      return categoryMappings[lowerValue];
    }
    
    // Check for partial matches
    for (const [key, category] of Object.entries(categoryMappings)) {
      if (lowerValue.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerValue)) {
        return category;
      }
    }
    
    return null;
  }

  /**
   * Extracts object tags from the detected tags
   */
  private extractObjectTags(tags: DetectedTags): string[] {
    const objectTags: string[] = [];
    
    // Look for tags that represent detected objects
    for (const [key, value] of Object.entries(tags)) {
      const keyLower = key.toLowerCase();
      
      // Object tags are typically labeled as 'object', 'class', or simply numbered like 'object1'
      if (keyLower.includes('object') || keyLower.includes('class') || /^\d+$/.test(keyLower)) {
        if (typeof value === 'string' && value.trim()) {
          objectTags.push(value.trim());
        }
      }
    }
    
    // Also include 'item' or 'description' tags
    const itemTag = tags['item'];
    if (typeof itemTag === 'string' && itemTag.trim()) {
      objectTags.push(itemTag.trim());
    }
    
    const descriptionTag = tags['description'];
    if (typeof descriptionTag === 'string' && descriptionTag.trim()) {
      objectTags.push(descriptionTag.trim());
    }
    
    return objectTags;
  }

  /**
   * Maps a detected value to a valid subcategory option
   */
  private mapToValidSubcategory(value: string, validSubcategories: string[]): string | null {
    const lowerValue = value.toLowerCase();
    
    // First try exact match
    for (const subcategory of validSubcategories) {
      if (lowerValue === subcategory.toLowerCase()) {
        return this.capitalizeSubcategory(subcategory);
      }
    }
    
    // Then try partial matches - check if detected value contains subcategory keywords
    for (const subcategory of validSubcategories) {
      const lowerSubcategory = subcategory.toLowerCase();
      if (lowerValue.includes(lowerSubcategory) || lowerSubcategory.includes(lowerValue)) {
        return this.capitalizeSubcategory(subcategory);
      }
    }
    
    // Special mappings for common variations
    const specialMappings: Record<string, string> = {
      'a-line skirts': 'skirt',
      'pencil skirts': 'skirt', 
      'mini skirts': 'skirt',
      'midi skirts': 'skirt',
      'maxi skirts': 'skirt',
      'pleated skirts': 'skirt',
      'jean': 'jeans',
      'denim': 'jeans',
      'trouser': 'trousers',
      'pant': 'trousers',
      'pants': 'trousers',
      'short': 'shorts',
      'dress shirt': 'shirt',
      'button-down': 'shirt',
      'tee': 't-shirt',
      'top': 't-shirt'
    };
    
    for (const [key, mappedValue] of Object.entries(specialMappings)) {
      if (lowerValue.includes(key.toLowerCase())) {
        // Find the mapped value in valid subcategories
        for (const subcategory of validSubcategories) {
          if (subcategory.toLowerCase() === mappedValue.toLowerCase()) {
            return this.capitalizeSubcategory(subcategory);
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Capitalizes subcategory for form consistency
   */
  private capitalizeSubcategory(subcategory: string): string {
    // Handle special cases that should be capitalized differently
    switch (subcategory.toLowerCase()) {
      case 't-shirt':
        return 'T-Shirt';
      case 'tank top':
        return 'Tank Top';
      default:
        return subcategory.charAt(0).toUpperCase() + subcategory.slice(1).toLowerCase();
    }
  }

  /**
   * Checks if a tag matches a valid subcategory for the given category
   */
  private isValidSubcategory(tag: string, category: ItemCategory): boolean {
    const lowerTag = tag.toLowerCase();
    
    // Import the subcategory mappings here to avoid circular dependencies
    const { getSubcategoriesForCategory } = require('../mappings/subcategoryMappings');
    const validSubcategories = getSubcategoriesForCategory(category);
    
    for (const subcategory of validSubcategories) {
      if (lowerTag === subcategory.toLowerCase() || 
          lowerTag.includes(subcategory.toLowerCase()) || 
          subcategory.toLowerCase().includes(lowerTag)) {
        return true;
      }
    }
    
    return false;
  }
}
