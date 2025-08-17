import React, { useMemo, useEffect, useRef } from 'react';
import {
  FormGroup,
  Label,
  Textarea,
  Checkbox,
  CheckboxLabel,
  SectionDivider,
  ButtonContainer,
} from '../../../../pages/ProfilePage.styles';
import { SectionProps } from './types';
import { WardrobeGoalsData } from '../../../../types';
import { wardrobeGoalOptionsWithDetails, wardrobeGoalsStepContent } from '../../../../data/onboardingOptions';
import { useStyleProfile } from '../context/StyleProfileContext';
import Button from '../../../common/Button';

// Define a more specific props interface using WardrobeGoalsData
interface WardrobeGoalsSectionProps extends Omit<SectionProps, 'profileData'> {
  profileData?: Partial<WardrobeGoalsData>; // Fallback for backward compatibility
  wardrobeGoalsData?: WardrobeGoalsData; // New direct data prop
  showSaveButton?: boolean; // Control save button visibility
}

const WardrobeGoalsSection: React.FC<WardrobeGoalsSectionProps> = ({
  // Component props
  profileData,
  wardrobeGoalsData,
  setProfileData,
  handleCheckboxChange,
  showSaveButton = true
}) => {
  // Use wardrobeGoalsData if provided, otherwise fall back to profileData
  const data = useMemo(() => wardrobeGoalsData || profileData || {}, [wardrobeGoalsData, profileData]);
  
  // Get context hook at component top level
  const { handleSave } = useStyleProfile();
  
  // Get the standard wardrobe goal IDs from the options
  const standardWardrobeGoalIds = useMemo(() => {
    return wardrobeGoalOptionsWithDetails.map(option => option.id);
  }, []);
  
  // Find any custom goals (not in standard options)
  const customWardrobeGoals = useMemo(() => {
    return Array.isArray(data.wardrobeGoals) ? 
      data.wardrobeGoals.filter(goal => 
        !standardWardrobeGoalIds.includes(goal) && goal !== 'other'
      ) : [];
  }, [data.wardrobeGoals, standardWardrobeGoalIds]);
  
  // Store the previous otherWardrobeGoal value when unchecking
  const savedOtherGoalRef = useRef<string>('');
  
  // Note: Removed auto-sync useEffect that was preventing manual unchecking of 'Other' checkbox
  // The checkbox state is now fully controlled by user interactions

  // Clean up custom goals when component mounts or data changes
  useEffect(() => {
    const cleanUpCustomGoals = () => {
      console.log('WardrobeGoalsSection - Clean up custom goals - wardrobeGoals:', data.wardrobeGoals);
      
      if (setProfileData && profileData) {
        if (!data.wardrobeGoals || !Array.isArray(data.wardrobeGoals)) {
          return;
        }

        const standardGoals = data.wardrobeGoals.filter(goal =>
          standardWardrobeGoalIds.includes(goal) || goal === 'other'
        );
        
        const cleanGoals = [...standardGoals];
        
        if (data.wardrobeGoals.includes('other') && 
            data.otherWardrobeGoal && 
            data.otherWardrobeGoal.trim()) {
          cleanGoals.push(data.otherWardrobeGoal.trim());
        }

        customWardrobeGoals.forEach(goal => {
          if (!cleanGoals.includes(goal)) {
            cleanGoals.push(goal);
          }
        });

        if (JSON.stringify(cleanGoals) !== JSON.stringify(data.wardrobeGoals)) {
          console.log('WardrobeGoalsSection - Cleaning wardrobe goals:', {
            before: data.wardrobeGoals,
            after: cleanGoals
          });
          
          setProfileData({
            ...profileData,
            ...data,
            wardrobeGoals: cleanGoals,
            otherWardrobeGoal: data.otherWardrobeGoal
          } as any);
        }
      }
    };
    
    cleanUpCustomGoals();
  }, [data, setProfileData, profileData, standardWardrobeGoalIds, customWardrobeGoals]);

  const handleSaveSection = () => {
    console.log('Current wardrobe goals before save:', data.wardrobeGoals);
    console.log('Current otherWardrobeGoal before save:', data.otherWardrobeGoal);
    
    if (handleSave) {
      handleSave('wardrobeGoals');
    }
  };

  return (
    <>
      <SectionDivider>{wardrobeGoalsStepContent.profileSection.title}</SectionDivider>
      <FormGroup>
        <Label>What are your main wardrobe goals? (Select all that apply)</Label>
        {wardrobeGoalOptionsWithDetails.map((option) => (
          <div key={option.id}>
            <CheckboxLabel>
              <Checkbox
                type="checkbox"
                checked={data.wardrobeGoals?.includes(option.id) || false}
                onChange={() => {
                  if (option.id === 'other') {
                    if (data.wardrobeGoals?.includes('other')) {
                      // User is unchecking 'other' - clear the textarea text
                      savedOtherGoalRef.current = typeof data.otherWardrobeGoal === 'string' ? data.otherWardrobeGoal : '';
                      
                      // Clear the textarea text when unchecking
                      if (setProfileData) {
                        const baseData = profileData || data;
                        const updatedData = {
                          ...baseData,
                          wardrobeGoals: data.wardrobeGoals,
                          otherWardrobeGoal: ''
                        } as any;
                        setProfileData(updatedData);
                      }
                    } else {
                      // User is checking 'other' - save current text and focus textarea
                      if (typeof data.otherWardrobeGoal === 'string') {
                        savedOtherGoalRef.current = data.otherWardrobeGoal;
                      }
                      
                      setTimeout(() => {
                        const textareaElement = document.querySelector('textarea[placeholder*="other wardrobe goal"]') as HTMLTextAreaElement;
                        if (textareaElement) {
                          textareaElement.focus();
                        }
                      }, 0);
                    }
                  }
                  
                  if (handleCheckboxChange) {
                    handleCheckboxChange('wardrobeGoals', option.id);
                  }
                }}
              />
              {option.label}
            </CheckboxLabel>
            {option.description && (
              <div style={{
                fontSize: '0.875rem',
                color: '#6B7280',
                marginLeft: '1.5rem',
                marginTop: '0.25rem',
                marginBottom: '0.5rem'
              }}>
                {option.description}
              </div>
            )}
          </div>
        ))}
        
        {/* Custom goals display */}
        {customWardrobeGoals.length > 0 && (
          <div style={{ marginTop: '0.5rem' }}>
            {customWardrobeGoals.map((goal, index) => (
              <CheckboxLabel key={`custom-goal-${index}`}>
                <Checkbox
                  type="checkbox"
                  checked={true}
                  onChange={() => {
                    console.log('Current wardrobe goals before change:', data.wardrobeGoals);
                    
                    const isAdding = !data.wardrobeGoals?.includes(goal);
                    console.log('Custom goal toggle:', { goal, isAdding });
                    
                    if (handleCheckboxChange) {
                      handleCheckboxChange('wardrobeGoals', goal);
                    }
                  }}
                />
                {goal} (Custom)
              </CheckboxLabel>
            ))}
          </div>
        )}
      </FormGroup>
      
      {data.wardrobeGoals?.includes('other') && (
        <FormGroup>
          <Label htmlFor="otherWardrobeGoal">Please specify your other wardrobe goal:</Label>
          <Textarea
            id="otherWardrobeGoal"
            value={data.otherWardrobeGoal || ''}
            onChange={(e) => {
              if (setProfileData) {
                // Handle both modular (wardrobeGoalsData) and legacy (profileData) approaches
                const baseData = profileData || data;
                const updatedData = {
                  ...baseData,
                  wardrobeGoals: data.wardrobeGoals,
                  otherWardrobeGoal: e.target.value
                } as any;
                
                console.log('WardrobeGoalsSection - otherWardrobeGoal changed:', {
                  value: e.target.value,
                  updatedData
                });
                
                setProfileData(updatedData);
              }
            }}
            placeholder="Describe your other wardrobe goal..."
            rows={3}
          />
        </FormGroup>
      )}

      <SectionDivider />
      
      {showSaveButton && (
        <ButtonContainer>
          <Button
            onClick={handleSaveSection}
          >
            Save Wardrobe Goals
          </Button>
        </ButtonContainer>
      )}
    </>
  );
};

export default WardrobeGoalsSection;
