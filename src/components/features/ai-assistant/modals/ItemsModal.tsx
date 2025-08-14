import React from 'react';
import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import Button from '../../../common/Button';
import FiltersPanel from '../FiltersPanel';
import ItemsGrid from '../ItemsGrid';
import {
  Modal as StyledItemsModal,
  ModalContent as ItemsModalContent,
  ModalHeader as ItemsModalHeader,
  ModalTitle as ItemsModalTitle,
  CloseButton,
  ButtonGroup,
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
  if (!isOpen) return null;

  return (
    <StyledItemsModal>
      <ItemsModalContent>
        <ItemsModalHeader>
          <ItemsModalTitle>Select Items to Include</ItemsModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ItemsModalHeader>
        
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
            
            <ButtonGroup>
              <Button onClick={onClose}>Cancel</Button>
              <Button variant="primary" onClick={onClose}>Done</Button>
            </ButtonGroup>
          </>
        )}
      </ItemsModalContent>
    </StyledItemsModal>
  );
};

export default ItemsModal;
