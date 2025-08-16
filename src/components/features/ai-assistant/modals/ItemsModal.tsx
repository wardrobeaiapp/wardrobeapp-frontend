import React from 'react';
import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import { Modal, ModalAction, ModalBody } from '../../../common/Modal';
import FiltersPanel from '../FiltersPanel';
import ItemsGrid from '../ItemsGrid';
import {
  ResultsCount,
  CheckboxContainer
} from '../AIComponents.styles';

interface ItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WardrobeItem[];
  selectedItems: string[];
  onItemSelect: (itemId: string) => void;
  searchQuery: string;
  categoryFilter: ItemCategory | 'all';
  colorFilter: string;
  seasonFilter: Season | 'all';
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ItemCategory | 'all') => void;
  onColorChange: (value: string) => void;
  onSeasonChange: (value: Season | 'all') => void;
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
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onSeasonChange
}) => {
  const actions: ModalAction[] = [
    { label: 'Cancel', onClick: onClose, variant: 'secondary' },
    { label: 'Done', onClick: onClose, variant: 'primary' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Items to Include"
      actions={items.length > 0 ? actions : undefined}
      size="lg"
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
                onItemSelect={onItemSelect}
              />
            </CheckboxContainer>
          </>
        )}
      </ModalBody>
    </Modal>
  );
};

export default ItemsModal;
