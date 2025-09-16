import React from 'react';
import { WardrobeItem } from '../../../../types';
import WardrobeItemCard from '../cards/WardrobeItemCard';
import Loader from '../../../common/Loader';
import styled from 'styled-components';
import { formTokens } from '../../../../styles/tokens/forms';
import { CategoryFilter, SearchFilter, SeasonFilter, ScenarioFilter } from '../shared/Filters';
import { FiltersContainer } from '../../../../pages/HomePage.styles';

const ItemsGrid = styled.div<{ $variant?: string }>`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${formTokens.spacing.lg};
  margin-top: ${formTokens.spacing.lg};
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
  onViewItem = () => {},
  onEditItem,
  onDeleteItem
}) => {
  // Helper to get the first season if seasonFilter is an array
  const getFirstSeason = (season: string | string[]): string => {
    return Array.isArray(season) ? (season[0] || 'all') : season;
  };

  // Memoize the filtered items calculation
  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      const isNotWishlist = item.wishlist !== true;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      // Handle season filter (can be string or string[])
      const currentSeason = Array.isArray(seasonFilter) ? seasonFilter[0] : seasonFilter;
      const matchesSeason = currentSeason === 'all' || 
        (Array.isArray(item.season) 
          ? item.season.some(s => s === currentSeason)
          : item.season === currentSeason);
      
      // Handle search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === '' || 
        item.name.toLowerCase().includes(searchLower) ||
        (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
        (item.material && item.material.toLowerCase().includes(searchLower));
      
      // Handle scenario filter
      const matchesScenario = scenarioFilter === 'all' || 
        (item.scenarios && item.scenarios.includes(scenarioFilter));
      
      return isNotWishlist && matchesCategory && matchesSeason && matchesSearch && matchesScenario;
    });
  }, [items, categoryFilter, seasonFilter, searchQuery, scenarioFilter]);

  // Debug logging - only in development
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      console.log('[ItemsTab] Render', { 
        totalItems: items.length,
        filteredCount: filteredItems.length,
        filters: { categoryFilter, seasonFilter, searchQuery }
      });
    }, [items.length, filteredItems.length, categoryFilter, seasonFilter, searchQuery]);
  }

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
