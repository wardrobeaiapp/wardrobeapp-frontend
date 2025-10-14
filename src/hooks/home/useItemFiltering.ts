import { useMemo } from 'react';
import { WardrobeItem, Season, WishlistStatus } from '../../types';

export interface ItemFilterOptions {
  category?: string;
  season?: string | string[];
  searchQuery?: string;
  wishlistStatus?: string;
  isWishlist?: boolean;
  scenario?: string;
}

export const useItemFiltering = (
  items: WardrobeItem[], 
  options: ItemFilterOptions
) => {
  const {
    category = 'all',
    season = 'all',
    searchQuery = '',
    wishlistStatus = 'all',
    isWishlist = false,
    scenario = 'all'
  } = options;

  const filteredItems = useMemo(() => {
    // Memoize search query lowercase to avoid repeated operations
    const searchLower = searchQuery ? searchQuery.toLowerCase() : '';
    
    const filtered = items.filter(item => {
      // Skip if this is a wishlist filter but the item is not a wishlist item
      if (isWishlist && !item.wishlist) return false;
      
      // Skip if this is a regular items filter but the item is a wishlist item
      if (!isWishlist && item.wishlist) return false;
      
      // Category filter
      const matchesCategory = category === 'all' || item.category === category;
      
      // Season filter - handle both string and string[] for season and item.season
      const matchesSeason = season === 'all' || 
        (Array.isArray(season)
          ? season.some(s => s === 'all' || 
              (Array.isArray(item.season) 
                ? item.season.includes(s as Season)
                : item.season === s))
          : (Array.isArray(item.season)
              ? item.season.includes(season as Season)
              : item.season === season));
      
      // Search query - optimized string operations
      const itemScenarios = item.scenarios || [];
      const matchesSearch = !searchLower || 
        item.name.toLowerCase().includes(searchLower) ||
        (item.category?.toLowerCase() || '').includes(searchLower) ||
        (item.brand?.toLowerCase() || '').includes(searchLower) ||
        itemScenarios.some(s => s.toLowerCase().includes(searchLower));
      
      // Wishlist status filter (only applies to wishlist items)
      let matchesStatus = true;
      if (isWishlist) {
        const itemStatus = item.wishlistStatus || WishlistStatus.NOT_REVIEWED;
        matchesStatus = wishlistStatus === 'all' || itemStatus === wishlistStatus;
      }
      
      // Scenario filter - only apply if scenario is provided and not 'all'
      const matchesScenario = !scenario || scenario === 'all' || 
        (Array.isArray(itemScenarios) && itemScenarios.length > 0 && itemScenarios.includes(scenario));
      
      return matchesCategory && matchesSeason && matchesSearch && matchesStatus && matchesScenario;
    });

    // Lightweight debug logging - only summary stats
    if (process.env.NODE_ENV === 'development' && (scenario && scenario !== 'all')) {
      console.log(`[useItemFiltering] Filtered ${items.length} → ${filtered.length} items (scenario: ${scenario})`);
    }

    return filtered;
  }, [items, category, season, searchQuery, wishlistStatus, isWishlist, scenario]);

  return {
    filteredItems,
    itemCount: filteredItems.length
  };
};

export default useItemFiltering;
