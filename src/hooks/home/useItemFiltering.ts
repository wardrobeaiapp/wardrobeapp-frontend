import { useMemo } from 'react';
import { WardrobeItem, Season, WishlistStatus } from '../../types';

export interface ItemFilterOptions {
  category?: string;
  season?: string;
  searchQuery?: string;
  wishlistStatus?: string;
  isWishlist?: boolean;
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
    isWishlist = false
  } = options;

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Skip if this is a wishlist filter but the item is not a wishlist item
      if (isWishlist && !item.wishlist) return false;
      
      // Skip if this is a regular items filter but the item is a wishlist item
      if (!isWishlist && item.wishlist) return false;
      
      // Category filter
      const matchesCategory = category === 'all' || item.category === category;
      
      // Season filter
      const matchesSeason = season === 'all' || 
        (Array.isArray(item.season) 
          ? item.season.includes(season as Season)
          : item.season === season);
      
      // Search query
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchLower) ||
        (item.category?.toLowerCase() || '').includes(searchLower) ||
        (item.brand?.toLowerCase() || '').includes(searchLower);
      
      // Wishlist status filter (only applies to wishlist items)
      let matchesStatus = true;
      if (isWishlist) {
        const itemStatus = item.wishlistStatus || WishlistStatus.NOT_REVIEWED;
        matchesStatus = wishlistStatus === 'all' || itemStatus === wishlistStatus;
      }
      
      return matchesCategory && matchesSeason && matchesSearch && matchesStatus;
    });
  }, [items, category, season, searchQuery, wishlistStatus, isWishlist]);

  return {
    filteredItems,
    itemCount: filteredItems.length
  };
};

export default useItemFiltering;
