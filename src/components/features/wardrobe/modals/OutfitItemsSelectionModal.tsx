import React from 'react';
import { WardrobeItem, Season, ItemCategory } from '../../../../types';
import { Modal, ModalAction } from '../../../common/Modal';
import FiltersPanel from '../shared/FiltersPanel';
import ItemsGrid from '../shared/ItemsGrid';
import {
  CheckboxContainer,
  ResultsCount
} from '../forms/OutfitForm/OutfitForm.styles';
import { formatCategory } from '../../../../utils/textFormatting';

interface OutfitItemsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableItems: WardrobeItem[];
  selectedItems: string[];
  onItemSelect: (itemIds: string | string[]) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categoryFilter: ItemCategory | 'all';
  onCategoryChange: (value: string) => void;
  colorFilter: string;
  onColorChange: (value: string) => void;
  seasonFilter: Season | 'all';
  onSeasonChange: (value: string) => void;
  categories: string[];
  colors: string[];
  title?: string;
  singleSelect?: boolean;
}

const OutfitItemsSelectionModal: React.FC<OutfitItemsSelectionModalProps> = ({
  isOpen,
  onClose,
  availableItems,
  selectedItems,
  onItemSelect,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  colorFilter,
  onColorChange,
  seasonFilter,
  onSeasonChange,
  categories,
  colors,
  title = 'Select Wardrobe Items',
  singleSelect = false
}) => {
  const hasActiveFilters = Boolean(
    searchQuery || 
    (categoryFilter && categoryFilter !== 'all') || 
    colorFilter || 
    (seasonFilter && seasonFilter !== 'all')
  );
  
  const filteredItems = availableItems.filter(item => {
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = categoryFilter === 'all' || 
      item.category === categoryFilter;
      
    const matchesColor = !colorFilter || 
      (item.color && item.color.toLowerCase() === colorFilter.toLowerCase());
      
    // Handle season filter - check if item.season matches seasonFilter
    const matchesSeason = seasonFilter === 'all' || 
      (item.season && String(item.season).toLowerCase() === String(seasonFilter).toLowerCase());
      
    return matchesSearch && matchesCategory && matchesColor && matchesSeason;
  });

  const actions: ModalAction[] = [
    { label: 'Done', onClick: onClose, variant: 'primary' }
  ];

  const handleResetFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
    onColorChange('');
    onSeasonChange('all');
  };

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
          <div>
            <FiltersPanel
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              categoryFilter={categoryFilter}
              onCategoryChange={onCategoryChange}
              colorFilter={colorFilter}
              onColorChange={onColorChange}
              seasonFilter={seasonFilter}
              onSeasonChange={onSeasonChange}
              onResetFilters={handleResetFilters}
              showResetButton={hasActiveFilters}
              // Convert categories to the format expected by FiltersPanel
              customFilters={[
                {
                  id: 'category',
                  label: 'Category',
                  value: categoryFilter,
                  options: [
                    { value: 'all', label: 'All Categories' },
                    ...categories.map(cat => ({
                      value: cat,
                      label: formatCategory(cat)
                    }))
                  ],
                  onChange: onCategoryChange
                },
                {
                  id: 'season',
                  label: 'Season',
                  value: seasonFilter,
                  options: [
                    { value: 'all', label: 'All Seasons' },
                    ...Object.values(Season).map(season => ({
                      value: season,
                      label: season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
                      }))
                  ],
                  onChange: onSeasonChange
                },
                {
                  id: 'color',
                  label: 'Color',
                  value: colorFilter,
                  options: [
                    { value: '', label: 'All Colors' },
                    ...colors.map(color => ({
                      value: color,
                      label: color
                    }))
                  ],
                  onChange: onColorChange
                }
              ]}
            />
          </div>
          
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>No items match your current filters.</p>
              <button 
                onClick={handleResetFilters}
                style={{
                  marginTop: '1rem',
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
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
        </>
      )}
    </Modal>
  );
};

export default OutfitItemsSelectionModal;
