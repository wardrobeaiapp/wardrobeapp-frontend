import React, { ChangeEvent } from 'react';
import { FormField, FormInput, FormRow, Checkbox, CheckboxGroup, FormSelect } from '../../../../../../components/common/Form';
import { Season } from '../../../../../../types';
import ScenarioSelector from '../../../shared/ScenarioSelector/ScenarioSelector';
import { AVAILABLE_SEASONS, getSeasonDisplayName } from '../utils/formHelpers';

// Import extracted utilities and types
import { DetailsFieldsProps, getFieldVisibility, useFormOptions, useScenarios } from '../utils';

export const DetailsFields: React.FC<DetailsFieldsProps> = ({
  material,
  onMaterialChange,
  brand,
  onBrandChange,
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
  scenarios,
  onScenarioToggle,
  seasons,
  onToggleSeason,
  isWishlistItem,
  onWishlistToggle,
  category,
  subcategory,
  errors
}) => {
  // Use extracted hooks for cleaner logic
  const { scenarios: availableScenarios, isLoading: isLoadingScenarios } = useScenarios();
  const fieldVisibility = getFieldVisibility(category, subcategory);
  const formOptions = useFormOptions(category, subcategory);
  
  
  
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
            {formOptions.patternOptions.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </FormSelect>
        </FormField>

        {fieldVisibility.shouldShowSilhouette && (
            <FormField label="Silhouette" error={errors.silhouette}>
              <FormSelect
                value={silhouette}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onSilhouetteChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select silhouette</option>
                {formOptions.silhouetteOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {fieldVisibility.shouldShowLength && (
            <FormField label="Length" error={errors.length}>
              <FormSelect
                value={length}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onLengthChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select length</option>
                {formOptions.lengthOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {fieldVisibility.shouldShowSleeves && (
            <FormField label="Sleeves" error={errors.sleeves}>
              <FormSelect
                value={sleeves}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onSleeveChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select sleeves</option>
                {formOptions.sleeveOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {fieldVisibility.shouldShowStyle && (
            <FormField label="Style" error={errors.style}>
              <FormSelect
                value={style}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onStyleChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select style</option>
                {formOptions.styleOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {fieldVisibility.shouldShowNeckline && (
            <FormField label="Neckline" error={errors.neckline}>
              <FormSelect
                value={neckline}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onNecklineChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select neckline</option>
                {formOptions.necklineOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {fieldVisibility.shouldShowRise && (
            <FormField label="Rise" error={errors.rise}>
              <FormSelect
                value={rise}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onRiseChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select rise</option>
                {formOptions.riseOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

          {fieldVisibility.shouldShowHeelHeight && (
            <FormField label="Heel Height" error={errors.heelHeight}>
              <FormSelect
                value={heelHeight}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onHeelHeightChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select heel height</option>
                {formOptions.heelHeightOptions.map((option: string) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </FormSelect>
            </FormField>
          )}
          
          {fieldVisibility.shouldShowBootHeight && (
            <FormField label="Boot Height" error={errors.bootHeight}>
              <FormSelect
                value={bootHeight}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onBootHeightChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select boot height</option>
                {formOptions.bootHeightOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}
          
          {fieldVisibility.shouldShowType && (
            <FormField label="Type" error={errors.type}>
              <FormSelect
                value={type}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => onTypeChange(e.target.value)}
                variant="outline"
                isFullWidth
              >
                <option value="">Select type</option>
                {formOptions.typeOptions.map((option: string) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </FormSelect>
            </FormField>
          )}

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

      {/* Scenarios section */}
      <FormField 
        style={{ marginTop: '1.5rem' }}
      >
        <ScenarioSelector
          scenarios={availableScenarios}
          selectedScenarios={scenarios}
          onScenarioChange={onScenarioToggle}
          isLoading={isLoadingScenarios}
          namespace="item-scenario"
        />
      </FormField>

      {/* Seasons section */}
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
