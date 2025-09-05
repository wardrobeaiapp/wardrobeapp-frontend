import { useMemo, useCallback, useState } from 'react';
import { WardrobeItem, WishlistStatus } from '../../types';
import { useItemFiltering } from '../home/useItemFiltering';

interface UseWishlistFilteringProps {
  items: WardrobeItem[];
}

export const useWishlistFiltering = ({ items }: UseWishlistFilteringProps) => {
  // Wishlist status filter state
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState<WishlistStatus | 'all'>('all');
  
  // Filter wishlist items using the useItemFiltering hook
  const { filteredItems: filteredWishlistItems, itemCount: wishlistItemCount } = useItemFiltering(
    items,
    {
      isWishlist: true,
      wishlistStatus: wishlistStatusFilter === 'all' ? undefined : wishlistStatusFilter,
    }
  );
  
  // Memoize the filtered items for performance
  const wishlistItems = useMemo(() => filteredWishlistItems, [filteredWishlistItems]);
  
  // Handle wishlist status filter changes
  const handleSetWishlistStatusFilter = useCallback((status: WishlistStatus | 'all') => {
    setWishlistStatusFilter(status);
  }, []);
  
  return {
    // Filtered wishlist items
    filteredWishlistItems,
    wishlistItems, // For backward compatibility
    
    // Wishlist status filtering
    wishlistStatusFilter,
    setWishlistStatusFilter: handleSetWishlistStatusFilter,
    wishlistItemCount,
  };
};

export default useWishlistFiltering;
