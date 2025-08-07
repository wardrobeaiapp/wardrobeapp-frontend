import React from 'react';
import { StepTitle, StepDescription } from '../../pages/OnboardingPage.styles';
import { styleOptionsWithDetails, stylePreferencesStepContent } from '../../data/onboardingOptions';
import {
  OptionsGrid,
  OptionCard,
  CardIcon,
  CardTextContent,
  CardLabel,
  CardDescription,
  FormSection,
  SliderContainer,
  SliderTitle,
  SliderInput,
  SliderLabels,
  SliderLabel,
  TextAreaContainer
} from './OnboardingCardComponents.styles';
import { SharedStyledTextArea as StyledTextArea } from './SharedOnboardingComponents.styles';

// Using the StyleOption interface from styleOptionsWithDetails in onboardingOptions.tsx

interface StylePreferencesStepProps {
  preferredStyles: string[];
  comfortVsStyleValue: number;
  classicVsTrendyValue: number;
  basicsVsStatementsValue: number;
  additionalStyleNotes: string;
  handleStyleToggle: (styleId: string) => void;
  handleComfortVsStyleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClassicVsTrendyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBasicsVsStatementsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAdditionalStyleNotesChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const StylePreferencesStep: React.FC<StylePreferencesStepProps> = ({
  preferredStyles,
  comfortVsStyleValue,
  classicVsTrendyValue,
  basicsVsStatementsValue,
  additionalStyleNotes,
  handleStyleToggle,
  handleComfortVsStyleChange,
  handleClassicVsTrendyChange,
  handleBasicsVsStatementsChange,
  handleAdditionalStyleNotesChange
}) => {
  // Using styleOptionsWithDetails from onboardingOptions.tsx

  return (
    <>
      <StepTitle>{stylePreferencesStepContent.title}</StepTitle>
      <StepDescription>
        {stylePreferencesStepContent.description}
      </StepDescription>
      
      <OptionsGrid style={{ marginTop: '20px' }}>
        {styleOptionsWithDetails.map(style => (
          <OptionCard
            key={style.id}
            $selected={preferredStyles.includes(style.id)}
            onClick={() => handleStyleToggle(style.id)}
          >
            <CardIcon style={{ backgroundColor: style.bgColor, color: style.iconColor }}>
              {style.icon}
            </CardIcon>
            <CardTextContent>
              <CardLabel>{style.label}</CardLabel>
              <CardDescription>{style.description}</CardDescription>
            </CardTextContent>
          </OptionCard>
        ))}
      </OptionsGrid>

      <FormSection>
        <StepDescription>
          {stylePreferencesStepContent.morePreferencesDescription}
        </StepDescription>

        <SliderContainer>
          <SliderTitle>{stylePreferencesStepContent.comfortVsStyleTitle}</SliderTitle>
          <SliderInput
            type="range"
            min="0"
            max="100"
            value={comfortVsStyleValue}
            onChange={handleComfortVsStyleChange}
          />
          <SliderLabels>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.comfort.left}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.comfort.middle}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.comfort.right}</SliderLabel>
          </SliderLabels>
        </SliderContainer>

        <SliderContainer>
          <SliderTitle>{stylePreferencesStepContent.classicVsTrendyTitle}</SliderTitle>
          <SliderInput
            type="range"
            min="0"
            max="100"
            value={classicVsTrendyValue}
            onChange={handleClassicVsTrendyChange}
          />
          <SliderLabels>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.classic.left}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.classic.middle}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.classic.right}</SliderLabel>
          </SliderLabels>
        </SliderContainer>

        <SliderContainer>
          <SliderTitle>{stylePreferencesStepContent.basicsVsStatementsTitle}</SliderTitle>
          <SliderInput
            type="range"
            min="0"
            max="100"
            value={basicsVsStatementsValue}
            onChange={handleBasicsVsStatementsChange}
          />
          <SliderLabels>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.basics.left}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.basics.middle}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.basics.right}</SliderLabel>
          </SliderLabels>
        </SliderContainer>

        <TextAreaContainer style={{ width: '100%' }}>
          <SliderTitle>{stylePreferencesStepContent.additionalNotesTitle}</SliderTitle>
          <StyledTextArea
            id="additionalStyleNotes"
            name="additionalStyleNotes"
            value={additionalStyleNotes}
            onChange={handleAdditionalStyleNotesChange}
            placeholder={stylePreferencesStepContent.additionalNotesPlaceholder}
            style={{ width: '100%' }}
          />
        </TextAreaContainer>
      </FormSection>
    </>
  );
};

export default StylePreferencesStep;
