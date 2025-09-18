import { Season } from '../../../../types';
import { ExtractionHelpers } from '../utils/extractionHelpers';

// Mapping of season keywords to Season enum values
const SEASON_KEYWORD_MAPPING: Record<string, Season> = {
  // Transitional (Spring/Fall combined)
  'spring': Season.TRANSITIONAL,
  'springtime': Season.TRANSITIONAL,
  'light': Season.TRANSITIONAL,
  'pastel': Season.TRANSITIONAL,
  'rainy': Season.TRANSITIONAL,
  'floral': Season.TRANSITIONAL,
  'breezy': Season.TRANSITIONAL,
  'mild': Season.TRANSITIONAL,
  'april': Season.TRANSITIONAL,
  'may': Season.TRANSITIONAL,
  'march': Season.TRANSITIONAL,
  
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
  
  // Fall/Autumn (now part of Transitional)
  'fall': Season.TRANSITIONAL,
  'autumn': Season.TRANSITIONAL,
  'harvest': Season.TRANSITIONAL,
  'rustic': Season.TRANSITIONAL,
  'earth tone': Season.TRANSITIONAL,
  'rust': Season.TRANSITIONAL,
  'orange': Season.TRANSITIONAL,
  'burgundy': Season.TRANSITIONAL,
  'brown': Season.TRANSITIONAL,
  'khaki': Season.TRANSITIONAL,
  'olive': Season.TRANSITIONAL,
  'september': Season.TRANSITIONAL,
  'october': Season.TRANSITIONAL,
  'november': Season.TRANSITIONAL,
  'layering': Season.TRANSITIONAL,
  'transitional': Season.TRANSITIONAL,
  
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
};

/**
 * Get all available seasons
 * @returns Array of all Season enum values
 */
export function getAllSeasons(): Season[] {
  return [Season.SUMMER, Season.WINTER, Season.TRANSITIONAL];
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
    case Season.SUMMER:
      return 'Summer';
    case Season.WINTER:
      return 'Winter';
    case Season.TRANSITIONAL:
      return 'Spring/Fall';
    default:
      return 'Unknown';
  }
}
