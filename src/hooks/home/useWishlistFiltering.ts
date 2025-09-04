import { useMemo } from 'react';
import { WardrobeItem, WishlistStatus, Season } from '../../types';

export interface WishlistFilterOptions {
  category?: string;
  season?: string | string[];
  searchQuery?: string;
  wishlistStatus?: WishlistStatus | 'all';
}

export const useWishlistFiltering = (
  items: WardrobeItem[],
  options?: WishlistFilterOptions
) => {
  // Default filter values
  const {
    category = 'all',
    season = 'all',
    searchQuery = '',
    wishlistStatus = 'all'
  } = options || {};

  const { filteredItems, itemCount } = useMemo(() => {
    // First filter by wishlist items only
    const wishlistItems = items.filter(item => item.wishlist === true);
    
    // Then apply other filters
    const filtered = wishlistItems.filter(item => {
      const searchLower = searchQuery.toLowerCase();
      const itemSeasons = Array.isArray(item.season) ? item.season : [item.season];
      
      // Category filter
      const matchesCategory = category === 'all' || 
        item.category === category;
      
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
      
      // Wishlist status filter
      const matchesStatus = wishlistStatus === 'all' || 
        item.wishlistStatus === wishlistStatus;
      
      // Search query - search name, brand, and category
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchLower) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        item.category.toLowerCase().includes(searchLower) ||
        (item.subcategory && item.subcategory.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSeason && matchesStatus && matchesSearch;
    });

    return {
      filteredItems: filtered,
      itemCount: filtered.length
    };
  }, [items, category, season, searchQuery, wishlistStatus]);

  return {
    filteredItems,
    itemCount
  };
};

export default useWishlistFiltering;
