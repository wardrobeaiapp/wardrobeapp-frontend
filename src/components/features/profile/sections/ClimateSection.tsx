import React, { useState, useEffect } from 'react';
import {
  FormGroup,
  SectionDivider
} from '../../../../pages/ProfilePage.styles';
import { SectionProps } from './types';
import { ClimateData } from '../../../../types';
import { climateOptionsWithDetails, climatePreferenceStepContent } from '../../../../data/onboardingOptions';
import { FormField, FormSelect } from '../../../../components/common/Form';

// Define a more specific props interface using ClimateData
interface ClimateSectionProps extends Omit<SectionProps, 'profileData'> {
  climateData?: ClimateData;
  profileData?: Partial<ClimateData>; // Keep for backward compatibility
  showSaveButton?: boolean;
}

const ClimateSection: React.FC<ClimateSectionProps> = ({
  climateData,
  profileData,
  handleNestedChange,
}) => {
  // Use climateData if available, otherwise fall back to profileData for backward compatibility
  const currentData = climateData || profileData || { localClimate: '' };
  const [selectedOption, setSelectedOption] = useState<string>(currentData.localClimate || '');

  // Update selectedOption when climate data changes
  useEffect(() => {
    setSelectedOption(currentData.localClimate || '');
  }, [currentData.localClimate]);

  // Handle option selection
  const handleOptionSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const optionId = e.target.value;
    console.log('DEBUG - ClimateSection - Selected climate option:', optionId);
    setSelectedOption(optionId);
    
    // Use handleNestedChange to update the localClimate field directly
    if (handleNestedChange) {
      handleNestedChange('localClimate', '', optionId);
      console.log('DEBUG - ClimateSection - Updated profile data with localClimate using handleNestedChange:', optionId);
    }
  };

  return (
    <>
      <SectionDivider>{climatePreferenceStepContent.profileSection.title}</SectionDivider>
      <FormGroup>
        <FormField 
          label={climatePreferenceStepContent.profileSection.localClimateLabel}
          htmlFor="localClimate"
        >
          <FormSelect
            id="localClimate"
            value={selectedOption}
            onChange={handleOptionSelect}
          >
            <option value="">Select climate</option>
            {climateOptionsWithDetails.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </FormSelect>
        </FormField>
      </FormGroup>
    </>
  );
};

export default ClimateSection;
