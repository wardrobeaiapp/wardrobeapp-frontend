import React, { useMemo, useEffect } from 'react';
import { SearchFilter, CategoryFilter, SeasonFilter, SelectFilter } from '../shared/Filters';
import { WardrobeItem, WishlistStatus } from '../../../../types';
import {
  FiltersContainer,
  FilterGroup,
  ItemsGrid,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  LoadingContainer,
  LoadingText,
  Spinner,
  ErrorContainer
} from '../../../../pages/HomePage.styles';
import WardrobeItemCard from '../cards/WardrobeItemCard';

interface WishlistTabProps {
  items: WardrobeItem[];
  isLoading: boolean;
  error: string | null;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  seasonFilter: string | string[];
  setSeasonFilter: (season: string | string[]) => void;
  statusFilter: WishlistStatus | 'all';
  setStatusFilter: (status: WishlistStatus | 'all') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewItem?: (item: WardrobeItem) => void; 
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem?: () => void;
}

const WishlistTab: React.FC<WishlistTabProps> = ({
  items,
  isLoading,
  error,
  categoryFilter,
  setCategoryFilter,
  seasonFilter,
  setSeasonFilter,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  onViewItem,
  onEditItem,
  onDeleteItem,
  onAddItem
}) => {
  // Helper to get the first season if seasonFilter is an array
  const getFirstSeason = (season: string | string[]): string => {
    return Array.isArray(season) ? (season[0] || 'all') : season;
  };

  // Filter items to only include wishlist items and apply all filters
  const filteredItems = useMemo(() => {
    // First filter only wishlist items
    return items.filter(item => {
      if (item.wishlist !== true) return false;
      
      // Apply category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }
      
      // Apply season filter (handles both string and string[])
      if (seasonFilter !== 'all') {
        const itemSeasons = Array.isArray(item.season) ? item.season : [item.season];
        const filterSeasons = Array.isArray(seasonFilter) ? seasonFilter : [seasonFilter];
        const hasMatchingSeason = filterSeasons.some(season => 
          itemSeasons.some(s => s?.toLowerCase() === season?.toLowerCase())
        );
        if (!hasMatchingSeason) return false;
      }
      
      // Apply status filter
      if (statusFilter !== 'all' && item.wishlistStatus !== statusFilter) {
        return false;
      }
      
      // Apply search query
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = 
          (item.name?.toLowerCase().includes(searchLower) ||
           item.brand?.toLowerCase().includes(searchLower) ||
           item.color?.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }
      
      return true;
    });
  }, [items, categoryFilter, seasonFilter, statusFilter, searchQuery]);
  
  const handleSeasonChange = (value: string | string[]) => {
    setSeasonFilter(value);
  };
  
  // Debug logging
  useEffect(() => {
    console.log('[WishlistTab] Items received:', items.length);
    console.log('[WishlistTab] Filtered wishlist items:', filteredItems.length);
    console.log('[WishlistTab] Active filters:', { 
      categoryFilter, 
      seasonFilter, 
      statusFilter,
      searchQuery 
    });
  }, [items, filteredItems, categoryFilter, seasonFilter, statusFilter, searchQuery]);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading wishlist items...</LoadingText>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <p>Error loading wishlist items: {error}</p>
      </ErrorContainer>
    );
  }

  return (
    <>
      <FiltersContainer>
        <FilterGroup>
          <SearchFilter
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search wishlist..."
          />
        </FilterGroup>
        <FilterGroup>
          <CategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </FilterGroup>
        <FilterGroup>
          <SeasonFilter
            value={getFirstSeason(seasonFilter)}
            onChange={handleSeasonChange}
          />
        </FilterGroup>
        <FilterGroup>
          <SelectFilter<Exclude<WishlistStatus, 'all'>>
            value={statusFilter === 'all' ? WishlistStatus.APPROVED : statusFilter}
            onChange={(value) => setStatusFilter(value === 'all' ? 'all' : value)}
            label="Status"
            id="status-filter"
            options={[
              { value: WishlistStatus.APPROVED, label: 'Approved' },
              { value: WishlistStatus.POTENTIAL_ISSUE, label: 'Potential Issue' },
              { value: WishlistStatus.NOT_REVIEWED, label: 'Not Reviewed' }
            ]}
            includeAllOption={true}
            allOptionLabel="All Statuses"
          />
        </FilterGroup>
      </FiltersContainer>

      {filteredItems.length > 0 ? (
        <ItemsGrid $variant="items">
          {filteredItems.map((item: WardrobeItem) => (
            <WardrobeItemCard
              key={item.id}
              item={item}
              onView={onViewItem}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))}
        </ItemsGrid>
      ) : (
        <EmptyState>
          <EmptyStateTitle>Your wishlist is empty</EmptyStateTitle>
          <EmptyStateText>
            Add items to your wishlist by checking the "Add to Wishlist" option when creating or editing items.
          </EmptyStateText>
        </EmptyState>
      )}
    </>
  );
};

export default WishlistTab;
