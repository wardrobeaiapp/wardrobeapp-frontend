import React, { useState, useEffect } from 'react';
import { Outfit } from '../../../types';
import Button from '../../common/Button';
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
  ButtonContainer,
} from './Calendar.styles';

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
  
  if (!visible) return null;

  return (
    <PopupContainer>
      <PopupContent>
        <PopupHeader>
          <PopupTitle>Select Outfits</PopupTitle>
          <PopupCloseButton onClick={() => onClose()}>×</PopupCloseButton>
        </PopupHeader>
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
              {outfit.occasion && (
                <SelectionItemCategory>{outfit.occasion}</SelectionItemCategory>
              )}
            </SelectionItem>
          ))}
        </SelectionGrid>
        <ButtonContainer>
          <Button onClick={() => onClose()}>Cancel</Button>
          <Button variant="primary" onClick={() => {
            // Save selections and close
            onSave(localSelectedIds);
            onClose();
          }}>Done</Button>
        </ButtonContainer>
      </PopupContent>
    </PopupContainer>
  );
};

export default OutfitSelectionPopup;
