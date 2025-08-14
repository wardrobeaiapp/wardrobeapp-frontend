import React from 'react';
import { WardrobeItem } from '../../../../types';
import {
  SelectedItemsContainer,
  SelectedItemBadge,
  RemoveItemButton
} from '../CapsuleForm.styles';
import { ModernSubmitButton } from '../OutfitForm.styles';

interface MainItemSelectorProps {
  mainItemId: string;
  availableItems: WardrobeItem[];
  onMainItemChange: (itemId: string) => void;
  onSelectClick: () => void;
}

const MainItemSelector: React.FC<MainItemSelectorProps> = ({
  mainItemId,
  availableItems,
  onMainItemChange,
  onSelectClick
}) => {
  const mainItem = availableItems?.find(i => i.id === mainItemId);
  
  return (
    <div>
      {mainItem ? (
        <SelectedItemsContainer>
          <SelectedItemBadge key={mainItemId}>
            {mainItem.name}
            <RemoveItemButton onClick={() => onMainItemChange('')}>&times;</RemoveItemButton>
          </SelectedItemBadge>
        </SelectedItemsContainer>
      ) : (
        <ModernSubmitButton type="button" onClick={onSelectClick} style={{ width: '100%' }}>
          Select Main Item
        </ModernSubmitButton>
      )}
    </div>
  );
};

export default MainItemSelector;
