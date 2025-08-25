import { DetectedTags, FieldExtractorFn } from '../types';
import { patternMappings, getPatternOptions } from '../mappings/patternMappings';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Extractor class for pattern-related fields
 */
export class PatternExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the item pattern from detected tags
   */
  extractPattern: FieldExtractorFn<string> = (tags) => {
    this.logger.debug('Extracting pattern from tags');
    
    // First check for direct pattern tag
    const patternTag = ExtractionHelpers.extractFromTags(tags, 'pattern', ['print', 'design']);
    
    if (patternTag) {
      // Default to 'Solid' if pattern is explicitly set to 'solid' or 'none'
      if (['solid', 'none', 'plain', 'no pattern'].includes(patternTag.toLowerCase())) {
        this.logger.debug('Pattern explicitly set to solid/none');
        return 'Solid';
      }
      
      const mappedPattern = ExtractionHelpers.mapToStandardOption(
        patternTag,
        patternMappings,
        getPatternOptions()
      );
      
      if (mappedPattern) {
        this.logger.debug('Found pattern from pattern tag:', mappedPattern);
        return mappedPattern;
      }
    }
    
    // Check for pattern keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip obvious non-pattern fields
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'size', 'brand'].includes(keyLower)) {
        continue;
      }
      
      // Look for pattern keywords in the tag value
      for (const [patternKeyword, mappedPattern] of Object.entries(patternMappings)) {
        if (value.toLowerCase().includes(patternKeyword.toLowerCase())) {
          this.logger.debug(`Found pattern "${mappedPattern}" in tag "${key}": ${value}`);
          return mappedPattern;
        }
      }
    }
    
    // Check for generic description or title
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [patternKeyword, mappedPattern] of Object.entries(patternMappings)) {
        if (description.toLowerCase().includes(patternKeyword.toLowerCase())) {
          this.logger.debug(`Found pattern "${mappedPattern}" in description: ${description}`);
          return mappedPattern;
        }
      }
    }
    
    // Default to 'Solid' if no pattern detected
    this.logger.debug('No pattern detected, defaulting to Solid');
    return 'Solid';
  };
}
