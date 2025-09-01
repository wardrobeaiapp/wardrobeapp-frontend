import { ItemCategory } from '../../../../types';

/**
 * Helper utilities for tag extraction and manipulation
 */
export class ExtractionHelpers {
  /**
   * Normalize a string by removing punctuation, converting to lowercase, and trimming whitespace
   */
  static normalizeString(input: string): string {
    if (!input) return '';
    return input.toLowerCase().replace(/[^\w\s]/g, '').trim();
  }

  /**
   * Check if a tag contains or exactly matches any terms from a list
   * @param tag The tag to check
   * @param terms List of terms to match against
   * @param exactMatch Whether to require exact matches
   * @returns Whether the tag matches any terms
   */
  static tagMatchesAny(tag: string, terms: string[], exactMatch = false): boolean {
    if (!tag || !terms || terms.length === 0) return false;
    
    const normalizedTag = this.normalizeString(tag);
    
    return terms.some(term => {
      const normalizedTerm = this.normalizeString(term);
      return exactMatch 
        ? normalizedTag === normalizedTerm
        : normalizedTag.includes(normalizedTerm);
    });
  }

  /**
   * Get the best matching tag from a list of tags by highest score
   * @param tags Array of tags to search
   * @param terms Terms to match against
   * @param confidences Optional object of tag confidence scores
   * @returns The best matching tag or undefined if no match
   */
  static getBestMatchingTag(
    tags: string[] | undefined, 
    terms: string[],
    confidences?: Record<string, number>
  ): string | undefined {
    if (!tags || tags.length === 0 || !terms || terms.length === 0) return undefined;
    
    let bestMatch: string | undefined;
    let bestScore = -1;
    
    for (const tag of tags) {
      // Check if tag matches any terms
      const matches = terms.some(term => {
        const normalizedTag = this.normalizeString(tag);
        const normalizedTerm = this.normalizeString(term);
        return normalizedTag.includes(normalizedTerm);
      });
      
      if (matches) {
        // Use confidence as score if available, otherwise use 1 for any match
        const score = confidences ? (confidences[tag] || 0) : 1;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = tag;
        }
      }
    }
    
    return bestMatch;
  }

  /**
   * Checks if the specified category is a valid category for extraction
   */
  static isValidCategory(category?: ItemCategory): boolean {
    if (!category) return false;
    
    // Add any category validation logic here if needed
    return true;
  }

  /**
   * Finds all tags that match any of the provided terms
   * @param tags Array of tags to search
   * @param terms Terms to match against
   * @returns Array of matching tags
   */
  static findAllMatchingTags(tags: string[] | undefined, terms: string[]): string[] {
    if (!tags || tags.length === 0 || !terms || terms.length === 0) return [];
    
    return tags.filter(tag => this.tagMatchesAny(tag, terms, false));
  }

  /**
   * Combines multiple tag arrays, removing duplicates
   * @param tagArrays Arrays of tags to combine
   * @returns Combined array with duplicates removed
   */
  static combineTags(...tagArrays: (string[] | undefined)[]): string[] {
    const allTags: string[] = [];
    
    for (const tags of tagArrays) {
      if (tags && tags.length > 0) {
        allTags.push(...tags);
      }
    }
    
    // Remove duplicates using Set
    return Array.from(new Set(allTags));
  }

  /**
   * Checks if a string value exists in an enum
   * @param value The string value to check
   * @param enumObj The enum object to check against
   * @returns Whether the value exists in the enum
   */
  static isValueInEnum<T extends Record<string, string | number>>(
    value: string,
    enumObj: T
  ): boolean {
    const enumValues = Object.values(enumObj) as string[];
    return enumValues.includes(value);
  }
}
