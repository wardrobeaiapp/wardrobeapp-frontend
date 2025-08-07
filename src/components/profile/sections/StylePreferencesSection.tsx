import React from 'react';
import { useStyleProfile } from '../context/StyleProfileContext';
import {
  FormGroup,
  Label,
  Textarea,
  SliderContainer,
  SliderLabels,
  SliderLabel,
  RangeSlider,
  SectionDivider,
  StyleOptionsGrid,
  StyleOptionCard,
  StyleOptionIcon,
  StyleOptionLabel,
  StyledFieldset,
} from '../../../pages/ProfilePage.styles';
import { styleOptionsWithDetails, stylePreferencesStepContent } from '../../../data/onboardingOptions';
import { SectionProps } from './types';
import { StylePreferencesData } from '../../../types';

// Define a more specific props interface using StylePreferencesData
interface StylePreferencesSectionProps extends Omit<SectionProps, 'profileData'> {
  stylePreferencesData?: StylePreferencesData;
  profileData?: Partial<StylePreferencesData>; // Keep for backward compatibility
  showSaveButton?: boolean;
}

// Internal component that renders the form fields
const StylePreferencesFormContent: React.FC<StylePreferencesSectionProps & { onSectionSave?: () => void }> = ({
  stylePreferencesData,
  profileData,
  handleNestedChange,
  handleCheckboxChange,
  onSectionSave
}) => {
  // Use stylePreferencesData if provided, otherwise fall back to profileData
  const data = stylePreferencesData || profileData || { preferredStyles: [], stylePreferences: { comfortVsStyle: 50, classicVsTrendy: 50, basicsVsStatements: 50, additionalNotes: '' } };
  return (
    <>
      <SectionDivider>{stylePreferencesStepContent.profileSection.title}</SectionDivider>
      <FormGroup>
        <StyledFieldset>
          <legend>{stylePreferencesStepContent.profileSection.selectStylesLabel}</legend>
          
          <StyleOptionsGrid>
          {styleOptionsWithDetails.map(style => {
            // Ensure preferredStyles is always an array
            const preferredStyles = Array.isArray(data.preferredStyles) ? 
              data.preferredStyles : [];
            
            // Check if this style is selected
            const isSelected = preferredStyles.includes(style.id);
            
            return (
              <StyleOptionCard
                key={style.id}
                $selected={isSelected}
                onClick={() => {
                  // Use handleCheckboxChange instead of handleNestedChange
                  // This ensures proper state management in the wrapper
                  if (handleCheckboxChange) {
                    // Pass the style.id as the value to toggle
                    handleCheckboxChange('preferredStyles', style.id);
                    console.log('StylePreferencesSection - Style selected:', style.id);
                  } else {
                    console.error('ERROR: handleCheckboxChange is not available!');
                  }
                }}
              >
              <StyleOptionIcon style={{ backgroundColor: style.bgColor, color: style.iconColor }}>
                {style.icon}
              </StyleOptionIcon>
              <StyleOptionLabel>{style.label}</StyleOptionLabel>
            </StyleOptionCard>
          );
          })}
        </StyleOptionsGrid>
        </StyledFieldset>
        
        <StyledFieldset style={{ marginTop: '20px' }}>
          <legend>{stylePreferencesStepContent.profileSection.preferencesLabel}</legend>
        
        <SliderContainer>
          <Label htmlFor="comfortVsStyleSlider">{stylePreferencesStepContent.profileSection.comfortVsStyleLabel}</Label>
          <SliderLabels>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.comfort.left}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.comfort.middle}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.comfort.right}</SliderLabel>
          </SliderLabels>
          <RangeSlider
            type="range"
            min="0"
            max="100"
            value={data.stylePreferences?.comfortVsStyle || 50}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              // Use handleNestedChange for immediate state update
              handleNestedChange?.('stylePreferences', 'comfortVsStyle', parseInt(e.target.value));
              console.log('StylePreferencesSection - comfortVsStyle changed to:', parseInt(e.target.value));
            }}
          />
        </SliderContainer>

        <SliderContainer>
          <Label htmlFor="classicVsTrendySlider">{stylePreferencesStepContent.profileSection.classicVsTrendyLabel}</Label>
          <SliderLabels>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.classic.left}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.classic.middle}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.classic.right}</SliderLabel>
          </SliderLabels>
          <RangeSlider
            id="classicVsTrendySlider"
            type="range"
            min="0"
            max="100"
            value={data.stylePreferences?.classicVsTrendy || 50}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              // Use handleNestedChange for immediate state update
              handleNestedChange?.('stylePreferences', 'classicVsTrendy', parseInt(e.target.value));
              console.log('StylePreferencesSection - classicVsTrendy changed to:', parseInt(e.target.value));
            }}
          />
        </SliderContainer>

        <SliderContainer>
          <Label htmlFor="basicsVsStatementsSlider">{stylePreferencesStepContent.profileSection.basicsVsStatementsLabel}</Label>
          <SliderLabels>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.basics.left}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.basics.middle}</SliderLabel>
            <SliderLabel>{stylePreferencesStepContent.sliderLabels.basics.right}</SliderLabel>
          </SliderLabels>
          <RangeSlider
            id="basicsVsStatementsSlider"
            type="range"
            min="0"
            max="100"
            value={data.stylePreferences?.basicsVsStatements || 50}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              // Use handleNestedChange for immediate state update
              handleNestedChange?.('stylePreferences', 'basicsVsStatements', parseInt(e.target.value));
              console.log('StylePreferencesSection - basicsVsStatements changed to:', parseInt(e.target.value));
            }}
          />
        </SliderContainer>
        </StyledFieldset>

        <FormGroup>
          <Label htmlFor="additionalStyleNotes">{stylePreferencesStepContent.profileSection.additionalNotesLabel}</Label>
          <Textarea
            id="additionalStyleNotes"
            value={data.stylePreferences?.additionalNotes || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              // Use handleNestedChange for immediate state update
              handleNestedChange?.('stylePreferences', 'additionalNotes', e.target.value);
              console.log('StylePreferencesSection - additionalNotes changed to:', e.target.value);
            }}
            placeholder={stylePreferencesStepContent.profileSection.additionalNotesPlaceholder}
          />
        </FormGroup>
      </FormGroup>

      {/* Debug display - Comment out or remove in production */}
      <div style={{ 
        margin: '20px 0', 
        padding: '10px', 
        border: '1px solid #ccc', 
        borderRadius: '4px',
        backgroundColor: '#f5f5f5',
        fontSize: '12px',
        display: 'none' // Set to 'block' to show debug info
      }}>
        <h4>Debug: Current Style Preferences Data</h4>
        <pre>{JSON.stringify({
          preferredStyles: data.preferredStyles,
          stylePreferences: data.stylePreferences
        }, null, 2)}</pre>
      </div>
      
      {/* Section-specific save button removed to avoid duplication with parent component */}
    </>
  );
};

// Wrapper component that adds section-specific save functionality
const StylePreferencesSection: React.FC<StylePreferencesSectionProps> = (props) => {
  // Use stylePreferencesData if provided, otherwise fall back to profileData
  const data = props.stylePreferencesData || props.profileData || { 
    preferredStyles: [], 
    stylePreferences: { 
      comfortVsStyle: 50, 
      classicVsTrendy: 50, 
      basicsVsStatements: 50, 
      additionalNotes: '' 
    } 
  };
  
  // Get handleSave from context (only if available)
  const context = useStyleProfile();
  const handleSave = context?.handleSave;
  
  // Handle section-specific save
  const handleSectionSave = () => {
    console.log('Saving style preferences section specifically');
    console.log('Current preferredStyles before save:', data.preferredStyles);
    console.log('Current stylePreferences before save:', data.stylePreferences);
    
    // Verify the data is properly structured before saving
    if (!Array.isArray(data.preferredStyles)) {
      console.error('ERROR: preferredStyles is not an array before save!');
    }
    
    // Log the entire profile data for debugging
    console.log('Full profile data before save:', JSON.stringify({
      preferredStyles: data.preferredStyles,
      stylePreferences: data.stylePreferences
    }, null, 2));
    
    // Add a debug log to track when handleSave is called
    if (handleSave) {
      console.log('Calling handleSave with section: stylePreferences');
      handleSave('stylePreferences');
      console.log('handleSave called');
    } else {
      console.log('No handleSave available - using wrapper save functionality');
    }
  };
  
  return <StylePreferencesFormContent {...props} onSectionSave={handleSectionSave} />;
};

export default StylePreferencesSection;
