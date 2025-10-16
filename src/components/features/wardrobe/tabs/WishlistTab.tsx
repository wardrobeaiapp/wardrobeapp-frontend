import React, { useEffect } from 'react';
import { SearchFilter, CategoryFilter, SeasonFilter, SelectFilter, ScenarioFilter } from '../shared/Filters';
import { WardrobeItem, WishlistStatus } from '../../../../types';
import { useWishlistFiltering } from '../../../../hooks/home/useWishlistFiltering';
import { useMockDataStatus } from '../../../../hooks/ai';
import {
  FiltersContainer,
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
  scenarioFilter?: string;
  setScenarioFilter?: (scenario: string) => void;
  onViewItem?: (item: WardrobeItem) => void; 
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem?: () => void;
  hideStatusFilter?: boolean;
  hideStatusIcon?: boolean;
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
  scenarioFilter = 'all',
  setScenarioFilter = () => {},
  onViewItem,
  onEditItem,
  onDeleteItem,
  onAddItem,
  hideStatusFilter = false,
  hideStatusIcon = false
}) => {
  // Helper to get the first season if seasonFilter is an array
  const getFirstSeason = (season: string | string[]): string => {
    return Array.isArray(season) ? (season[0] || 'all') : season;
  };

  // Use the wishlist filtering hook
  const { 
    filteredWishlistItems: filteredItems
  } = useWishlistFiltering({ 
    items,
    scenarioFilter,
    setScenarioFilter,
    categoryFilter,
    seasonFilter,
    searchQuery,
    statusFilter,
    setCategoryFilter,
    setSeasonFilter,
    setSearchQuery,
    setStatusFilter
  });

  // Check which items have saved mock data
  const { hasMockData } = useMockDataStatus(filteredItems);
  
  const handleSeasonChange = (value: string | string[]) => {
    setSeasonFilter(value);
  };
  
  const handleScenarioChange = (value: string) => {
    setScenarioFilter(value);
  };
  
  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[WishlistTab] Items received:', items.length);
      console.log('[WishlistTab] Filtered wishlist items:', filteredItems.length);
      console.log('[WishlistTab] Active filters:', { 
        categoryFilter, 
        seasonFilter, 
        statusFilter,
        searchQuery 
      });
    }
  }, [items.length, filteredItems.length, categoryFilter, seasonFilter, statusFilter, searchQuery]);

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
        <SearchFilter
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search wishlist..."
        />
        <CategoryFilter
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
        <SeasonFilter
          value={getFirstSeason(seasonFilter)}
          onChange={handleSeasonChange}
        />
        <ScenarioFilter
          value={scenarioFilter}
          onChange={handleScenarioChange}
          includeAllOption={true}
        />
        {!hideStatusFilter && (
          <SelectFilter<WishlistStatus>
            value={statusFilter === 'all' ? 'all' as const : statusFilter}
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
        )}
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
              hideStatusIcon={hideStatusIcon}
              hasMockData={hasMockData(item.id)}
              showAIBadge={true}
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
