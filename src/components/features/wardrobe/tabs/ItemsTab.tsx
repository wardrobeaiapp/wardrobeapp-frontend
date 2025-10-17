import React from 'react';
import { WardrobeItem } from '../../../../types';
import WardrobeItemCard from '../cards/WardrobeItemCard';
import Loader from '../../../common/Loader';
import styled from 'styled-components';
import { formTokens } from '../../../../styles/tokens/forms';
import { CategoryFilter, SearchFilter, SeasonFilter, ScenarioFilter } from '../shared/Filters';
import { FiltersContainer } from '../../../../pages/HomePage.styles';
import { useItemFiltering } from '../../../../hooks/home/useItemFiltering';
import { useMockDataStatus } from '../../../../hooks/ai';

const ItemsGrid = styled.div<{ $variant?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${formTokens.spacing.lg};
  margin-top: ${formTokens.spacing.lg};
  
  /* 2 columns on mobile for better space utilization */
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${formTokens.spacing.md};
    margin-top: ${formTokens.spacing.md};
  }
  
  @media (max-width: 480px) {
    gap: ${formTokens.spacing.sm};
    margin-top: ${formTokens.spacing.sm};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${formTokens.spacing.xl} 0;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: ${formTokens.spacing.sm};
  color: ${formTokens.colors.text};
`;

const EmptyStateText = styled.p`
  color: ${formTokens.colors.textMuted};
  margin-bottom: ${formTokens.spacing.lg};
`;

const ErrorContainer = styled.div`
  padding: ${formTokens.spacing.md};
  background-color: ${formTokens.colors.errorBackground};
  color: ${formTokens.colors.error};
  border-radius: ${formTokens.borderRadius.md};
  margin-bottom: ${formTokens.spacing.lg};
`;



interface ItemsTabProps {
  items: WardrobeItem[];
  itemCount?: number;
  isLoading: boolean;
  error: string | null;
  // Filters
  categoryFilter: string;
  seasonFilter: string | string[];
  searchQuery: string;
  scenarioFilter?: string;
  // Filter handlers
  setCategoryFilter: (category: string) => void;
  setSeasonFilter: (season: string | string[]) => void;
  setScenarioFilter?: (scenario: string) => void;
  setSearchQuery: (query: string) => void;
  // Action handlers
  onViewItem?: (item: WardrobeItem) => void;
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
  onAddItem?: () => void;
  // Demo mode
  disableMockDataCheck?: boolean; // Disable AI mock data checking (for demo)
  allowUnauthenticated?: boolean; // For demo mode - allows fetching scenarios without authentication
}

const ItemsTab = React.memo<ItemsTabProps>(({
  items,
  itemCount,
  isLoading: externalIsLoading,
  error,
  // Filters
  categoryFilter,
  seasonFilter,
  searchQuery,
  scenarioFilter = 'all',
  // Filter handlers
  setCategoryFilter,
  setSeasonFilter,
  setSearchQuery,
  setScenarioFilter = () => {},
  onViewItem,
  onEditItem,
  onDeleteItem,
  disableMockDataCheck = false,
  allowUnauthenticated = false
}) => {
  // Use optimized filtering hook instead of duplicate logic
  const { filteredItems } = useItemFiltering(items, {
    category: categoryFilter,
    season: seasonFilter,
    searchQuery,
    scenario: scenarioFilter,
    isWishlist: false // ItemsTab only shows non-wishlist items
  });

  // Check which items have saved mock data (disabled in demo mode)
  const { hasMockData } = useMockDataStatus(filteredItems, disableMockDataCheck);

  // Helper for SeasonFilter component - needed for display value
  const getFirstSeason = (season: string | string[]): string => {
    return Array.isArray(season) ? (season[0] || 'all') : season;
  };


  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSeasonChange = (season: string | string[]) => {
    setSeasonFilter(season);
  };

  return (
    <>
      <FiltersContainer>
          <SearchFilter
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search items..."
          />
          <CategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          <SeasonFilter
            value={getFirstSeason(seasonFilter)}
            onChange={handleSeasonChange}
          />
          {setScenarioFilter && (
            <ScenarioFilter
              value={scenarioFilter || 'all'}
              onChange={setScenarioFilter}
              includeAllOption={true}
              allowUnauthenticated={allowUnauthenticated}
            />
          )}
      </FiltersContainer>

      {error && (
        <ErrorContainer>
          <p>Error loading wardrobe items: {error}</p>
          <p>Please try refreshing the page.</p>
        </ErrorContainer>
      )}

      {/* Show loader when items are loading */}
      {externalIsLoading ? (
        <Loader text="Loading your wardrobe items..." />
      ) : (
        <>
          {!externalIsLoading && filteredItems.length === 0 && (
            <EmptyState>
              <EmptyStateTitle>No items found</EmptyStateTitle>
              <EmptyStateText>
                {itemCount === 0 
                  ? 'Your wardrobe is empty. Add your first item to get started!'
                  : 'Try adjusting your filters or add a new item to your wardrobe.'}
              </EmptyStateText>
            </EmptyState>
          )}
          {filteredItems.length > 0 && (
            <ItemsGrid $variant="items">
              {filteredItems.map(item => (
                <WardrobeItemCard
                  key={item.id}
                  item={item}
                  onView={onViewItem}
                  onEdit={() => onEditItem(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                  hasMockData={hasMockData(item.id)}
                  showAIBadge={true}
                />
              ))}
            </ItemsGrid>
          )}
        </>
      )}
    </>
  );
});

export default ItemsTab;
