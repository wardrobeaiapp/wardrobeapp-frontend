import { DetectedTags } from '../types';
import { Logger } from './logger';

/**
 * Helper functions for extracting and mapping values from detected tags
 */
export class ExtractionHelpers {
  private static logger: Logger = new Logger();

  /**
   * Sets the logger instance for extraction helpers
   */
  static setLogger(logger: Logger): void {
    this.logger = logger;
  }

  /**
   * Extracts a value from a specific tag key or from related keywords
   * @param tags The detected tags object
   * @param primaryKey The primary tag key to check first
   * @param relatedKeywords Keywords to look for in other tag keys
   * @returns The extracted value or null if not found
   */
  static extractFromTags(
    tags: DetectedTags,
    primaryKey: string,
    relatedKeywords: string[] = []
  ): string | null {
    // First check for the primary key (case-sensitive)
    if (tags[primaryKey] && typeof tags[primaryKey] === 'string') {
      this.logger.debug(`Found direct ${primaryKey} tag:`, tags[primaryKey]);
      return tags[primaryKey] as string;
    }

    // Look for case-insensitive match of the primary key
    const primaryKeyLower = primaryKey.toLowerCase();
    for (const [key, value] of Object.entries(tags)) {
      if (key.toLowerCase() === primaryKeyLower && typeof value === 'string') {
        this.logger.debug(`Found case-insensitive ${primaryKey} tag:`, value);
        return value as string;
      }
    }

    // Look for related keywords in tag keys
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string') {
        const keyLower = key.toLowerCase();
        if (relatedKeywords.some(keyword => keyLower.includes(keyword.toLowerCase()))) {
          this.logger.debug(`Found ${primaryKey} hint in ${key}:`, value);
          return value as string;
        }
      }
    }

    this.logger.debug(`No ${primaryKey} found in tags`);
    return null;
  }

  /**
   * Maps a raw value to a standardized option using a mapping dictionary
   * @param rawValue The raw value to map
   * @param mappings The mapping dictionary
   * @param validOptions Optional list of valid options to check against
   * @returns The mapped value or null if no mapping found
   */
  static mapToStandardOption(
    rawValue: string,
    mappings: Record<string, string>,
    validOptions: string[] = []
  ): string | null {
    if (!rawValue) return null;
    
    const lowerRaw = rawValue.toLowerCase();
    
    // Try exact match with valid options first (case insensitive)
    if (validOptions.length > 0) {
      const exactMatch = validOptions.find(option => option.toLowerCase() === lowerRaw);
      if (exactMatch) {
        this.logger.debug('Found exact match:', exactMatch);
        return exactMatch;
      }
    }
    
    // Check for keyword matches in mapping dictionary
    for (const [keyword, mappedValue] of Object.entries(mappings)) {
      if (lowerRaw.includes(keyword.toLowerCase())) {
        this.logger.debug(`Mapped ${rawValue} to ${mappedValue} via keyword ${keyword}`);
        return mappedValue;
      }
    }
    
    // Try partial match with valid options
    if (validOptions.length > 0) {
      for (const option of validOptions) {
        const lowerOption = option.toLowerCase();
        if (lowerRaw.includes(lowerOption) || lowerOption.includes(lowerRaw)) {
          this.logger.debug('Found partial match:', option);
          return option;
        }
      }
    }
    
    // Return the original value if no mapping found and it's in valid options
    if (validOptions.length > 0 && validOptions.some(option => option.toLowerCase() === lowerRaw)) {
      return validOptions.find(option => option.toLowerCase() === lowerRaw) || null;
    }
    
    // If 'Other' is a valid option, return it as fallback
    if (validOptions.includes('Other')) {
      this.logger.debug('No match found, using Other as fallback');
      return 'Other';
    }
    
    // If no match or fallback found, just return capitalized value if it's not empty
    if (rawValue.trim()) {
      const capitalized = this.capitalize(rawValue);
      this.logger.debug('No match found, using capitalized value:', capitalized);
      return capitalized;
    }
    
    return null;
  }

  /**
   * Checks if a field should be updated based on options
   * @param fieldName The name of the field
   * @param currentValue The current value of the field
   * @param skipFields List of fields to skip
   * @param overwriteExisting Whether to overwrite existing values
   * @returns Whether the field should be updated
   */
  static shouldUpdateField(
    fieldName: string,
    currentValue: any,
    skipFields: string[] = [],
    overwriteExisting: boolean = false
  ): boolean {
    if (skipFields.includes(fieldName)) {
      this.logger.debug(`Skipping ${fieldName} as it's in skipFields`);
      return false;
    }
    
    const hasExistingValue = currentValue !== undefined && 
                           currentValue !== null && 
                           currentValue !== '';
    
    if (!overwriteExisting && hasExistingValue) {
      this.logger.debug(`Not updating ${fieldName} as it already has a value and overwriteExisting is false`);
      return false;
    }
    
    return true;
  }

  /**
   * Extracts keywords that match specific criteria from a text
   * @param text The text to extract from
   * @param keywordMappings The mapping of keywords to their mapped values
   * @returns The first matched keyword's mapped value or null if none found
   */
  static extractKeywordFromText(
    text: string,
    keywordMappings: Record<string, string>
  ): string | null {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    
    for (const [keyword, mappedValue] of Object.entries(keywordMappings)) {
      if (lowerText.includes(keyword.toLowerCase())) {
        this.logger.debug(`Found keyword "${keyword}" in text, mapping to "${mappedValue}"`);
        return mappedValue;
      }
    }
    
    return null;
  }

  /**
   * Capitalizes the first letter of a string
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
