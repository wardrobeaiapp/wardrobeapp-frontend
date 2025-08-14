import React from 'react';
import { WardrobeItem } from '../../../../types';
import {
  SelectedItemsContainer,
  SelectedItemBadge,
  RemoveItemButton
} from '../forms/CapsuleForm.styles';

interface SelectedItemsListProps {
  selectedItems: string[];
  availableItems: WardrobeItem[];
  onItemRemove: (itemId: string) => void;
  mainItemId?: string; // ID of the main item to exclude from the list
}

const SelectedItemsList: React.FC<SelectedItemsListProps> = ({
  selectedItems,
  availableItems,
  onItemRemove,
  mainItemId
}) => {
  // Filter out the main item from the selected items list
  const otherItems = selectedItems.filter(itemId => itemId !== mainItemId);
  
  if (otherItems.length === 0) {
    return null;
  }

  return (
    <SelectedItemsContainer>
      {otherItems.map(itemId => {
        const item = availableItems?.find(i => i.id === itemId);
        return item ? (
          <SelectedItemBadge key={itemId}>
            {item.name}
            <RemoveItemButton onClick={() => onItemRemove(itemId)}>&times;</RemoveItemButton>
          </SelectedItemBadge>
        ) : null;
      })}
    </SelectedItemsContainer>
  );
};

export default SelectedItemsList;
