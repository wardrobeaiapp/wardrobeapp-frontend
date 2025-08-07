import React from 'react';
import {
  StepTitle,
  StepDescription,
} from '../../pages/OnboardingPage.styles';
import {
  OptionsGrid,
  OptionCard,
  CardIcon,
  CardTextContent,
  CardLabel,
  CardDescription
} from './OnboardingCardComponents.styles';
import { climateOptionsWithDetails, climatePreferenceStepContent } from '../../data/onboardingOptions';

interface ClimatePreferenceStepProps {
  climatePreference: string;
  handleClimatePreferenceSelect: (climate: string) => void;
}

const ClimatePreferenceStep: React.FC<ClimatePreferenceStepProps> = ({
  climatePreference,
  handleClimatePreferenceSelect
}) => {
  // Using climate options with details from central data file

  return (
    <>
      <StepTitle>{climatePreferenceStepContent.title}</StepTitle>
      <StepDescription>
        {climatePreferenceStepContent.description}
      </StepDescription>
      <OptionsGrid>
        {climateOptionsWithDetails.map(option => (
          <OptionCard
            key={option.id}
            $selected={climatePreference === option.id}
            onClick={() => handleClimatePreferenceSelect(option.id)}
          >
            <CardIcon style={{ backgroundColor: option.bgColor, color: option.iconColor }}>
              <option.icon />
            </CardIcon>
            <CardTextContent>
              <CardLabel>{option.label}</CardLabel>
              <CardDescription>{option.description}</CardDescription>
            </CardTextContent>
          </OptionCard>
        ))}
      </OptionsGrid>
    </>
  );
};

export default ClimatePreferenceStep;
