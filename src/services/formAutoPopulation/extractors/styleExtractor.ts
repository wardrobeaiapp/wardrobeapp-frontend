import { ItemCategory } from '../../../types';
import { DetectedTags, FieldExtractorFn } from '../types';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Style and silhouette mappings by category
 */
const styleMappings: Record<string, string> = {
  // General styles
  'casual': 'Casual',
  'formal': 'Formal',
  'business': 'Business',
  'professional': 'Business',
  'dressy': 'Dressy',
  'elegant': 'Elegant',
  'chic': 'Chic',
  'bohemian': 'Bohemian',
  'boho': 'Bohemian',
  'sporty': 'Sporty',
  'athletic': 'Athletic',
  'preppy': 'Preppy',
  'vintage': 'Vintage',
  'retro': 'Retro',
  'classic': 'Classic',
  'minimalist': 'Minimalist',
  'trendy': 'Trendy',
  'streetwear': 'Streetwear',
  'loungewear': 'Loungewear',
  'sleepwear': 'Sleepwear',
  'punk': 'Punk',
  'rock': 'Rock',
  'grunge': 'Grunge',
  'goth': 'Gothic',
  'gothic': 'Gothic',
  'romantic': 'Romantic',
  'feminine': 'Feminine',
  'masculine': 'Masculine',
  'androgynous': 'Androgynous',
  'western': 'Western',
  'country': 'Western',
  'festive': 'Festive',
  'holiday': 'Holiday',
  'resort': 'Resort',
  'vacation': 'Vacation',
  'beach': 'Beach',
  'summer': 'Summer',
  'winter': 'Winter',
  'fall': 'Fall',
  'spring': 'Spring',
  'everyday': 'Everyday',
  'workwear': 'Workwear',
  'office': 'Office',
  'party': 'Party',
  'evening': 'Evening',
  'cocktail': 'Cocktail',
  'wedding': 'Wedding',
  'bridal': 'Bridal',
  'statement': 'Statement'
};

/**
 * Silhouette mappings by category
 */
const silhouetteMappings: Partial<Record<ItemCategory, Record<string, string>>> = {
  [ItemCategory.TOP]: {
    'slim': 'Slim Fit',
    'fitted': 'Fitted',
    'tight': 'Fitted',
    'relaxed': 'Relaxed',
    'loose': 'Loose',
    'oversized': 'Oversized',
    'baggy': 'Oversized',
    'boxy': 'Boxy',
    'cropped': 'Cropped',
    'crop': 'Cropped',
    'peplum': 'Peplum',
    'bodycon': 'Bodycon',
    'draped': 'Draped',
    'flowy': 'Flowy',
    'structured': 'Structured',
    'a-line': 'A-Line',
    'trapeze': 'Trapeze',
    'swing': 'Swing',
    'babydoll': 'Babydoll',
  },
  [ItemCategory.BOTTOM]: {
    'straight': 'Straight Leg',
    'straight leg': 'Straight Leg',
    'slim': 'Slim Fit',
    'skinny': 'Skinny',
    'fitted': 'Fitted',
    'relaxed': 'Relaxed',
    'loose': 'Loose',
    'wide': 'Wide Leg',
    'wide leg': 'Wide Leg',
    'flared': 'Flared',
    'bootcut': 'Bootcut',
    'bell': 'Bell Bottom',
    'bell bottom': 'Bell Bottom',
    'tapered': 'Tapered',
    'harem': 'Harem',
    'baggy': 'Baggy',
    'oversized': 'Oversized',
    'pleated': 'Pleated',
    'cargo': 'Cargo',
    'boyfriend': 'Boyfriend',
    'mom': 'Mom Fit',
    'dad': 'Dad Fit',
    'palazzo': 'Palazzo',
    'culottes': 'Culottes',
    'pencil': 'Pencil',
    'a-line': 'A-Line',
    'mini': 'Mini',
    'midi': 'Midi',
    'maxi': 'Maxi',
    'high waisted': 'High-Waisted',
    'high-waisted': 'High-Waisted',
    'mid rise': 'Mid-Rise',
    'mid-rise': 'Mid-Rise',
    'low rise': 'Low-Rise',
    'low-rise': 'Low-Rise',
  },
  [ItemCategory.ONE_PIECE]: {
    'shift': 'Shift',
    'sheath': 'Sheath',
    'bodycon': 'Bodycon',
    'fit and flare': 'Fit-and-Flare',
    'fit-and-flare': 'Fit-and-Flare',
    'a-line': 'A-Line',
    'empire': 'Empire',
    'wrap': 'Wrap',
    'halter': 'Halter',
    'maxi': 'Maxi',
    'midi': 'Midi',
    'mini': 'Mini',
    'ballgown': 'Ballgown',
    'ball gown': 'Ballgown',
    'princess': 'Princess',
    'mermaid': 'Mermaid',
    'trumpet': 'Trumpet',
    'column': 'Column',
    'trapeze': 'Trapeze',
    'tent': 'Tent',
    'smock': 'Smock',
    'babydoll': 'Babydoll',
    'skater': 'Skater',
    'slip': 'Slip',
    'sundress': 'Sundress',
    'tunic': 'Tunic',
    'tshirt': 'T-Shirt',
    't-shirt': 'T-Shirt',
    'sweater': 'Sweater',
    'jumper': 'Jumper',
    'overall': 'Overall',
    'overalls': 'Overalls',
    'coverall': 'Coverall',
    'coveralls': 'Coveralls',
    'jumpsuit': 'Jumpsuit',
    'romper': 'Romper',
    'playsuit': 'Playsuit',
  },
  [ItemCategory.OUTERWEAR]: {
    'fitted': 'Fitted',
    'slim': 'Slim Fit',
    'tailored': 'Tailored',
    'structured': 'Structured',
    'relaxed': 'Relaxed',
    'loose': 'Loose',
    'oversized': 'Oversized',
    'boyfriend': 'Boyfriend',
    'cocoon': 'Cocoon',
    'boxy': 'Boxy',
    'cropped': 'Cropped',
    'crop': 'Cropped',
    'longline': 'Longline',
    'double breasted': 'Double-Breasted',
    'double-breasted': 'Double-Breasted',
    'single breasted': 'Single-Breasted',
    'single-breasted': 'Single-Breasted',
    'belted': 'Belted',
    'wrap': 'Wrap',
    'trench': 'Trench',
    'moto': 'Moto',
    'biker': 'Biker',
    'bomber': 'Bomber',
    'varsity': 'Varsity',
    'military': 'Military',
    'utility': 'Utility',
    'parka': 'Parka',
    'peacoat': 'Peacoat',
    'duffle': 'Duffle',
    'puffer': 'Puffer',
    'quilted': 'Quilted',
    'denim': 'Denim',
    'leather': 'Leather',
    'wool': 'Wool',
    'fleece': 'Fleece',
    'shearling': 'Shearling',
    'fur': 'Fur',
    'faux fur': 'Faux Fur',
  }
};

/**
 * Extractor class for style and silhouette-related fields
 */
export class StyleExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the item style from detected tags
   */
  extractStyle: FieldExtractorFn<string> = (tags) => {
    this.logger.debug('Extracting style from tags');
    
    // First check for direct style tag
    const styleTag = ExtractionHelpers.extractFromTags(tags, 'style', ['look', 'design', 'aesthetic']);
    
    if (styleTag) {
      const mappedStyle = ExtractionHelpers.mapToStandardOption(styleTag, styleMappings);
      if (mappedStyle) {
        this.logger.debug('Found style from style tag:', mappedStyle);
        return mappedStyle;
      }
    }
    
    // Look for style keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain style information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      // Check for style keywords in tag values
      for (const [styleKeyword, mappedStyle] of Object.entries(styleMappings)) {
        if (value.toLowerCase().includes(styleKeyword.toLowerCase())) {
          this.logger.debug(`Found style "${mappedStyle}" in tag "${key}": ${value}`);
          return mappedStyle;
        }
      }
    }
    
    // Check description
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [styleKeyword, mappedStyle] of Object.entries(styleMappings)) {
        if (description.toLowerCase().includes(styleKeyword.toLowerCase())) {
          this.logger.debug(`Found style "${mappedStyle}" in description: ${description}`);
          return mappedStyle;
        }
      }
    }
    
    // Couldn't determine style
    this.logger.debug('Could not determine style');
    return null;
  };

  /**
   * Extracts the item silhouette from detected tags
   */
  extractSilhouette: FieldExtractorFn<string> = (tags: DetectedTags, category?: ItemCategory, subcategory?: string) => {
    if (!category || !silhouetteMappings[category]) {
      this.logger.debug(`No silhouette mappings for category: ${category}`);
      return null;
    }
    
    this.logger.debug('Extracting silhouette for category:', category, 'subcategory:', subcategory);
    
    // Get valid form options for this category/subcategory combination
    const validFormOptions = this.getValidSilhouetteOptions(category, subcategory);
    this.logger.debug('Valid silhouette options for', category, subcategory, ':', validFormOptions);
    
    // First check for direct silhouette tag
    const silhouetteTag = ExtractionHelpers.extractFromTags(tags, 'silhouette', ['fit', 'shape', 'cut']);
    
    if (silhouetteTag) {
      const mappedSilhouette = this.mapToValidFormOption(silhouetteTag, validFormOptions);
      if (mappedSilhouette) {
        this.logger.debug('Found silhouette from silhouette tag:', mappedSilhouette);
        return mappedSilhouette;
      }
    }
    
    // Look for silhouette keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain silhouette information
      // NOTE: Don't skip 'subcategory' as it often contains silhouette info like "a-line skirts"
      const keyLower = key.toLowerCase();
      if (['category', 'color', 'pattern', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      // Try to map the value to a valid form option
      const mappedSilhouette = this.mapToValidFormOption(value, validFormOptions);
      if (mappedSilhouette) {
        this.logger.debug(`Found silhouette "${mappedSilhouette}" in tag "${key}": ${value}`);
        return mappedSilhouette;
      }
    }
    
    // Check description
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      const mappedSilhouette = this.mapToValidFormOption(description, validFormOptions);
      if (mappedSilhouette) {
        this.logger.debug(`Found silhouette "${mappedSilhouette}" in description: ${description}`);
        return mappedSilhouette;
      }
    }
    
    // Couldn't determine silhouette
    this.logger.debug('Could not determine silhouette');
    return null;
  };

  /**
   * Gets valid silhouette options from the form helpers
   */
  private getValidSilhouetteOptions(category: ItemCategory, subcategory?: string): string[] {
    try {
      // Import the form helper function
      const { getSilhouetteOptions } = require('../../../components/features/wardrobe/forms/WardrobeItemForm/utils/formHelpers');
      return getSilhouetteOptions(category, subcategory) || [];
    } catch (error) {
      this.logger.debug('Could not get valid silhouette options:', error);
      return [];
    }
  }

  /**
   * Maps a detected value to a valid form silhouette option
   */
  private mapToValidFormOption(value: string, validOptions: string[]): string | null {
    const lowerValue = value.toLowerCase();
    
    // First try exact match
    for (const option of validOptions) {
      if (lowerValue === option.toLowerCase()) {
        return option;
      }
    }
    
    // Then try partial matches
    for (const option of validOptions) {
      const lowerOption = option.toLowerCase();
      if (lowerValue.includes(lowerOption) || lowerOption.includes(lowerValue)) {
        return option;
      }
    }
    
    // Special keyword mappings that work across different subcategories
    const keywordMappings: Record<string, string> = {
      'a-line': 'A-Line',
      'aline': 'A-Line', 
      'pencil': 'Pencil',
      'straight': 'Straight',
      'pleated': 'Pleated',
      'wrap': 'Wrap',
      'skinny': 'Skinny',
      'slim': 'Slim Fit',
      'regular': 'Regular Fit',
      'relaxed': 'Relaxed Fit',
      'wide': 'Wide Leg',
      'bootcut': 'Bootcut',
      'flared': 'Flared'
    };
    
    for (const [keyword, mappedValue] of Object.entries(keywordMappings)) {
      if (lowerValue.includes(keyword)) {
        // Check if this mapped value is valid for the current form
        if (validOptions.includes(mappedValue)) {
          return mappedValue;
        }
      }
    }
    
    return null;
  }

  /**
   * Extracts the item length from detected tags
   */
  extractLength: FieldExtractorFn<string> = (tags: DetectedTags, category?: ItemCategory) => {
    if (!category) {
      this.logger.debug('Cannot extract length without a category');
      return null;
    }
    
    this.logger.debug('Extracting length for category:', category);
    
    // Length mappings
    const lengthMappings: Record<string, string> = {
      'mini': 'Mini',
      'short': 'Short',
      'crop': 'Cropped',
      'cropped': 'Cropped',
      'knee': 'Knee Length',
      'knee length': 'Knee Length',
      'knee-length': 'Knee Length',
      'midi': 'Midi',
      'mid-length': 'Midi',
      'calf': 'Calf Length',
      'calf length': 'Calf Length',
      'tea': 'Tea Length',
      'tea length': 'Tea Length',
      'maxi': 'Maxi',
      'long': 'Long',
      'floor': 'Floor Length',
      'floor length': 'Floor Length',
      'ankle': 'Ankle Length',
      'ankle length': 'Ankle Length',
      'full': 'Full Length',
      'full length': 'Full Length',
    };
    
    // First check for direct length tag
    const lengthTag = ExtractionHelpers.extractFromTags(tags, 'length', ['elongation', 'extent']);
    
    if (lengthTag) {
      const mappedLength = ExtractionHelpers.mapToStandardOption(lengthTag, lengthMappings);
      if (mappedLength) {
        this.logger.debug('Found length from length tag:', mappedLength);
        return mappedLength;
      }
    }
    
    // Look for length keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain length information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      // Check for length keywords in tag values
      for (const [lengthKeyword, mappedLength] of Object.entries(lengthMappings)) {
        if (value.toLowerCase().includes(lengthKeyword.toLowerCase())) {
          this.logger.debug(`Found length "${mappedLength}" in tag "${key}": ${value}`);
          return mappedLength;
        }
      }
    }
    
    // Check description
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [lengthKeyword, mappedLength] of Object.entries(lengthMappings)) {
        if (description.toLowerCase().includes(lengthKeyword.toLowerCase())) {
          this.logger.debug(`Found length "${mappedLength}" in description: ${description}`);
          return mappedLength;
        }
      }
    }
    
    // Couldn't determine length
    this.logger.debug('Could not determine length');
    return null;
  };

  /**
   * Extracts information about the sleeves from detected tags
   */
  extractSleeves: FieldExtractorFn<string> = (tags: DetectedTags, category?: ItemCategory) => {
    if (!category || ![ItemCategory.TOP, ItemCategory.ONE_PIECE, ItemCategory.OUTERWEAR].includes(category)) {
      this.logger.debug(`Category ${category} doesn't typically have sleeves`);
      return null;
    }
    
    this.logger.debug('Extracting sleeves for category:', category);
    this.logger.debug('Available tags for sleeve extraction:', tags);
    
    // Sleeve mappings
    const sleeveMappings: Record<string, string> = {
      'sleeveless': 'sleeveless',
      'no sleeve': 'sleeveless',
      'without sleeve': 'sleeveless',
      'strapless': 'sleeveless',
      'spaghetti': 'sleeveless', // Spaghetti straps are essentially sleeveless
      'spaghetti strap': 'sleeveless',
      'thin strap': 'sleeveless',
      'halter': 'sleeveless', // Halter is also sleeveless
      'cold shoulder': 'short sleeves',
      'off shoulder': 'short sleeves',
      'off-shoulder': 'short sleeves', 
      'one shoulder': 'one sleeve',
      'one-shoulder': 'one sleeve',
      'cap': 'short sleeves',
      'cap sleeve': 'short sleeves',
      'short': 'short sleeves',
      'short sleeve': 'short sleeves',
      'elbow': '3/4 sleeves',
      'elbow length': '3/4 sleeves',
      '3/4': '3/4 sleeves',
      'three quarter': '3/4 sleeves',
      'three-quarter': '3/4 sleeves',
      'long': 'long sleeves',
      'long sleeve': 'long sleeves',
      'full': 'long sleeves',
      'full sleeve': 'long sleeves',
      'wrist': 'long sleeves',
      'wrist length': 'long sleeves',
      'bell': 'long sleeves', // Bell sleeves are typically long
      'bell sleeve': 'long sleeves',
      'flutter': 'short sleeves', // Flutter sleeves are typically short
      'flutter sleeve': 'short sleeves',
      'puff': 'short sleeves', // Puff sleeves are typically short
      'puff sleeve': 'short sleeves',
      'bishop': 'long sleeves', // Bishop sleeves are typically long
      'bishop sleeve': 'long sleeves',
      'raglan': 'long sleeves', // Raglan sleeves are typically long
      'raglan sleeve': 'long sleeves',
      'dolman': 'long sleeves', // Dolman sleeves are typically long
      'dolman sleeve': 'long sleeves',
      'batwing': 'long sleeves', // Batwing sleeves are typically long
      'batwing sleeve': 'long sleeves',
      'kimono': 'long sleeves', // Kimono sleeves are typically long
      'kimono sleeve': 'long sleeves',
    };
    
    // First check for direct sleeve tag
    const sleeveTag = ExtractionHelpers.extractFromTags(tags, 'sleeve', ['sleeves', 'arm']);
    
    if (sleeveTag) {
      const mappedSleeve = ExtractionHelpers.mapToStandardOption(sleeveTag, sleeveMappings);
      if (mappedSleeve) {
        this.logger.debug('Found sleeve from sleeve tag:', mappedSleeve);
        return mappedSleeve;
      }
    }
    
    // Look for sleeve keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain sleeve information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      // Check for sleeve keywords in tag values
      for (const [sleeveKeyword, mappedSleeve] of Object.entries(sleeveMappings)) {
        if (value.toLowerCase().includes(sleeveKeyword.toLowerCase())) {
          this.logger.debug(`Found sleeve "${mappedSleeve}" in tag "${key}": ${value}`);
          return mappedSleeve;
        }
      }
    }
    
    // Check description
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [sleeveKeyword, mappedSleeve] of Object.entries(sleeveMappings)) {
        if (description.toLowerCase().includes(sleeveKeyword.toLowerCase())) {
          this.logger.debug(`Found sleeve "${mappedSleeve}" in description: ${description}`);
          return mappedSleeve;
        }
      }
    }
    
    // Couldn't determine sleeve type
    this.logger.debug('Could not determine sleeve type');
    return null;
  };

  /**
   * Extracts neckline information from detected tags, including cut variations
   */
  extractNeckline: FieldExtractorFn<string> = (tags: DetectedTags, category?: ItemCategory) => {
    if (!category || ![ItemCategory.TOP, ItemCategory.ONE_PIECE].includes(category)) {
      this.logger.debug(`Category ${category} doesn't typically have necklines`);
      return null;
    }
    
    this.logger.debug('Extracting neckline for category:', category);
    this.logger.debug('Available tags for neckline extraction:', tags);
    
    // Neckline mappings - includes both "neckline" and "cut" variations
    const necklineMappings: Record<string, string> = {
      // Direct neckline terms
      'scoop': 'scoop',
      'scoop neck': 'scoop neck',
      'scoop neckline': 'scoop neck',
      'v-neck': 'v-neck',
      'v neck': 'v-neck',
      'vneck': 'v-neck',
      'crew': 'crew',
      'crew neck': 'crew',
      'boat': 'boat',
      'boat neck': 'boat',
      'boatneck': 'boat',
      'square': 'square',
      'square neck': 'square',
      'sweetheart': 'sweetheart',
      'sweetheart neckline': 'sweetheart',
      'halter': 'halter',
      'halter neck': 'halter',
      'halter top': 'halter',
      'spaghetti': 'spaghetti straps',
      'spaghetti strap': 'spaghetti straps',
      'spaghetti straps': 'spaghetti straps',
      'thin strap': 'spaghetti straps',
      'thin straps': 'spaghetti straps',
      'shoulder straps': 'shoulder straps',
      'wide straps': 'shoulder straps',
      'thick straps': 'shoulder straps',
      'strap': 'shoulder straps',
      'straps': 'shoulder straps',
      'one shoulder': 'one shoulder',
      'off shoulder': 'off shoulder',
      'off-shoulder': 'off shoulder',
      'turtleneck': 'turtleneck',
      'turtle neck': 'turtleneck',
      'mock': 'mock',
      'mock neck': 'mock',
      'asymmetric': 'asymmetric',
      'high neck': 'high neck',
      'deep v': 'deep v',
      'jewel': 'jewel',
      'jewel neck': 'jewel',
      'plunge': 'plunge',
      'plunging': 'plunge',
      'surplice': 'surplice',
      'illusion': 'illusion',
      'keyhole': 'keyhole',
      'portrait': 'portrait',
      'queen anne': 'queen anne',
      'sabrina': 'sabrina',
      'slash': 'slash',
      'straight': 'straight',
      'wrap': 'wrap',
      'collar': 'collar',
      
      // Cut variations that refer to necklines
      'v cut': 'v-neck',
      'v-cut': 'v-neck',
      'scoop cut': 'scoop',
      'deep cut': 'deep v',
      'low cut': 'plunge',
      'high cut': 'high neck',
      'square cut': 'square',
      'straight cut': 'straight',
      'asymmetrical cut': 'asymmetric',
    };
    
    // First check for direct neckline tags
    const necklineTag = ExtractionHelpers.extractFromTags(tags, 'neckline', ['neck', 'collar']);
    
    if (necklineTag) {
      const mappedNeckline = ExtractionHelpers.mapToStandardOption(necklineTag, necklineMappings);
      if (mappedNeckline) {
        this.logger.debug('Found neckline from neckline tag:', mappedNeckline);
        return mappedNeckline;
      }
    }
    
    // Check for cut tags that might refer to neckline
    const cutTag = ExtractionHelpers.extractFromTags(tags, 'cut', ['cutting', 'style']);
    
    if (cutTag) {
      const mappedNeckline = ExtractionHelpers.mapToStandardOption(cutTag, necklineMappings);
      if (mappedNeckline) {
        this.logger.debug('Found neckline from cut tag:', mappedNeckline);
        return mappedNeckline;
      }
    }
    
    // Look for neckline keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields unlikely to contain neckline information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'brand', 'size', 'season'].includes(keyLower)) {
        continue;
      }
      
      // Check for neckline keywords in tag values
      for (const [necklineKeyword, mappedNeckline] of Object.entries(necklineMappings)) {
        if (value.toLowerCase().includes(necklineKeyword.toLowerCase())) {
          this.logger.debug(`Found neckline "${mappedNeckline}" from keyword "${necklineKeyword}" in tag "${key}": ${value}`);
          return mappedNeckline;
        }
      }
    }
    
    // Check description for neckline terms
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [necklineKeyword, mappedNeckline] of Object.entries(necklineMappings)) {
        if (description.toLowerCase().includes(necklineKeyword.toLowerCase())) {
          this.logger.debug(`Found neckline "${mappedNeckline}" in description: ${description}`);
          return mappedNeckline;
        }
      }
    }
    
    // Couldn't determine neckline
    this.logger.debug('Could not determine neckline');
    return null;
  };

  /**
   * Extracts the rise information for bottoms
   */
  extractRise: FieldExtractorFn<string> = (tags: DetectedTags, category?: ItemCategory) => {
    if (!category || category !== ItemCategory.BOTTOM) {
      this.logger.debug(`Rise is typically only for bottoms, not ${category}`);
      return null;
    }
    
    this.logger.debug('Extracting rise for bottoms');
    
    // Rise mappings (updated to match form options: High, Mid, Low)
    const riseMappings: Record<string, string> = {
      'high': 'High',
      'high rise': 'High',
      'high-rise': 'High',
      'high waist': 'High',
      'high-waist': 'High',
      'high-waisted': 'High',
      'high waisted': 'High',
      'mid': 'Mid',
      'mid rise': 'Mid',
      'mid-rise': 'Mid',
      'medium': 'Mid',
      'medium rise': 'Mid',
      'medium-rise': 'Mid',
      'regular': 'Mid',
      'regular rise': 'Mid',
      'low': 'Low',
      'low rise': 'Low',
      'low-rise': 'Low',
      'hip': 'Low',
      'hip hugger': 'Low',
    };
    
    // First check for direct rise tag
    const riseTag = ExtractionHelpers.extractFromTags(tags, 'rise', ['waist', 'waistline']);
    
    if (riseTag) {
      const mappedRise = ExtractionHelpers.mapToStandardOption(riseTag, riseMappings);
      if (mappedRise) {
        this.logger.debug('Found rise from rise tag:', mappedRise);
        return mappedRise;
      }
    }
    
    // Look for rise keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain rise information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      // Check for rise keywords in tag values
      for (const [riseKeyword, mappedRise] of Object.entries(riseMappings)) {
        if (value.toLowerCase().includes(riseKeyword.toLowerCase())) {
          this.logger.debug(`Found rise "${mappedRise}" in tag "${key}": ${value}`);
          return mappedRise;
        }
      }
    }
    
    // Check description
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [riseKeyword, mappedRise] of Object.entries(riseMappings)) {
        if (description.toLowerCase().includes(riseKeyword.toLowerCase())) {
          this.logger.debug(`Found rise "${mappedRise}" in description: ${description}`);
          return mappedRise;
        }
      }
    }
    
    // Couldn't determine rise
    this.logger.debug('Could not determine rise');
    return null;
  };
}
