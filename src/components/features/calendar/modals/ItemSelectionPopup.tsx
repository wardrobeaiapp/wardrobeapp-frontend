import React, { useState, useEffect } from 'react';
import { WardrobeItem } from '../../../../types';
import Button from '../../../common/Button';
import {
  PopupContainer,
  PopupContent,
  PopupHeader,
  PopupTitle,
  PopupCloseButton,
  SelectionGrid,
  SelectionItem,
  SelectionItemName,
  SelectionItemCategory,
  ButtonContainer
} from '../Calendar.styles';

interface ItemSelectionPopupProps {
  visible: boolean;
  items: WardrobeItem[];
  selectedItemIds: string[];
  onSave: (selectedIds: string[]) => void;
  onClose: () => void;
}

const ItemSelectionPopup: React.FC<ItemSelectionPopupProps> = ({
  visible,
  items,
  selectedItemIds,
  onSave,
  onClose
}) => {
  // Create local state to track selected items
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);
  
  // Initialize local state when popup becomes visible
  useEffect(() => {
    if (visible) {
      setLocalSelectedIds([...selectedItemIds]);
    }
  }, [visible, selectedItemIds]);
  
  // Simple toggle function that only affects local state
  const handleToggleItem = (itemId: string) => {
    setLocalSelectedIds(prevIds => {
      if (prevIds.includes(itemId)) {
        return prevIds.filter(id => id !== itemId);
      } else {
        return [...prevIds, itemId];
      }
    });
  };
  
  if (!visible) return null;

  return (
    <PopupContainer>
      <PopupContent>
        <PopupHeader>
          <PopupTitle>Select Individual Items</PopupTitle>
          <PopupCloseButton onClick={() => onClose()}>×</PopupCloseButton>
        </PopupHeader>
        <SelectionGrid>
          {items.map(item => (
            <SelectionItem 
              key={item.id} 
              selected={localSelectedIds.includes(item.id)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleItem(item.id);
              }}
            >
              <SelectionItemName>{item.name}</SelectionItemName>
              <SelectionItemCategory>{item.category}</SelectionItemCategory>
            </SelectionItem>
          ))}
        </SelectionGrid>
        <ButtonContainer>
          <Button fullWidth variant="secondary" onClick={() => onClose()}>Cancel</Button>
          <Button fullWidth variant="primary" onClick={() => {
            // Save selections and close
            onSave(localSelectedIds);
            onClose();
          }}>Done</Button>
        </ButtonContainer>
      </PopupContent>
    </PopupContainer>
  );
};

export default ItemSelectionPopup;
