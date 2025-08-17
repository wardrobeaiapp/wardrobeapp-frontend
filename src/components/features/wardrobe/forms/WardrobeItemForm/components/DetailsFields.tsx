import React, { ChangeEvent } from 'react';
import { Season } from '../../../../../../types';
import { AVAILABLE_SEASONS, getSeasonDisplayName } from '../utils/formHelpers';
import { FormField, FormInput, FormRow, Checkbox, CheckboxGroup } from '../../../../../../components/common/Form';

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
          <FormInput
            type="text"
            value={material}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onMaterialChange(e.target.value)}
            placeholder="Enter material"
            variant="outline"
            isFullWidth
          />
        </FormField>
        
        <FormField label="Brand" error={errors.brand}>
          <FormInput
            type="text"
            value={brand}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onBrandChange(e.target.value)}
            placeholder="Enter brand"
            variant="outline"
            isFullWidth
          />
        </FormField>
      </FormRow>

      <FormRow style={{ marginTop: '1.5rem' }}>
        <FormField label="Size" error={errors.size}>
          <FormInput
            type="text"
            value={size}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSizeChange(e.target.value)}
            placeholder="e.g., S, M, L, XL, 32, 10"
            variant="outline"
            isFullWidth
          />
        </FormField>
        
        <FormField label="Purchase Price" error={errors.price}>
          <FormInput
            type="number"
            value={price}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onPriceChange(e.target.value)}
            placeholder="Enter price"
            variant="outline"
            isFullWidth
          />
        </FormField>
      </FormRow>

      <FormField 
        label="Seasons" 
        error={errors.seasons}
        style={{ marginTop: '1.5rem' }}
      >
        <CheckboxGroup
          options={AVAILABLE_SEASONS.map(season => ({
            value: season as Season,
            label: getSeasonDisplayName(season)
          }))}
          value={seasons}
          onChange={(selectedSeasons) => {
            // Find which season was toggled
            const allSeasons = new Set([...seasons, ...selectedSeasons]);
            const changedSeason = Array.from(allSeasons).find(
              season => seasons.includes(season) !== selectedSeasons.includes(season)
            );
            
            if (changedSeason) {
              onToggleSeason(changedSeason);
            }
          }}
        />
      </FormField>

      <FormField style={{ marginTop: '1.5rem' }}>
        <Checkbox
          label="Add to wishlist"
          checked={isWishlistItem}
          onChange={(e) => onWishlistToggle(e.target.checked)}
        />
      </FormField>
    </>
  );
};
