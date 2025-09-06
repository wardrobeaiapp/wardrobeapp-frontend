import React from 'react';
import { WardrobeItem } from '../../../../../types';
import { formatCategory } from '../../../../../utils/textFormatting';
import {
  ItemsGrid as StyledItemsGrid,
  ItemCard,
  ItemImageContainer,
  ItemImage,
  PlaceholderImage,
  ItemContent,
  ItemName,
  ItemDetail,
  SelectionIndicator,
  NoResultsMessage
} from '../../forms/OutfitForm/OutfitForm.styles';

export interface ItemsGridProps {
  items: WardrobeItem[];
  selectedItems: string[];
  onItemSelect: (itemId: string) => void;
  singleSelect?: boolean;
  noResultsMessage?: string;
}

const ItemsGrid: React.FC<ItemsGridProps> = ({
  items,
  selectedItems,
  onItemSelect,
  singleSelect = false,
  noResultsMessage = 'No items match your filters. Try adjusting your search criteria.'
}) => {
  const handleItemClick = (itemId: string, isSelected: boolean) => {
    if (singleSelect) {
      onItemSelect(isSelected ? '' : itemId);
    } else {
      onItemSelect(itemId);
    }
  };

  if (items.length === 0) {
    return <NoResultsMessage>{noResultsMessage}</NoResultsMessage>;
  }

  return (
    <StyledItemsGrid>
      {items.map(item => {
        const isSelected = selectedItems.includes(item.id);
        return (
          <ItemCard 
            key={item.id} 
            $isSelected={isSelected}
            onClick={() => handleItemClick(item.id, isSelected)}
          >
            {isSelected && (
              <SelectionIndicator>✓</SelectionIndicator>
            )}
            <ItemImageContainer>
              {item.imageUrl ? (
                <ItemImage 
                  src={item.imageUrl} 
                  alt={item.name} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <PlaceholderImage>No Image</PlaceholderImage>
              )}
            </ItemImageContainer>
            <ItemContent>
              <ItemName>{item.name}</ItemName>
              <ItemDetail>{formatCategory(item.category)}, {item.color.toLowerCase()}</ItemDetail>
              <ItemDetail>
                {item.season.join(', ')}
              </ItemDetail>
            </ItemContent>
          </ItemCard>
        );
      })}
    </StyledItemsGrid>
  );
};

export default ItemsGrid;
