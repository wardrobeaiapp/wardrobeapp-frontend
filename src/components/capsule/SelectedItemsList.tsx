import React from 'react';
import { WardrobeItem } from '../../types';
import {
  SelectedItemsContainer,
  SelectedItemBadge,
  RemoveItemButton
} from '../CapsuleForm.styles';

interface SelectedItemsListProps {
  selectedItems: string[];
  availableItems: WardrobeItem[];
  onItemRemove: (itemId: string) => void;
}

const SelectedItemsList: React.FC<SelectedItemsListProps> = ({
  selectedItems,
  availableItems,
  onItemRemove
}) => {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <SelectedItemsContainer>
      {selectedItems.map(itemId => {
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
