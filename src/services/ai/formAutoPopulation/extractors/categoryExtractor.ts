import { ItemCategory } from '../../../../types';
import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { getCategoryFromKeyword } from '../mappings/categoryMappings';
import { getSubcategoriesForCategory } from '../mappings/subcategoryMappings';

/**
 * Responsible for extracting item category and subcategory from detected tags
 */
export class CategoryExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the main item category from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @returns The detected item category or undefined if no category could be determined
   */
  extractCategory(tags: { fashion_tags?: string[], general_tags?: string[] }): ItemCategory | null {
    this.logger.debug('[CategoryExtractor] Extracting category from tags');
    
    // First check fashion tags, which are more reliable for category detection
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[CategoryExtractor] Combined tags for category extraction:', allTags);
    
    // Get the first tag that maps to a category
    for (const tag of allTags) {
      const category = getCategoryFromKeyword(tag);
      
      if (category) {
        this.logger.debug(`[CategoryExtractor] Found category ${category} from tag ${tag}`);
        return category;
      }
    }
    
    this.logger.debug('[CategoryExtractor] No category found from tags');
    return null;
  }

  /**
   * Extract the item subcategory based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The main item category to provide context for subcategory detection
   * @returns The detected subcategory or undefined if no subcategory could be determined
   */
  extractSubcategory(tags: { fashion_tags?: string[], general_tags?: string[] }, category?: ItemCategory): string | null {
    if (!category) {
      this.logger.debug('[CategoryExtractor] Cannot extract subcategory without category');
      return null;
    }
    
    this.logger.debug(`[CategoryExtractor] Extracting subcategory for category ${category}`);
    
    // Get valid subcategories for this category
    const validSubcategories = getSubcategoriesForCategory(category);
    
    if (!validSubcategories || validSubcategories.length === 0) {
      this.logger.debug(`[CategoryExtractor] No subcategories defined for category ${category}`);
      return null;
    }
    
    this.logger.debug(`[CategoryExtractor] Valid subcategories for ${category}:`, validSubcategories);
    
    // Create normalized keywords from subcategory names for matching
    const subcategoryKeywords = validSubcategories.map(subcategory => {
      return {
        subcategory,
        keywords: [subcategory.toLowerCase()]
      };
    });
    
    // Combine fashion and general tags for best coverage
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[CategoryExtractor] Combined tags for subcategory extraction:', allTags);
    
    // Find the first tag that matches a subcategory keyword
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const { subcategory, keywords } of subcategoryKeywords) {
        if (keywords.some(keyword => normalizedTag.includes(keyword))) {
          this.logger.debug(`[CategoryExtractor] Found subcategory ${subcategory} from tag ${tag}`);
          return subcategory;
        }
      }
    }
    
    // If no specific match, use a default subcategory if available
    if (validSubcategories.length > 0) {
      this.logger.debug(`[CategoryExtractor] Using default subcategory ${validSubcategories[0]}`);
      return validSubcategories[0];
    }
    
    this.logger.debug('[CategoryExtractor] No subcategory found');
    return null;
  }
}
