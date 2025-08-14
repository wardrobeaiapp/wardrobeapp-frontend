import React, { useState, useMemo } from 'react';
import { WardrobeItem, WishlistStatus, ItemCategory, Season } from '../../../../../types';
import { FaTimes, FaSearch } from 'react-icons/fa';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  FilterSection,
  SearchContainer,
  SearchInput,
  FilterRow,
  FilterGroup,
  FilterLabel,
  FilterSelect,
  FilterInput,
  ItemsFoundText,
  ItemGrid,
  WishlistItemCard,
  ItemImage,
  ItemInfo,
  ItemName,
  ItemDetails,
  EmptyState
} from './WishlistSelectionModal.styles';

interface WishlistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WardrobeItem[];
  onSelectItem: (item: WardrobeItem) => void;
}

const WishlistSelectionModal: React.FC<WishlistSelectionModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [colorFilter, setColorFilter] = useState('');
  const [selectedSeason, setSelectedSeason] = useState<string>('all');

  // Filter and search logic (must be before conditional return)
  const filteredItems = useMemo(() => {
    let filtered = items.filter(
      item => item.wishlist === true && item.wishlistStatus === WishlistStatus.NOT_REVIEWED
    );

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        (item.brand && item.brand.toLowerCase().includes(query)) ||
        (item.material && item.material.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply color filter
    if (colorFilter.trim()) {
      const color = colorFilter.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.color.toLowerCase().includes(color)
      );
    }

    // Apply season filter
    if (selectedSeason !== 'all') {
      filtered = filtered.filter(item => 
        item.season.includes(selectedSeason as Season)
      );
    }

    return filtered;
  }, [items, searchQuery, selectedCategory, colorFilter, selectedSeason]);

  // Conditional return must come after hooks
  if (!isOpen) return null;

  const handleSelectItem = (item: WardrobeItem) => {
    onSelectItem(item);
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Select Items</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <FilterSection>
          {/* Search */}
          <SearchContainer>
            <FaSearch />
            <SearchInput
              type="text"
              placeholder="Search by name, brand, material..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>

          {/* Filters */}
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Category</FilterLabel>
              <FilterSelect
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Object.values(ItemCategory).map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).toLowerCase().replace(/_/g, ' ')}
                  </option>
                ))}
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Color</FilterLabel>
              <FilterInput
                type="text"
                placeholder="Enter color"
                value={colorFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColorFilter(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Season</FilterLabel>
              <FilterSelect
                value={selectedSeason}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSeason(e.target.value)}
              >
                <option value="all">All Seasons</option>
                {Object.values(Season)
                  .filter(season => season !== Season.ALL_SEASON)
                  .map(season => (
                    <option key={season} value={season}>
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </option>
                  ))}
              </FilterSelect>
            </FilterGroup>
          </FilterRow>

          <ItemsFoundText>{filteredItems.length} items found</ItemsFoundText>
        </FilterSection>

        {filteredItems.length > 0 ? (
          <ItemGrid>
            {filteredItems.map((item: WardrobeItem) => (
              <WishlistItemCard key={item.id} onClick={() => handleSelectItem(item)}>
                <ItemImage>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </ItemImage>
                <ItemInfo>
                  <ItemName>{item.name}</ItemName>
                  <ItemDetails>
                    {item.brand && <span>{item.brand}</span>}
                    <span>{item.category.charAt(0).toUpperCase() + item.category.slice(1).toLowerCase().replace(/_/g, ' ')}</span>
                    {item.price && <span>${item.price}</span>}
                  </ItemDetails>
                </ItemInfo>
              </WishlistItemCard>
            ))}
          </ItemGrid>
        ) : (
          <EmptyState>
            No items found matching your criteria
          </EmptyState>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default WishlistSelectionModal;
