import { useState, useEffect } from 'react';
import { ProfileData } from '../../../types';
import { ArrayFieldsOfProfileData } from '../sections/types';
import { 
  processProfileData, 
  hasProfileDataChanged, 
  toggleArrayField
} from '../utils/styleProfileUtils';

export const useStyleProfileLogic = (initialData: ProfileData) => {
  // State for profile data
  const [profileData, setProfileData] = useState<ProfileData>(() => processProfileData(initialData));
  const [originalData] = useState<ProfileData>(initialData);
  
  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScenarioChangeModalOpen, setIsScenarioChangeModalOpen] = useState(false);
  
  // State for activity tracking
  const [activityChanges, setActivityChanges] = useState({
    dailyActivities: false,
    leisureActivities: false
  });
  
  // State for scenario tracking
  const [scenarioChanges] = useState({
    added: [],
    modified: [],
    removed: []
  });

  // Handle profile data updates when initialData changes
  useEffect(() => {
    const processedData = processProfileData(initialData);
    
    // Check if key properties have changed before updating state
    if (hasProfileDataChanged(initialData, profileData)) {
      setProfileData(processedData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, JSON.stringify(initialData.clothingBudget), JSON.stringify(initialData.shoppingLimit)]);

  // Handle checkbox changes for array fields
  const handleCheckboxChange = (field: ArrayFieldsOfProfileData, value: string) => {
    setProfileData(prev => toggleArrayField(prev, field, value));
  };

  // Handle changes for nested objects in the profile data
  const handleNestedChange = (parentField: keyof ProfileData, field: string, value: any) => {
    setProfileData(prev => {
      // Create a copy of the previous state
      const newState = {...prev};
      
      // Special case for shoppingLimit with empty field - replace the entire object
      if (parentField === 'shoppingLimit' && field === '') {
        newState.shoppingLimit = value;
        return newState;
      }
      
      // Special case for otherWardrobeGoal - set it directly as a string
      if (parentField === 'otherWardrobeGoal') {
        newState.otherWardrobeGoal = value;
        return newState;
      }
      
      // Special case for preferredStyles - set it directly as an array
      if (parentField === 'preferredStyles') {
        newState.preferredStyles = value;
        return newState;
      }
      
      // Special case for localClimate - set it directly as a string
      if (parentField === 'localClimate') {
        newState.localClimate = value;
        return newState;
      }
      
      // Special case for wardrobeGoals - set it directly as an array
      if (parentField === 'wardrobeGoals') {
        newState.wardrobeGoals = value;
        return newState;
      }
      
      // Special case for subscriptionPlan - set it directly as a string
      if (parentField === 'subscriptionPlan') {
        newState.subscriptionPlan = value;
        return newState;
      }
      
      // Special case for subscriptionRenewalDate - set it directly as a string
      if (parentField === 'subscriptionRenewalDate') {
        newState.subscriptionRenewalDate = value;
        return newState;
      }
      
      // Initialize the parent field if it doesn't exist
      if (!newState[parentField]) {
        // Create appropriate default based on field type
        if (parentField === 'shoppingLimit') {
          newState.shoppingLimit = { amount: 0, frequency: 'monthly' };
        } else {
          // For other fields, initialize as empty object or appropriate default
          (newState as any)[parentField] = {};
        }
      }
      
      // Update the specific field
      if (typeof newState[parentField] === 'object') {
        (newState as any)[parentField] = {
          ...(newState[parentField] as any),
          [field]: value
        };
      }
      
      return newState;
    });
  };

  // Modal management
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Update scenarios based on activity changes
  const updateScenarios = () => {
    // Store the current profile data in localStorage for comparison
    localStorage.setItem('previousProfileData', localStorage.getItem('currentProfileData') || '{}');
    localStorage.setItem('currentProfileData', JSON.stringify(profileData));
    
    // Reset activity changes
    setActivityChanges({
      dailyActivities: false,
      leisureActivities: false
    });
    
    // Show the success modal
    setIsModalOpen(true);
    
    // No navigation or redirection - changes will be detected by ScenarioSettingsSection
  };

  return {
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
  };
};
