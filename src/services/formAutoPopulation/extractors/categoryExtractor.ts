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
  extractSubcategory: FieldExtractorFn<string> = (tags, category) => {
    if (!category) {
      this.logger.debug('Cannot extract subcategory without a category');
      return null;
    }
    
    this.logger.debug('Extracting subcategory for category:', category);
    
    // First check for direct subcategory tag
    const subcategoryTag = ExtractionHelpers.extractFromTags(tags, 'subcategory', [
      'subtype', 'sub-category', 'sub-type'
    ]);
    
    if (subcategoryTag) {
      this.logger.debug('Found direct subcategory tag:', subcategoryTag);
      return subcategoryTag;
    }
    
    // Then try to infer from object tags
    const objectTags = this.extractObjectTags(tags);
    
    // For each object tag, check if it could be a subcategory
    for (const tag of objectTags) {
      // We've already used this tag for the category, so it's not a subcategory
      const mappedCategory = this.mapToCategory(tag);
      if (mappedCategory === category) continue;
      
      // Check if this tag matches a valid subcategory
      if (this.isValidSubcategory(tag, category)) {
        this.logger.debug('Inferred subcategory from object tag:', tag);
        return tag;
      }
    }
    
    // If we couldn't determine a subcategory, return 'other'
    this.logger.debug('Could not determine subcategory, defaulting to "other"');
    return 'other';
  };

  /**
   * Maps a string value to a category using the category mappings
   */
  private mapToCategory(value: string): ItemCategory | null {
    const lowerValue = value.toLowerCase();
    
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
