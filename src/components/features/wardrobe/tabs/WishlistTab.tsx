import React from 'react';
import { MdSearch } from 'react-icons/md';
import { FormField } from '../../../common/Form';
import { ItemCategory, Season, WardrobeItem, WishlistStatus } from '../../../../types';
import {
  FiltersContainer,
  FilterGroup,
  Select,
  ItemsGrid,
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
  LoadingContainer,
  LoadingText,
  Spinner,
  ErrorContainer,
  SearchContainer,
  SearchIcon,
  SearchInput
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
  onViewItem?: (item: WardrobeItem) => void; // New prop for viewing items
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
          <FormField
            label="Search wishlist"
            htmlFor="wishlist-search-input"
          >
            <SearchContainer>
              <SearchIcon><MdSearch /></SearchIcon>
              <SearchInput
                id="wishlist-search-input"
                type="text"
                placeholder="Search wishlist by name, category, brand..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
          </FormField>
        </FilterGroup>

        <FilterGroup>
          <FormField
            label="Category"
            htmlFor="category-filter"
          >
            <Select 
              id="category-filter"
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {Object.values(ItemCategory).map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </FormField>
        </FilterGroup>
        <FilterGroup>
          <FormField
            label="Season"
            htmlFor="season-filter"
          >
            <Select 
              id="season-filter"
              value={seasonFilter} 
              onChange={(e) => setSeasonFilter(e.target.value)}
            >
              <option value="all">All Seasons</option>
              {Object.values(Season)
                .filter(season => season !== Season.ALL_SEASON)
                .map(season => (
                  <option key={season} value={season}>{season}</option>
                ))}
            </Select>
          </FormField>
        </FilterGroup>
        <FilterGroup>
          <FormField
            label="Status"
            htmlFor="status-filter"
          >
            <Select 
              id="status-filter"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {Object.values(WishlistStatus).map(status => (
                <option key={status} value={status}>
                  {status === WishlistStatus.APPROVED ? 'Approved' : 
                   status === WishlistStatus.POTENTIAL_ISSUE ? 'Potential Issue' : 'Not Reviewed'}
                </option>
              ))}
            </Select>
          </FormField>
        </FilterGroup>
      </FiltersContainer>

      {wishlistItems.length > 0 ? (
        <ItemsGrid>
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
