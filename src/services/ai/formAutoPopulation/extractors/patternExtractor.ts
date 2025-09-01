import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { mapPatternKeyword } from '../mappings/patternMappings';

/**
 * Responsible for extracting pattern information from detected tags
 */
export class PatternExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the pattern from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @returns The detected pattern or undefined if no pattern could be determined
   */
  extractPattern(tags: { pattern_tags?: string[], fashion_tags?: string[], general_tags?: string[] }): string | null {
    this.logger.debug('[PatternExtractor] Extracting pattern from tags');
    
    // First check specific pattern tags if available
    if (tags.pattern_tags && tags.pattern_tags.length > 0) {
      this.logger.debug('[PatternExtractor] Checking pattern_tags:', tags.pattern_tags);
      
      // Take the first pattern tag
      const patternTag = tags.pattern_tags[0];
      const mappedPattern = mapPatternKeyword(patternTag);
      
      this.logger.debug(`[PatternExtractor] Mapped pattern tag "${patternTag}" to "${mappedPattern}"`);
      return mappedPattern;
    }
    
    // If no specific pattern tags, try to extract from fashion or general tags
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[PatternExtractor] Checking combined tags for pattern information:', allTags);
    
    // Common pattern terms that might appear in general tags
    const patternTerms = [
      'striped', 'stripe', 'checkered', 'plaid', 'floral', 'polka dot', 'dotted',
      'animal print', 'leopard', 'zebra', 'camouflage', 'camo', 'tie-dye', 'geometric',
      'paisley', 'herringbone', 'houndstooth', 'argyle', 'abstract', 'tropical', 'print'
    ];
    
    // Find tags that contain pattern terms
    const patternTags = allTags.filter(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return patternTerms.some(pattern => normalizedTag.includes(pattern));
    });
    
    if (patternTags.length > 0) {
      this.logger.debug('[PatternExtractor] Found pattern-related tags:', patternTags);
      
      // Map the first pattern tag to a standard pattern
      const mappedPattern = mapPatternKeyword(patternTags[0]);
      this.logger.debug(`[PatternExtractor] Mapped tag "${patternTags[0]}" to pattern "${mappedPattern}"`);
      return mappedPattern;
    }
    
    // If no pattern terms found, assume the item is solid
    this.logger.debug('[PatternExtractor] No pattern found in tags, assuming solid');
    return 'Solid';
  }
}
