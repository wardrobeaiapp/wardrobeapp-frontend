import React from 'react';
import { Season } from '../../../../../../types';
import { AVAILABLE_SEASONS, getSeasonDisplayName } from '../utils/formHelpers';
import { FormRow, Input, CheckboxGroup, CheckboxItem, CheckboxInput, CheckboxLabel } from '../WardrobeItemForm.styles';
import { FormField } from '../../../../../forms/common/FormField';

interface DetailsFieldsProps {
  material: string;
  onMaterialChange: (material: string) => void;
  brand: string;
  onBrandChange: (brand: string) => void;
  size: string;
  onSizeChange: (size: string) => void;
  price: string;
  onPriceChange: (price: string) => void;
  seasons: Season[];
  onToggleSeason: (season: Season) => void;
  isWishlistItem: boolean;
  onWishlistToggle: (isWishlist: boolean) => void;
  errors: { [key: string]: string };
}

export const DetailsFields: React.FC<DetailsFieldsProps> = ({
  material,
  onMaterialChange,
  brand,
  onBrandChange,
  size,
  onSizeChange,
  price,
  onPriceChange,
  seasons,
  onToggleSeason,
  isWishlistItem,
  onWishlistToggle,
  errors
}) => {
  return (
    <>
      <FormRow>
        <FormField label="Material" error={errors.material}>
          <Input
            type="text"
            value={material}
            onChange={(e) => onMaterialChange(e.target.value)}
            placeholder="Enter material"
          />
        </FormField>
        
        <FormField label="Brand" error={errors.brand}>
          <Input
            type="text"
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            placeholder="Enter brand"
          />
        </FormField>
      </FormRow>

      <FormRow style={{ marginTop: '1.5rem' }}>
        <FormField label="Size" error={errors.size}>
          <Input
            type="text"
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
            placeholder="e.g., S, M, L, XL, 32, 10"
          />
        </FormField>
        
        <FormField label="Purchase Price" error={errors.price}>
          <Input
            type="number"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="Enter price"
          />
        </FormField>
      </FormRow>

      <FormField 
        label="Seasons" 
        error={errors.seasons}
        style={{ marginTop: '1.5rem' }}
      >
        <CheckboxGroup>
          {AVAILABLE_SEASONS.map((season) => (
            <CheckboxItem key={season}>
              <CheckboxInput
                type="checkbox"
                id={`season-${season}`}
                checked={seasons.includes(season as Season)}
                onChange={() => onToggleSeason(season as Season)}
              />
              <CheckboxLabel htmlFor={`season-${season}`}>
                {getSeasonDisplayName(season)}
              </CheckboxLabel>
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </FormField>

      <FormField style={{ marginTop: '1.5rem' }}>
        <CheckboxItem>
          <CheckboxInput
            type="checkbox"
            id="wishlist"
            checked={isWishlistItem}
            onChange={(e) => onWishlistToggle(e.target.checked)}
          />
          <CheckboxLabel htmlFor="wishlist">
            Add to wishlist
          </CheckboxLabel>
        </CheckboxItem>
      </FormField>
    </>
  );
};
