import { useState, useEffect, useMemo } from 'react';
import { Season, WardrobeItem } from '../../../types';

export interface UseItemFilteringProps {
  availableItems: WardrobeItem[];
}

export interface UseItemFilteringReturn {
  // Filter state
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  colorFilter: string;
  setColorFilter: (color: string) => void;
  seasonFilter: string;
  setSeasonFilter: (season: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: WardrobeItem[];
  
  // Filter data
  categories: string[];
  colors: string[];
  
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
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('');
  const [seasonFilter, setSeasonFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<WardrobeItem[]>(nonWishlistItems);

  // Filter items based on selected filters
  useEffect(() => {
    if (!nonWishlistItems.length) return;
    
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
        (item.material && item.material.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    setFilteredItems(filtered);
  }, [nonWishlistItems, categoryFilter, colorFilter, seasonFilter, searchQuery]);

  // Get unique categories and colors for filters
  const categories = nonWishlistItems
    .map(item => item.category)
    .filter((category, index, self) => self.indexOf(category) === index);
  const colors = nonWishlistItems
    .map(item => item.color)
    .filter((color, index, self) => self.indexOf(color) === index);

  // Reset filters helper (used when opening modals)
  const resetFilters = () => {
    setCategoryFilter('all');
    setColorFilter('');
    setSeasonFilter('all');
    setSearchQuery('');
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
    
    // Modal helpers
    resetFilters,
  };
};
