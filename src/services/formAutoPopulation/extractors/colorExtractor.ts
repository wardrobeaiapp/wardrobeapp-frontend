import { DetectedTags, FieldExtractorFn } from '../types';
import { colorMappings, getColorOptions } from '../mappings/colorMappings';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Extractor class for color-related fields
 */
export class ColorExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the item color from detected tags
   */
  extractColor: FieldExtractorFn<string> = (tags) => {
    this.logger.debug('Extracting color from tags');
    
    // First check for direct color tag
    const colorTag = ExtractionHelpers.extractFromTags(tags, 'color', ['hue', 'shade', 'tone']);
    
    if (colorTag) {
      const mappedColor = ExtractionHelpers.mapToStandardOption(
        colorTag,
        colorMappings,
        getColorOptions()
      );
      
      if (mappedColor) {
        this.logger.debug('Found color from color tag:', mappedColor);
        return mappedColor;
      }
    }
    
    // Check for color keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip obvious non-color fields
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'size', 'brand'].includes(keyLower)) {
        continue;
      }
      
      // Look for color keywords in the tag value
      for (const [colorKeyword, mappedColor] of Object.entries(colorMappings)) {
        if (value.toLowerCase().includes(colorKeyword.toLowerCase())) {
          this.logger.debug(`Found color "${mappedColor}" in tag "${key}": ${value}`);
          return mappedColor;
        }
      }
    }
    
    // Check for color keywords in tag keys
    for (const [key, _] of Object.entries(tags)) {
      for (const [colorKeyword, mappedColor] of Object.entries(colorMappings)) {
        if (key.toLowerCase().includes(colorKeyword.toLowerCase())) {
          this.logger.debug(`Found color "${mappedColor}" in tag key: ${key}`);
          return mappedColor;
        }
      }
    }
    
    // Check for generic description or title
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [colorKeyword, mappedColor] of Object.entries(colorMappings)) {
        if (description.toLowerCase().includes(colorKeyword.toLowerCase())) {
          this.logger.debug(`Found color "${mappedColor}" in description: ${description}`);
          return mappedColor;
        }
      }
    }
    
    // Couldn't determine color
    this.logger.debug('Could not determine color');
    return null;
  };
}
