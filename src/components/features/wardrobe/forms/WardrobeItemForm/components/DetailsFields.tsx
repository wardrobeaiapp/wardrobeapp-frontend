import React, { ChangeEvent } from 'react';
import { FormField, FormInput, FormRow, Checkbox, CheckboxGroup, FormSelect } from '../../../../../../components/common/Form';
import { ItemCategory, Season } from '../../../../../../types';
import { getSilhouetteOptions, getSleeveOptions, getStyleOptions, getLengthOptions, getRiseOptions, getNecklineOptions, getHeelHeightOptions, getBootHeightOptions, getTypeOptions, getPatternOptions, AVAILABLE_SEASONS, getSeasonDisplayName } from '../utils/formHelpers';

interface DetailsFieldsProps {
  material: string;
  onMaterialChange: (material: string) => void;
  brand: string;
  onBrandChange: (brand: string) => void;
  size: string;
  onSizeChange: (size: string) => void;
  price: string;
  onPriceChange: (price: string) => void;
  pattern: string;
  onPatternChange: (pattern: string) => void;
  silhouette: string;
  onSilhouetteChange: (silhouette: string) => void;
  length: string;
  onLengthChange: (length: string) => void;
  sleeves: string;
  onSleeveChange: (sleeve: string) => void;
  style: string;
  onStyleChange: (style: string) => void;
  rise: string;
  onRiseChange: (rise: string) => void;
  neckline: string;
  onNecklineChange: (neckline: string) => void;
  heelHeight: string;
  onHeelHeightChange: (heelHeight: string) => void;
  bootHeight: string;
  onBootHeightChange: (bootHeight: string) => void;
  type: string;
  onTypeChange: (type: string) => void;
  seasons: Season[];
  onToggleSeason: (season: Season) => void;
  isWishlistItem: boolean;
  onWishlistToggle: (isWishlist: boolean) => void;
  category: ItemCategory | '';
  subcategory: string;
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
  pattern,
  onPatternChange,
  silhouette,
  onSilhouetteChange,
  length,
  onLengthChange,
  sleeves,
  onSleeveChange,
  style,
  onStyleChange,
  rise,
  onRiseChange,
  neckline,
  onNecklineChange,
  heelHeight,
  onHeelHeightChange,
  bootHeight,
  onBootHeightChange,
  type,
  onTypeChange,
  seasons,
  onToggleSeason,
  isWishlistItem,
  onWishlistToggle,
  category,
  subcategory,
  errors
}) => {
  // Show silhouette field based on category and subcategory
  const shouldShowSilhouette = category && 
    ![ItemCategory.ACCESSORY, ItemCategory.FOOTWEAR, ItemCategory.OTHER].includes(category as ItemCategory) &&
    // For BOTTOM category, only show for specific subcategories
    (category !== ItemCategory.BOTTOM || 
     (subcategory && !['leggings'].includes(subcategory.toLowerCase())));
  
  // Show length field for BOTTOM category with specific subcategories and ONE_PIECE with dress
  const shouldShowLength = (category === ItemCategory.BOTTOM && 
    subcategory && 
    ['jeans', 'trousers', 'shorts', 'skirt'].includes(subcategory.toLowerCase())) ||
    (category === ItemCategory.ONE_PIECE && 
     subcategory && 
     subcategory.toLowerCase() === 'dress') ||
    category === ItemCategory.OUTERWEAR;

  // Show sleeves field based on category and subcategory
  const shouldShowSleeves = (category === ItemCategory.ONE_PIECE && subcategory && !['overall'].includes(subcategory.toLowerCase())) || 
    (category === ItemCategory.TOP && 
     subcategory && 
     ['t-shirt', 'shirt', 'blouse', 'sweater', 'cardigan'].includes(subcategory.toLowerCase()));

  // Show style field based on category and subcategory
  const shouldShowStyle = category && 
    ![ItemCategory.ACCESSORY, ItemCategory.OTHER].includes(category as ItemCategory);

  // Show neckline field for specific subcategories
  const shouldShowNeckline = subcategory && 
    ['dress', 't-shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'jumpsuit', 'romper'].includes(subcategory.toLowerCase());

  // Show rise field only for BOTTOM category
  const shouldShowRise = category === ItemCategory.BOTTOM;
  
  // Show heel height field for footwear
  const shouldShowHeelHeight = category === ItemCategory.FOOTWEAR && 
    subcategory && 
    ['heels', 'boots', 'sandals', 'flats', 'formal shoes'].includes(subcategory.toLowerCase());
    
  // Show boot height field for boots subcategory
  const shouldShowBootHeight = category === ItemCategory.FOOTWEAR && 
    subcategory && 
    subcategory.toLowerCase() === 'boots';
    
  // Show type field for specific subcategories
  const shouldShowType = (category === ItemCategory.FOOTWEAR && subcategory && 
    ['boots', 'formal shoes'].includes(subcategory.toLowerCase())) ||
    (category === ItemCategory.ACCESSORY && subcategory && 
    ['bag', 'jewelry'].includes(subcategory.toLowerCase()));

  const silhouetteOptions = category ? getSilhouetteOptions(category) : [];
  const lengthOptions = getLengthOptions(category);
  const sleeveOptions = getSleeveOptions();
  const styleOptions = getStyleOptions();
  const riseOptions = getRiseOptions();
  const necklineOptions = getNecklineOptions();
  const heelHeightOptions = getHeelHeightOptions();
  const bootHeightOptions = getBootHeightOptions();
  const typeOptions = getTypeOptions(category, subcategory);
  const patternOptions = getPatternOptions();
  
  // Debug field visibility
  console.log('[DetailsFields] Field visibility debug:', {
    category,
    shouldShowSleeves,
    shouldShowStyle,
    shouldShowSilhouette,
    shouldShowLength,
    shouldShowRise,
    sleeves,
    style,
    rise,
    length: length // Add length to debug output
  });
  
  // Specific debug for length field
  console.log('[DEBUG] Length field state:', {
    length,
    shouldShowLength,
    lengthOptions: lengthOptions.length
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
        
        <FormField label="Pattern">
          <FormSelect
            value={pattern}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => onPatternChange(e.target.value)}
            variant="outline"
            isFullWidth
          >
            <option value="">Select a pattern (optional)</option>
            {patternOptions.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FormSelect>
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
              <FormSelect
                value={length}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onLengthChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select length</option>
                {lengthOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
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

          {shouldShowNeckline && (
            <FormField label="Neckline" error={errors.neckline}>
              <FormSelect
                value={neckline}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onNecklineChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select neckline</option>
                {necklineOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {shouldShowRise && (
            <FormField label="Rise" error={errors.rise}>
              <FormSelect
                value={rise}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onRiseChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select rise</option>
                {riseOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {shouldShowHeelHeight && (
            <FormField label="Heel Height" error={errors.heelHeight}>
              <FormSelect
                value={heelHeight}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onHeelHeightChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select heel height</option>
                {heelHeightOptions.map(option => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          )}
          
          {shouldShowBootHeight && (
            <FormField label="Boot Height" error={errors.bootHeight}>
              <FormSelect
                value={bootHeight}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onBootHeightChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select boot height</option>
                {bootHeightOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}
          
          {shouldShowType && (
            <FormField label="Type" error={errors.type}>
              <FormSelect
                value={type}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onTypeChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select type</option>
                {typeOptions.map(option => (
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
