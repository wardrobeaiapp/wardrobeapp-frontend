import { ItemCategory } from '../../../types/';
import { FieldExtractorFn } from '../types';
import { Logger } from '../utils/logger';

/**
 * Extractor class for outerwear-related fields
 */
export class OuterwearExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the specific type for outerwear items
   */
  extractType: FieldExtractorFn<string> = (tags, category, subcategory) => {
    if (!category || category !== ItemCategory.OUTERWEAR) {
      this.logger.debug(`Type extraction is focused on outerwear, not ${category}`);
      return null;
    }
    
    this.logger.debug('Extracting specific type for outerwear');
    
    // Type mappings by subcategory
    const typeMappings: Record<string, Record<string, string>> = {
      'jacket': {
        'baseball': 'Baseball',
        'biker': 'Biker',
        'bomber': 'Bomber',
        'puffer': 'Puffer',
        'casual': 'Casual',
        'harrington': 'Harrington',
        'knitted poncho': 'Knitted Poncho',
        'pilot': 'Pilot',
        'racer': 'Racer',
        'poncho': 'Poncho',
        'winter': 'Winter',
        // Additional jacket types
        'denim': 'Denim',
        'leather': 'Leather',
        'varsity': 'Varsity',
        'military': 'Military',
        'utility': 'Utility',
        'moto': 'Moto',
        'fleece': 'Fleece',
        'windbreaker': 'Windbreaker',
        'track': 'Track',
        'blazer': 'Blazer',
      },
      'coat': {
        'duffle': 'Duffle',
        'kimono': 'Kimono',
        'peacoat': 'Peacoat',
        'raincoat': 'Raincoat',
        'winter': 'Winter',
        'wool': 'Wool',
        // Additional coat types
        'trench': 'Trench',
        'parka': 'Parka',
        'overcoat': 'Overcoat',
        'topcoat': 'Topcoat',
        'car coat': 'Car Coat',
        'car-coat': 'Car Coat',
        'long coat': 'Long Coat',
        'long-coat': 'Long Coat',
        'maxi coat': 'Maxi Coat',
        'maxi-coat': 'Maxi Coat',
      }
    };
    
    if (!subcategory) {
      this.logger.debug('No subcategory provided for outerwear type extraction');
      return null;
    }
    
    // First debug all available tags
    this.logger.debug('All available tags for type extraction:', tags);
    
    // Extract object tags from the detected tags to find type information
    const objectTags: string[] = [];
    for (const [key, value] of Object.entries(tags)) {
      const keyLower = key.toLowerCase();
      // Look for object tags, subcategory tags, and any other relevant tags
      if (keyLower.includes('object') || keyLower.includes('class') || /^\d+$/.test(keyLower) || 
          keyLower.includes('subcategory') || keyLower.includes('item') || keyLower.includes('description')) {
        if (typeof value === 'string' && value.trim()) {
          objectTags.push(value.trim());
          this.logger.debug(`Found tag: ${key} = ${value}`);
        }
      }
    }
    
    this.logger.debug('Object tags for type extraction:', objectTags);
    
    // Check all object tags against type mappings
    for (const tag of objectTags) {
      const tagLower = tag.toLowerCase();
      
      for (const mappings of Object.values(typeMappings)) {
        for (const [typeKeyword, mappedType] of Object.entries(mappings)) {
          if (tagLower.includes(typeKeyword.toLowerCase())) {
            this.logger.debug(`Found type "${mappedType}" from keyword "${typeKeyword}" in tag: ${tag}`);
            return mappedType;
          }
        }
      }
    }
    
    // Also check subcategory as fallback
    if (subcategory) {
      const subcategoryLower = subcategory.toLowerCase();
      for (const mappings of Object.values(typeMappings)) {
        for (const [typeKeyword, mappedType] of Object.entries(mappings)) {
          if (subcategoryLower.includes(typeKeyword.toLowerCase())) {
            this.logger.debug(`Found type "${mappedType}" from keyword "${typeKeyword}" in subcategory: ${subcategory}`);
            return mappedType;
          }
        }
      }
    }
    
    // If no specific type found, return null to avoid auto-filling incorrect data
    this.logger.debug('No specific type mapping found in tags or subcategory');
    return null;
  };
}
