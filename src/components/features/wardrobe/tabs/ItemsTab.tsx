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

const ItemsTab: React.FC<ItemsTabProps> = ({
  items,
  isLoading: externalIsLoading,
  error,
  categoryFilter,
  setCategoryFilter,
  seasonFilter,
  setSeasonFilter,
  searchQuery,
  setSearchQuery,
  onViewItem,
  onEditItem,
  onDeleteItem
}) => {
  // Using the isLoading prop passed from parent directly
  // Filter items based on selected filters, search query, and exclude wishlist items
  const filteredItems = items.filter(item => {
    // Exclude wishlist items from the main wardrobe tab
    const isNotWishlist = item.wishlist !== true;
    
    // Check category filter
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    // Check season filter - handle Season enum values array
    const matchesSeason = seasonFilter === 'all' || 
      (item.season && item.season.length > 0 &&
        item.season.some(season => 
          season.toLowerCase() === seasonFilter.toLowerCase()
        )
      );
    
    // Check search query (case-insensitive)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      (item.name && item.name.toLowerCase().includes(searchLower)) ||
      (item.brand && item.brand.toLowerCase().includes(searchLower)) ||
      (item.color && item.color.toLowerCase().includes(searchLower));
    
    // Only include items that match all conditions
    return isNotWishlist && matchesCategory && matchesSeason && matchesSearch;
  });
  
  // Debug logging
  console.log('[ItemsTab] Total items:', items.length);
  console.log('[ItemsTab] Wishlist items excluded:', items.filter(item => item.wishlist === true).length);
  console.log('[ItemsTab] Filtered items count:', filteredItems.length);
  console.log('[ItemsTab] Active filters:', { 
    category: categoryFilter, 
    season: seasonFilter, 
    search: searchQuery 
  });

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
};

export default ItemsTab;
