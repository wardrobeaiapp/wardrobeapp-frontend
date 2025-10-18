import React from 'react';
import { OnboardingStateHook } from './useOnboardingState';
import { validateFrequency } from '../../utils/frequencyValidation';

/**
 * Custom hook to create event adapter functions for the onboarding state
 * These adapters convert React event objects to the direct values expected by the onboarding state hook
 */
export const useOnboardingEventAdapters = (onboardingState: OnboardingStateHook) => {
  const {
    // dailyActivities removed to fix ESLint warning
    handleDailyActivityToggle,
    setOfficeDressCode,
    setRemoteWorkPriority,
    setCreativeMobility,
    setUniformPreference,
    setStudentDressCode,
    handleHomeActivityToggle,
    handleOtherActivityDescriptionChange,
    setOutdoorFrequency,
    setOutdoorPeriod,
    setSocialFrequency,
    setSocialPeriod,
    setTravelFrequency,
    handleOtherLeisureActivityDescriptionChange,
    setComfortVsStyleValue,
    setClassicVsTrendyValue,
    setBasicsVsStatementsValue,
    // setAdditionalStyleNotes and handleOtherWardrobeGoalDescriptionChange removed to fix ESLint warnings
    setHasShoppingLimit,
    handleShoppingLimitAmountChange,
    handleClothingBudgetAmountChange,
  } = onboardingState;

  // Event adapter functions for handlers that expect direct values
  const handleActivityToggle = (activityId: string) => {
    console.log('handleActivityToggle called with:', activityId);
    
    // Simplified handling for all activities including 'other'
    // This matches the pattern used in Leisure Activities
    handleDailyActivityToggle(activityId);
  };

  // Event adapters for text inputs and textareas
  const handleOtherActivityDescriptionInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleOtherActivityDescriptionChange(e.target.value);
  };

  const handleOtherLeisureActivityDescriptionInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleOtherLeisureActivityDescriptionChange(e.target.value);
  };
  
  // handleOtherWardrobeGoalChange removed to fix ESLint warning
  
  // handleAdditionalStyleNotesChange removed to fix ESLint warning
  
  // Event adapters for select inputs
  const handleDressCodeSelect = (value: string) => {
    console.log('DEBUG - handleDressCodeSelect called with value:', value);
    console.log('DEBUG - officeDressCode BEFORE setting (current state):', onboardingState.officeDressCode);
    
    // Force update using a direct approach
    try {
      // Call the setter function
      setOfficeDressCode(value);
      console.log('DEBUG - setOfficeDressCode called with:', value);
      
      // Also directly update the onboardingState object for immediate use
      // This won't affect React's rendering but will make the value available in the object
      (onboardingState as any).officeDressCode = value;
      console.log('DEBUG - Also directly set onboardingState.officeDressCode to:', value);
    } catch (error) {
      console.error('ERROR updating officeDressCode:', error);
    }
    
    // Note: React state updates are asynchronous, so this will show the previous value, not the new one
    // The state will be updated correctly for the next render cycle
    console.log('DEBUG - State update scheduled, will be applied in next render cycle');
    
    // Add a timeout to check if the state was updated after the render cycle
    setTimeout(() => {
      console.log('DEBUG - officeDressCode AFTER timeout (should be updated):', onboardingState.officeDressCode);
      // Log the entire onboardingState to see what's happening
      console.log('DEBUG - Full onboardingState after timeout:', JSON.stringify({
        dailyActivities: onboardingState.dailyActivities,
        officeDressCode: onboardingState.officeDressCode,
        // Add other relevant fields as needed
      }, null, 2));
    }, 100);
  };
  
  const handleRemoteWorkPrioritySelect = (value: string) => {
    setRemoteWorkPriority(value);
  };
  
  const handleCreativeMobilitySelect = (value: string) => {
    setCreativeMobility(value);
  };
  
  const handleUniformPreferenceSelect = (preference: string) => {
    console.log('DEBUG - handleUniformPreferenceSelect called with value:', preference);
    console.log('DEBUG - uniformPreference BEFORE setting (current state):', onboardingState.uniformPreference);
    
    // Force update using a direct approach
    try {
      // Call the setter function
      setUniformPreference(preference);
      console.log('DEBUG - setUniformPreference called with:', preference);
      
      // Also directly update the onboardingState object for immediate use
      // This won't affect React's rendering but will make the value available in the object
      (onboardingState as any).uniformPreference = preference;
      console.log('DEBUG - Also directly set onboardingState.uniformPreference to:', preference);
    } catch (error) {
      console.error('ERROR updating uniformPreference:', error);
    }
    
    // Note: React state updates are asynchronous, so this will show the previous value, not the new one
    // The state will be updated correctly for the next render cycle
    console.log('DEBUG - State update scheduled, will be applied in next render cycle');
    
    // Add a timeout to check if the state was updated after the render cycle
    setTimeout(() => {
      console.log('DEBUG - uniformPreference AFTER timeout (should be updated):', onboardingState.uniformPreference);
      // Log the entire onboardingState to see what's happening
      console.log('DEBUG - Full onboardingState after timeout:', JSON.stringify({
        dailyActivities: onboardingState.dailyActivities,
        uniformPreference: onboardingState.uniformPreference,
        // Add other relevant fields as needed
      }, null, 2));
    }, 100);
  };
  
  const handleStudentDressCodeSelect = (value: string) => {
    setStudentDressCode(value);
  };
  
  // Event adapters for number inputs with validation
  const handleOutdoorFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      const validatedValue = validateFrequency(value, onboardingState.outdoorPeriod);
      setOutdoorFrequency(validatedValue);
    }
  };
  
  const handleOutdoorPeriodChange = (value: string) => {
    setOutdoorPeriod(value);
    // Validate current frequency against new period limits
    const validatedFrequency = validateFrequency(onboardingState.outdoorFrequency, value);
    if (validatedFrequency !== onboardingState.outdoorFrequency) {
      setOutdoorFrequency(validatedFrequency);
    }
  };
  
  const handleSocialFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      const validatedValue = validateFrequency(value, onboardingState.socialPeriod);
      setSocialFrequency(validatedValue);
    }
  };
  
  const handleSocialPeriodChange = (value: string) => {
    setSocialPeriod(value);
    // Validate current frequency against new period limits
    const validatedFrequency = validateFrequency(onboardingState.socialFrequency, value);
    if (validatedFrequency !== onboardingState.socialFrequency) {
      setSocialFrequency(validatedFrequency);
    }
  };
  
  
  const handleTravelFrequencyChange = (value: string) => {
    setTravelFrequency(value);
  };
  
  // Event adapters for slider inputs with validation
  const handleComfortVsStyleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setComfortVsStyleValue(value);
    }
  };
  
  const handleClassicVsTrendyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setClassicVsTrendyValue(value);
    }
  };
  
  const handleBasicsVsStatementsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      setBasicsVsStatementsValue(value);
    }
  };
  
  // Event adapters for shopping limit and budget
  const handleShoppingLimitToggle = (value: boolean) => {
    setHasShoppingLimit(value);
  };
  
  // Event adapters for number inputs with validation
  const handleShoppingLimitAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      handleShoppingLimitAmountChange(value);
    }
  };
  
  const handleClothingBudgetAmountInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      handleClothingBudgetAmountChange(value);
    }
  };

  return {
    // Daily activities
    handleActivityToggle,
    handleDressCodeSelect,
    handleRemoteWorkPrioritySelect,
    handleCreativeMobilitySelect,
    handleUniformPreferenceSelect,
    handleStudentDressCodeSelect,
    handleHomeActivityToggle,
    handleOtherActivityDescriptionChange: handleOtherActivityDescriptionInputChange,
    
    // Leisure activities
    handleLeisureActivityToggle: handleActivityToggle,
    handleOtherLeisureActivityDescriptionChange: handleOtherLeisureActivityDescriptionInputChange,
    handleOutdoorFrequencyChange,
    handleOutdoorPeriodChange,
    handleSocialFrequencyChange,
    handleSocialPeriodChange,
    handleTravelFrequencyChange,
    handleComfortVsStyleChange,
    handleClassicVsTrendyChange,
    handleBasicsVsStatementsChange,
    handleShoppingLimitToggle,
    handleShoppingLimitAmountInput,
    handleClothingBudgetAmountInput
  };
};

export type OnboardingEventAdapters = ReturnType<typeof useOnboardingEventAdapters>;
