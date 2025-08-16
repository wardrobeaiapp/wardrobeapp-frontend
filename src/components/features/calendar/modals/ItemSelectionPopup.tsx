import React, { useState, useEffect } from 'react';
import { WardrobeItem } from '../../../../types';
import { Modal, ModalAction, ModalBody } from '../../../common/Modal';
import {
  SelectionGrid,
  SelectionItem,
  SelectionItemName,
  SelectionItemCategory
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
  
  const handleSave = () => {
    onSave(localSelectedIds);
    onClose();
  };

  const actions: ModalAction[] = [
    { label: 'Cancel', onClick: onClose, variant: 'secondary' },
    { label: 'Done', onClick: handleSave, variant: 'primary' }
  ];

  return (
    <Modal
      isOpen={visible}
      onClose={onClose}
      title="Select Individual Items"
      actions={actions}
      size="lg"
    >
      <ModalBody>
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
      </ModalBody>
    </Modal>
  );
};

export default ItemSelectionPopup;
