import { ProfileData, ArrayFieldsOfProfileData } from '../../../../types';

/**
 * Ensures that all array fields in the profile data are actually arrays
 */
export const processProfileData = (data: ProfileData): ProfileData => {
  return {
    ...data,
    // Ensure dailyActivities is always an array
    dailyActivities: Array.isArray(data.dailyActivities) ? 
      data.dailyActivities : 
      (data.dailyActivities ? [data.dailyActivities] : []),
    // Ensure homeActivities is always an array
    homeActivities: Array.isArray(data.homeActivities) ? 
      data.homeActivities : 
      (data.homeActivities ? [data.homeActivities] : []),
    // Ensure other array fields are also arrays
    preferredStyles: Array.isArray(data.preferredStyles) ? 
      data.preferredStyles : 
      (data.preferredStyles ? [data.preferredStyles] : []),
    leisureActivities: Array.isArray(data.leisureActivities) ? 
      data.leisureActivities : 
      (data.leisureActivities ? [data.leisureActivities] : []),
    wardrobeGoals: Array.isArray(data.wardrobeGoals) ? 
      data.wardrobeGoals : 
      (data.wardrobeGoals ? [data.wardrobeGoals] : [])
  };
};

/**
 * Checks if profile data has changed compared to previous data
 */
export const hasProfileDataChanged = (newData: ProfileData, oldData: ProfileData): boolean => {
  return JSON.stringify(newData.clothingBudget) !== JSON.stringify(oldData.clothingBudget) ||
    JSON.stringify(newData.shoppingLimit) !== JSON.stringify(oldData.shoppingLimit) ||
    JSON.stringify(newData.dailyActivities) !== JSON.stringify(oldData.dailyActivities) ||
    JSON.stringify(newData.homeActivities) !== JSON.stringify(oldData.homeActivities) ||
    JSON.stringify(newData.preferredStyles) !== JSON.stringify(oldData.preferredStyles);
};

/**
 * Updates a nested field in profile data
 */
export const updateNestedField = (
  profileData: ProfileData, 
  parentField: keyof ProfileData, 
  field: string, 
  value: any
): ProfileData => {
  const newProfileData = { ...profileData };
  
  // Special handling for array fields like preferredStyles
  if (parentField === 'preferredStyles' || 
      parentField === 'dailyActivities' || 
      parentField === 'leisureActivities' || 
      parentField === 'wardrobeGoals') {
    // For array fields, the value is the new array
    newProfileData[parentField] = value;
  }
  // Handle each parent field type separately to maintain type safety
  else if (parentField === 'stylePreferences') {
    newProfileData.stylePreferences = {
      ...newProfileData.stylePreferences,
      [field]: value
    };
  } 
  else if (parentField === 'shoppingLimit') {
    newProfileData.shoppingLimit = {
      ...newProfileData.shoppingLimit,
      [field]: value,
      // Ensure required fields are present
      frequency: newProfileData.shoppingLimit?.frequency || 'monthly',
      amount: newProfileData.shoppingLimit?.amount || 0
    };
  }
  else if (parentField === 'clothingBudget') {
    newProfileData.clothingBudget = {
      ...newProfileData.clothingBudget,
      [field]: value,
      // Ensure required fields are present
      amount: newProfileData.clothingBudget?.amount || 0,
      currency: newProfileData.clothingBudget?.currency || 'USD',
      frequency: newProfileData.clothingBudget?.frequency || 'monthly'
    };
  }
  else if (parentField === 'outdoorFrequency' || 
           parentField === 'socialFrequency' || 
           parentField === 'formalEventsFrequency') {
    // Handle frequency objects
    const frequencyObj = newProfileData[parentField] || { frequency: 0, period: 'weekly' };
    
    (newProfileData as any)[parentField] = {
      ...frequencyObj,
      [field]: value
    };
  }
  else if (field === '') {
    // Direct field update for a top-level primitive field (like localClimate)
    console.log(`DEBUG - styleProfileUtils - Updating direct field ${parentField} with value:`, value);
    (newProfileData as any)[parentField] = value;
  }
  else {
    // For other nested fields, use a type assertion as a fallback
    const parentValue = profileData[parentField] || {};
    const updatedParent = {
      ...(typeof parentValue === 'object' && !Array.isArray(parentValue) ? parentValue : {}),
      [field]: value
    };
    (newProfileData as any)[parentField] = updatedParent;
  }
  
  return newProfileData;
};

/**
 * Updates an array field in profile data by toggling a value
 */
export const toggleArrayField = (
  profileData: ProfileData, 
  field: ArrayFieldsOfProfileData, 
  value: string
): ProfileData => {
  const newProfileData = { ...profileData };
  
  // Get the current array or initialize an empty one
  // Ensure we're working with an array
  const currentArray = Array.isArray(profileData[field]) ? profileData[field] : [];
  
  // Toggle the value - make sure currentArray is defined before using includes
  const newArray = currentArray && currentArray.includes(value)
    ? currentArray.filter(item => item !== value)
    : Array.from(new Set([...(currentArray || []), value])); // Use Set to remove duplicates
    
  // Update the field with the new array
  newProfileData[field] = newArray;
  
  return newProfileData;
};
