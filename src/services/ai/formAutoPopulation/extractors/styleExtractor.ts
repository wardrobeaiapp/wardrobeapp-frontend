import { ItemCategory } from '../../../../types';
import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';

/**
 * Responsible for extracting style-related information from detected tags
 */
export class StyleExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the general style from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @returns The detected style or undefined if no style could be determined
   */
  extractStyle(tags: { fashion_tags?: string[], general_tags?: string[] }): string | null {
    this.logger.debug('[StyleExtractor] Extracting style from tags');
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[StyleExtractor] Checking combined tags for style information:', allTags);
    
    // Style keywords to look for
    const styleKeywords = [
      'casual', 'formal', 'business', 'elegant', 'professional', 'sophisticated', 
      'preppy', 'boho', 'bohemian', 'vintage', 'retro', 'classic', 'traditional', 
      'modern', 'contemporary', 'minimalist', 'streetwear', 'athleisure', 'athletic',
      'sporty', 'edgy', 'punk', 'grunge', 'rock', 'glamorous', 'chic', 'trendy',
      'hipster', 'artsy', 'romantic', 'feminine', 'masculine', 'androgynous',
      'western', 'country', 'cottagecore', 'normcore', 'y2k', 'goth', 'skater',
      'business casual', 'smart casual', 'cocktail', 'festive', 'workwear'
    ];
    
    // Find tags that contain style keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of styleKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Format style with proper capitalization
          const formattedStyle = this.formatStyleName(keyword);
          this.logger.debug(`[StyleExtractor] Found style "${formattedStyle}" from tag "${tag}"`);
          return formattedStyle;
        }
      }
    }
    
    this.logger.debug('[StyleExtractor] No specific style found in tags');
    return null;
  }

  /**
   * Extract the silhouette based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category for context
   * @param subcategory Optional subcategory for more specific matching
   * @returns The detected silhouette or undefined if no silhouette could be determined
   */
  extractSilhouette(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory, subcategory?: string): string | null {
    this.logger.debug(`[StyleExtractor] Extracting silhouette from tags for category ${category}`);
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    
    // Silhouette keywords by category
    const silhouetteKeywords: Record<ItemCategory, string[]> = {
      [ItemCategory.TOP]: [
        'fitted', 'slim fit', 'loose', 'oversized', 'relaxed fit', 'boxy',
        'cropped', 'peplum', 'draped', 'structured', 'tailored', 'flowy'
      ],
      [ItemCategory.BOTTOM]: [
        'skinny', 'slim', 'straight leg', 'wide leg', 'bootcut', 'flared',
        'tapered', 'relaxed fit', 'boyfriend', 'mom', 'baggy', 'pleated',
        'palazzo', 'high-waisted', 'low-rise', 'mid-rise', 'paper bag'
      ],
      [ItemCategory.ONE_PIECE]: [
        'a-line', 'shift', 'bodycon', 'wrap', 'fit and flare', 'maxi', 'midi',
        'mini', 'sheath', 'empire waist', 'column', 'ballgown', 'mermaid',
        'trumpet', 'loose', 'oversized', 'baggy'
      ],
      [ItemCategory.OUTERWEAR]: [
        'fitted', 'slim fit', 'oversized', 'boxy', 'relaxed fit', 'cropped',
        'longline', 'structured', 'tailored', 'cocoon', 'double-breasted'
      ],
      [ItemCategory.FOOTWEAR]: [
        'pointed toe', 'round toe', 'square toe', 'open toe', 'peep toe',
        'almond toe', 'chunky', 'slim', 'platform', 'stiletto', 'block heel',
        'flat', 'slip-on', 'lace-up', 'ankle strap'
      ],
      [ItemCategory.ACCESSORY]: ['oversized', 'mini', 'structured', 'slouchy', 'hobo'],
      [ItemCategory.OTHER]: ['fitted', 'relaxed', 'compression', 'loose', 'oversized', 'high-waisted', 'cheeky', 'full coverage', 'brazilian']
    };
    
    // Get relevant silhouette keywords for this category
    const relevantKeywords = silhouetteKeywords[category] || [];
    
    // Find tags that match silhouette keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of relevantKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Format silhouette with proper capitalization
          const formattedSilhouette = this.formatStyleName(keyword);
          this.logger.debug(`[StyleExtractor] Found silhouette "${formattedSilhouette}" from tag "${tag}"`);
          return formattedSilhouette;
        }
      }
    }
    
    // If we have a subcategory, it might help determine silhouette
    if (subcategory) {
      this.logger.debug(`[StyleExtractor] Checking if subcategory "${subcategory}" implies a silhouette`);
      
      // Map certain subcategories to default silhouettes
      const subcategorySilhouetteMap: Record<string, string> = {
        'Skinny Jeans': 'Skinny',
        'Boyfriend Jeans': 'Relaxed',
        'Mom Jeans': 'High-Waisted',
        'Wide-Leg Pants': 'Wide Leg',
        'Bootcut Jeans': 'Bootcut',
        'Flared Pants': 'Flared',
        'Straight Leg Pants': 'Straight Leg',
        'A-Line Skirt': 'A-Line',
        'Pencil Skirt': 'Fitted',
        'Maxi Dress': 'Maxi',
        'Midi Dress': 'Midi',
        'Mini Dress': 'Mini',
        'Shift Dress': 'Shift',
        'Wrap Dress': 'Wrap',
        'Bodycon Dress': 'Bodycon',
        'Oversized Sweater': 'Oversized',
        'Slim Fit Shirt': 'Slim Fit',
        'Boxy T-Shirt': 'Boxy',
        'Cropped Top': 'Cropped'
      };
      
      if (subcategory in subcategorySilhouetteMap) {
        const silhouette = subcategorySilhouetteMap[subcategory];
        this.logger.debug(`[StyleExtractor] Using silhouette "${silhouette}" based on subcategory "${subcategory}"`);
        return silhouette;
      }
    }
    
    this.logger.debug('[StyleExtractor] No specific silhouette found in tags');
    return null;
  }

  /**
   * Extract the length based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category for context
   * @returns The detected length or undefined if no length could be determined
   */
  extractLength(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory): string | null {
    this.logger.debug(`[StyleExtractor] Extracting length from tags for category ${category}`);
    
    // Only extract length for relevant categories
    if (![ItemCategory.TOP, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE, ItemCategory.OUTERWEAR].includes(category)) {
      this.logger.debug(`[StyleExtractor] Length not applicable for category ${category}`);
      return null;
    }
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    
    // Length keywords by category
    const lengthKeywords: Record<ItemCategory, string[]> = {
      [ItemCategory.TOP]: [
        'cropped', 'short', 'waist length', 'hip length', 'regular length',
        'long', 'tunic length', 'thigh length', 'longline'
      ],
      [ItemCategory.BOTTOM]: [
        'mini', 'short', 'bermuda length', 'knee length', 'midi',
        'calf length', 'ankle length', 'full length', 'maxi', 'floor length'
      ],
      [ItemCategory.ONE_PIECE]: [
        'mini', 'short', 'above knee', 'knee length', 'midi',
        'calf length', 'ankle length', 'full length', 'maxi', 'floor length'
      ],
      [ItemCategory.OUTERWEAR]: [
        'cropped', 'waist length', 'hip length', 'mid-thigh', 'knee length',
        'long', 'ankle length', 'floor length', 'midi', 'maxi'
      ],
      [ItemCategory.FOOTWEAR]: [],
      [ItemCategory.ACCESSORY]: [],
      [ItemCategory.OTHER]: []
    };
    
    // Get relevant length keywords for this category
    const relevantKeywords = lengthKeywords[category] || [];
    
    // Find tags that match length keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of relevantKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Format length with proper capitalization
          const formattedLength = this.formatStyleName(keyword);
          this.logger.debug(`[StyleExtractor] Found length "${formattedLength}" from tag "${tag}"`);
          return formattedLength;
        }
      }
    }
    
    this.logger.debug('[StyleExtractor] No specific length found in tags');
    return null;
  }

  /**
   * Extract the sleeve type based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category for context
   * @returns The detected sleeve type or undefined if no sleeve type could be determined
   */
  extractSleeves(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory): string | null {
    this.logger.debug(`[StyleExtractor] Extracting sleeves from tags for category ${category}`);
    
    // Only extract sleeves for relevant categories
    if (![ItemCategory.TOP, ItemCategory.ONE_PIECE, ItemCategory.OUTERWEAR].includes(category)) {
      this.logger.debug(`[StyleExtractor] Sleeves not applicable for category ${category}`);
      return null;
    }
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    
    // Sleeve keywords
    const sleeveKeywords = [
      'sleeveless', 'tank', 'strapless', 'spaghetti strap', 'cap sleeve',
      'short sleeve', 'elbow length', 'three-quarter sleeve', '3/4 sleeve',
      'long sleeve', 'bell sleeve', 'flutter sleeve', 'puff sleeve',
      'bishop sleeve', 'dolman sleeve', 'batwing sleeve', 'raglan sleeve',
      'kimono sleeve', 'off-shoulder', 'cold shoulder', 'one shoulder'
    ];
    
    // Find tags that match sleeve keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of sleeveKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Format sleeve type with proper capitalization
          const formattedSleeves = this.formatStyleName(keyword);
          this.logger.debug(`[StyleExtractor] Found sleeves "${formattedSleeves}" from tag "${tag}"`);
          return formattedSleeves;
        }
      }
    }
    
    // Check if we can infer from other tags (e.g., "tank top" implies sleeveless)
    if (allTags.some(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return normalizedTag.includes('tank top') || normalizedTag === 'tank';
    })) {
      this.logger.debug('[StyleExtractor] Inferred "Sleeveless" from tank top');
      return 'Sleeveless';
    }
    
    this.logger.debug('[StyleExtractor] No specific sleeves found in tags');
    return null;
  }

  /**
   * Extract the rise (for bottoms) based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category for context
   * @returns The detected rise or undefined if no rise could be determined
   */
  extractRise(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory): string | null {
    this.logger.debug(`[StyleExtractor] Extracting rise from tags for category ${category}`);
    
    // Only extract rise for bottoms
    if (category !== ItemCategory.BOTTOM) {
      this.logger.debug(`[StyleExtractor] Rise not applicable for category ${category}`);
      return null;
    }
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    
    // Rise keywords
    const riseKeywords = [
      'high rise', 'high-rise', 'high waist', 'high-waist', 'high-waisted',
      'mid rise', 'mid-rise', 'medium rise', 'medium-rise', 'medium waist',
      'low rise', 'low-rise', 'low waist', 'low-waist', 'ultra high-rise',
      'super high-rise'
    ];
    
    // Find tags that match rise keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of riseKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Map to standard rise terms
          let standardRise: string;
          
          if (normalizedKeyword.includes('high')) {
            standardRise = 'High-Rise';
          } else if (normalizedKeyword.includes('mid') || normalizedKeyword.includes('medium')) {
            standardRise = 'Mid-Rise';
          } else if (normalizedKeyword.includes('low')) {
            standardRise = 'Low-Rise';
          } else {
            standardRise = this.formatStyleName(keyword);
          }
          
          this.logger.debug(`[StyleExtractor] Found rise "${standardRise}" from tag "${tag}"`);
          return standardRise;
        }
      }
    }
    
    // Check for specific subcategory indicators
    if (allTags.some(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return normalizedTag.includes('mom jeans') || normalizedTag === 'mom jean';
    })) {
      this.logger.debug('[StyleExtractor] Inferred "High-Rise" from mom jeans');
      return 'High-Rise';
    }
    
    this.logger.debug('[StyleExtractor] No specific rise found in tags');
    return null;
  }

  /**
   * Extract the neckline based on detected tags and category
   * @param tags Object containing detected tags from AI analysis
   * @param category The item category for context
   * @returns The detected neckline or undefined if no neckline could be determined
   */
  extractNeckline(tags: { fashion_tags?: string[], general_tags?: string[] }, category: ItemCategory): string | null {
    this.logger.debug(`[StyleExtractor] Extracting neckline from tags for category ${category}`);
    
    // Only extract neckline for relevant categories
    if (![ItemCategory.TOP, ItemCategory.ONE_PIECE].includes(category)) {
      this.logger.debug(`[StyleExtractor] Neckline not applicable for category ${category}`);
      return null;
    }
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    
    // Neckline keywords
    const necklineKeywords = [
      'crew neck', 'crewneck', 'round neck', 'v-neck', 'v neck', 'scoop neck',
      'square neck', 'boat neck', 'bateau neck', 'sweetheart', 'halter neck',
      'mock neck', 'turtleneck', 'cowl neck', 'off-shoulder', 'off shoulder',
      'one-shoulder', 'one shoulder', 'cold shoulder', 'keyhole', 'plunge',
      'deep v', 'notch', 'high neck', 'collared', 'button-down', 'button up',
      'peter pan collar', 'polo', 'henley'
    ];
    
    // Find tags that match neckline keywords
    for (const tag of allTags) {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      
      for (const keyword of necklineKeywords) {
        const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
        
        if (normalizedTag.includes(normalizedKeyword) || normalizedTag === normalizedKeyword) {
          // Map to standard neckline terms
          let standardNeckline: string;
          
          if (normalizedKeyword.includes('crew') || normalizedKeyword.includes('round')) {
            standardNeckline = 'Crew Neck';
          } else if (normalizedKeyword.includes('v-neck') || normalizedKeyword === 'v neck' || normalizedKeyword.includes('deep v')) {
            standardNeckline = 'V-Neck';
          } else if (normalizedKeyword.includes('turtle') || normalizedKeyword.includes('mock')) {
            standardNeckline = 'Turtleneck';
          } else if (normalizedKeyword.includes('off') && normalizedKeyword.includes('shoulder')) {
            standardNeckline = 'Off-Shoulder';
          } else {
            standardNeckline = this.formatStyleName(keyword);
          }
          
          this.logger.debug(`[StyleExtractor] Found neckline "${standardNeckline}" from tag "${tag}"`);
          return standardNeckline;
        }
      }
    }
    
    // Check for specific indicators from subcategory
    if (allTags.some(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return normalizedTag.includes('polo shirt') || normalizedTag === 'polo';
    })) {
      this.logger.debug('[StyleExtractor] Inferred "Collared" neckline from polo shirt');
      return 'Collared';
    }
    
    if (allTags.some(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return normalizedTag.includes('button') && (normalizedTag.includes('down') || normalizedTag.includes('up'));
    })) {
      this.logger.debug('[StyleExtractor] Inferred "Collared" neckline from button-down/button-up shirt');
      return 'Collared';
    }
    
    this.logger.debug('[StyleExtractor] No specific neckline found in tags');
    return null;
  }

  /**
   * Format a style name with proper capitalization
   */
  private formatStyleName(styleName: string): string {
    // Special case formatting for hyphenated terms
    if (styleName.includes('-')) {
      return styleName.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-');
    }
    
    // Handle multi-word style names
    return styleName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
