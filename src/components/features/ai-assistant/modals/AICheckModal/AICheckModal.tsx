import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Season, ItemCategory } from '../../../../../types';
import { DetectedTags } from '../../../../../services/formAutoPopulation';
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
  onFetchTags?: (imageUrl: string) => Promise<DetectedTags | null>;
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

const AICheckModal: React.FC<AICheckModalProps> = ({ isOpen, onClose, onApply, imageUrl, onFetchTags }) => {
  // We'll use the tags directly without storing them in state
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const hasFetchedRef = useRef(false);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setSubcategory(''); // Reset subcategory when category changes
  };

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSubcategory(e.target.value);
  };

  // Using setSelectedSeasons directly with CheckboxGroup instead of a toggle function

  const handleApply = () => {
    onApply({
      category,
      subcategory,
      seasons: selectedSeasons,
    });
    onClose();
  };

  // Process category from tags and set it if valid
  const processCategory = useCallback((tags: DetectedTags) => {
    if (tags.category && typeof tags.category === 'string' && !category) {
      const mappedCategory = tags.category.toUpperCase();
      if (Object.values(ItemCategory).includes(mappedCategory as ItemCategory)) {
        setCategory(mappedCategory);
      }
    }
  }, [category]);

  // Process seasons from tags and set them if valid
  const processSeasons = useCallback((tags: DetectedTags) => {
    if (tags.seasons && Array.isArray(tags.seasons) && tags.seasons.length > 0 && selectedSeasons.length === 0) {
      const mappedSeasons = tags.seasons
        .filter((s): s is string => typeof s === 'string')
        .map(s => s.toUpperCase());
      const validSeasons = mappedSeasons.filter(s => 
        Object.values(Season).includes(s as Season));
      if (validSeasons.length > 0) {
        setSelectedSeasons(validSeasons);
      }
    }
  }, [selectedSeasons]);

  // Fetch tags from image when modal opens
  useEffect(() => {
    // Define an async function to fetch and process tags
    const fetchAndProcessTags = async () => {
      // Only fetch if modal is open, we have an image URL, onFetchTags exists, and we haven't already fetched
      if (isOpen && imageUrl && onFetchTags && !hasFetchedRef.current) {
        try {
          console.log('[AICheckModal] Fetching tags for image...');
          hasFetchedRef.current = true; // Mark as fetched to prevent repeated calls
          
          const tags = await onFetchTags(imageUrl);
          if (tags) {
            console.log('[AICheckModal] Extracted tags:', tags);
            
            // Process tags to auto-select category and seasons
            processCategory(tags);
            processSeasons(tags);
          }
        } catch (error) {
          console.error('[AICheckModal] Error fetching tags:', error);
        }
      }
    };
    
    // Run fetch logic when modal opens
    if (isOpen) {
      fetchAndProcessTags();
    } else {
      // Reset ref when modal closes for next time it opens
      hasFetchedRef.current = false;
    }

    // Including all dependencies to satisfy ESLint
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, imageUrl, onFetchTags, processCategory, processSeasons]);

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
