import React from 'react';
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
  // Add debugging logs to see what items have the wishlist property set
  console.log('[WishlistTab] All items:', items);
  console.log('[WishlistTab] Items with wishlist property:', items.filter(item => item.wishlist !== undefined));
  console.log('[WishlistTab] Items with wishlist=true:', items.filter(item => item.wishlist === true));
  
  // Filter items based on selected filters and wishlist status
  const wishlistItems = items.filter(item => {
    const isWishlist = item.wishlist === true;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesSeason = seasonFilter === 'all' || 
      (item.season && Array.isArray(item.season) && item.season.includes(seasonFilter as Season));
    const matchesStatus = statusFilter === 'all' || item.wishlistStatus === statusFilter;
    
    console.log(`[WishlistTab] Item ${item.id} (${item.name}) - wishlist:`, item.wishlist, 'isWishlist:', isWishlist);
    return isWishlist && matchesCategory && matchesSeason && matchesStatus;
  });
  
  console.log('[WishlistTab] Filtered wishlist items:', wishlistItems);

  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <LoadingText>Loading your wishlist items...</LoadingText>
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
            options={Object.values(WishlistStatus).map(status => ({
              value: status,
              label: status.charAt(0) + status.slice(1).toLowerCase()
            }))}
            allOptionLabel="All Statuses"
          />
        </FilterGroup>
      </FiltersContainer>

      {wishlistItems.length > 0 ? (
        <ItemsGrid $variant="items">
          {wishlistItems.map(item => (
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
