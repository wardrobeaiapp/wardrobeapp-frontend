import { ItemCategory } from '../../../types/';
import { DetectedTags, FieldExtractorFn } from '../types';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Extractor class for footwear-related fields
 */
export class FootwearExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the heel height from detected tags
   */
  extractHeelHeight: FieldExtractorFn<string> = (tags, category) => {
    if (!category || category !== ItemCategory.FOOTWEAR) {
      this.logger.debug(`Heel height is only applicable to footwear, not ${category}`);
      return null;
    }
    
    this.logger.debug('Extracting heel height for footwear');
    
    // Heel height mappings
    const heelHeightMappings: Record<string, string> = {
      'flat': 'Flat (0-0.5")',
      'no heel': 'Flat (0-0.5")',
      'zero': 'Flat (0-0.5")',
      '0"': 'Flat (0-0.5")',
      '0 inch': 'Flat (0-0.5")',
      '0.5"': 'Flat (0-0.5")',
      '0.5 inch': 'Flat (0-0.5")',
      'low': 'Low (0.5-1.5")',
      'small': 'Low (0.5-1.5")',
      '1"': 'Low (0.5-1.5")',
      '1 inch': 'Low (0.5-1.5")',
      '1.5"': 'Low (0.5-1.5")',
      '1.5 inch': 'Low (0.5-1.5")',
      'mid': 'Mid (1.5-3")',
      'medium': 'Mid (1.5-3")',
      '2"': 'Mid (1.5-3")',
      '2 inch': 'Mid (1.5-3")',
      '2.5"': 'Mid (1.5-3")',
      '2.5 inch': 'Mid (1.5-3")',
      '3"': 'Mid (1.5-3")',
      '3 inch': 'Mid (1.5-3")',
      'high': 'High (3-4")',
      'tall': 'High (3-4")',
      '3.5"': 'High (3-4")',
      '3.5 inch': 'High (3-4")',
      '4"': 'High (3-4")',
      '4 inch': 'High (3-4")',
      'very high': 'Very High (4"+ stiletto)',
      'very tall': 'Very High (4"+ stiletto)',
      'ultra high': 'Very High (4"+ stiletto)',
      'stiletto': 'Very High (4"+ stiletto)',
      'platform': 'Platform',
      'wedge': 'Wedge',
      'block': 'Block',
      'kitten': 'Kitten',
      'chunky': 'Chunky',
    };
    
    // First check for direct heel height tag
    const heelTag = ExtractionHelpers.extractFromTags(tags, 'heel height', [
      'heel', 'heels', 'height'
    ]);
    
    if (heelTag) {
      const mappedHeelHeight = ExtractionHelpers.mapToStandardOption(heelTag, heelHeightMappings);
      if (mappedHeelHeight) {
        this.logger.debug('Found heel height from heel tag:', mappedHeelHeight);
        return mappedHeelHeight;
      }
    }
    
    // Look for heel height keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain heel height information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      // Check for heel height keywords in tag values
      for (const [heelKeyword, mappedHeelHeight] of Object.entries(heelHeightMappings)) {
        if (value.toLowerCase().includes(heelKeyword.toLowerCase())) {
          this.logger.debug(`Found heel height "${mappedHeelHeight}" in tag "${key}": ${value}`);
          return mappedHeelHeight;
        }
      }
    }
    
    // Check description
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [heelKeyword, mappedHeelHeight] of Object.entries(heelHeightMappings)) {
        if (description.toLowerCase().includes(heelKeyword.toLowerCase())) {
          this.logger.debug(`Found heel height "${mappedHeelHeight}" in description: ${description}`);
          return mappedHeelHeight;
        }
      }
    }
    
    // Check subcategory for clues
    const subcategory = ExtractionHelpers.extractFromTags(tags, 'subcategory');
    if (subcategory) {
      const lowerSubcategory = subcategory.toLowerCase();
      
      // Flat shoes
      if (['flats', 'loafers', 'sneakers', 'slippers', 'mules', 'oxfords', 'sandals'].includes(lowerSubcategory)) {
        this.logger.debug(`Inferred flat heel from subcategory: ${subcategory}`);
        return 'Flat (0-0.5")';
      }
      
      // High heel shoes
      if (['heels', 'pumps', 'stilettos'].includes(lowerSubcategory)) {
        this.logger.debug(`Inferred high heel from subcategory: ${subcategory}`);
        return 'High (3-4")';
      }
    }
    
    // Couldn't determine heel height
    this.logger.debug('Could not determine heel height');
    return null;
  };

  /**
   * Extracts the boot height from detected tags
   */
  extractBootHeight: FieldExtractorFn<string> = (tags, category, subcategory) => {
    if (!category || category !== ItemCategory.FOOTWEAR) {
      this.logger.debug(`Boot height is only applicable to footwear, not ${category}`);
      return null;
    }
    
    // Only applicable to boots
    if (!subcategory || !subcategory.toLowerCase().includes('boot')) {
      this.logger.debug(`Boot height is only applicable to boots, not ${subcategory}`);
      return null;
    }
    
    this.logger.debug('Extracting boot height for boots');
    
    // Boot height mappings
    const bootHeightMappings: Record<string, string> = {
      'ankle': 'Ankle',
      'ankle height': 'Ankle',
      'ankle boot': 'Ankle',
      'bootie': 'Ankle',
      'booties': 'Ankle',
      'chelsea': 'Ankle',
      'mid calf': 'Mid-Calf',
      'mid-calf': 'Mid-Calf',
      'calf': 'Mid-Calf',
      'calf height': 'Mid-Calf',
      'mid': 'Mid-Calf',
      'knee': 'Knee-High',
      'knee high': 'Knee-High',
      'knee-high': 'Knee-High',
      'knee height': 'Knee-High',
      'over the knee': 'Over-the-Knee',
      'over-the-knee': 'Over-the-Knee',
      'otk': 'Over-the-Knee',
      'thigh': 'Thigh-High',
      'thigh high': 'Thigh-High',
      'thigh-high': 'Thigh-High',
    };
    
    // First check for direct boot height tag
    const bootHeightTag = ExtractionHelpers.extractFromTags(tags, 'boot height', [
      'shaft height', 'height', 'shaft'
    ]);
    
    if (bootHeightTag) {
      const mappedBootHeight = ExtractionHelpers.mapToStandardOption(bootHeightTag, bootHeightMappings);
      if (mappedBootHeight) {
        this.logger.debug('Found boot height from boot height tag:', mappedBootHeight);
        return mappedBootHeight;
      }
    }
    
    // Look for boot height keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain boot height information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      // Check for boot height keywords in tag values
      for (const [bootHeightKeyword, mappedBootHeight] of Object.entries(bootHeightMappings)) {
        if (value.toLowerCase().includes(bootHeightKeyword.toLowerCase())) {
          this.logger.debug(`Found boot height "${mappedBootHeight}" in tag "${key}": ${value}`);
          return mappedBootHeight;
        }
      }
    }
    
    // Check description
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [bootHeightKeyword, mappedBootHeight] of Object.entries(bootHeightMappings)) {
        if (description.toLowerCase().includes(bootHeightKeyword.toLowerCase())) {
          this.logger.debug(`Found boot height "${mappedBootHeight}" in description: ${description}`);
          return mappedBootHeight;
        }
      }
    }
    
    // Default to ankle boots if we can't determine
    this.logger.debug('Could not determine boot height, defaulting to Ankle');
    return 'Ankle';
  };

  /**
   * Extracts the specific type for footwear items
   */
  extractType: FieldExtractorFn<string> = (tags, category, subcategory) => {
    if (!category || category !== ItemCategory.FOOTWEAR) {
      this.logger.debug(`Type extraction is focused on footwear, not ${category}`);
      return null;
    }
    
    this.logger.debug('Extracting specific type for footwear');
    
    // Type mappings by subcategory
    const typeMappings: Record<string, Record<string, string>> = {
      'sneakers': {
        'high top': 'High-Top',
        'high-top': 'High-Top',
        'low top': 'Low-Top',
        'low-top': 'Low-Top',
        'slip on': 'Slip-On',
        'slip-on': 'Slip-On',
        'running': 'Running',
        'tennis': 'Tennis',
        'basketball': 'Basketball',
        'skate': 'Skate',
        'training': 'Training',
        'athletic': 'Athletic',
        'casual': 'Casual',
        'canvas': 'Canvas',
        'leather': 'Leather',
      },
      'boots': {
        'chelsea': 'Chelsea',
        'combat': 'Combat',
        'hiking': 'Hiking',
        'riding': 'Riding',
        'rain': 'Rain',
        'snow': 'Snow',
        'winter': 'Winter',
        'western': 'Western',
        'cowboy': 'Western',
        'work': 'Work',
        'ankle': 'Ankle',
        'desert': 'Desert',
        'chukka': 'Chukka',
        'platform': 'Platform',
        'heeled': 'Heeled',
        'flat': 'Flat',
        'lace-up': 'Lace-Up',
        'lace up': 'Lace-Up',
        'zip-up': 'Zip-Up',
        'zip up': 'Zip-Up',
      },
      'sandals': {
        'flip flop': 'Flip-Flops',
        'flip-flop': 'Flip-Flops',
        'thong': 'Flip-Flops',
        'gladiator': 'Gladiator',
        'slide': 'Slides',
        'slides': 'Slides',
        'platform': 'Platform',
        'wedge': 'Wedge',
        'flat': 'Flat',
        'heel': 'Heeled',
        'heeled': 'Heeled',
        'ankle strap': 'Ankle Strap',
        'ankle-strap': 'Ankle Strap',
        'espadrille': 'Espadrille',
        'sport': 'Sport',
        'outdoor': 'Outdoor',
        'dressy': 'Dressy',
        'casual': 'Casual',
        'beach': 'Beach',
      },
      'heels': {
        'pump': 'Pumps',
        'pumps': 'Pumps',
        'stiletto': 'Stiletto',
        'kitten': 'Kitten',
        'block': 'Block Heel',
        'block heel': 'Block Heel',
        'chunky': 'Chunky',
        'wedge': 'Wedge',
        'platform': 'Platform',
        'peep toe': 'Peep Toe',
        'peep-toe': 'Peep Toe',
        'pointed toe': 'Pointed Toe',
        'pointed-toe': 'Pointed Toe',
        'round toe': 'Round Toe',
        'round-toe': 'Round Toe',
        'slingback': 'Slingback',
        'ankle strap': 'Ankle Strap',
        'ankle-strap': 'Ankle Strap',
        'mary jane': 'Mary Jane',
        'mary-jane': 'Mary Jane',
        'd\'orsay': 'D\'Orsay',
        'dorsay': 'D\'Orsay',
        'd-orsay': 'D\'Orsay',
      },
      'flats': {
        'ballet': 'Ballet',
        'loafer': 'Loafer',
        'moccasin': 'Moccasin',
        'oxford': 'Oxford',
        'slip on': 'Slip-On',
        'slip-on': 'Slip-On',
        'pointed toe': 'Pointed Toe',
        'pointed-toe': 'Pointed Toe',
        'round toe': 'Round Toe',
        'round-toe': 'Round Toe',
        'mary jane': 'Mary Jane',
        'mary-jane': 'Mary Jane',
        'ankle strap': 'Ankle Strap',
        'ankle-strap': 'Ankle Strap',
        'd\'orsay': 'D\'Orsay',
        'dorsay': 'D\'Orsay',
        'd-orsay': 'D\'Orsay',
        'driving': 'Driving',
        'espadrille': 'Espadrille',
      },
      'other': {
        'mule': 'Mules',
        'mules': 'Mules',
        'clog': 'Clogs',
        'clogs': 'Clogs',
        'slipper': 'Slippers',
        'slippers': 'Slippers',
        'house shoe': 'Slippers',
        'house-shoe': 'Slippers',
        'espadrille': 'Espadrilles',
        'espadrilles': 'Espadrilles',
        'boat shoe': 'Boat Shoes',
        'boat-shoe': 'Boat Shoes',
        'deck shoe': 'Boat Shoes',
        'deck-shoe': 'Boat Shoes',
      }
    };
    
    // First check for direct type tag
    const typeTag = ExtractionHelpers.extractFromTags(tags, 'type', ['style', 'design']);
    
    if (typeTag && subcategory) {
      // Get mappings for the subcategory or use 'other' as fallback
      const subcategoryLower = subcategory.toLowerCase();
      const relevantMappings = typeMappings[subcategoryLower] || 
        typeMappings[subcategoryLower + 's'] || // Try plural
        typeMappings['other'];
      
      if (relevantMappings) {
        const mappedType = ExtractionHelpers.mapToStandardOption(typeTag, relevantMappings);
        if (mappedType) {
          this.logger.debug(`Found footwear type "${mappedType}" from type tag: ${typeTag}`);
          return mappedType;
        }
      }
    }
    
    // If we have a subcategory, look for specific type information
    if (subcategory) {
      const subcategoryLower = subcategory.toLowerCase();
      const relevantMappings = typeMappings[subcategoryLower] || 
        typeMappings[subcategoryLower + 's'] || // Try plural
        typeMappings['other'];
      
      if (relevantMappings) {
        // Look for type information in all tags
        for (const [key, value] of Object.entries(tags)) {
          if (typeof value !== 'string') continue;
          
          // Skip fields that are unlikely to contain type information
          const keyLower = key.toLowerCase();
          if (['category', 'subcategory', 'color', 'pattern', 'brand', 'size'].includes(keyLower)) {
            continue;
          }
          
          // Check for type keywords in tag values
          for (const [typeKeyword, mappedType] of Object.entries(relevantMappings)) {
            if (value.toLowerCase().includes(typeKeyword.toLowerCase())) {
              this.logger.debug(`Found footwear type "${mappedType}" in tag "${key}": ${value}`);
              return mappedType;
            }
          }
        }
        
        // Check description
        const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
        if (description) {
          for (const [typeKeyword, mappedType] of Object.entries(relevantMappings)) {
            if (description.toLowerCase().includes(typeKeyword.toLowerCase())) {
              this.logger.debug(`Found footwear type "${mappedType}" in description: ${description}`);
              return mappedType;
            }
          }
        }
      }
    }
    
    // If we couldn't determine a specific type, return null
    this.logger.debug('Could not determine specific footwear type');
    return null;
  };
}
