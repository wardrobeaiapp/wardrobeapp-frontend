import React, { useMemo, useEffect, useRef } from 'react';
import { FormGroup, SectionDivider, ButtonContainer } from '../../../../pages/ProfilePage.styles';
import Button from '../../../common/Button';
import { SectionProps } from './types';
import { WardrobeGoalsData } from '../../../../types';
import { wardrobeGoalOptionsWithDetails, wardrobeGoalsStepContent } from '../../../../data/onboardingOptions';
import { useStyleProfile } from '../context/StyleProfileContext';
import { FormField, Checkbox } from '../../../../components/common/Form';

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

  const onCheckboxChange = (optionId: string) => {
    if (optionId === 'other') {
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
      handleCheckboxChange('wardrobeGoals', optionId);
    }
  };

  return (
    <>
      <SectionDivider>{wardrobeGoalsStepContent.profileSection.title}</SectionDivider>
      <FormGroup>
        <FormField label="What are your main wardrobe goals? (Select all that apply)">
          {wardrobeGoalOptionsWithDetails.map((option) => (
            <div key={option.id} style={{ marginBottom: option.description ? '0.5rem' : '0.25rem' }}>
              <Checkbox
                label={option.label}
                checked={data.wardrobeGoals?.includes(option.id) || false}
                onChange={() => onCheckboxChange(option.id)}
              />
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
            <div style={{ marginTop: '0.75rem' }}>
              {customWardrobeGoals.map((goal, index) => (
                <div key={`custom-goal-${index}`} style={{ marginBottom: '0.25rem' }}>
                  <Checkbox
                    label={`${goal} (Custom)`}
                    checked={true}
                    onChange={() => {
                      console.log('Current wardrobe goals before change:', data.wardrobeGoals);
                      if (handleCheckboxChange) {
onCheckboxChange(goal);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </FormField>
      </FormGroup>
      
      {data.wardrobeGoals?.includes('other') && (
        <FormField 
          label="Please specify your other wardrobe goal"
          htmlFor="otherWardrobeGoal"
        >
          <textarea
            id="otherWardrobeGoal"
            value={data.otherWardrobeGoal || ''}
            onChange={(e) => {
              if (setProfileData) {
                const baseData = profileData || data;
                setProfileData({
                  ...baseData,
                  otherWardrobeGoal: e.target.value
                } as any);
              }
            }}
            placeholder="Describe your other wardrobe goal..."
            rows={3}
          />
        </FormField>
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
