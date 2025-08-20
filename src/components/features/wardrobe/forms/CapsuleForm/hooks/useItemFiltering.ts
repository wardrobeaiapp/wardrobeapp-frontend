import { useState, useEffect, useMemo } from 'react';
import { Season, WardrobeItem, ItemCategory } from '../../../../../../types';

export interface UseItemFilteringProps {
  availableItems: WardrobeItem[];
}

export interface UseItemFilteringReturn {
  // Filter state
  categoryFilter: ItemCategory | 'all';
  setCategoryFilter: (category: ItemCategory | 'all') => void;
  colorFilter: string;
  setColorFilter: (color: string) => void;
  seasonFilter: Season | 'all';
  setSeasonFilter: (season: Season | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: WardrobeItem[];
  
  // Filter data
  categories: string[];
  colors: string[];
  
  // State helpers
  hasActiveFilters: boolean;
  noMatchingItems: boolean;
  
  // Modal helpers
  resetFilters: () => void;
}

export const useItemFiltering = ({ 
  availableItems 
}: UseItemFilteringProps): UseItemFilteringReturn => {
  // Filter out wishlist items from available items
  const nonWishlistItems = useMemo(() => 
    availableItems ? availableItems.filter(item => !item.wishlist) : [], 
    [availableItems]
  );
  
  // Filter state
  const [categoryFilter, setCategoryFilterState] = useState<ItemCategory | 'all'>('all');
  const [colorFilter, setColorFilter] = useState('');
  const [seasonFilter, setSeasonFilterState] = useState<Season | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>(nonWishlistItems);

  // Filter items based on selected filters
  useEffect(() => {
    if (!nonWishlistItems.length) {
      setFilteredItems([]);
      return;
    }
    
    let filtered = [...nonWishlistItems];
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.category === categoryFilter
      );
    }
    
    // Apply color filter
    if (colorFilter) {
      filtered = filtered.filter(item => 
        item.color.toLowerCase().includes(colorFilter.toLowerCase())
      );
    }
    
    // Apply season filter
    if (seasonFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.season.includes(seasonFilter as Season)
      );
    }
    
    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.material && item.material.toLowerCase().includes(searchQuery.toLowerCase())) 
      );
    }
    
    // Only update if we have items or if all filters are reset
    if (filtered.length > 0 || 
        (categoryFilter === 'all' && 
         !colorFilter && 
         seasonFilter === 'all' && 
         !searchQuery)) {
      setFilteredItems(filtered);
    }
  }, [nonWishlistItems, categoryFilter, colorFilter, seasonFilter, searchQuery]);
  
  // Check if there are active filters
  const hasActiveFilters = useMemo(() => {
    return categoryFilter !== 'all' || 
           colorFilter !== '' || 
           seasonFilter !== 'all' || 
           searchQuery !== '';
  }, [categoryFilter, colorFilter, seasonFilter, searchQuery]);
  
  // Check if no items match the current filters
  const noMatchingItems = useMemo(() => {
    return hasActiveFilters && filteredItems.length === 0;
  }, [hasActiveFilters, filteredItems.length]);

  // Get unique categories and colors for filters
  const categories = nonWishlistItems
    .map(item => item.category)
    .filter((category, index, self) => self.indexOf(category) === index);
  const colors = nonWishlistItems
    .map(item => item.color)
    .filter((color, index, self) => self.indexOf(color) === index);

  // Reset filters helper (used when opening modals)
  const resetFilters = () => {
    setCategoryFilterState('all');
    setColorFilter('');
    setSeasonFilterState('all');
    setSearchQuery('');
  };

  const setCategoryFilter = (value: ItemCategory | 'all') => {
    setCategoryFilterState(value);
  };

  const setSeasonFilter = (value: Season | 'all') => {
    setSeasonFilterState(value);
  };

  return {
    // Filter state
    categoryFilter,
    setCategoryFilter,
    colorFilter,
    setColorFilter,
    seasonFilter,
    setSeasonFilter,
    searchQuery,
    setSearchQuery,
    filteredItems,
    
    // Filter data
    categories,
    colors,
    
    // State helpers
    hasActiveFilters,
    noMatchingItems,
    
    // Modal helpers
    resetFilters,
  };
};
