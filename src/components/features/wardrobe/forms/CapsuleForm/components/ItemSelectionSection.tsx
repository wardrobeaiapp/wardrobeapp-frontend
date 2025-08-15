import React from 'react';
import { WardrobeItem } from '../../../../../../types';
import {
  FormGroup,
  Label
} from '../CapsuleForm.styles';
import Button from '../../../../../common/Button';
import MainItemSelector from '../../../capsule/MainItemSelector';
import SelectedItemsList from '../../../capsule/SelectedItemsList';

export interface ItemSelectionSectionProps {
  // Main item props
  mainItemId: string;
  availableItems: WardrobeItem[];
  onMainItemChange: (itemId: string) => void;
  onOpenMainItemModal: () => void;
  
  // Selected items props
  selectedItems: string[];
  onItemChange: (itemId: string) => void;
  onOpenItemsModal: () => void;
}

const ItemSelectionSection: React.FC<ItemSelectionSectionProps> = ({
  mainItemId,
  availableItems,
  onMainItemChange,
  onOpenMainItemModal,
  selectedItems,
  onItemChange,
  onOpenItemsModal
}) => {
  // Calculate the count of supporting items (excluding main item)
  const supportingItemsCount = selectedItems.filter(itemId => itemId !== mainItemId).length;
  
  return (
    <>
      <FormGroup>
        <Label>Main Item</Label>
        <MainItemSelector
          mainItemId={mainItemId}
          availableItems={availableItems}
          onMainItemChange={onMainItemChange}
          onSelectClick={onOpenMainItemModal}
        />
      </FormGroup>

      <FormGroup>
        <Label>Selected Items ({supportingItemsCount})</Label>
        <Button variant="primary" type="button" onClick={onOpenItemsModal}>
          Select Items
        </Button>
        
        <SelectedItemsList
          selectedItems={selectedItems}
          availableItems={availableItems}
          onItemRemove={onItemChange}
          mainItemId={mainItemId}
        />
      </FormGroup>
    </>
  );
};

export default ItemSelectionSection;
