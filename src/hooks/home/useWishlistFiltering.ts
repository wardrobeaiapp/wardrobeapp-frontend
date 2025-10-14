import { useMemo, useCallback, useState } from 'react';
import { WardrobeItem, WishlistStatus } from '../../types';
import { useItemFiltering } from '../home/useItemFiltering';

interface UseWishlistFilteringProps {
  items: WardrobeItem[];
  scenarioFilter?: string;
  setScenarioFilter?: (scenario: string) => void;
  categoryFilter?: string;
  seasonFilter?: string | string[];
  searchQuery?: string;
  statusFilter?: WishlistStatus | 'all';
  setCategoryFilter?: (category: string) => void;
  setSeasonFilter?: (season: string | string[]) => void;
  setSearchQuery?: (query: string) => void;
  setStatusFilter?: (status: WishlistStatus | 'all') => void;
}

export const useWishlistFiltering = ({ 
  items, 
  scenarioFilter: externalScenarioFilter, 
  setScenarioFilter: externalSetScenarioFilter,
  categoryFilter: externalCategoryFilter,
  seasonFilter: externalSeasonFilter,
  searchQuery: externalSearchQuery,
  statusFilter: externalStatusFilter,
  setCategoryFilter: externalSetCategoryFilter,
  setSeasonFilter: externalSetSeasonFilter,
  setSearchQuery: externalSetSearchQuery,
  setStatusFilter: externalSetStatusFilter
}: UseWishlistFilteringProps) => {
  // Wishlist status filter state
  const [wishlistStatusFilter, setWishlistStatusFilter] = useState<WishlistStatus | 'all'>('all');

  // Scenario filter state - use external if provided, otherwise use internal state
  const [internalScenarioFilter, setInternalScenarioFilter] = useState<string>('all');
  const scenarioFilter = externalScenarioFilter !== undefined ? externalScenarioFilter : internalScenarioFilter;
  const setScenarioFilter = externalSetScenarioFilter || setInternalScenarioFilter;

  // Filter state management - use external if provided, otherwise use internal state
  const [internalCategoryFilter, setInternalCategoryFilter] = useState<string>('all');
  const [internalSeasonFilter, setInternalSeasonFilter] = useState<string | string[]>('all');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');

  const categoryFilter = externalCategoryFilter !== undefined ? externalCategoryFilter : internalCategoryFilter;
  const setCategoryFilter = externalSetCategoryFilter || setInternalCategoryFilter;
  const seasonFilter = externalSeasonFilter !== undefined ? externalSeasonFilter : internalSeasonFilter;
  const setSeasonFilter = externalSetSeasonFilter || setInternalSeasonFilter;
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const setSearchQuery = externalSetSearchQuery || setInternalSearchQuery;
  
  // Filter wishlist items using the useItemFiltering hook
  const { filteredItems: filteredWishlistItems, itemCount: wishlistItemCount } = useItemFiltering(
    items,
    {
      isWishlist: true,
      wishlistStatus: wishlistStatusFilter === 'all' ? undefined : wishlistStatusFilter,
      scenario: scenarioFilter === 'all' ? undefined : scenarioFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      season: seasonFilter === 'all' ? undefined : seasonFilter,
      searchQuery: searchQuery,
    }
  );
  
  // Memoize the filtered items for performance
  const wishlistItems = useMemo(() => filteredWishlistItems, [filteredWishlistItems]);
  
  // Handle wishlist status filter changes
  const handleSetWishlistStatusFilter = useCallback((status: WishlistStatus | 'all') => {
    setWishlistStatusFilter(status);
    externalSetStatusFilter && externalSetStatusFilter(status);
  }, [externalSetStatusFilter]);

  // Handle scenario filter changes
  const handleSetScenarioFilter = useCallback((scenario: string) => {
    setScenarioFilter(scenario);
  }, [setScenarioFilter]);

  // Handle category filter changes
  const handleSetCategoryFilter = useCallback((category: string) => {
    setCategoryFilter(category);
  }, [setCategoryFilter]);

  // Handle season filter changes
  const handleSetSeasonFilter = useCallback((season: string | string[]) => {
    setSeasonFilter(season);
  }, [setSeasonFilter]);

  // Handle search query changes
  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, [setSearchQuery]);

  return {
    // Filtered wishlist items
    filteredWishlistItems,
    wishlistItems, // For backward compatibility
    
    // Wishlist status filtering
    wishlistStatusFilter: externalStatusFilter || wishlistStatusFilter,
    setWishlistStatusFilter: handleSetWishlistStatusFilter,
    wishlistItemCount,
    
    // Scenario filtering
    scenarioFilter,
    setScenarioFilter: handleSetScenarioFilter,
    
    // Category filtering
    categoryFilter,
    setCategoryFilter: handleSetCategoryFilter,
    
    // Season filtering
    seasonFilter,
    setSeasonFilter: handleSetSeasonFilter,
    
    // Search filtering
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
  };
};

export default useWishlistFiltering;
