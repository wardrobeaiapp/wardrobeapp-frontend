import React from 'react';
import { WardrobeItem } from '../../../../types';
import Button from '../../../common/Button';
import { RemoveItemButton, SelectedItemBadge, SelectedItemsContainer } from '../forms/CapsuleForm/CapsuleForm.styles';

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
        <Button fullWidth onClick={onSelectClick}>
          Select Main Item
        </Button>
      )}
    </div>
  );
};

export default MainItemSelector;
