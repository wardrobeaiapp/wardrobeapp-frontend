import React from 'react';
import { Season } from '../../../../../types';
import { AVAILABLE_SEASONS, getSeasonDisplayName } from '../utils/formHelpers';
import {
  FormRow,
  FormGroup,
  Label,
  Input,
  CheckboxGroup,
  CheckboxItem,
  CheckboxInput,
  CheckboxLabel
} from '../../WardrobeItemForm.styles';

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
        <FormGroup>
          <Label>Material</Label>
          <Input
            type="text"
            value={material}
            onChange={(e) => onMaterialChange(e.target.value)}
            placeholder="Enter material"
          />
          {errors.material && (
            <div style={{ color: 'red', fontSize: '0.875rem' }}>
              {errors.material}
            </div>
          )}
        </FormGroup>
        <FormGroup>
          <Label>Brand</Label>
          <Input
            type="text"
            value={brand}
            onChange={(e) => onBrandChange(e.target.value)}
            placeholder="Enter brand"
          />
        </FormGroup>
      </FormRow>

      <FormRow style={{ marginTop: '1.5rem' }}>
        <FormGroup>
          <Label>Size</Label>
          <Input
            type="text"
            value={size}
            onChange={(e) => onSizeChange(e.target.value)}
            placeholder="e.g., S, M, L, XL, 32, 10"
          />
        </FormGroup>
        <FormGroup>
          <Label>Purchase Price</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            placeholder="Enter price"
          />
        </FormGroup>
      </FormRow>

      <FormGroup style={{ marginTop: '1.5rem' }}>
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '0.25rem', padding: 0, display: 'block' }}>
            Seasons *
          </legend>
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
        </fieldset>
        {errors.seasons && (
          <div style={{ color: 'red', fontSize: '0.875rem' }}>
            {errors.seasons}
          </div>
        )}
      </FormGroup>

      <FormGroup style={{ marginTop: '1.5rem' }}>
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
      </FormGroup>
    </>
  );
};
