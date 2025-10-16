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
    // Early return if no items
    if (!items || items.length === 0) return [];
    
    // Pre-compute search terms to avoid repeated operations
    const searchLower = searchQuery ? searchQuery.toLowerCase().trim() : '';
    const hasSearch = searchLower.length > 0;
    
    const filtered = items.filter(item => {
      // Fast wishlist filtering first
      if (isWishlist && !item.wishlist) return false;
      if (!isWishlist && item.wishlist) return false;
      
      // Fast category filtering
      if (category !== 'all' && item.category !== category) return false;
      
      // Fast scenario filtering with early return
      if (scenario && scenario !== 'all') {
        const itemScenarios = item.scenarios;
        if (!itemScenarios || itemScenarios.length === 0 || !itemScenarios.includes(scenario)) {
          return false;
        }
      }
      
      // Season filtering - optimized logic
      if (season !== 'all') {
        const itemSeason = item.season;
        let matchesSeason = false;
        
        if (Array.isArray(season)) {
          matchesSeason = season.includes('all') || season.some(s => 
            Array.isArray(itemSeason) ? itemSeason.includes(s as Season) : itemSeason === s
          );
        } else {
          matchesSeason = Array.isArray(itemSeason) 
            ? itemSeason.includes(season as Season)
            : itemSeason === season;
        }
        
        if (!matchesSeason) return false;
      }
      
      // Search filtering - optimized with early returns and pre-computed lowercase
      if (hasSearch) {
        const itemNameLower = item.name.toLowerCase();
        if (itemNameLower.includes(searchLower)) return true;
        
        const categoryLower = (item.category || '').toLowerCase();
        if (categoryLower.includes(searchLower)) return true;
        
        const brandLower = (item.brand || '').toLowerCase();
        if (brandLower.includes(searchLower)) return true;
        
        const itemScenarios = item.scenarios;
        if (itemScenarios && itemScenarios.some(s => s.toLowerCase().includes(searchLower))) {
          return true;
        }
        
        return false; // No search match found
      }
      
      // Wishlist status filtering (only for wishlist items)
      if (isWishlist && wishlistStatus !== 'all') {
        const itemStatus = item.wishlistStatus || WishlistStatus.NOT_REVIEWED;
        return itemStatus === wishlistStatus;
      }
      
      return true;
    });


    return filtered;
  }, [items, category, season, searchQuery, wishlistStatus, isWishlist, scenario]);

  return {
    filteredItems,
    itemCount: filteredItems.length
  };
};

export default useItemFiltering;
