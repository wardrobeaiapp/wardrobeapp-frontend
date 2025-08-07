import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// Import ProfileData from the main types file
import { ProfileData } from '../../../types';
import { 
  ArrayFieldsOfProfileData,
  ProfileSection, 
  StylePreferencesData, 
  WardrobeGoalsData 
} from '../sections/types';
import { 
  processProfileData, 
  hasProfileDataChanged, 
  toggleArrayField
} from '../utils/styleProfileUtils';
// Import the new saveSectionPreferences function
import { saveSectionPreferences } from '../../../services/sectionPreferencesService';

// Define the SaveResult interface
export interface SaveResult {
  success: boolean;
  error?: any;
}

// Define the context type
interface StyleProfileContextType {
  profileData: ProfileData;
  setProfileData: React.Dispatch<React.SetStateAction<ProfileData>>;
  originalData: ProfileData;
  activityChanges: {
    dailyActivities: boolean;
    leisureActivities: boolean;
  };
  handleCheckboxChange: (field: ArrayFieldsOfProfileData, value: string) => void;
  handleNestedChange: (parentField: keyof ProfileData, field: string, value: any) => void;
  handleSave: (section?: ProfileSection) => Promise<SaveResult>;
  isModalOpen: boolean;
  closeModal: () => void;
  updateScenarios: () => void;
  navigateToScenarios?: () => void;
  isScenarioChangeModalOpen: boolean;
  setIsScenarioChangeModalOpen: (isOpen: boolean) => void;
  scenarioChanges: {
    added: any[];
    modified: any[];
    removed: any[];
  };
}

// Create the context with a default value
const StyleProfileContext = createContext<StyleProfileContextType | undefined>(undefined);

// Props for the provider component
interface StyleProfileProviderProps {
  children: ReactNode;
  initialData: ProfileData;
  onSave: (data: ProfileData, section?: ProfileSection) => Promise<SaveResult>;
  onNavigateToScenarios?: () => void;
}

// Provider component
export const StyleProfileProvider: React.FC<StyleProfileProviderProps> = ({ 
  children, 
  initialData, 
  onSave,
  onNavigateToScenarios 
}) => {
  // Process initialData to ensure all array fields are arrays
  const processedInitialData = processProfileData(initialData);
  
  // State for profile data
  const [profileData, setProfileData] = useState<ProfileData>(processedInitialData);
  
  // State for tracking which activity sections have changes
  /** @deprecated Related to dailyActivities and leisureActivities which are no longer displayed in UI. */
  const [activityChanges, setActivityChanges] = useState({
    dailyActivities: false,
    leisureActivities: false
  });
  
  // State for the success modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for scenario change modal
  const [isScenarioChangeModalOpen, setIsScenarioChangeModalOpen] = useState(false);
  
  // State for scenario changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [scenarioChanges, setScenarioChanges] = useState({
    added: [],
    modified: [],
    removed: []
  });
  
  // Original data for comparison
  const [originalData, setOriginalData] = useState<ProfileData>(processedInitialData);

  // Update profileData when initialData changes
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
        console.log('StyleProfileContext: Directly setting shoppingLimit object', value);
        return newState;
      }
      
      // Special case for otherWardrobeGoal - set it directly as a string
      if (parentField === 'otherWardrobeGoal') {
        newState.otherWardrobeGoal = value;
        console.log('StyleProfileContext: Setting otherWardrobeGoal', value);
        return newState;
      }
      
      // Special case for preferredStyles - set it directly as an array
      if (parentField === 'preferredStyles') {
        newState.preferredStyles = value;
        console.log('StyleProfileContext: Setting preferredStyles array', value);
        return newState;
      }
      
      // Special case for localClimate - set it directly as a string
      if (parentField === 'localClimate') {
        newState.localClimate = value;
        console.log('StyleProfileContext: Setting localClimate', value);
        return newState;
      }
      
      // Special case for wardrobeGoals - set it directly as an array
      if (parentField === 'wardrobeGoals') {
        newState.wardrobeGoals = value;
        console.log('StyleProfileContext: Setting wardrobeGoals array', value);
        return newState;
      }
      
      // Special case for subscriptionPlan - set it directly as a string
      if (parentField === 'subscriptionPlan') {
        newState.subscriptionPlan = value;
        console.log('StyleProfileContext: Setting subscriptionPlan', value);
        return newState;
      }
      
      // Special case for subscriptionRenewalDate - set it directly as a string
      if (parentField === 'subscriptionRenewalDate') {
        newState.subscriptionRenewalDate = value;
        console.log('StyleProfileContext: Setting subscriptionRenewalDate', value);
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
        (newState[parentField] as any)[field] = value;
      }
      
      return newState;
    });
  };

  // Function to handle saving profile data
  const handleSave = async (section: ProfileSection = 'all'): Promise<SaveResult> => {
    // Log the section being saved
    console.log(`StyleProfileContext handleSave - Starting save for section: ${section}`);
    console.log(`StyleProfileContext handleSave - ENTRY - section: ${section}`);
    
    // Log only the relevant section data based on what's being saved
    if (section === 'all') {
      console.log(`StyleProfileContext handleSave - BEFORE onSave - saving ALL sections`);
    } else if (section === 'stylePreferences') {
      console.log(`StyleProfileContext handleSave - BEFORE onSave - section: ${section} - data:`, {
        preferredStyles: profileData.preferredStyles,
        stylePreferences: profileData.stylePreferences
      });
    } else if (section === 'wardrobeGoals') {
      console.log(`StyleProfileContext handleSave - BEFORE onSave - section: ${section} - data:`, {
        wardrobeGoals: profileData.wardrobeGoals,
        otherWardrobeGoal: profileData.otherWardrobeGoal
      });
    } else {
      console.log(`StyleProfileContext handleSave - BEFORE onSave - section: ${section}`);
    }
    
    // For section-specific saves, use the new dedicated saveSectionPreferences function
    // This bypasses all the complex logic in the original save function
    if (section !== 'all') {
      console.log(`StyleProfileContext handleSave - Using dedicated saveSectionPreferences for ${section} section`);
      
      try {
        // Get the current user ID from localStorage or use a development fallback
        let userId = localStorage.getItem('userId');
        
        // DEVELOPMENT ONLY: If no userId is found, use a test ID
        // In production, this should be removed and proper auth flow should be used
        if (!userId) {
          console.warn('StyleProfileContext handleSave - No userId found in localStorage, using test ID for development');
          userId = 'test-user-id-for-development';
          
          // Store it in localStorage for consistency
          localStorage.setItem('userId', userId);
        }
        
        // Add detailed logging for stylePreferences data before calling saveSectionPreferences
        if (section === 'stylePreferences') {
          console.log('StyleProfileContext handleSave - DETAILED stylePreferences data before save:', {
            preferredStyles: profileData.preferredStyles,
            stylePreferences: {
              comfortVsStyle: profileData.stylePreferences?.comfortVsStyle,
              classicVsTrendy: profileData.stylePreferences?.classicVsTrendy,
              basicsVsStatements: profileData.stylePreferences?.basicsVsStatements,
              additionalNotes: profileData.stylePreferences?.additionalNotes
            },
            stylePreferencesType: typeof profileData.stylePreferences,
            comfortVsStyleType: typeof profileData.stylePreferences?.comfortVsStyle
          });
          
          // CRITICAL FIX: Create a StylePreferencesData object with explicit values to prevent loss
          // This ensures the actual values are passed to saveSectionPreferences in the expected format
          
          // Log raw values from profileData for debugging
          console.log('RAW VALUES FROM PROFILE DATA:', {
            comfortVsStyle: {
              value: profileData.stylePreferences?.comfortVsStyle,
              type: typeof profileData.stylePreferences?.comfortVsStyle,
              isNull: profileData.stylePreferences?.comfortVsStyle === null,
              isUndefined: profileData.stylePreferences?.comfortVsStyle === undefined
            },
            classicVsTrendy: {
              value: profileData.stylePreferences?.classicVsTrendy,
              type: typeof profileData.stylePreferences?.classicVsTrendy,
              isNull: profileData.stylePreferences?.classicVsTrendy === null,
              isUndefined: profileData.stylePreferences?.classicVsTrendy === undefined
            },
            basicsVsStatements: {
              value: profileData.stylePreferences?.basicsVsStatements,
              type: typeof profileData.stylePreferences?.basicsVsStatements,
              isNull: profileData.stylePreferences?.basicsVsStatements === null,
              isUndefined: profileData.stylePreferences?.basicsVsStatements === undefined
            }
          });
          
          // Force numeric values with explicit Number conversion and ensure we're using the latest state
          // CRITICAL FIX: Create a fresh copy of the data to prevent any stale state issues
          const stylePreferencesData: StylePreferencesData = {
            preferredStyles: [...(profileData.preferredStyles || [])],
            stylePreferences: {
              comfortVsStyle: Number(profileData.stylePreferences?.comfortVsStyle) || 50,
              classicVsTrendy: Number(profileData.stylePreferences?.classicVsTrendy) || 50,
              basicsVsStatements: Number(profileData.stylePreferences?.basicsVsStatements) || 50,
              additionalNotes: profileData.stylePreferences?.additionalNotes || ''
            }
          };
          
          // Log the numeric types to verify they're correct
          console.log('StyleProfileContext handleSave - NUMERIC TYPE CHECK:', {
            comfortVsStyle: {
              value: stylePreferencesData.stylePreferences?.comfortVsStyle,
              type: typeof stylePreferencesData.stylePreferences?.comfortVsStyle,
              isNumber: typeof stylePreferencesData.stylePreferences?.comfortVsStyle === 'number'
            },
            classicVsTrendy: {
              value: stylePreferencesData.stylePreferences?.classicVsTrendy,
              type: typeof stylePreferencesData.stylePreferences?.classicVsTrendy,
              isNumber: typeof stylePreferencesData.stylePreferences?.classicVsTrendy === 'number'
            },
            basicsVsStatements: {
              value: stylePreferencesData.stylePreferences?.basicsVsStatements,
              type: typeof stylePreferencesData.stylePreferences?.basicsVsStatements,
              isNumber: typeof stylePreferencesData.stylePreferences?.basicsVsStatements === 'number'
            }
          });
          
          console.log('StyleProfileContext handleSave - PRESERVED stylePreferences data:', {
            preferredStyles: stylePreferencesData.preferredStyles,
            stylePreferences: stylePreferencesData.stylePreferences
          });
          
          // Call the new dedicated function with the section-specific data
          console.log(`StyleProfileContext handleSave - Using ONLY saveSectionPreferences for ${section} section with section-specific data`);
          const result = await saveSectionPreferences(stylePreferencesData, userId, section);
          return result;
        } else if (section === 'wardrobeGoals') {
          // CRITICAL FIX: Create a WardrobeGoalsData object with explicit values to prevent loss
          // This ensures the actual values are passed to saveSectionPreferences in the expected format
          const wardrobeGoalsData: WardrobeGoalsData = {
            wardrobeGoals: [...(profileData.wardrobeGoals || [])],
            otherWardrobeGoal: profileData.otherWardrobeGoal || ''
          };
          
          console.log('StyleProfileContext handleSave - PRESERVED wardrobeGoals data:', {
            wardrobeGoals: wardrobeGoalsData.wardrobeGoals,
            otherWardrobeGoal: wardrobeGoalsData.otherWardrobeGoal
          });
          
          // Call the new dedicated function with the section-specific data
          console.log(`StyleProfileContext handleSave - Using ONLY saveSectionPreferences for ${section} section with section-specific data`);
          const result = await saveSectionPreferences(wardrobeGoalsData, userId, section);
          return result;
        }
        
        // For other sections, use the original profileData
        console.log(`StyleProfileContext handleSave - Using ONLY saveSectionPreferences for ${section} section`);
        const result = await saveSectionPreferences(profileData, userId, section);

        
        // If save was successful, update the modal state
        if (result.success) {
          setIsModalOpen(true);
          // Update the original data to match the current data
          setOriginalData(current => ({
            ...current,
            ...profileData
          }));
        }
        
        return result;
      } catch (error) {
        console.error(`StyleProfileContext handleSave - Error saving ${section} section:`, error);
        return { success: false, error };
      }
    }
    
    console.log(`StyleProfileContext handleSave - section-specific save for: ${section}`);
    // Check if daily activities or leisure activities have changed
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
    
    // Ensure shopping limit data is properly structured before saving
    const updatedProfileData = {...profileData};
    
    // Make sure shoppingLimit exists and has the correct structure
    if (updatedProfileData.shoppingLimit) {
      // Convert amount to a number if it's a string or ensure it's a valid number
      const amount = typeof updatedProfileData.shoppingLimit.amount === 'string' 
        ? parseFloat(updatedProfileData.shoppingLimit.amount) 
        : (typeof updatedProfileData.shoppingLimit.amount === 'number' 
          ? updatedProfileData.shoppingLimit.amount 
          : 0);
      
      // Ensure amount is a valid number (not NaN)
      updatedProfileData.shoppingLimit.amount = !isNaN(amount) ? amount : 0;
    }
    
    // Clean up wardrobe goals - remove duplicate custom goals
    if (updatedProfileData.wardrobeGoals && Array.isArray(updatedProfileData.wardrobeGoals)) {
      console.log('DEDUPLICATION DEBUG - Initial state:', {
        wardrobeGoals: [...updatedProfileData.wardrobeGoals],
        otherWardrobeGoal: updatedProfileData.otherWardrobeGoal,
        hasOther: updatedProfileData.wardrobeGoals.includes('other')
      });
      
      // Get standard goal IDs
      const standardGoalIds = ['optimize-my-wardrobe', 'buy-less-shop-more-intentionally', 
        'save-money', 'build-a-capsule-wardrobe', 'other', 'define-or-upgrade-my-personal-style'];
      
      // IMPORTANT: For section-specific saves, preserve all goals without filtering
      // Only deduplicate to avoid duplicates of the same goal
      // Use explicit type check to avoid TypeScript error
      if (section !== 'all' && section === 'wardrobeGoals') {
        console.log('SECTION-SPECIFIC SAVE: Preserving all wardrobe goals without filtering');
        
        // Use a Set to ensure uniqueness but preserve all goals
        const uniqueGoalsSet = new Set(updatedProfileData.wardrobeGoals);
        
        // Add the current custom goal if 'other' is checked and there's text
        if (updatedProfileData.wardrobeGoals.includes('other') && 
            updatedProfileData.otherWardrobeGoal && 
            updatedProfileData.otherWardrobeGoal.trim()) {
          // Add the custom goal
          const customGoal = updatedProfileData.otherWardrobeGoal.trim();
          uniqueGoalsSet.add(customGoal);
          
          console.log('DEDUPLICATION DEBUG - Adding custom goal for section-specific save:', {
            customGoal,
            allGoals: [...uniqueGoalsSet]
          });
        }
        
        // Convert Set back to array
        const finalGoals = Array.from(uniqueGoalsSet);
        
        console.log('SECTION-SPECIFIC SAVE - Final wardrobe goals:', {
          finalGoals,
          originalGoals: [...updatedProfileData.wardrobeGoals],
          finalLength: finalGoals.length
        });
        
        // Update the wardrobe goals with the deduplicated array
        updatedProfileData.wardrobeGoals = finalGoals;
      } else {
        // For non-section-specific saves, use the original deduplication logic
        // First, identify standard and custom goals
        const standardGoals = updatedProfileData.wardrobeGoals.filter(goal => 
          standardGoalIds.includes(goal)
        );
        
        const customGoals = updatedProfileData.wardrobeGoals.filter(goal => 
          !standardGoalIds.includes(goal)
        );
        
        console.log('DEDUPLICATION DEBUG - After filtering goals:', {
          standardGoals: [...standardGoals],
          customGoals: [...customGoals]
        });
        
        // Use a Set to ensure uniqueness
        const uniqueGoalsSet = new Set(standardGoals);
        
        // Add the current custom goal if 'other' is checked and there's text
        if (updatedProfileData.wardrobeGoals.includes('other') && 
            updatedProfileData.otherWardrobeGoal && 
            updatedProfileData.otherWardrobeGoal.trim()) {
          // Add the custom goal
          const customGoal = updatedProfileData.otherWardrobeGoal.trim();
          uniqueGoalsSet.add(customGoal);
          
          console.log('DEDUPLICATION DEBUG - Adding custom goal:', {
            customGoal,
            setBeforeAdd: [...uniqueGoalsSet],
            setAfterAdd: [...uniqueGoalsSet].concat(customGoal)
          });
        }
        
        // Convert Set back to array
        const finalGoals = Array.from(uniqueGoalsSet);
        
        console.log('DEDUPLICATION DEBUG - Final goals:', {
          finalGoals,
          originalLength: updatedProfileData.wardrobeGoals.length,
          finalLength: finalGoals.length,
          hasDuplicates: new Set(finalGoals).size !== finalGoals.length
        });
        
        // Update the wardrobe goals with the deduplicated array
        updatedProfileData.wardrobeGoals = finalGoals;
      }
      
      console.log('StyleProfileContext - Final wardrobe goals cleanup:', {
        original: profileData.wardrobeGoals,
        cleaned: updatedProfileData.wardrobeGoals,
        otherGoal: updatedProfileData.otherWardrobeGoal,
        section: section
      });
    }
    
    // Debug logging for climate value and shopping limit
    console.log('DEBUG - StyleProfileContext - handleSave - Before saving profileData:', {
      localClimate: updatedProfileData.localClimate,
      shoppingLimit: updatedProfileData.shoppingLimit,
      shoppingLimitAmount: updatedProfileData.shoppingLimit?.amount,
      shoppingLimitFrequency: updatedProfileData.shoppingLimit?.frequency,
      profileDataKeys: Object.keys(updatedProfileData),
      profileData: JSON.stringify(updatedProfileData)
    });
    
    // Only perform wardrobeGoals deduplication if we're saving that section or all sections
    if ((section === 'all' || section === 'wardrobeGoals') && updatedProfileData.wardrobeGoals && Array.isArray(updatedProfileData.wardrobeGoals)) {
      // Use a Set to ensure uniqueness one last time
      updatedProfileData.wardrobeGoals = Array.from(new Set(updatedProfileData.wardrobeGoals));
      
      console.log('FINAL DEDUPLICATION CHECK - Right before save:', {
        wardrobeGoals: updatedProfileData.wardrobeGoals,
        length: updatedProfileData.wardrobeGoals.length,
        hasDuplicates: new Set(updatedProfileData.wardrobeGoals).size !== updatedProfileData.wardrobeGoals.length
      });
    } else if ((section === 'all' || section === 'wardrobeGoals') && (!updatedProfileData.wardrobeGoals || !Array.isArray(updatedProfileData.wardrobeGoals))) {
      // Only fix wardrobeGoals if we're saving that section or all sections
      // If wardrobeGoals is missing or not an array, ensure it's properly initialized
      // This is critical to prevent loss of wardrobe goals during save
      console.log('WARNING: wardrobeGoals missing or not an array in handleSave - fixing', {
        current: updatedProfileData.wardrobeGoals,
        type: typeof updatedProfileData.wardrobeGoals,
        isArray: Array.isArray(updatedProfileData.wardrobeGoals)
      });
      
      // Initialize from profileData if available
      if (profileData.wardrobeGoals && Array.isArray(profileData.wardrobeGoals)) {
        updatedProfileData.wardrobeGoals = [...profileData.wardrobeGoals];
        console.log('Restored wardrobeGoals from profileData:', updatedProfileData.wardrobeGoals);
      } else {
        // Last resort - initialize as empty array
        updatedProfileData.wardrobeGoals = [];
        console.log('Initialized wardrobeGoals as empty array');
      }
    }
    
    // Only log wardrobeGoals if we're saving that section or all sections
    if (section === 'all' || section === 'wardrobeGoals') {
      console.log(`StyleProfileContext handleSave - BEFORE onSave - section: ${section} - wardrobeGoals:`, updatedProfileData.wardrobeGoals);
    }
    
    try {
      // For section-specific saves, ensure we're only sending the necessary data
      // This adds an extra layer of protection against cross-section data contamination
      let dataToSave = updatedProfileData;
      
      if (section !== 'all') {
        // Create a minimal copy with only the fields needed for this section
        const minimalData = {...updatedProfileData};
        
        // Remove unnecessary fields based on section
        // This ensures that even if there are bugs in the section-specific save logic,
        // we won't accidentally overwrite data from other sections
        switch(section) {
          case 'wardrobeGoals':
            // Keep only wardrobe goals related fields
            // Using WardrobeGoalsData interface to determine which fields to keep
            Object.keys(minimalData).forEach(key => {
              if (key !== 'wardrobeGoals' && key !== 'otherWardrobeGoal') {
                delete (minimalData as any)[key];
              }
            });
            console.log('Section-specific save for wardrobeGoals:', minimalData);
            break;
          case 'stylePreferences':
            // Keep only style preferences related fields
            // Using StylePreferencesData interface to determine which fields to keep
            // First clear all unrelated fields
            Object.keys(minimalData).forEach(key => {
              delete (minimalData as any)[key];
            });
            
            // IMPORTANT: For stylePreferences, we need to flatten the data structure
            // to match the database schema. The database expects these fields at the top level,
            // not nested under a stylePreferences object.
            
            // Add preferredStyles array (top-level field)
            (minimalData as any).preferredStyles = profileData.preferredStyles || [];
            
            // Map the slider values directly to top-level fields
            if (profileData.stylePreferences?.comfortVsStyle !== undefined) {
              (minimalData as any).comfort_vs_style = profileData.stylePreferences.comfortVsStyle;
            }
            
            if (profileData.stylePreferences?.classicVsTrendy !== undefined) {
              (minimalData as any).classic_vs_trendy = profileData.stylePreferences.classicVsTrendy;
            }
            
            if (profileData.stylePreferences?.basicsVsStatements !== undefined) {
              (minimalData as any).basics_vs_statements = profileData.stylePreferences.basicsVsStatements;
            }
            
            // Map additional notes to the correct field name expected by the DB
            if (profileData.stylePreferences?.additionalNotes !== undefined) {
              (minimalData as any).style_additional_notes = profileData.stylePreferences.additionalNotes;
            }
            
            console.log('Section-specific save for stylePreferences (flattened):', minimalData);
            
            console.log('Section-specific save for stylePreferences (restructured):', minimalData);
            break;
          case 'dailyActivities':
            // Keep only daily activities related fields
            // Using DailyActivitiesData interface to determine which fields to keep
            Object.keys(minimalData).forEach(key => {
              if (key !== 'dailyActivities' && key !== 'otherActivityDescription' && 
                  key !== 'officeDressCode' && key !== 'remoteWorkPriority' && 
                  key !== 'creativeMobility') {
                delete (minimalData as any)[key];
              }
            });
            console.log('Section-specific save for dailyActivities:', minimalData);
            break;
          case 'leisureActivities':
            // Keep only leisure activities related fields
            Object.keys(minimalData).forEach(key => {
              if (key !== 'leisureActivities' && key !== 'otherLeisureActivity') {
                delete (minimalData as any)[key];
              }
            });
            break;
          case 'climate':
            // Keep only climate related fields
            Object.keys(minimalData).forEach(key => {
              if (key !== 'localClimate') {
                delete (minimalData as any)[key];
              }
            });
            break;
          case 'shoppingLimit':
            // Keep only shopping limit related fields
            Object.keys(minimalData).forEach(key => {
              if (key !== 'shoppingLimit') {
                delete (minimalData as any)[key];
              }
            });
            break;
          case 'subscription':
            // Keep only subscription related fields
            Object.keys(minimalData).forEach(key => {
              if (key !== 'subscriptionPlan' && key !== 'subscriptionRenewalDate') {
                delete (minimalData as any)[key];
              }
            });
            break;
        }
        
        dataToSave = minimalData;
        console.log(`StyleProfileContext handleSave - Using minimal data for section ${section}:`, dataToSave);
      }
      
      // Call onSave and wait for the result
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await onSave(dataToSave, section);
      
      // Update original data for next comparison, but only for the section that was saved
      // This prevents changes in one section from affecting other sections
      if (section === 'all') {
        // If saving all sections, update all original data
        setOriginalData({...profileData});
      } else {
        // If saving a specific section, only update that section's data in originalData
        // This preserves the original state of other sections
        const updatedOriginalData = {...originalData};
        
        // Update only the fields related to the saved section
        switch(section) {
          case 'wardrobeGoals':
            updatedOriginalData.wardrobeGoals = [...profileData.wardrobeGoals];
            updatedOriginalData.otherWardrobeGoal = profileData.otherWardrobeGoal;
            break;
          case 'stylePreferences':
            updatedOriginalData.preferredStyles = [...profileData.preferredStyles];
            updatedOriginalData.stylePreferences = {...profileData.stylePreferences};
            break;
          case 'dailyActivities':
            updatedOriginalData.dailyActivities = [...profileData.dailyActivities];
            updatedOriginalData.otherActivityDescription = profileData.otherActivityDescription;
            break;
          case 'leisureActivities':
            updatedOriginalData.leisureActivities = [...profileData.leisureActivities];
            updatedOriginalData.otherLeisureActivity = profileData.otherLeisureActivity;
            break;
          case 'climate':
            updatedOriginalData.localClimate = profileData.localClimate;
            break;
          case 'shoppingLimit':
            if (profileData.shoppingLimit) {
              updatedOriginalData.shoppingLimit = {
                frequency: profileData.shoppingLimit.frequency || '',
                amount: profileData.shoppingLimit.amount || 0,
                limitAmount: profileData.shoppingLimit.limitAmount,
                currency: profileData.shoppingLimit.currency
              };
            }
            break;
          case 'subscription':
            updatedOriginalData.subscriptionPlan = profileData.subscriptionPlan;
            updatedOriginalData.subscriptionRenewalDate = profileData.subscriptionRenewalDate;
            break;
        }
        
        setOriginalData(updatedOriginalData);
      }
      
      // Open the modal
      setIsModalOpen(true);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving profile data:', error);
      return { success: false, error };
    }
  };

  // Close the confirmation modal
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  // Update scenarios based on activity changes
  const updateScenarios = () => {
    console.log('Updating scenarios based on profile changes:', {
      dailyActivities: profileData.dailyActivities,
      leisureActivities: profileData.leisureActivities
    });
    
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

// Custom hook to use the context
export const useStyleProfile = (): StyleProfileContextType => {
  const context = useContext(StyleProfileContext);
  if (context === undefined) {
    throw new Error('useStyleProfile must be used within a StyleProfileProvider');
  }
  return context;
};
