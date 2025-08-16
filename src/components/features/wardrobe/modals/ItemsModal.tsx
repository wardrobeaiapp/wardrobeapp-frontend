import React from 'react';
import { WardrobeItem } from '../../../../types';
import { Modal, ModalAction, ModalBody } from '../../../common/Modal';
import FiltersPanel from '../capsule/FiltersPanel';
import ItemsGrid from '../capsule/ItemsGrid';
import {
  CheckboxContainer,
  ResultsCount
} from '../forms/OutfitForm/OutfitForm.styles';

interface ItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WardrobeItem[];
  selectedItems: string[];
  onItemSelect: (itemId: string) => void;
  searchQuery: string;
  categoryFilter: string;
  colorFilter: string;
  seasonFilter: string;
  categories: string[];
  colors: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
  singleSelect?: boolean; // If true, only one item can be selected
  title?: string; // Custom title for the modal
}

const ItemsModal: React.FC<ItemsModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedItems,
  onItemSelect,
  searchQuery,
  categoryFilter,
  colorFilter,
  seasonFilter,
  colors,
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onSeasonChange,
  singleSelect = false,
  title = 'Select Items'
}) => {
  // Create a wrapper function for item selection to handle single select mode
  const handleItemSelect = (itemId: string) => {
    if (singleSelect) {
      // In single select mode, clicking an already selected item deselects it
      if (selectedItems.includes(itemId)) {
        onItemSelect('');
      } else {
        onItemSelect(itemId);
      }
    } else {
      // In multi-select mode, use the provided onItemSelect function
      onItemSelect(itemId);
    }
  };

  const actions: ModalAction[] = [
    { label: 'Done', onClick: onClose, variant: 'primary' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
      size="xl"
    >
      <ModalBody>
        {items.length === 0 ? (
          <p>No items available. Add some items to your wardrobe first.</p>
        ) : (
          <>
            <FiltersPanel
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              colorFilter={colorFilter}
              seasonFilter={seasonFilter}
              colors={colors}
              onSearchChange={onSearchChange}
              onCategoryChange={onCategoryChange}
              onColorChange={onColorChange}
              onSeasonChange={onSeasonChange}
            />
            
            <ResultsCount>
              {items.length} {items.length === 1 ? 'item' : 'items'} found
            </ResultsCount>
            
            <CheckboxContainer>
              <ItemsGrid
                items={items}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
              />
            </CheckboxContainer>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ItemsModal;
