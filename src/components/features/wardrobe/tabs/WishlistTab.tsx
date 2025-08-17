import React, { useMemo, useEffect } from 'react';
import { SearchFilter, CategoryFilter, SeasonFilter, SelectFilter } from '../shared/Filters';
import { Season, WardrobeItem, WishlistStatus } from '../../../../types';
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
  seasonFilter: string;
  setSeasonFilter: (season: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
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
  // Filter items to only include wishlist items and apply all filters
  const filteredItems = useMemo(() => {
    // First filter only wishlist items
    let result = items.filter(item => item.wishlist === true);
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(item => item.category === categoryFilter);
    }
    
    // Apply season filter
    if (seasonFilter !== 'all') {
      result = result.filter(item => 
        Array.isArray(item.season) 
          ? item.season.includes(seasonFilter as Season)
          : item.season === seasonFilter
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => 
        (item.wishlistStatus || WishlistStatus.NOT_REVIEWED) === statusFilter
      );
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.category?.toLowerCase() || '').includes(query) ||
        (item.brand?.toLowerCase() || '').includes(query)
      );
    }
    
    return result;
  }, [items, categoryFilter, seasonFilter, statusFilter, searchQuery]);
  
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
            value={seasonFilter}
            onChange={setSeasonFilter}
          />
        </FilterGroup>
        <FilterGroup>
          <SelectFilter
            value={statusFilter}
            onChange={setStatusFilter}
            label="Status"
            id="status-filter"
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: WishlistStatus.APPROVED, label: 'Approved' },
              { value: WishlistStatus.POTENTIAL_ISSUE, label: 'Potential Issue' },
              { value: WishlistStatus.NOT_REVIEWED, label: 'Not Reviewed' }
            ]}
            includeAllOption={false} // We're handling the 'all' option manually
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
