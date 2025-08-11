import { Season, WardrobeItem } from '../../../types';

/**
 * Get unique categories from available items
 */
export const extractUniqueCategories = (items: WardrobeItem[]): string[] => {
  return items
    .map(item => item.category)
    .filter((category, index, self) => self.indexOf(category) === index);
};

/**
 * Get unique colors from available items
 */
export const extractUniqueColors = (items: WardrobeItem[]): string[] => {
  return items
    .map(item => item.color)
    .filter((color, index, self) => self.indexOf(color) === index);
};

/**
 * Apply category filter to items
 */
export const applyCategoryFilter = (
  items: WardrobeItem[],
  categoryFilter: string
): WardrobeItem[] => {
  if (categoryFilter === 'all') return items;
  return items.filter(item => item.category === categoryFilter);
};

/**
 * Apply color filter to items
 */
export const applyColorFilter = (
  items: WardrobeItem[],
  colorFilter: string
): WardrobeItem[] => {
  if (!colorFilter) return items;
  return items.filter(item => 
    item.color.toLowerCase().includes(colorFilter.toLowerCase())
  );
};

/**
 * Apply season filter to items
 */
export const applySeasonFilter = (
  items: WardrobeItem[],
  seasonFilter: string
): WardrobeItem[] => {
  if (seasonFilter === 'all') return items;
  return items.filter(item => 
    item.season.includes(seasonFilter as Season)
  );
};

/**
 * Apply search query filter to items
 */
export const applySearchFilter = (
  items: WardrobeItem[],
  searchQuery: string
): WardrobeItem[] => {
  if (!searchQuery) return items;
  
  const query = searchQuery.toLowerCase();
  return items.filter(item => 
    item.name.toLowerCase().includes(query) ||
    (item.brand && item.brand.toLowerCase().includes(query)) ||
    (item.material && item.material.toLowerCase().includes(query)) ||
    (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
  );
};

/**
 * Apply all filters to items in sequence
 */
export const applyAllFilters = (
  items: WardrobeItem[],
  filters: {
    categoryFilter: string;
    colorFilter: string;
    seasonFilter: string;
    searchQuery: string;
  }
): WardrobeItem[] => {
  let filtered = [...items];
  
  filtered = applyCategoryFilter(filtered, filters.categoryFilter);
  filtered = applyColorFilter(filtered, filters.colorFilter);
  filtered = applySeasonFilter(filtered, filters.seasonFilter);
  filtered = applySearchFilter(filtered, filters.searchQuery);
  
  return filtered;
};
