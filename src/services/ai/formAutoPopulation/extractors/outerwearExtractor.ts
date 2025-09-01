import { ItemCategory } from '../../../../types';
import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';

/**
 * Responsible for extracting outerwear-specific information from detected tags
 */
export class OuterwearExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the outerwear type based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category for context
   * @param subcategory Optional subcategory for more specific matching
   * @returns The detected outerwear type or undefined if no type could be determined
   */
  extractType(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory, subcategory?: string): string | null {
    this.logger.debug(`[OuterwearExtractor] Extracting type from tags for category ${category}`);
    
    // Only extract type for outerwear
    if (category !== ItemCategory.OUTERWEAR) {
      this.logger.debug(`[OuterwearExtractor] Type extraction not applicable for category ${category}`);
      return null;
    }
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    
    // Outerwear type keywords
    const typeKeywords = [
      'jacket', 'coat', 'blazer', 'parka', 'peacoat', 'trench coat',
      'windbreaker', 'bomber', 'denim jacket', 'leather jacket', 'puffer',
      'raincoat', 'cape', 'poncho', 'cardigan', 'sweater coat',
      'overcoat', 'fur coat', 'down jacket', 'quilted jacket',
      'sports jacket', 'varsity jacket', 'ski jacket', 'winter coat'
    ];
    
    // Find tags that match outerwear type keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of typeKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Format type with proper capitalization
          const formattedType = this.formatTypeName(keyword);
          this.logger.debug(`[OuterwearExtractor] Found type "${formattedType}" from tag "${tag}"`);
          return formattedType;
        }
      }
    }
    
    // If we have a subcategory, it might be the type already
    if (subcategory) {
      this.logger.debug(`[OuterwearExtractor] Using subcategory "${subcategory}" as type`);
      return subcategory;
    }
    
    this.logger.debug('[OuterwearExtractor] No specific type found in tags');
    return null;
  }

  /**
   * Format a type name with proper capitalization
   */
  private formatTypeName(typeName: string): string {
    return typeName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
