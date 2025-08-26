import { Season } from '../../../types';

/**
 * Maps keywords to their appropriate seasons
 */
export const seasonMappings: Record<string, Season[]> = {
  // Spring keywords
  'spring': [Season.SPRING],
  'light': [Season.SPRING],
  'pastel': [Season.SPRING],
  'floral': [Season.SPRING],
  'garden': [Season.SPRING],
  'easter': [Season.SPRING],
  'april': [Season.SPRING],
  'may': [Season.SPRING],
  'march': [Season.SPRING],
  'bloom': [Season.SPRING],
  
  // Summer keywords
  'summer': [Season.SUMMER],
  'beach': [Season.SUMMER],
  'hot': [Season.SUMMER],
  'vacation': [Season.SUMMER],
  'tropical': [Season.SUMMER],
  'july': [Season.SUMMER],
  'august': [Season.SUMMER],
  'june': [Season.SUMMER],
  'sun': [Season.SUMMER],
  'swim': [Season.SUMMER],
  'warm weather': [Season.SUMMER],
  
  // Fall keywords
  'fall': [Season.FALL],
  'autumn': [Season.FALL],
  'harvest': [Season.FALL],
  'october': [Season.FALL],
  'november': [Season.FALL],
  'september': [Season.FALL],
  'rustic': [Season.FALL],
  'rust': [Season.FALL],
  'foliage': [Season.FALL],
  'school': [Season.FALL],
  
  // Winter keywords
  'winter': [Season.WINTER],
  'cold': [Season.WINTER],
  'snow': [Season.WINTER],
  'ice': [Season.WINTER],
  'holiday': [Season.WINTER],
  'christmas': [Season.WINTER],
  'december': [Season.WINTER],
  'january': [Season.WINTER],
  'february': [Season.WINTER],
  'cozy': [Season.WINTER],
  
  // Multi-season keywords
  'transition': [Season.SPRING, Season.FALL],
  'all-season': [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER],
  'year-round': [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER],
  'versatile': [Season.SPRING, Season.FALL],
  'layering': [Season.SPRING, Season.FALL],
  'casual': [Season.SPRING, Season.SUMMER, Season.FALL],
  'light jacket': [Season.SPRING, Season.FALL]
};

/**
 * Gets all seasons
 */
export function getAllSeasons(): Season[] {
  return Object.values(Season);
}
