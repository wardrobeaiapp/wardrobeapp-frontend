import React from 'react';
import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import { Modal, ModalAction } from '../../../common/Modal';
import FiltersPanel from '../outfit/FiltersPanel';
import ItemsGrid from '../outfit/ItemsGrid';
import {
  CheckboxContainer,
  ResultsCount
} from '../forms/OutfitForm/OutfitForm.styles';

interface OutfitItemsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: WardrobeItem[];
  filteredItems: WardrobeItem[];
  selectedItems: string[];
  searchQuery: string;
  categoryFilter: ItemCategory | 'all';
  colorFilter: string;
  seasonFilter: Season | 'all';
  categories: string[];
  colors: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ItemCategory | 'all') => void;
  onColorChange: (value: string) => void;
  onSeasonChange: (value: Season | 'all') => void;
  onItemSelect: (itemId: string) => void;
  title?: string;
  singleSelect?: boolean;
}

const OutfitItemsSelectionModal: React.FC<OutfitItemsSelectionModalProps> = ({
  isOpen,
  onClose,
  availableItems,
  filteredItems,
  selectedItems,
  searchQuery,
  categoryFilter,
  colorFilter,
  seasonFilter,
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onSeasonChange,
  onItemSelect,
  categories,
  colors,
  title = 'Select Wardrobe Items',
  singleSelect = false
}) => {
  const actions: ModalAction[] = [
    { label: 'Done', onClick: onClose, variant: 'primary' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
      size="lg"
    >
        {availableItems.length === 0 ? (
          <p>No items available. Add some items to your wardrobe first.</p>
        ) : (
          <>
            <FiltersPanel
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              colorFilter={colorFilter}
              seasonFilter={seasonFilter}
              onSearchChange={onSearchChange}
              onCategoryChange={onCategoryChange}
              onColorChange={onColorChange}
              onSeasonChange={onSeasonChange}
            />
            
            <ResultsCount>
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
            </ResultsCount>
            
            <CheckboxContainer>
              <ItemsGrid
                items={filteredItems}
                selectedItems={selectedItems}
                onItemSelect={onItemSelect}
                singleSelect={singleSelect}
              />
            </CheckboxContainer>
          </>
        )}
    </Modal>
  );
};

export default OutfitItemsSelectionModal;
