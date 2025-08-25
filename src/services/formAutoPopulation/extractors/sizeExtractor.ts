import { ItemCategory } from '../../../types';
import { DetectedTags, FieldExtractorFn } from '../types';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Size variations by category
 */
const sizeMappings: Record<ItemCategory, Record<string, string>> = {
  [ItemCategory.TOP]: {
    'xxs': 'XXS',
    'xs': 'XS',
    'small': 'S',
    's': 'S',
    'medium': 'M',
    'm': 'M',
    'large': 'L',
    'l': 'L',
    'xl': 'XL',
    'xxl': 'XXL',
    '2xl': 'XXL',
    'xxxl': '3XL',
    '3xl': '3XL',
    'xxxxl': '4XL',
    '4xl': '4XL',
    '0': 'XXS',
    '2': 'XS',
    '4': 'S',
    '6': 'S',
    '8': 'M',
    '10': 'M',
    '12': 'L',
    '14': 'XL',
    '16': 'XXL',
    '18': '3XL',
  },
  [ItemCategory.BOTTOM]: {
    'xxs': 'XXS',
    'xs': 'XS',
    'small': 'S',
    's': 'S',
    'medium': 'M',
    'm': 'M',
    'large': 'L',
    'l': 'L',
    'xl': 'XL',
    'xxl': 'XXL',
    '2xl': 'XXL',
    'xxxl': '3XL',
    '3xl': '3XL',
    'xxxxl': '4XL',
    '4xl': '4XL',
    '00': '00',
    '0': '0',
    '2': '2',
    '4': '4',
    '6': '6',
    '8': '8',
    '10': '10',
    '12': '12',
    '14': '14',
    '16': '16',
    '18': '18',
    '23': '23', // Inch waist sizes
    '24': '24',
    '25': '25',
    '26': '26',
    '27': '27',
    '28': '28',
    '29': '29',
    '30': '30',
    '31': '31',
    '32': '32',
    '33': '33',
    '34': '34',
    '36': '36',
    '38': '38',
    '40': '40',
    '42': '42',
    '44': '44',
  },
  [ItemCategory.ONE_PIECE]: {
    'xxs': 'XXS',
    'xs': 'XS',
    'small': 'S',
    's': 'S',
    'medium': 'M',
    'm': 'M',
    'large': 'L',
    'l': 'L',
    'xl': 'XL',
    'xxl': 'XXL',
    '2xl': 'XXL',
    'xxxl': '3XL',
    '3xl': '3XL',
    'xxxxl': '4XL',
    '4xl': '4XL',
    '00': '00',
    '0': '0',
    '2': '2',
    '4': '4',
    '6': '6',
    '8': '8',
    '10': '10',
    '12': '12',
    '14': '14',
    '16': '16',
    '18': '18',
  },
  [ItemCategory.OUTERWEAR]: {
    'xxs': 'XXS',
    'xs': 'XS',
    'small': 'S',
    's': 'S',
    'medium': 'M',
    'm': 'M',
    'large': 'L',
    'l': 'L',
    'xl': 'XL',
    'xxl': 'XXL',
    '2xl': 'XXL',
    'xxxl': '3XL',
    '3xl': '3XL',
    'xxxxl': '4XL',
    '4xl': '4XL',
    '0': '0',
    '2': '2',
    '4': '4',
    '6': '6',
    '8': '8',
    '10': '10',
    '12': '12',
    '14': '14',
    '16': '16',
    '36': '36', // European jacket sizes
    '38': '38',
    '40': '40',
    '42': '42',
    '44': '44',
    '46': '46',
    '48': '48',
    '50': '50',
    '52': '52',
  },
  [ItemCategory.FOOTWEAR]: {
    '5': '5',
    '5.5': '5.5',
    '6': '6',
    '6.5': '6.5',
    '7': '7',
    '7.5': '7.5',
    '8': '8',
    '8.5': '8.5',
    '9': '9',
    '9.5': '9.5',
    '10': '10',
    '10.5': '10.5',
    '11': '11',
    '11.5': '11.5',
    '12': '12',
    '13': '13',
    '14': '14',
    '35': '35', // European shoe sizes
    '36': '36',
    '37': '37',
    '38': '38',
    '39': '39',
    '40': '40',
    '41': '41',
    '42': '42',
    '43': '43',
    '44': '44',
    '45': '45',
    '46': '46',
  },
  [ItemCategory.ACCESSORY]: {
    'os': 'One Size',
    'one size': 'One Size',
    'onesize': 'One Size',
    'one-size': 'One Size',
    'universal': 'One Size',
    'xs': 'XS',
    's': 'S',
    'small': 'S',
    'm': 'M',
    'medium': 'M',
    'l': 'L',
    'large': 'L',
    'xl': 'XL',
  },
  [ItemCategory.OTHER]: {
    'os': 'One Size',
    'one size': 'One Size',
    'onesize': 'One Size',
    'one-size': 'One Size',
    'universal': 'One Size',
    'xs': 'XS',
    's': 'S',
    'small': 'S',
    'm': 'M',
    'medium': 'M',
    'l': 'L',
    'large': 'L',
    'xl': 'XL',
  },
};

/**
 * Extractor class for size-related fields
 */
export class SizeExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the item size from detected tags
   */
  extractSize: FieldExtractorFn<string> = (tags, category) => {
    if (!category) {
      this.logger.debug('Cannot extract size without a category');
      return null;
    }
    
    this.logger.debug('Extracting size for category:', category);
    
    // First check for direct size tag
    const sizeTag = ExtractionHelpers.extractFromTags(tags, 'size', ['dimensions', 'fit']);
    
    if (sizeTag) {
      const mappedSize = this.mapSizeForCategory(sizeTag, category);
      if (mappedSize) {
        this.logger.debug('Found size from size tag:', mappedSize);
        return mappedSize;
      }
    }
    
    // Check all tag values for size information
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain size information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'brand', 'material'].includes(keyLower)) {
        continue;
      }
      
      // Check for size patterns
      const sizeMatch = this.extractSizePattern(value);
      if (sizeMatch) {
        const mappedSize = this.mapSizeForCategory(sizeMatch, category);
        if (mappedSize) {
          this.logger.debug(`Found size "${mappedSize}" in tag "${key}": ${value}`);
          return mappedSize;
        }
      }
    }
    
    // Check if description contains size information
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      const sizeMatch = this.extractSizePattern(description);
      if (sizeMatch) {
        const mappedSize = this.mapSizeForCategory(sizeMatch, category);
        if (mappedSize) {
          this.logger.debug(`Found size "${mappedSize}" in description: ${description}`);
          return mappedSize;
        }
      }
    }
    
    // Couldn't determine size
    this.logger.debug('Could not determine size');
    return null;
  };

  /**
   * Maps a raw size value to a standardized size for the given category
   */
  private mapSizeForCategory(rawSize: string, category: ItemCategory): string | null {
    if (!rawSize) return null;
    
    const lowerRaw = rawSize.toLowerCase().trim();
    const categoryMappings = sizeMappings[category] || {};
    
    // Direct mapping
    if (lowerRaw in categoryMappings) {
      return categoryMappings[lowerRaw];
    }
    
    // Handle cases like "size M" or "size 8"
    const sizePrefix = /^size\s+(.+)$/i.exec(lowerRaw);
    if (sizePrefix && sizePrefix[1]) {
      const sizeValue = sizePrefix[1].trim().toLowerCase();
      if (sizeValue in categoryMappings) {
        return categoryMappings[sizeValue];
      }
    }
    
    // For numeric inch sizes with "waist" mentioned
    if (category === ItemCategory.BOTTOM && lowerRaw.includes('waist')) {
      const waistMatch = /\b(\d{2})\b/.exec(lowerRaw);
      if (waistMatch && waistMatch[1]) {
        const waistSize = waistMatch[1];
        if (waistSize in categoryMappings) {
          return categoryMappings[waistSize];
        }
      }
    }
    
    // For shoe sizes with EU/US/UK prefix
    if (category === ItemCategory.FOOTWEAR) {
      const euMatch = /\beu\s*(\d{1,2}(\.5)?)\b/i.exec(lowerRaw);
      const usMatch = /\bus\s*(\d{1,2}(\.5)?)\b/i.exec(lowerRaw);
      const ukMatch = /\buk\s*(\d{1,2}(\.5)?)\b/i.exec(lowerRaw);
      
      const match = usMatch || euMatch || ukMatch;
      if (match && match[1]) {
        const sizeValue = match[1];
        if (sizeValue in categoryMappings) {
          return categoryMappings[sizeValue];
        }
      }
    }
    
    // If no mapping found, return original if it appears to be a valid size format
    if (/^(xs|s|m|l|xl|xxl|\d{1,2}(\.5)?)$/i.test(lowerRaw)) {
      return this.standardizeSizeFormat(rawSize);
    }
    
    return null;
  }

  /**
   * Extracts size patterns from text
   */
  private extractSizePattern(text: string): string | null {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    
    // Match common size patterns
    const sizePatterns = [
      // Standard sizes: S, M, L, XL, etc.
      /\b(xxs|xs|small|medium|large|xl|xxl|xxxl|[sml])\b/i,
      // Numeric sizes: Size 6, Size 8, etc.
      /\bsize\s+(\d{1,2})\b/i,
      // Waist sizes: 32 waist, 34W, etc.
      /\b(\d{2})\s*(?:waist|w)\b/i,
      // Shoe sizes: Size 9, EU 40, US 8.5, etc.
      /\b(?:size|eu|us|uk)\s*(\d{1,2}(?:\.5)?)\b/i,
      // Direct numeric sizes (for bottoms, shoes): 30, 32, 8.5, etc.
      /\b(\d{1,2}(?:\.5)?)\b/i,
      // One Size
      /\b(one[ -]?size|os)\b/i
    ];
    
    for (const pattern of sizePatterns) {
      const match = pattern.exec(lowerText);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  /**
   * Standardizes size format (capitalization, spacing, etc.)
   */
  private standardizeSizeFormat(size: string): string {
    if (!size) return size;
    
    const lowerSize = size.toLowerCase().trim();
    
    // Handle letter sizes
    if (/^xxs|xs|s|m|l|xl|xxl|xxxl|xxxxl|\d+xl$/i.test(lowerSize)) {
      return lowerSize.toUpperCase();
    }
    
    // Handle "one size"
    if (/^one[ -]?size|os$/i.test(lowerSize)) {
      return 'One Size';
    }
    
    // Handle "small", "medium", "large"
    if (lowerSize === 'small') return 'S';
    if (lowerSize === 'medium') return 'M';
    if (lowerSize === 'large') return 'L';
    
    // Return as is for numeric sizes
    return size.trim();
  }
}
