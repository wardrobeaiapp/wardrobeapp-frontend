import React, { useState } from 'react';
import styled from 'styled-components';
import { Season, ItemCategory } from '../../../../../types';
import { Modal } from '../../../../common/Modal';
import { FormField, FormSelect, CheckboxGroup } from '../../../../common/Form';
import { getSubcategoryOptions, formatCategoryName } from '../../../../features/wardrobe/forms/WardrobeItemForm/utils/formHelpers';

// Styled components
const AICheckModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;

  .image-preview {
    width: 100%;
    height: 300px;
    border-radius: 8px;
    overflow: hidden;
    background-color: ${({ theme }) => theme.colors.backgroundSecondary};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .no-image {
      color: ${({ theme }) => theme.colors.textSecondary};
      padding: 1rem;
      text-align: center;
    }
  }
`;


interface AICheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: { category: string; subcategory: string; seasons: string[] }) => void;
  imageUrl: string;
}

// Get all category options from ItemCategory enum
const categories = Object.values(ItemCategory).map(category => ({
  value: category,
  label: formatCategoryName(category)
}));

// Get subcategory options based on selected category
const getSubcategorySelectOptions = (category: ItemCategory | '') => {
  if (!category) return [];
  const subcategories = getSubcategoryOptions(category);
  return subcategories.map(subcategory => ({
    value: subcategory.toUpperCase().replace(/\s+/g, '_'),
    label: subcategory
  }));
};

const AICheckModal: React.FC<AICheckModalProps> = ({ isOpen, onClose, onApply, imageUrl }) => {
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory(''); // Reset subcategory when category changes
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubcategory(e.target.value);
  };

  const handleSeasonToggle = (season: string) => {
    setSelectedSeasons(prev =>
      prev.includes(season)
        ? prev.filter(s => s !== season)
        : [...prev, season]
    );
  };

  const handleApply = () => {
    onApply({
      category,
      subcategory,
      seasons: selectedSeasons,
    });
    onClose();
  };

  const filteredSubcategories = getSubcategorySelectOptions(category as ItemCategory);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Check Settings"
      size="md"
      actions={[
        { label: 'Cancel', onClick: onClose, variant: 'secondary', fullWidth: true },
        { label: 'Apply', onClick: handleApply, variant: 'primary', fullWidth: true },
      ]}
    >
      <AICheckModalContainer>
        <div className="image-preview">
          {imageUrl ? (
            <img src={imageUrl} alt="Item to check" />
          ) : (
            <div className="no-image">No image selected</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <FormField label="Category">
            <FormSelect
              value={category}
              onChange={handleCategoryChange}
              style={{ width: '100%' }}
            >
              <option value="">Select category</option>
              {categories.map((cat) => {
                // Skip the 'OTHER' category as it's not relevant for AI checking
                if (cat.value === ItemCategory.OTHER) return null;
                return (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                );
              })}
            </FormSelect>
          </FormField>

          <FormField label="Subcategory">
            <FormSelect
              value={subcategory}
              onChange={handleSubcategoryChange}
              disabled={!category}
              style={{ width: '100%' }}
            >
              <option value="">
                {category ? 'Select subcategory' : 'Select category'}
              </option>
              {filteredSubcategories.map((sub) => (
                <option key={sub.value} value={sub.value}>
                  {sub.label}
                </option>
              ))}
            </FormSelect>
          </FormField>
        </div>

        <FormField label="Seasons">
          <CheckboxGroup
            options={(Object.values(Season) as string[])
              .filter(season => season !== 'ALL_SEASON')
              .map(season => ({
                value: season,
                label: season === 'FALL' ? 'Fall' : season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()
              }))}
            value={selectedSeasons}
            onChange={setSelectedSeasons}
            direction="row"
          />
        </FormField>
      </AICheckModalContainer>
    </Modal>
  );
};

export default AICheckModal;
