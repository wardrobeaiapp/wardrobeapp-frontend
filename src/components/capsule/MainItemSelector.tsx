import React from 'react';
import { WardrobeItem } from '../../types';
import Button from '../Button';
import {
  SelectedItemsContainer,
  SelectedItemBadge,
  RemoveItemButton
} from '../CapsuleForm.styles';

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
        <Button type="button" onClick={onSelectClick} style={{ width: '100%' }}>Select Main Item</Button>
      )}
    </div>
  );
};

export default MainItemSelector;
