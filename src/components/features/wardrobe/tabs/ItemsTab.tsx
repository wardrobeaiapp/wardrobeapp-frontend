import React from 'react';
import { WardrobeItem } from '../../../../types';
import WardrobeItemCard from '../cards/WardrobeItemCard';
import Loader from '../../../common/Loader';
import styled from 'styled-components';
import { formTokens } from '../../../../styles/tokens/forms';
import { CategoryFilter, SearchFilter, SeasonFilter } from '../shared/Filters';
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
  isLoading: boolean;
  error: string | null;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  seasonFilter: string;
  setSeasonFilter: (season: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onViewItem?: (item: WardrobeItem) => void; // New prop for viewing items
  onEditItem: (id: string) => void;
  onDeleteItem: (id: string) => void;
}

const ItemsTab = React.memo<ItemsTabProps>(({
  items,
  isLoading: externalIsLoading,
  error,
  categoryFilter,
  setCategoryFilter,
  seasonFilter,
  setSeasonFilter,
  searchQuery,
  setSearchQuery,
  onViewItem = () => {},
  onEditItem,
  onDeleteItem
}) => {
  // Memoize the filtered items calculation
  const filteredItems = React.useMemo(() => {
    return items.filter(item => {
      const isNotWishlist = item.wishlist !== true;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesSeason = seasonFilter === 'all' || 
        (item.season?.some(s => s.toLowerCase() === seasonFilter.toLowerCase()) ?? false);
      
      if (!isNotWishlist || !matchesCategory || !matchesSeason) return false;
      
      // Only calculate search if other filters pass
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        return (item.name?.toLowerCase().includes(searchLower) ||
                item.brand?.toLowerCase().includes(searchLower) ||
                item.color?.toLowerCase().includes(searchLower)) ?? false;
      }
      
      return true;
    });
  }, [items, categoryFilter, seasonFilter, searchQuery]);

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

  return (
    <>
      <FiltersContainer>
          <SearchFilter
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search items..."
          />
          <CategoryFilter
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
          <SeasonFilter
            value={seasonFilter}
            onChange={setSeasonFilter}
          />
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
          {filteredItems.length === 0 ? (
            <EmptyState>
              <EmptyStateTitle>Your wardrobe is empty</EmptyStateTitle>
              <EmptyStateText>
                {items.length === 0
                  ? "You haven't added any items to your wardrobe yet."
                  : "No items match your current filters."}
              </EmptyStateText>
              {items.length === 0 && (
                <p>Click the "Add Item" button in the top-right corner to get started.</p>
              )}
            </EmptyState>
          ) : (
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
