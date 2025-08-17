import React, { ChangeEvent } from 'react';
import { ItemCategory } from '../../../../../../types';
import { getSubcategoryOptions } from '../utils/formHelpers';
import { FormField, FormInput, FormSelect, FormRow } from '../../../../../../components/common/Form';

interface BasicInfoFieldsProps {
  name: string;
  onNameChange: (name: string) => void;
  category: ItemCategory | '';
  onCategoryChange: (category: ItemCategory | '') => void;
  subcategory: string;
  onSubcategoryChange: (subcategory: string) => void;
  color: string;
  onColorChange: (color: string) => void;
  errors: { [key: string]: string };
}

export const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({
  name,
  onNameChange,
  category,
  onCategoryChange,
  subcategory,
  onSubcategoryChange,
  color,
  onColorChange,
  errors
}) => {
  const subcategoryOptions = getSubcategoryOptions(category);

  return (
    <>
      <FormRow>
        <FormField label="Item Name" error={errors.name}>
          <FormInput
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
            placeholder="Enter item name (optional)"
            variant="outline"
            isFullWidth
          />
        </FormField>
        
        <FormField label="Category " error={errors.category} required>
          <FormSelect
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as ItemCategory | '')}
          >
            <option value="">Select a category</option>
            <option value={ItemCategory.TOP}>Top</option>
            <option value={ItemCategory.BOTTOM}>Bottom</option>
            <option value={ItemCategory.ONE_PIECE}>One Piece</option>
            <option value={ItemCategory.OUTERWEAR}>Outerwear</option>
            <option value={ItemCategory.FOOTWEAR}>Footwear</option>
            <option value={ItemCategory.ACCESSORY}>Accessory</option>
            <option value={ItemCategory.OTHER}>Other</option>
          </FormSelect>
        </FormField>
      </FormRow>

      <FormRow style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
        <FormField 
          label="Subcategory" 
        >
          <FormSelect
            value={subcategory}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            disabled={!category || subcategoryOptions.length === 0}
          >
            <option value="">Select a subcategory</option>
            {subcategoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FormSelect>
        </FormField>
        
        <FormField label="Color " error={errors.color} required>
          <FormInput
            type="text"
            value={color}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onColorChange(e.target.value)}
            placeholder="Enter color"
            variant="outline"
            isFullWidth
          />
        </FormField>
      </FormRow>
    </>
  );
};
