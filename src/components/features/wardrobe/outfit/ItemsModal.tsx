import React from 'react';
import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import { formatCategory } from '../../../../utils/textFormatting';
import FiltersPanel from './FiltersPanel';
import ItemsGrid from './ItemsGrid';
import {
  ItemsModal as StyledItemsModal,
  ItemsModalContent,
  ItemsModalHeader,
  ItemsModalTitle,
  CloseButton,
  CheckboxContainer,
  ResultsCount,
  ButtonGroup,
  ModernSubmitButton
} from '../OutfitForm.styles';

interface ItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: WardrobeItem[];
  filteredItems: WardrobeItem[];
  selectedItems: string[];
  searchQuery: string;
  categoryFilter: ItemCategory | 'all';
  colorFilter: string;
  seasonFilter: Season | 'all';
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ItemCategory | 'all') => void;
  onColorChange: (value: string) => void;
  onSeasonChange: (value: Season | 'all') => void;
  onItemSelect: (itemId: string) => void;
}

const ItemsModal: React.FC<ItemsModalProps> = ({
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
  onItemSelect
}) => {
  if (!isOpen) return null;

  return (
    <StyledItemsModal>
      <ItemsModalContent>
        <ItemsModalHeader>
          <ItemsModalTitle>Select Wardrobe Items</ItemsModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ItemsModalHeader>
        
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
              />
            </CheckboxContainer>
          </>
        )}
        
        <ButtonGroup style={{ marginTop: '1.5rem' }}>
          <ModernSubmitButton type="button" onClick={onClose}>
            Done
          </ModernSubmitButton>
        </ButtonGroup>
      </ItemsModalContent>
    </StyledItemsModal>
  );
};

export default ItemsModal;
