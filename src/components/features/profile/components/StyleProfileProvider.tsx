import * as React from 'react';
import { StyleProfileContext } from '../context/StyleProfileContext';
import { useStyleProfileLogic } from '../hooks/useStyleProfileLogic';
import { StyleProfileSaveService } from '../services/StyleProfileSaveService';
import { StyleProfileProviderProps, StyleProfileContextType } from '../types/StyleProfileTypes';


// Provider component
export const StyleProfileProvider: React.FC<StyleProfileProviderProps> = ({ 
  children, 
  initialData, 
  onSave,
  onNavigateToScenarios 
}) => {
  // Use the extracted logic hook
  const {
    profileData,
    setProfileData,
    originalData,
    isModalOpen,
    setIsModalOpen,
    isScenarioChangeModalOpen,
    setIsScenarioChangeModalOpen,
    activityChanges,
    setActivityChanges,
    scenarioChanges,
    handleCheckboxChange,
    handleNestedChange,
    closeModal,
    updateScenarios
  } = useStyleProfileLogic(initialData);

  // Check if daily activities or leisure activities have changed
  const checkActivityChanges = () => {
    const dailyActivitiesChanged = 
      JSON.stringify(originalData.dailyActivities?.sort()) !== 
      JSON.stringify(profileData.dailyActivities?.sort());
      
    const leisureActivitiesChanged = 
      JSON.stringify(originalData.leisureActivities?.sort()) !== 
      JSON.stringify(profileData.leisureActivities?.sort());
    
    // Update activity changes state
    setActivityChanges({
      dailyActivities: dailyActivitiesChanged,
      leisureActivities: leisureActivitiesChanged
    });
  };

  // Enhanced handleSave using the service
  const handleSave = async (section?: any) => {
    // Check for activity changes before saving
    checkActivityChanges();
    
    return await StyleProfileSaveService.handleSave(
      profileData,
      section,
      onSave,
      setIsModalOpen,
      (data) => {
        if (typeof data === 'function') {
          // Handle function updates
          const updatedData = data(originalData);
          // Since we can't directly update originalData from the hook, we'll need to 
          // handle this through the parent component or pass a setter
          return updatedData;
        }
        return data;
      },
      originalData
    );
  };

  // Create the context value
  const contextValue: StyleProfileContextType = {
    profileData,
    originalData,
    handleCheckboxChange,
    handleNestedChange,
    handleSave,
    setProfileData,
    isModalOpen,
    closeModal,
    activityChanges,
    updateScenarios,
    navigateToScenarios: onNavigateToScenarios,
    isScenarioChangeModalOpen,
    setIsScenarioChangeModalOpen,
    scenarioChanges
  };

  return (
    <StyleProfileContext.Provider value={contextValue}>
      {children}
    </StyleProfileContext.Provider>
  );
};
