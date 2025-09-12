import React, { useState, useMemo } from 'react';
import { WardrobeItem, WishlistStatus, Season } from '../../../../../types';
import { Modal } from '../../../../common/Modal';
import {
  FilterSection,
  ItemsFoundText,
  ItemGrid,
  WishlistItemCard,
  ItemImage,
  ItemInfo,
  ItemName,
  ItemDetails,
  EmptyState
} from './WishlistSelectionModal.styles';
import FiltersPanel from '../../../wardrobe/shared/FiltersPanel';

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

  const handleSelectItem = (item: WardrobeItem) => {
    onSelectItem(item);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Items"
      size="lg"
    >
      <FilterSection>
        <FiltersPanel
          searchQuery={searchQuery}
          categoryFilter={selectedCategory}
          colorFilter={colorFilter}
          seasonFilter={selectedSeason}
          onSearchChange={setSearchQuery}
          onCategoryChange={setSelectedCategory}
          onColorChange={setColorFilter}
          onSeasonChange={setSelectedSeason}
          searchPlaceholder="Search by name, brand, material..."
        />
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
    </Modal>
  );
};

export default WishlistSelectionModal;
