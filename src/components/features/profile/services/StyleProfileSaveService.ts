import { ProfileData } from '../../../../types';
import { ProfileSection, StylePreferencesData, WardrobeGoalsData } from '../sections/types';
import { SaveResult } from '../types/StyleProfileTypes';
import { saveSectionPreferences } from '../../../../services/sectionPreferencesService';

export class StyleProfileSaveService {
  
  static async handleSave(
    profileData: ProfileData,
    section: ProfileSection | 'all' = 'all',
    onSave: (data: ProfileData, section?: ProfileSection) => Promise<SaveResult>,
    setIsModalOpen: (open: boolean) => void,
    setOriginalData: (data: ProfileData | ((prev: ProfileData) => ProfileData)) => void,
    originalData: ProfileData
  ): Promise<SaveResult> {
    
    // For section-specific saves, use the new dedicated saveSectionPreferences function
    // This bypasses all the complex logic in the original save function
    if (section !== 'all') {
      try {
        // Get the current user ID from localStorage or use a development fallback
        let userId = localStorage.getItem('userId');
        
        // DEVELOPMENT ONLY: If no userId is found, use a test ID
        // In production, this should be removed and proper auth flow should be used
        if (!userId) {
          userId = 'test-user-id-for-development';
          
          // Store it in localStorage for consistency
          localStorage.setItem('userId', userId);
        }
        
        // Add detailed logging for stylePreferences data before calling saveSectionPreferences
        if (section === 'stylePreferences') {
          const stylePreferencesData: StylePreferencesData = {
            preferredStyles: [...(profileData.preferredStyles || [])],
            stylePreferences: {
              comfortVsStyle: Number(profileData.stylePreferences?.comfortVsStyle) || 50,
              classicVsTrendy: Number(profileData.stylePreferences?.classicVsTrendy) || 50,
              basicsVsStatements: Number(profileData.stylePreferences?.basicsVsStatements) || 50,
              additionalNotes: profileData.stylePreferences?.additionalNotes || ''
            }
          };
          
          // Call the new dedicated function with the section-specific data
          const result = await saveSectionPreferences(stylePreferencesData, userId, section);
          return result;
        } else if (section === 'wardrobeGoals') {
          // CRITICAL FIX: Create a WardrobeGoalsData object with explicit values to prevent loss
          // This ensures the actual values are passed to saveSectionPreferences in the expected format
          const wardrobeGoalsData: WardrobeGoalsData = {
            wardrobeGoals: [...(profileData.wardrobeGoals || [])],
            otherWardrobeGoal: profileData.otherWardrobeGoal || ''
          };
          
          // Call the new dedicated function with the section-specific data
          const result = await saveSectionPreferences(wardrobeGoalsData, userId, section);
          return result;
        }
        
        // For other sections, use the original profileData
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
        console.error(`Error saving ${section} section:`, error);
        return { success: false, error };
      }
    }
    
    // Clean up and prepare data for full save
    const updatedProfileData = StyleProfileSaveService.prepareDataForSave(profileData, section);
    
    try {
      // For section-specific saves, ensure we're only sending the necessary data
      let dataToSave = updatedProfileData;
      
      if (section !== 'all') {
        dataToSave = StyleProfileSaveService.createMinimalDataForSection(updatedProfileData, profileData, section);
      }
      
      // Call onSave and wait for the result
      const result = await onSave(dataToSave, section);
      
      // Update original data for next comparison
      StyleProfileSaveService.updateOriginalDataAfterSave(
        section, 
        profileData, 
        originalData, 
        setOriginalData
      );
      
      // Open the modal
      setIsModalOpen(true);
      
      return result;
    } catch (error) {
      console.error('Error saving profile data:', error);
      return { success: false, error };
    }
  }
  
  private static prepareDataForSave(profileData: ProfileData, section: ProfileSection | 'all'): ProfileData {
    const updatedProfileData = {...profileData};
    
    // Ensure shopping limit data is properly structured before saving
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
      updatedProfileData.wardrobeGoals = StyleProfileSaveService.deduplicateWardrobeGoals(
        updatedProfileData, 
        section
      );
    }
    
    return updatedProfileData;
  }
  
  private static deduplicateWardrobeGoals(updatedProfileData: ProfileData, section: ProfileSection | 'all'): string[] {
    // Get standard goal IDs
    const standardGoalIds = ['optimize-my-wardrobe', 'buy-less-shop-more-intentionally', 
      'save-money', 'build-a-capsule-wardrobe', 'other', 'define-or-upgrade-my-personal-style'];
    
    // IMPORTANT: For section-specific saves, preserve all goals without filtering
    // Only deduplicate to avoid duplicates of the same goal
    if (section !== 'all' && section === 'wardrobeGoals') {
      // Use a Set to ensure uniqueness but preserve all goals
      const uniqueGoalsSet = new Set(updatedProfileData.wardrobeGoals);
      
      // Add the current custom goal if 'other' is checked and there's text
      if (updatedProfileData.wardrobeGoals!.includes('other') && 
          updatedProfileData.otherWardrobeGoal && 
          updatedProfileData.otherWardrobeGoal.trim()) {
        // Add the custom goal
        const customGoal = updatedProfileData.otherWardrobeGoal.trim();
        uniqueGoalsSet.add(customGoal);
      }
      
      // Convert Set back to array
      return Array.from(uniqueGoalsSet);
    } else {
      // For non-section-specific saves, use the original deduplication logic
      // First, identify standard and custom goals
      const standardGoals = updatedProfileData.wardrobeGoals!.filter(goal => 
        standardGoalIds.includes(goal)
      );
      
      // Use a Set to ensure uniqueness
      const uniqueGoalsSet = new Set(standardGoals);
      
      // Add the current custom goal if 'other' is checked and there's text
      if (updatedProfileData.wardrobeGoals!.includes('other') && 
          updatedProfileData.otherWardrobeGoal && 
          updatedProfileData.otherWardrobeGoal.trim()) {
        // Add the custom goal
        const customGoal = updatedProfileData.otherWardrobeGoal.trim();
        uniqueGoalsSet.add(customGoal);
      }
      
      // Convert Set back to array
      return Array.from(uniqueGoalsSet);
    }
  }
  
  private static createMinimalDataForSection(
    updatedProfileData: ProfileData, 
    profileData: ProfileData, 
    section: ProfileSection
  ): ProfileData {
    // Create a minimal copy with only the fields needed for this section
    const minimalData = {...updatedProfileData};
    
    // Remove unnecessary fields based on section
    switch(section) {
      case 'wardrobeGoals':
        // Keep only wardrobe goals related fields
        Object.keys(minimalData).forEach(key => {
          if (key !== 'wardrobeGoals' && key !== 'otherWardrobeGoal') {
            delete (minimalData as any)[key];
          }
        });
        break;
        
      case 'stylePreferences':
        // Keep only style preferences related fields
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
        break;
        
      case 'dailyActivities':
        // Keep only daily activities related fields
        Object.keys(minimalData).forEach(key => {
          if (key !== 'dailyActivities' && key !== 'otherActivityDescription' && 
              key !== 'officeDressCode' && key !== 'remoteWorkPriority' && 
              key !== 'creativeMobility') {
            delete (minimalData as any)[key];
          }
        });
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
    
    return minimalData;
  }
  
  private static updateOriginalDataAfterSave(
    section: ProfileSection | 'all',
    profileData: ProfileData,
    originalData: ProfileData,
    setOriginalData: (data: ProfileData | ((prev: ProfileData) => ProfileData)) => void
  ): void {
    // Update original data for next comparison, but only for the section that was saved
    if (section === 'all') {
      // If saving all sections, update all original data
      setOriginalData({...profileData});
    } else {
      // If saving a specific section, only update that section's data in originalData
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
  }
}
