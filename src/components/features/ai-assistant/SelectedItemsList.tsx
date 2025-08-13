import React from 'react';
import { WardrobeItem } from '../../../types';
import {
  SelectedItemsList as SelectedItemsContainer,
  SelectedItem as SelectedItemBadge,
  RemoveButton as RemoveItemButton
} from './AIComponents.styles';

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
    return (
      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
        No items selected. The AI will choose from all available items.
      </p>
    );
  }

  return (
    <SelectedItemsContainer>
      {selectedItems.map(itemId => {
        const item = availableItems.find(i => i.id === itemId);
        if (!item) return null;
        
        return (
          <SelectedItemBadge key={itemId}>
            {item.name}
            <RemoveItemButton onClick={() => onItemRemove(itemId)}>
              ×
            </RemoveItemButton>
          </SelectedItemBadge>
        );
      })}
    </SelectedItemsContainer>
  );
};

export default SelectedItemsList;
