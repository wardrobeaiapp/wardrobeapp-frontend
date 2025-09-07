import { useMemo, useCallback, useState } from 'react';
import { WardrobeItem, WishlistStatus } from '../../types';
import { useItemFiltering } from '../home/useItemFiltering';

interface UseWishlistFilteringProps {
  items: WardrobeItem[];
  scenarioFilter?: string;
  setScenarioFilter?: (scenario: string) => void;
}

export const useWishlistFiltering = ({ 
  items, 
  scenarioFilter: externalScenarioFilter, 
  setScenarioFilter: externalSetScenarioFilter 
}: UseWishlistFilteringProps) => {
  // Wishlist status filter state
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState<WishlistStatus | 'all'>('all');
  
  // Scenario filter state - use external if provided, otherwise use internal state
  const [internalScenarioFilter, setInternalScenarioFilter] = useState<string>('all');
  const scenarioFilter = externalScenarioFilter !== undefined ? externalScenarioFilter : internalScenarioFilter;
  const setScenarioFilter = externalSetScenarioFilter || setInternalScenarioFilter;
  
  // Filter wishlist items using the useItemFiltering hook
  const { filteredItems: filteredWishlistItems, itemCount: wishlistItemCount } = useItemFiltering(
    items,
    {
      isWishlist: true,
      wishlistStatus: wishlistStatusFilter === 'all' ? undefined : wishlistStatusFilter,
      scenario: scenarioFilter === 'all' ? undefined : scenarioFilter,
    }
  );
  
  // Memoize the filtered items for performance
  const wishlistItems = useMemo(() => filteredWishlistItems, [filteredWishlistItems]);
  
  // Handle wishlist status filter changes
  const handleSetWishlistStatusFilter = useCallback((status: WishlistStatus | 'all') => {
    setWishlistStatusFilter(status);
  }, []);
  
  // Handle scenario filter changes
  const handleSetScenarioFilter = useCallback((scenario: string) => {
    setScenarioFilter(scenario);
  }, [setScenarioFilter]);

  return {
    // Filtered wishlist items
    filteredWishlistItems,
    wishlistItems, // For backward compatibility
    
    // Wishlist status filtering
    wishlistStatusFilter,
    setWishlistStatusFilter: handleSetWishlistStatusFilter,
    wishlistItemCount,
    
    // Scenario filtering
    scenarioFilter,
    setScenarioFilter: handleSetScenarioFilter,
  };
};

export default useWishlistFiltering;
