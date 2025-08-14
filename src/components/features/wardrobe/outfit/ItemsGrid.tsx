import React from 'react';
import { WardrobeItem, Season } from '../../../../types';
import { formatCategory } from '../../../../utils/textFormatting';
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
} from '../OutfitForm.styles';

interface ItemsGridProps {
  items: WardrobeItem[];
  selectedItems: string[];
  onItemSelect: (itemId: string) => void;
}

const ItemsGrid: React.FC<ItemsGridProps> = ({
  items,
  selectedItems,
  onItemSelect
}) => {
  if (items.length === 0) {
    return (
      <NoResultsMessage>
        No items match your filters. Try adjusting your search criteria.
      </NoResultsMessage>
    );
  }

  return (
    <StyledItemsGrid>
      {items.map(item => {
        const isSelected = selectedItems.includes(item.id);
        return (
          <ItemCard 
            key={item.id} 
            $isSelected={isSelected}
            onClick={() => onItemSelect(item.id)}
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
                {item.season.includes(Season.ALL_SEASON) && item.season.length === 1 
                  ? Season.ALL_SEASON
                  : item.season.filter(season => season !== Season.ALL_SEASON).join(', ')}
              </ItemDetail>
            </ItemContent>
          </ItemCard>
        );
      })}
    </StyledItemsGrid>
  );
};

export default ItemsGrid;
