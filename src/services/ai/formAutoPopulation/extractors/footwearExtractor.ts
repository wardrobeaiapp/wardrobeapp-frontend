import { ItemCategory } from '../../../../types';
import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';

/**
 * Responsible for extracting footwear-specific information from detected tags
 */
export class FootwearExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the heel height from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category (should be FOOTWEAR)
   * @returns The detected heel height or undefined if no heel height could be determined
   */
  extractHeelHeight(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory): string | null {
    // Only extract heel height for footwear
    if (category !== ItemCategory.FOOTWEAR) {
      this.logger.debug(`[FootwearExtractor] Heel height extraction not applicable for category ${category}`);
      return null;
    }
    this.logger.debug('[FootwearExtractor] Extracting heel height from tags');
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[FootwearExtractor] Checking combined tags for heel height information:', allTags);
    
    // Heel height keywords
    const heelHeightKeywords = [
      'flat', 'no heel', 'low heel', 'kitten heel', 'mid heel', 'medium heel',
      'high heel', 'stiletto', 'platform', 'wedge', 'block heel', 'chunky heel',
      '1 inch heel', '2 inch heel', '3 inch heel', '4 inch heel', '5 inch heel'
    ];
    
    // Find tags that match heel height keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of heelHeightKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Standardize heel height terminology
          let standardHeelHeight: string;
          
          if (normalizedKeyword.includes('flat') || normalizedKeyword.includes('no heel')) {
            standardHeelHeight = 'Flat';
          } else if (normalizedKeyword.includes('low') || normalizedKeyword.includes('kitten')) {
            standardHeelHeight = 'Low Heel';
          } else if (normalizedKeyword.includes('mid') || normalizedKeyword.includes('medium')) {
            standardHeelHeight = 'Medium Heel';
          } else if (normalizedKeyword.includes('high') || normalizedKeyword.includes('stiletto')) {
            standardHeelHeight = 'High Heel';
          } else if (normalizedKeyword.includes('platform')) {
            standardHeelHeight = 'Platform';
          } else if (normalizedKeyword.includes('wedge')) {
            standardHeelHeight = 'Wedge';
          } else if (normalizedKeyword.includes('block') || normalizedKeyword.includes('chunky')) {
            standardHeelHeight = 'Block Heel';
          } else if (normalizedKeyword.includes('inch')) {
            // Extract numerical height if available
            const match = normalizedKeyword.match(/(\d+)\s*inch/);
            if (match && match[1]) {
              const inches = parseInt(match[1], 10);
              if (inches <= 1) {
                standardHeelHeight = 'Low Heel';
              } else if (inches <= 2) {
                standardHeelHeight = 'Medium Heel';
              } else {
                standardHeelHeight = 'High Heel';
              }
            } else {
              standardHeelHeight = 'Medium Heel'; // Default if we can't parse the inches
            }
          } else {
            standardHeelHeight = keyword.charAt(0).toUpperCase() + keyword.slice(1);
          }
          
          this.logger.debug(`[FootwearExtractor] Found heel height "${standardHeelHeight}" from tag "${tag}"`);
          return standardHeelHeight;
        }
      }
    }
    
    // Check for specific footwear types that imply heel height
    const flatFootwearTypes = ['sneaker', 'flat', 'slipper', 'loafer', 'oxford', 'moccasin', 'ballet flat', 'espadrille'];
    const highHeelTypes = ['pump', 'stiletto', 'high heel'];
    
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      if (flatFootwearTypes.some(type => normalizedTag.includes(type))) {
        this.logger.debug(`[FootwearExtractor] Inferred "Flat" heel height from footwear type "${tag}"`);
        return 'Flat';
      }
      
      if (highHeelTypes.some(type => normalizedTag.includes(type))) {
        this.logger.debug(`[FootwearExtractor] Inferred "High Heel" from footwear type "${tag}"`);
        return 'High Heel';
      }
    }
    
    this.logger.debug('[FootwearExtractor] No heel height found in tags');
    return null;
  }

  /**
   * Extract the boot height from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category (should be FOOTWEAR)
   * @param subcategory The item subcategory (used to check if it's a boot)
   * @returns The detected boot height or undefined if no boot height could be determined
   */
  extractBootHeight(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory, subcategory?: string): string | null {
    // Only extract boot height for footwear
    if (category !== ItemCategory.FOOTWEAR) {
      this.logger.debug(`[FootwearExtractor] Boot height extraction not applicable for category ${category}`);
      return null;
    }
    this.logger.debug('[FootwearExtractor] Extracting boot height from tags');
    
    // Only attempt to extract boot height if we detect it's a boot
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    const isBootType = allTags.some(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return normalizedTag.includes('boot');
    });
    
    if (!isBootType) {
      this.logger.debug('[FootwearExtractor] Not a boot type, skipping boot height extraction');
      return null;
    }
    
    this.logger.debug('[FootwearExtractor] Checking combined tags for boot height information:', allTags);
    
    // Boot height keywords
    const bootHeightKeywords = [
      'ankle boot', 'ankle bootie', 'mid calf boot', 'mid-calf boot',
      'calf boot', 'knee high boot', 'knee-high boot', 'over the knee boot',
      'over-the-knee boot', 'thigh high boot', 'thigh-high boot', 'combat boot',
      'chelsea boot', 'ankle height', 'calf height', 'knee height', 'thigh height'
    ];
    
    // Find tags that match boot height keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of bootHeightKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Standardize boot height terminology
          let standardBootHeight: string;
          
          if (normalizedKeyword.includes('ankle')) {
            standardBootHeight = 'Ankle';
          } else if (normalizedKeyword.includes('mid calf') || normalizedKeyword.includes('mid-calf')) {
            standardBootHeight = 'Mid-Calf';
          } else if (normalizedKeyword.includes('calf') && !normalizedKeyword.includes('mid')) {
            standardBootHeight = 'Calf';
          } else if (normalizedKeyword.includes('knee high') || normalizedKeyword.includes('knee-high')) {
            standardBootHeight = 'Knee-High';
          } else if (normalizedKeyword.includes('over the knee') || normalizedKeyword.includes('over-the-knee')) {
            standardBootHeight = 'Over-the-Knee';
          } else if (normalizedKeyword.includes('thigh high') || normalizedKeyword.includes('thigh-high')) {
            standardBootHeight = 'Thigh-High';
          } else if (normalizedKeyword.includes('combat')) {
            standardBootHeight = 'Ankle'; // Combat boots are typically ankle height
          } else if (normalizedKeyword.includes('chelsea')) {
            standardBootHeight = 'Ankle'; // Chelsea boots are ankle height
          } else {
            // If no specific match, use the first word of the keyword as the height
            standardBootHeight = keyword.split(' ')[0];
            standardBootHeight = standardBootHeight.charAt(0).toUpperCase() + standardBootHeight.slice(1);
          }
          
          this.logger.debug(`[FootwearExtractor] Found boot height "${standardBootHeight}" from tag "${tag}"`);
          return standardBootHeight;
        }
      }
    }
    
    // If it's a boot but we couldn't determine height, default to ankle height
    this.logger.debug('[FootwearExtractor] Boot detected but no specific height found, defaulting to "Ankle"');
    return 'Ankle';
  }

  /**
   * Extract the footwear type based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category (should be FOOTWEAR)
   * @param subcategory Optional subcategory for more specific matching
   * @returns The detected footwear type or undefined if no type could be determined
   */
  extractType(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory, subcategory?: string): string | null {
    this.logger.debug(`[FootwearExtractor] Extracting type from tags for category ${category}`);
    
    // Only extract type for footwear
    if (category !== ItemCategory.FOOTWEAR) {
      this.logger.debug(`[FootwearExtractor] Type extraction not applicable for category ${category}`);
      return null;
    }
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    
    // Footwear type keywords
    const typeKeywords = [
      'sneakers', 'athletic shoes', 'running shoes', 'boots', 'ankle boots',
      'booties', 'combat boots', 'rain boots', 'chelsea boots', 'winter boots',
      'riding boots', 'knee-high boots', 'thigh-high boots', 'sandals', 'flip-flops',
      'slides', 'mules', 'espadrilles', 'wedges', 'platforms', 'heels', 'pumps',
      'stilettos', 'loafers', 'oxfords', 'brogues', 'boat shoes', 'deck shoes',
      'slippers', 'flats', 'ballet flats', 'moccasins', 'clogs'
    ];
    
    // Find tags that match footwear type keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of typeKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Format type with proper capitalization
          const formattedType = this.formatTypeName(keyword);
          this.logger.debug(`[FootwearExtractor] Found type "${formattedType}" from tag "${tag}"`);
          return formattedType;
        }
      }
    }
    
    // If we have a subcategory, it might be the type already
    if (subcategory) {
      this.logger.debug(`[FootwearExtractor] Using subcategory "${subcategory}" as type`);
      return subcategory;
    }
    
    this.logger.debug('[FootwearExtractor] No specific type found in tags');
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
