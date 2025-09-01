import { Season } from '../../../../types';
import { ExtractionHelpers } from '../utils/extractionHelpers';

// Mapping of season keywords to Season enum values
const SEASON_KEYWORD_MAPPING: Record<string, Season> = {
  // Spring
  'spring': Season.SPRING,
  'springtime': Season.SPRING,
  'light': Season.SPRING,
  'pastel': Season.SPRING,
  'rainy': Season.SPRING,
  'floral': Season.SPRING,
  'breezy': Season.SPRING,
  'mild': Season.SPRING,
  'april': Season.SPRING,
  'may': Season.SPRING,
  'march': Season.SPRING,
  
  // Summer
  'summer': Season.SUMMER,
  'hot': Season.SUMMER,
  'beach': Season.SUMMER,
  'sun': Season.SUMMER,
  'tropical': Season.SUMMER,
  'vacation': Season.SUMMER,
  'bright': Season.SUMMER,
  // First occurrence of 'warm' - maps to SUMMER
  'warm': Season.SUMMER,
  'june': Season.SUMMER,
  'july': Season.SUMMER,
  'august': Season.SUMMER,
  
  // Fall/Autumn
  'fall': Season.FALL,
  'autumn': Season.FALL,
  'harvest': Season.FALL,
  'rustic': Season.FALL,
  'earth tone': Season.FALL,
  'rust': Season.FALL,
  'orange': Season.FALL,
  'burgundy': Season.FALL,
  'brown': Season.FALL,
  'khaki': Season.FALL,
  'olive': Season.FALL,
  'september': Season.FALL,
  'october': Season.FALL,
  'november': Season.FALL,
  
  // Winter
  'winter': Season.WINTER,
  'cold': Season.WINTER,
  'snow': Season.WINTER,
  'holiday': Season.WINTER,
  'christmas': Season.WINTER,
  'heavy': Season.WINTER,
  'thick': Season.WINTER,
  'cozy': Season.WINTER,
  'warmth': Season.WINTER, // Changed from 'warm' to avoid duplicate property
  'wool': Season.WINTER,
  'december': Season.WINTER,
  'january': Season.WINTER,
  'february': Season.WINTER,
  
  // All seasons
  'all season': Season.ALL_SEASON,
  'year round': Season.ALL_SEASON,
  'all year': Season.ALL_SEASON,
  'versatile': Season.ALL_SEASON,
  'basic': Season.ALL_SEASON,
  'essential': Season.ALL_SEASON,
  'staple': Season.ALL_SEASON,
  'everyday': Season.ALL_SEASON,
  'transitional': Season.ALL_SEASON,
};

/**
 * Get all available seasons
 * @returns Array of all Season enum values
 */
export function getAllSeasons(): Season[] {
  return [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER, Season.ALL_SEASON];
}

/**
 * Map a season keyword to a Season enum value
 * @param keyword The season keyword to map
 * @returns The mapped Season enum value or undefined if no mapping exists
 */
export function mapSeasonKeyword(keyword: string): Season | undefined {
  if (!keyword) return undefined;
  
  const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
  
  // Check direct mapping
  if (normalizedKeyword in SEASON_KEYWORD_MAPPING) {
    return SEASON_KEYWORD_MAPPING[normalizedKeyword];
  }
  
  // Check if the keyword contains any of our mappable terms
  for (const [key, value] of Object.entries(SEASON_KEYWORD_MAPPING)) {
    if (normalizedKeyword.includes(key)) {
      return value;
    }
  }
  
  return undefined;
}

/**
 * Get display name for a season
 * @param season The Season enum value
 * @returns Display name for the season
 */
export function getSeasonDisplayName(season: Season): string {
  switch (season) {
    case Season.SPRING:
      return 'Spring';
    case Season.SUMMER:
      return 'Summer';
    case Season.FALL:
      return 'Fall';
    case Season.WINTER:
      return 'Winter';
    case Season.ALL_SEASON:
      return 'All Seasons';
    default:
      return 'Unknown';
  }
}
