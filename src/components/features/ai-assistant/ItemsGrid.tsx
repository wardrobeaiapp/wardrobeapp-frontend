import React from 'react';
import { WardrobeItem } from '../../../types';
import {
  ItemsGrid as StyledItemsGrid,
  ItemCard,
  ItemImage,
  ItemName,
  SelectionIndicator,
  ItemImageContainer,
  ItemImagePlaceholder,
  ItemDetails,
  NoResultsMessage
} from './AIComponents.styles';

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
    return <NoResultsMessage>No items match your filters. Try adjusting your search criteria.</NoResultsMessage>;
  }

  return (
    <StyledItemsGrid>
      {items.map(item => {
        const isSelected = selectedItems.includes(item.id);
        return (
          <ItemCard 
            key={item.id} 
            selected={isSelected}
            onClick={() => onItemSelect(item.id)}
          >
            {isSelected && (
              <SelectionIndicator>✓</SelectionIndicator>
            )}
            <ItemImageContainer>
              {item.imageUrl ? (
                <ItemImage src={item.imageUrl} alt={item.name} />
              ) : (
                <ItemImagePlaceholder>No Image</ItemImagePlaceholder>
              )}
            </ItemImageContainer>
            <ItemName>{item.name}</ItemName>
            <ItemDetails>
              {item.brand && <div>{item.brand}</div>}
              <div>{item.color}</div>
              <div>{item.category}</div>
            </ItemDetails>
          </ItemCard>
        );
      })}
    </StyledItemsGrid>
  );
};

export default ItemsGrid;
