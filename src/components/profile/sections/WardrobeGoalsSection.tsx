import React, { useMemo, useEffect, useRef } from 'react';
import {
  FormGroup,
  Label,
  Textarea,
  Checkbox,
  CheckboxLabel,
  SectionDivider,
  ButtonContainer,
  SectionSaveButton
} from '../../../pages/ProfilePage.styles';
import { SectionProps } from './types';
import { WardrobeGoalsData } from '../../../types';
import { wardrobeGoalOptionsWithDetails, wardrobeGoalsStepContent } from '../../../data/onboardingOptions';
import { useStyleProfile } from '../context/StyleProfileContext';

// Define a more specific props interface using WardrobeGoalsData
interface WardrobeGoalsSectionProps extends Omit<SectionProps, 'profileData'> {
  profileData: Partial<WardrobeGoalsData>;
}

const WardrobeGoalsSection: React.FC<WardrobeGoalsSectionProps> = ({
  // Component props
  profileData,
  setProfileData,
  handleCheckboxChange,
  handleNestedChange
}) => {
  // Using wardrobe goal options from centralized data source
  
  // Get the standard wardrobe goal IDs from the options
  const standardWardrobeGoalIds = useMemo(() => {
    return wardrobeGoalOptionsWithDetails.map(option => option.id);
  }, []);
  
  // Find any custom goals (not in standard options)
  const customWardrobeGoals = useMemo(() => {
    return Array.isArray(profileData.wardrobeGoals) ? 
      profileData.wardrobeGoals.filter(goal => 
        !standardWardrobeGoalIds.includes(goal) && goal !== 'other'
      ) : [];
  }, [profileData.wardrobeGoals, standardWardrobeGoalIds]);
  
  // Debug logging
  console.log('WardrobeGoalsSection - customWardrobeGoals:', customWardrobeGoals);
  console.log('WardrobeGoalsSection - otherWardrobeGoal:', profileData.otherWardrobeGoal);
  console.log('WardrobeGoalsSection - otherWardrobeGoal type:', typeof profileData.otherWardrobeGoal);
  console.log('WardrobeGoalsSection - otherWardrobeGoal empty check:', profileData.otherWardrobeGoal === '');
  
  // Debug logging for custom goals
  console.log('WardrobeGoalsSection - custom goals found:', customWardrobeGoals.length > 0);
  
  // Store the previous otherWardrobeGoal value when unchecking
  const savedOtherGoalRef = useRef<string>('');
  
  // Determine if the 'other' option should be checked
  const hasOtherWardrobeGoalText = useMemo(() => {
    return typeof profileData.otherWardrobeGoal === 'string' && 
           profileData.otherWardrobeGoal.trim() !== '';
  }, [profileData.otherWardrobeGoal]);

  // Ensure wardrobeGoals is always an array
  const wardrobeGoals = useMemo(() => {
    return Array.isArray(profileData.wardrobeGoals) ? 
      profileData.wardrobeGoals : 
      (profileData.wardrobeGoals ? [profileData.wardrobeGoals] : []);
  }, [profileData.wardrobeGoals]);
  
  // Sync 'other' in wardrobeGoals if there's text in otherWardrobeGoal on component mount
  useEffect(() => {
    // If there's text in otherWardrobeGoal but 'other' is not in wardrobeGoals
    if (hasOtherWardrobeGoalText && !wardrobeGoals.includes('other') && handleCheckboxChange) {
      console.log('Adding "other" to wardrobeGoals on mount due to existing otherWardrobeGoal text');
      
      // Add 'other' to wardrobeGoals
      handleCheckboxChange('wardrobeGoals', 'other');
    }
  // We include all dependencies to satisfy the linting rule
  // This will run when any of these values change, but the logic inside
  // ensures it only has an effect when needed
  }, [hasOtherWardrobeGoalText, wardrobeGoals, handleCheckboxChange]);
  
  // Clean up custom goals when component mounts or profileData changes
  useEffect(() => {
    // Only proceed if we have the ability to update profile data
    if (setProfileData) {
      // This function ensures we have a clean array of wardrobe goals with no duplicates
      const getCleanWardrobeGoals = () => {
        if (!profileData.wardrobeGoals || !Array.isArray(profileData.wardrobeGoals)) {
          return [];
        }
        
        // Keep only standard goals (including 'other')
        const standardGoals = profileData.wardrobeGoals.filter(goal => 
          standardWardrobeGoalIds.includes(goal) || goal === 'other'
        );
        
        // Start with standard goals
        const cleanGoals = [...standardGoals];
        
        // Add the custom goal if 'other' is checked and there's text
        if (profileData.wardrobeGoals.includes('other') && 
            profileData.otherWardrobeGoal && 
            profileData.otherWardrobeGoal.trim()) {
          cleanGoals.push(profileData.otherWardrobeGoal.trim());
        }
        
        return cleanGoals;
      };

      const cleanGoals = getCleanWardrobeGoals();
      
      // Only update if the cleaned goals are different from current goals
      if (JSON.stringify(cleanGoals) !== JSON.stringify(profileData.wardrobeGoals)) {
        console.log('Cleaning up wardrobe goals:', {
          before: profileData.wardrobeGoals,
          after: cleanGoals
        });
        
        setProfileData(prevData => ({
          ...prevData,
          wardrobeGoals: cleanGoals
        }));
      }
    }
  }, [profileData, setProfileData, standardWardrobeGoalIds]);

  // Get handleSave from context
  const { handleSave } = useStyleProfile();
  
  // Handle section-specific save
  const handleSectionSave = () => {
    console.log('Saving wardrobe goals section specifically');
    console.log('Current wardrobe goals before save:', profileData.wardrobeGoals);
    console.log('Current otherWardrobeGoal before save:', profileData.otherWardrobeGoal);
    
    // Verify the data is properly structured before saving
    if (!Array.isArray(profileData.wardrobeGoals)) {
      console.error('ERROR: wardrobeGoals is not an array before save!');
    }
    
    // Log the entire profile data for debugging
    console.log('Full profile data before save:', JSON.stringify({
      ...profileData,
      wardrobeGoals: profileData.wardrobeGoals,
      otherWardrobeGoal: profileData.otherWardrobeGoal
    }, null, 2));
    
    // Add a debug log to track when handleSave is called
    console.log('Calling handleSave with section: wardrobeGoals');
    handleSave('wardrobeGoals');
    console.log('handleSave called');
  };
  
  return (
    <>
      <SectionDivider>{wardrobeGoalsStepContent.profileSection.title}</SectionDivider>
      <FormGroup>
        <Label>{wardrobeGoalsStepContent.profileSection.mainGoalLabel}</Label>
        {wardrobeGoalOptionsWithDetails.map(option => (
          <div key={option.id}>
            <Checkbox
              id={`goal-${option.id}`}
              type="checkbox"
              checked={profileData.wardrobeGoals?.includes(option.id) || false}
              onChange={() => {
                // If this is the 'other' option
                if (option.id === 'other') {
                  // If it's currently checked (about to be unchecked)
                  if (profileData.wardrobeGoals?.includes('other')) {
                    console.log('Unchecking "other" and saving current otherWardrobeGoal value');
                    
                    // Save the current value for future use
                    if (typeof profileData.otherWardrobeGoal === 'string') {
                      savedOtherGoalRef.current = profileData.otherWardrobeGoal;
                    }
                    
                    // Clear the textarea value
                    if (handleNestedChange) {
                      handleNestedChange('otherWardrobeGoal', '', '');
                    }
                    
                    // Use the standard handler to uncheck 'other'
                    if (handleCheckboxChange) {
                      handleCheckboxChange('wardrobeGoals', 'other');
                    }
                    
                    // Remove any custom goals
                    if (setProfileData) {
                      setProfileData(prevData => {
                        // Keep only standard goals (excluding any custom goals)
                        const standardGoals = prevData.wardrobeGoals.filter(goal => 
                          standardWardrobeGoalIds.includes(goal)
                        );
                        return {
                          ...prevData,
                          wardrobeGoals: standardGoals
                        };
                      });
                    }
                  } else {
                    // It's currently unchecked (about to be checked)
                    if (handleCheckboxChange) {
                      handleCheckboxChange('wardrobeGoals', 'other');
                      
                      // Restore the saved value if it exists
                      if (savedOtherGoalRef.current && handleNestedChange) {
                        console.log('Restoring saved otherWardrobeGoal value:', savedOtherGoalRef.current);
                        handleNestedChange('otherWardrobeGoal', '', savedOtherGoalRef.current);
                        
                        // Clean up any existing custom goals and add only the current one
                        if (setProfileData) {
                          setProfileData(prevData => {
                            // Keep only standard goals including 'other'
                            const standardGoals = prevData.wardrobeGoals.filter(goal => 
                              standardWardrobeGoalIds.includes(goal) || goal === 'other'
                            );
                            
                            // Add the restored custom goal
                            const updatedGoals = [...standardGoals];
                            if (savedOtherGoalRef.current.trim()) {
                              updatedGoals.push(savedOtherGoalRef.current.trim());
                            }
                            
                            return {
                              ...prevData,
                              wardrobeGoals: updatedGoals
                            };
                          });
                        }
                      }
                    }
                  }
                } else {
                  // For all other options, just use the standard handler
                  if (handleCheckboxChange) {
                    console.log(`Toggling standard wardrobe goal: ${option.id}`);
                    console.log('Current wardrobe goals before change:', profileData.wardrobeGoals);
                    
                    // Check if the goal is being added or removed
                    const isAdding = !profileData.wardrobeGoals?.includes(option.id);
                    console.log(`${isAdding ? 'Adding' : 'Removing'} goal: ${option.id}`);
                    
                    // Use the original handler but add logging
                    handleCheckboxChange('wardrobeGoals', option.id);
                    
                    // Add a debug log to track the change
                    console.log(`Checkbox change for ${option.id} processed`);
                  }
                }
              }}
            />
            <CheckboxLabel htmlFor={`goal-${option.id}`}>{option.label}</CheckboxLabel>
          </div>
        ))}
      </FormGroup>

      {profileData.wardrobeGoals?.includes('other') && (
        <FormGroup>
          <Label htmlFor="otherWardrobeGoal">{wardrobeGoalsStepContent.profileSection.otherGoalLabel}</Label>
          <Textarea
            id="otherWardrobeGoal"
            value={profileData.otherWardrobeGoal || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              const newValue = e.target.value;
              
              // First, update the otherWardrobeGoal value
              handleNestedChange?.('otherWardrobeGoal', '', newValue);
              
              // The useEffect will automatically clean up the goals
              // No need to manually update wardrobeGoals here
            }}
            placeholder={wardrobeGoalsStepContent.profileSection.otherGoalPlaceholder}
          />
        </FormGroup>
      )}
      
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
        <h4>Debug: Current Wardrobe Goals Data</h4>
        <pre>{JSON.stringify({
          wardrobeGoals: profileData.wardrobeGoals,
          otherWardrobeGoal: profileData.otherWardrobeGoal
        }, null, 2)}</pre>
      </div>
      
      {/* Section-specific save button */}
      <ButtonContainer>
        <SectionSaveButton onClick={handleSectionSave}>
          Save Wardrobe Goals
        </SectionSaveButton>
      </ButtonContainer>
    </>
  );
};

export default WardrobeGoalsSection;
