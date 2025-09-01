import { ItemCategory } from '../../../../types';
import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';

/**
 * Responsible for generating item names based on detected tags and categories
 */
export class NameGenerator {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Generate a descriptive name for an item based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category
   * @param subcategory Optional subcategory for more specific naming
   * @param color Optional color to include in the name
   * @param pattern Optional pattern to include in the name
   * @returns A generated name for the item
   */
  generateName(
    tags: { fashion_tags?: string[], general_tags?: string[], color_tags?: string[] },
    category: ItemCategory,
    subcategory?: string,
    color?: string,
    pattern?: string
  ): string {
    this.logger.debug('[NameGenerator] Generating name for item', { category, subcategory, color, pattern });
    
    // Start with color and pattern if available
    let descriptors: string[] = [];
    
    // Add color if available
    if (color) {
      descriptors.push(color);
    }
    
    // Add pattern if available and not "Solid"
    if (pattern && pattern.toLowerCase() !== 'solid') {
      descriptors.push(pattern);
    }
    
    // Look for descriptive adjectives in tags
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    
    // Common descriptive adjectives to look for
    const descriptiveAdjectives = [
      'casual', 'formal', 'slim', 'relaxed', 'vintage', 'classic', 'modern',
      'dressy', 'elegant', 'professional', 'cozy', 'comfortable', 'oversized',
      'fitted', 'loose', 'structured', 'distressed', 'ripped', 'faded',
      'embroidered', 'embellished', 'printed', 'graphic', 'plain', 'basic',
      'premium', 'luxury', 'essential', 'signature', 'stretch', 'soft',
      'lightweight', 'heavyweight', 'warm', 'cool', 'breathable', 'waterproof',
      'insulated', 'padded', 'quilted', 'fleece-lined'
    ];
    
    // Add up to two descriptive adjectives from tags
    const adjectivesFromTags = allTags
      .filter(tag => descriptiveAdjectives.some(adj => 
        ExtractionHelpers.normalizeString(tag).includes(ExtractionHelpers.normalizeString(adj))))
      .slice(0, 2);
    
    if (adjectivesFromTags.length > 0) {
      descriptors = [...descriptors, ...adjectivesFromTags];
    }
    
    // Use subcategory if available, otherwise use category
    const itemType = subcategory || this.getCategoryDisplayName(category);
    
    // Combine descriptors with item type
    let name = '';
    if (descriptors.length > 0) {
      // Format descriptors and join with spaces
      const formattedDescriptors = descriptors
        .map(desc => desc.charAt(0).toUpperCase() + desc.slice(1).toLowerCase())
        .join(' ');
      
      name = `${formattedDescriptors} ${itemType}`;
    } else {
      // Just use the item type if no descriptors
      name = itemType;
    }
    
    this.logger.debug(`[NameGenerator] Generated name: "${name}"`);
    return name;
  }

  /**
   * Get a display name for a category
   */
  private getCategoryDisplayName(category: ItemCategory): string {
    switch (category) {
      case ItemCategory.TOP:
        return 'Top';
      case ItemCategory.BOTTOM:
        return 'Bottom';
      case ItemCategory.ONE_PIECE:
        return 'One-Piece';
      case ItemCategory.OUTERWEAR:
        return 'Outerwear';
      case ItemCategory.FOOTWEAR:
        return 'Footwear';
      case ItemCategory.ACCESSORY:
        return 'Accessory';
      case ItemCategory.OTHER:
        return 'Other';
      default:
        return 'Item';
    }
  }
}
