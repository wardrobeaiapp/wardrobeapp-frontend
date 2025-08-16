import React, { useState, useEffect } from 'react';
import { Outfit } from '../../../../types';
import { Modal, ModalAction } from '../../../common/Modal';
import {
  SelectionGrid,
  SelectionItem,
  SelectionItemName,
  SelectionItemCategory,
} from '../../../../pages/CalendarPage.styles';

interface OutfitSelectionPopupProps {
  visible: boolean;
  outfits: Outfit[];
  selectedOutfitIds: string[];
  onSave: (selectedIds: string[]) => void;
  onClose: () => void;
}

const OutfitSelectionPopup: React.FC<OutfitSelectionPopupProps> = ({
  visible,
  outfits,
  selectedOutfitIds,
  onSave,
  onClose
}) => {
  // Create local state to track selected outfits
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>([]);
  
  // Initialize local state when popup becomes visible
  useEffect(() => {
    if (visible) {
      setLocalSelectedIds([...selectedOutfitIds]);
    }
  }, [visible, selectedOutfitIds]);
  
  // Simple toggle function that only affects local state
  const handleToggleOutfit = (outfitId: string) => {
    console.log('Toggle outfit clicked:', outfitId);
    setLocalSelectedIds(prevIds => {
      const isSelected = prevIds.includes(outfitId);
      console.log('Is currently selected:', isSelected);
      
      if (isSelected) {
        const newIds = prevIds.filter(id => id !== outfitId);
        console.log('Removing from selection, new ids:', newIds);
        return newIds;
      } else {
        const newIds = [...prevIds, outfitId];
        console.log('Adding to selection, new ids:', newIds);
        return newIds;
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
      title="Select Outfits"
      actions={actions}
      size="lg"
    >
        <SelectionGrid>
          {outfits.map(outfit => (
            <SelectionItem 
              key={outfit.id} 
              selected={localSelectedIds.includes(outfit.id)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleToggleOutfit(outfit.id);
              }}
            >
              <SelectionItemName>{outfit.name}</SelectionItemName>
              <SelectionItemCategory>{outfit.items?.length || 0} items</SelectionItemCategory>
            </SelectionItem>
          ))}
        </SelectionGrid>
    </Modal>
  );
};

export default OutfitSelectionPopup;
