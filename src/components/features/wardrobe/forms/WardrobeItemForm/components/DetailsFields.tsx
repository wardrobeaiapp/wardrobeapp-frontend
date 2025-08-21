import React, { ChangeEvent } from 'react';
import { FormField, FormInput, FormRow, Checkbox, CheckboxGroup, FormSelect } from '../../../../../../components/common/Form';
import { ItemCategory, Season } from '../../../../../../types';
import { getSilhouetteOptions, getSleeveOptions, getStyleOptions, AVAILABLE_SEASONS, getSeasonDisplayName } from '../utils/formHelpers';

interface DetailsFieldsProps {
  material: string;
  onMaterialChange: (material: string) => void;
  brand: string;
  onBrandChange: (brand: string) => void;
  size: string;
  onSizeChange: (size: string) => void;
  price: string;
  onPriceChange: (price: string) => void;
  silhouette: string;
  onSilhouetteChange: (silhouette: string) => void;
  length: string;
  onLengthChange: (length: string) => void;
  sleeves: string;
  onSleeveChange: (sleeve: string) => void;
  style: string;
  onStyleChange: (style: string) => void;
  seasons: Season[];
  onToggleSeason: (season: Season) => void;
  isWishlistItem: boolean;
  onWishlistToggle: (isWishlist: boolean) => void;
  category: ItemCategory | '';
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
  silhouette,
  onSilhouetteChange,
  length,
  onLengthChange,
  sleeves,
  onSleeveChange,
  style,
  onStyleChange,
  seasons,
  onToggleSeason,
  isWishlistItem,
  onWishlistToggle,
  category,
  errors
}) => {
  // Hide silhouette and length fields for accessories, footwear, and other categories
  const shouldShowSilhouette = category && 
    ![ItemCategory.ACCESSORY, ItemCategory.FOOTWEAR, ItemCategory.OTHER].includes(category as ItemCategory);
  
  const shouldShowLength = category && 
    ![ItemCategory.ACCESSORY, ItemCategory.FOOTWEAR, ItemCategory.OTHER, ItemCategory.TOP].includes(category as ItemCategory);

  // Show sleeves field only for TOP category
  const shouldShowSleeves = category === ItemCategory.TOP || category === ItemCategory.ONE_PIECE;

  // Show style field for all categories except ACCESSORY and OTHER
  const shouldShowStyle = category && 
    ![ItemCategory.ACCESSORY, ItemCategory.OTHER].includes(category as ItemCategory);

  const silhouetteOptions = category ? getSilhouetteOptions(category as ItemCategory) : [];
  const sleeveOptions = getSleeveOptions();
  const styleOptions = getStyleOptions();
  
  // Debug field visibility
  console.log('[DetailsFields] Field visibility debug:', {
    category,
    shouldShowSleeves,
    shouldShowStyle,
    shouldShowSilhouette,
    shouldShowLength,
    sleeves,
    style
  });
  
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
        
        {/* <FormField label="Brand" error={errors.brand}>
          <FormInput
            type="text"
            value={brand}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onBrandChange(e.target.value)}
            placeholder="Enter brand"
            variant="outline"
            isFullWidth
          />
        </FormField> */}

        {shouldShowSilhouette && (
            <FormField label="Silhouette" error={errors.silhouette}>
              <FormSelect
                value={silhouette}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onSilhouetteChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select silhouette</option>
                {silhouetteOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {shouldShowLength && (
            <FormField label="Length" error={errors.length}>
              <FormInput
                type="text"
                value={length}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onLengthChange(e.target.value)}
                placeholder="e.g., Mini, Midi, Maxi, Short, Long"
                variant="outline"
                isFullWidth
              />
            </FormField>
          )}

          {shouldShowSleeves && (
            <FormField label="Sleeves" error={errors.sleeves}>
              <FormSelect
                value={sleeves}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onSleeveChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select sleeves</option>
                {sleeveOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {shouldShowStyle && (
            <FormField label="Style" error={errors.style}>
              <FormSelect
                value={style}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onStyleChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select style</option>
                {styleOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}
      </FormRow>

      <FormRow style={{ marginTop: '1.5rem' }}>
        {/* <FormField label="Size" error={errors.size}>
          <FormInput
            type="text"
            value={size}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSizeChange(e.target.value)}
            placeholder="e.g., S, M, L, XL, 32, 10"
            variant="outline"
            isFullWidth
          />
        </FormField> */}
        
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
