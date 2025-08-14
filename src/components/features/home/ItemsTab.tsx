import React from 'react';
import { MdSearch } from 'react-icons/md';
import { ItemCategory, Season, WardrobeItem } from '../../../types';
import WardrobeItemCard from '../wardrobe/WardrobeItemCard';
import Loader from '../../common/Loader';
import {
  FiltersContainer,
  FilterGroup,
  FilterLabel,
  Select,
  ItemsGrid,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  ErrorContainer,
  SearchContainer,
  SearchInput,
  SearchIcon
} from '../../../pages/HomePage.styles';

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
  // Filter items based on selected filters and exclude wishlist items
  const filteredItems = items.filter(item => {
    // Exclude wishlist items from the main wardrobe tab
    const isNotWishlist = item.wishlist !== true;
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    // Check if the item's season array includes the selected season
    const matchesSeason = seasonFilter === 'all' || 
      (item.season && Array.isArray(item.season) && item.season.includes(seasonFilter as Season));
    
    // Only include items that are not wishlist items and match the filters
    return isNotWishlist && matchesCategory && matchesSeason;
  });
  
  // Add debugging logs to see filtering in action
  console.log('[ItemsTab] Total items:', items.length);
  console.log('[ItemsTab] Wishlist items excluded:', items.filter(item => item.wishlist === true).length);
  console.log('[ItemsTab] Filtered items (after excluding wishlist):', filteredItems.length);

  return (
    <>
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
          <FiltersContainer>
            <FilterGroup>
              <FilterLabel htmlFor="search-input">Search</FilterLabel>
              <SearchContainer>
                <SearchIcon><MdSearch /></SearchIcon>
                <SearchInput
                  id="search-input"
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </SearchContainer>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel htmlFor="category-filter">Category</FilterLabel>
              <Select
                id="category-filter"
                value={categoryFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Object.values(ItemCategory).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Select>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel htmlFor="season-filter">Season</FilterLabel>
              <Select
                id="season-filter"
                value={seasonFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSeasonFilter(e.target.value)}
              >
                <option value="all">All Seasons</option>
                {Object.values(Season)
                  .filter(season => season !== Season.ALL_SEASON)
                  .map(season => (
                    <option key={season} value={season}>
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </option>
                  ))}
              </Select>
            </FilterGroup>
          </FiltersContainer>

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
            <ItemsGrid>
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
