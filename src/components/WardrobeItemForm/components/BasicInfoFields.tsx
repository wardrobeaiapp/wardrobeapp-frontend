import React from 'react';
import { ItemCategory } from '../../../types';
import { getSubcategoryOptions } from '../utils/formHelpers';
import {
  FormRow,
  FormGroup,
  Label,
  Input,
  Select
} from '../../../components/WardrobeItemForm.styles';

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
        <FormGroup>
          <Label>Item Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Enter item name (optional)"
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Category *</Label>
          <Select
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
          </Select>
          {errors.category && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.category}
            </div>
          )}
        </FormGroup>
      </FormRow>

      <FormRow style={{ marginTop: '1.5rem' }}>
        <FormGroup>
          <Label>Subcategory</Label>
          <Select
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
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>Color *</Label>
          <Input
            type="text"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            placeholder="Enter color"
          />
          {errors.color && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.color}
            </div>
          )}
        </FormGroup>
      </FormRow>
    </>
  );
};
