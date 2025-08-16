import React from 'react';
import { WardrobeItem } from '../../../../../types';
import {
  SelectedItemsContainer as StyledSelectedItemsContainer,
  SelectedItemBadge as StyledSelectedItemBadge,
  RemoveItemButton as StyledRemoveItemButton,
} from '../../forms/OutfitForm/OutfitForm.styles';

export interface SelectedItemsListProps {
  /** List of selected item IDs */
  selectedItems: string[];
  /** Available items to match with selected item IDs */
  availableItems: WardrobeItem[];
  /** Callback when an item is removed */
  onItemRemove: (itemId: string) => void;
  /** Optional ID of the main item to exclude from the list */
  mainItemId?: string;
  /** Custom empty state message */
  emptyMessage?: React.ReactNode;
  /** Custom styles for the container */
  containerStyle?: React.CSSProperties;
  /** Custom styles for item badges */
  badgeStyle?: React.CSSProperties;
  /** Custom styles for remove button */
  buttonStyle?: React.CSSProperties;
}

const SelectedItemsList: React.FC<SelectedItemsListProps> = ({
  selectedItems,
  availableItems,
  onItemRemove,
  mainItemId,
  containerStyle,
  badgeStyle,
  buttonStyle,
}) => {
  // Filter out the main item if specified
  const displayItems = mainItemId 
    ? selectedItems.filter(itemId => itemId !== mainItemId)
    : selectedItems;

  return (
    <StyledSelectedItemsContainer style={containerStyle}>
      {displayItems.map(itemId => {
        const item = availableItems?.find(i => i.id === itemId);
        if (!item) return null;
        
        return (
          <StyledSelectedItemBadge key={itemId} style={badgeStyle}>
            {item.name}
            <StyledRemoveItemButton 
              onClick={() => onItemRemove(itemId)}
              style={buttonStyle}
              aria-label={`Remove ${item.name}`}
            >
              ×
            </StyledRemoveItemButton>
          </StyledSelectedItemBadge>
        );
      })}
    </StyledSelectedItemsContainer>
  );
};

export default SelectedItemsList;
