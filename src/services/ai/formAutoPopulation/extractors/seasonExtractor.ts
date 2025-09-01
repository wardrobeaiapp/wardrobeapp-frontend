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
    
    // If no seasons detected, default to all seasons
    if (detectedSeasons.size === 0) {
      this.logger.debug('[SeasonExtractor] No specific seasons detected, defaulting to ALL');
      detectedSeasons.add(Season.ALL_SEASON);
    }
    
    // If we have Season.ALL and other seasons, remove the others (ALL takes precedence)
    if (detectedSeasons.has(Season.ALL_SEASON) && detectedSeasons.size > 1) {
      this.logger.debug('[SeasonExtractor] Found ALL season along with others, keeping only ALL');
      return [Season.ALL_SEASON];
    }
    
    return Array.from(detectedSeasons);
  }

  /**
   * Check if tags contain winter-specific indicators
   */
  private hasWinterIndicators(tags: string[]): boolean {
    const winterTerms = [
      'winter', 'cold', 'snow', 'warm', 'thick', 'heavy', 'cozy',
      'wool', 'fleece', 'knit', 'thermal', 'puffer', 'down', 'insulated'
    ];
    
    return tags.some(tag => ExtractionHelpers.tagMatchesAny(tag, winterTerms));
  }

  /**
   * Check if tags contain summer-specific indicators
   */
  private hasSummerIndicators(tags: string[]): boolean {
    const summerTerms = [
      'summer', 'hot', 'beach', 'light', 'thin', 'cool', 'breathable',
      'linen', 'cotton', 'shorts', 'tank', 'sleeveless', 'vacation', 'tropical'
    ];
    
    return tags.some(tag => ExtractionHelpers.tagMatchesAny(tag, summerTerms));
  }
}
