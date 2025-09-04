import { useState, useCallback } from 'react';
import { WishlistStatus } from '../../types';

export enum TabType {
  ITEMS = 'items',
  OUTFITS = 'outfits',
  CAPSULES = 'capsules',
  WISHLIST = 'wishlist'
}

interface TabFilters {
  category: string;
  season: string | string[];
  status: WishlistStatus | 'all';
  searchQuery: string;
  scenario: string;
}

export const useTabState = (initialTab: TabType = TabType.ITEMS) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  
  // Initialize filters for each tab
  const [filters, setFilters] = useState<Record<TabType, TabFilters>>({
    [TabType.ITEMS]: {
      category: 'all',
      season: 'all',
      status: 'all',
      searchQuery: '',
      scenario: 'all'
    },
    [TabType.OUTFITS]: {
      category: 'all',
      season: 'all',
      status: 'all',
      searchQuery: '',
      scenario: 'all'
    },
    [TabType.CAPSULES]: {
      category: 'all',
      season: 'all',
      status: 'all',
      searchQuery: '',
      scenario: 'all'
    },
    [TabType.WISHLIST]: {
      category: 'all',
      season: 'all',
      status: 'all',
      searchQuery: '',
      scenario: 'all'
    }
  });

  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // Update filter for the current tab
  const updateFilter = useCallback(<K extends keyof TabFilters>(
    filterName: K,
    value: TabFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [filterName]: value
      }
    }));
  }, [activeTab]);

  // Get current tab's filters
  const currentFilters = filters[activeTab];

  return {
    // Tab state
    activeTab,
    setActiveTab: handleTabChange,
    
    // Tab type helpers
    isItemsTab: activeTab === TabType.ITEMS,
    isOutfitsTab: activeTab === TabType.OUTFITS,
    isCapsulesTab: activeTab === TabType.CAPSULES,
    isWishlistTab: activeTab === TabType.WISHLIST,
    
    // Current tab's filters
    filters: currentFilters,
    
    // Filter updaters
    updateFilter,
    setCategoryFilter: (category: string) => updateFilter('category', category),
    setSeasonFilter: (season: string | string[]) => updateFilter('season', season),
    setStatusFilter: (status: WishlistStatus | 'all') => updateFilter('status', status),
    setSearchQuery: (searchQuery: string) => updateFilter('searchQuery', searchQuery),
    setScenarioFilter: (scenario: string) => updateFilter('scenario', scenario)
  };
};

export type UseTabStateReturn = ReturnType<typeof useTabState>;
