import { Season } from '../../../../types';
import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { mapSeasonKeyword } from '../mappings/seasonMappings';

/**
 * Responsible for extracting season information from detected tags
 */
export class SeasonExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the applicable seasons from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @returns Array of detected seasons or empty array if no seasons could be determined
   */
  extractSeasons(tags: { fashion_tags?: string[], general_tags?: string[] }): Season[] {
    this.logger.debug('[SeasonExtractor] Extracting seasons from tags');
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[SeasonExtractor] Checking combined tags for season information:', allTags);
    
    // Find seasons mentioned in tags
    const detectedSeasons = new Set<Season>();
    
    for (const tag of allTags) {
      const season = mapSeasonKeyword(tag);
      if (season) {
        this.logger.debug(`[SeasonExtractor] Detected season ${season} from tag "${tag}"`);
        detectedSeasons.add(season);
      }
    }
    
    // Check for specific season indicators
    if (this.hasWinterIndicators(allTags)) {
      detectedSeasons.add(Season.WINTER);
    }
    
    if (this.hasSummerIndicators(allTags)) {
      detectedSeasons.add(Season.SUMMER);
    }
    
    if (this.hasSpringIndicators(allTags)) {
      detectedSeasons.add(Season.SPRING);
    }
    
    if (this.hasFallIndicators(allTags)) {
      detectedSeasons.add(Season.FALL);
    }
    
    // If no seasons detected, return empty array
    if (detectedSeasons.size === 0) {
      this.logger.debug('[SeasonExtractor] No specific seasons detected');
      return [];
    }
    
    return Array.from(detectedSeasons);
  }

  /**
   * Generic helper function to check for season-specific indicators with detailed debugging
   * @param seasonName Name of the season for logging purposes
   * @param tags Array of tags to check
   * @param seasonTerms Array of terms specific to the season
   * @returns Whether any indicators were found
   */
  private hasSeasonIndicators(seasonName: string, tags: string[], seasonTerms: string[]): boolean {
    this.logger.debug(`[SeasonExtractor] Checking for ${seasonName} indicators in tags:`, tags);
    
    const matchingTags: string[] = [];
    const matchingTerms: string[] = [];
    
    for (const tag of tags) {
      for (const term of seasonTerms) {
        const normalizedTag = ExtractionHelpers.normalizeString(tag);
        const normalizedTerm = ExtractionHelpers.normalizeString(term);
        
        if (normalizedTag.includes(normalizedTerm)) {
          this.logger.debug(`[SeasonExtractor] ${seasonName} indicator found: tag "${tag}" matches term "${term}"`);
          matchingTags.push(tag);
          matchingTerms.push(term);
        }
      }
    }
    
    const hasIndicators = matchingTags.length > 0;
    
    if (hasIndicators) {
      this.logger.debug(`[SeasonExtractor] ${seasonName} indicators summary:`, {
        matchingTags: [...new Set(matchingTags)],
        matchingTerms: [...new Set(matchingTerms)],
        totalMatches: matchingTags.length
      });
    } else {
      this.logger.debug(`[SeasonExtractor] No ${seasonName} indicators found`);
    }
    
    return hasIndicators;
  }

  /**
   * Check if tags contain winter-specific indicators
   */
  private hasWinterIndicators(tags: string[]): boolean {
    const winterTerms = [
      'winter', 'cold', 'warm', 'thick', 'heavy', 'cozy',
      'wool', 'fleece', 'knit', 'thermal', 'puffer', 'down', 'insulated',
    ];
    
    return this.hasSeasonIndicators('winter', tags, winterTerms);
  }

  /**
   * Check if tags contain summer-specific indicators
   */
  private hasSummerIndicators(tags: string[]): boolean {
    const summerTerms = [
      'summer', 'hot', 'beach', 'light', 'cool', 'breathable',
      'linen', 'cotton', 'shorts', 'tank', 'sleeveless', 'vacation', 'tropical'
    ];
    
    return this.hasSeasonIndicators('summer', tags, summerTerms);
  }

  /**
   * Check if tags contain spring-specific indicators
   */
  private hasSpringIndicators(tags: string[]): boolean {
    const springTerms = [
      'spring', 'fresh', 'blooming', 'mild', 'transitional', 'layered',
      'cardigan', 'light jacket', 'denim', 'chinos', 'loafers', 'sneakers',
      'pastel', 'bright', 'floral', 'lightweight', 'versatile',
    ];
    
    return this.hasSeasonIndicators('spring', tags, springTerms);
  }

  /**
   * Check if tags contain fall-specific indicators
   */
  private hasFallIndicators(tags: string[]): boolean {
    const fallTerms = [
      'fall', 'autumn', 'crisp', 'layering', 'cozy', 'sweater', 'boots', 
      'scarf', 'plaid', 'corduroy', 'tweed', 'burgundy', 'rust', 'leather', 
      'suede', 'wool'
    ];
    
    return this.hasSeasonIndicators('fall', tags, fallTerms);
  }
}
