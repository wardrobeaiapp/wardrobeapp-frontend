import { ItemCategory } from '../../../../types';
import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';

/**
 * Responsible for extracting size information from detected tags
 */
export class SizeExtractor {
  private logger: Logger;
  
  // Common size terms that might appear in tags
  private commonSizeTerms = [
    'xxs', 'xs', 'small', 'medium', 'large', 'xl', 'xxl', '2xl', '3xl', '4xl',
    'petite', 'plus size', 'oversized', 'slim fit', 'regular fit', 'relaxed fit',
    'size 0', 'size 2', 'size 4', 'size 6', 'size 8', 'size 10', 'size 12',
    'size 14', 'size 16', 'size 18', 'size 20', 'size 22', 'size 24'
  ];
  
  // Footwear size terms
  private footwearSizeTerms = [
    'size 5', 'size 6', 'size 7', 'size 8', 'size 9', 'size 10', 'size 11', 'size 12',
    'size 5.5', 'size 6.5', 'size 7.5', 'size 8.5', 'size 9.5', 'size 10.5', 'size 11.5',
    'eu 36', 'eu 37', 'eu 38', 'eu 39', 'eu 40', 'eu 41', 'eu 42', 'eu 43', 'eu 44', 'eu 45',
    'uk 3', 'uk 4', 'uk 5', 'uk 6', 'uk 7', 'uk 8', 'uk 9', 'uk 10', 'uk 11'
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the size from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category for context
   * @returns The detected size or undefined if no size could be determined
   */
  extractSize(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory): string | null {
    this.logger.debug('[SizeExtractor] Extracting size from tags for category:', category);
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[SizeExtractor] Checking combined tags for size information:', allTags);
    
    // Determine which size terms to use based on category
    const sizeTerms = category === ItemCategory.FOOTWEAR ? this.footwearSizeTerms : this.commonSizeTerms;
    
    // Find tags that contain size terms
    const sizeTags = allTags.filter(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return sizeTerms.some(size => {
        const normalizedSize = ExtractionHelpers.normalizeString(size);
        return normalizedTag.includes(normalizedSize) || normalizedTag === normalizedSize;
      });
    });
    
    if (sizeTags.length > 0) {
      this.logger.debug('[SizeExtractor] Found size-related tags:', sizeTags);
      
      // Format the size name (capitalize first letter if a word)
      const sizeTag = sizeTags[0];
      const formattedSize = this.formatSize(sizeTag);
      
      this.logger.debug(`[SizeExtractor] Extracted size: ${formattedSize}`);
      return formattedSize;
    }
    
    this.logger.debug('[SizeExtractor] No size found in tags');
    return null;
  }

  /**
   * Format a size string for display
   */
  private formatSize(sizeString: string): string {
    // Special case formatting for specific size formats
    
    // Convert to lowercase for processing
    const lowerSize = sizeString.toLowerCase();
    
    // Handle special cases
    if (lowerSize === 'xs' || lowerSize === 'xxs' || lowerSize === 'xl' || lowerSize === 'xxl') {
      return lowerSize.toUpperCase();
    }
    
    if (lowerSize === 'small') return 'Small';
    if (lowerSize === 'medium') return 'Medium';
    if (lowerSize === 'large') return 'Large';
    
    if (lowerSize.startsWith('size ')) {
      return lowerSize.charAt(0).toUpperCase() + lowerSize.slice(1);
    }
    
    if (lowerSize.startsWith('eu ') || lowerSize.startsWith('uk ')) {
      return lowerSize.toUpperCase();
    }
    
    // Default formatting - capitalize first letter
    return sizeString.charAt(0).toUpperCase() + sizeString.slice(1).toLowerCase();
  }
}
