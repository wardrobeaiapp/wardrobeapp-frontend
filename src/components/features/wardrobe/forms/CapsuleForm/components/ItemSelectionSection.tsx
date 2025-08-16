import React from 'react';
import { WardrobeItem } from '../../../../../../types';
import Button from '../../../../../common/Button';
import FormField from '../../../../../common/Form/FormField';
import MainItemSelector from '../../../shared/MainItemSelector';
import SelectedItemsList from '../../../shared/SelectedItemsList';

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
      <FormField 
        label="Main Item"
        helpText="Select the primary item for this capsule"
      >
        <MainItemSelector
          mainItemId={mainItemId}
          availableItems={availableItems}
          onMainItemChange={onMainItemChange}
          onSelectClick={onOpenMainItemModal}
        />
      </FormField>

      <FormField 
        label={`Selected Items (${supportingItemsCount})`}
        helpText="Add supporting items to complete your capsule"
      >
        <div style={{ marginBottom: '0.5rem' }}>
          <Button variant="primary" fullWidth type="button" onClick={onOpenItemsModal}>
            Select Items
          </Button>
        </div>
        
        <SelectedItemsList
          selectedItems={selectedItems}
          availableItems={availableItems}
          onItemRemove={onItemChange}
          mainItemId={mainItemId}
        />
      </FormField>
    </>
  );
};

export default ItemSelectionSection;
