import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import supabaseAuthService from '../../services/auth/supabaseAuthService';
import { fetchUserPreferences, updateUserPreferences } from '../../services/profile/supabasePreferencesService';
import { getUserProfileByUserId } from '../../services/auth/supabaseAuthService';
import { getClothingBudgetData, getShoppingLimitData } from '../../services/profile/userBudgetsService';
import { 
  UserPreferences, 
  defaultPreferences, 
  SubscriptionData,
  ShoppingLimitData,
  AISettingsData,
  NotificationsData,
  OtherSettingsData
} from '../../types/profile';

export const useProfileData = () => {
  const { user, refreshUserData } = useSupabaseAuth();
  const [userPreferencesData, setUserPreferencesData] = useState<any>(null);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<{ clothingBudget: any; shoppingLimit: any } | null>(null);
  
  // Fetch user preferences from user_preferences table
  useEffect(() => {
    const fetchUserPrefsData = async () => {
      if (user?.id) {
        try {
          const { data: preferencesData } = await fetchUserPreferences(user.id);
          // Debug logging
          console.log('Fetched user preferences:', preferencesData);
          // Use type assertion to access database-specific fields
          console.log('other_activity_description from DB:', (preferencesData as any)?.other_activity_description);
          
          setUserPreferencesData(preferencesData);
          
          // Fetch user profile data (for subscription info)
          const userProfile = await getUserProfileByUserId(user.id);
          console.log('Fetched user profile for subscription data:', userProfile);
          setUserProfileData(userProfile);
        } catch (error) {
          console.error('Error fetching user preferences:', error);
        }
      }
    };
    
    fetchUserPrefsData();
  }, [user?.id]);

  // Fetch budget data from user_progress table (unified budget service)
  useEffect(() => {
    const fetchBudgetData = async () => {
      if (user?.id) {
        try {
          console.log('🎯 useProfileData - Fetching budget data from user_progress table');
          
          // Fetch both clothing budget and shopping limit data from user_progress
          const [clothingBudget, shoppingLimit] = await Promise.all([
            getClothingBudgetData(user.id).catch(error => {
              console.warn('No clothing budget data found:', error);
              return { amount: 0, currency: 'USD', frequency: 'monthly' as const };
            }),
            getShoppingLimitData(user.id).catch(error => {
              console.warn('No shopping limit data found:', error);
              return { shoppingLimitAmount: 0, shoppingLimitFrequency: 'monthly' as const };
            })
          ]);

          setBudgetData({ clothingBudget, shoppingLimit });
          console.log('🎯 useProfileData - Budget data fetched successfully:', { clothingBudget, shoppingLimit });
        } catch (error) {
          console.error('🎯 useProfileData - Error fetching budget data:', error);
          // Set default values on error
          setBudgetData({
            clothingBudget: { amount: 0, currency: 'USD', frequency: 'monthly' as const },
            shoppingLimit: { shoppingLimitAmount: 0, shoppingLimitFrequency: 'monthly' as const }
          });
        }
      }
    };
    
    fetchBudgetData();
  }, [user?.id]);

  // Map user preferences to our UserPreferences structure
  const styleProfile = useMemo(() => {
    // Always prioritize userPreferencesData from the database over user.preferences
    const hasData = userPreferencesData || user?.preferences;
    if (hasData) {
      // Prioritize data from userPreferencesData (database) over user.preferences
      // This ensures we're using the most up-to-date data from the user_preferences table
      const userPreferences = userPreferencesData || user?.preferences as {
        dislikedColors?: string[];
        preferredStyles?: string[];
        dailyActivities?: string[];
        leisureActivities?: string[];
        wardrobeGoals?: string[];
        scenarios?: any[];
        stylePreferences?: {
          [key: string]: any;
        };
        localClimate?: string;
        officeDressCode?: string;
        remoteWorkPriority?: string;
        creativeMobility?: string;
        otherLeisureActivity?: string;
        outdoorFrequency?: any;
        socialFrequency?: any;
        formalEventsFrequency?: any;
        travelFrequency?: string;
        otherWardrobeGoal?: string;
        shoppingLimit?: {
          frequency: string;
          amount: number;
        };
        clothingBudget?: {
          amount: number;
          currency: string;
          frequency: string;
        };
      };
      
      // Helper function to parse array data from the database
      const parseArrayData = (data: any, fallback: any[] = []) => {
        // If it's already an array, use it directly
        if (Array.isArray(data)) {
          return data;
        }
        // If it's a string, try to parse it as JSON
        else if (typeof data === 'string') {
          try {
            // If it starts with [ and ends with ], it's likely a JSON array
            if (data.trim().startsWith('[') && data.trim().endsWith(']')) {
              return JSON.parse(data);
            }
            // Otherwise, it might be a single value or comma-separated list
            else if (data.includes(',')) {
              return data.split(',').map((item: string) => item.trim());
            } else {
              return [data];
            }
          } catch (e) {
            console.error('Error parsing array data:', e);
            // If parsing fails, return as a single-item array
            return data ? [data] : [];
          }
        }
        // Return fallback if data is null or undefined
        return fallback;
      };
      
      // Uncomment for debugging
      // console.log('Raw daily_activities data:', {
      //   fromDB: userPreferencesData?.daily_activities,
      //   fromAuth: userPreferences?.dailyActivities,
      //   defaultValue: defaultPreferences.dailyActivities
      // });
      
      // Map database fields (snake_case) to our client-side model (camelCase)
      const mappedPreferences = {
        ...defaultPreferences,
        // Map fields from userPreferencesData (database) with fallback to user.preferences
        // Use parseArrayData for all array fields
        preferredStyles: parseArrayData(userPreferencesData?.preferred_styles, userPreferences?.preferredStyles || defaultPreferences.preferredStyles),
        dailyActivities: parseArrayData(userPreferencesData?.daily_activities, userPreferences?.dailyActivities || defaultPreferences.dailyActivities),
        // Temporarily comment out other_activity_description until DB schema is updated
        // Instead, we'll store this information in memory only for now
        otherActivityDescription: userPreferences?.otherActivityDescription || '',
        homeActivities: parseArrayData(userPreferencesData?.home_activities, userPreferences?.homeActivities || []),
        officeDressCode: userPreferencesData?.office_dress_code || userPreferences?.officeDressCode || defaultPreferences.officeDressCode,
        remoteWorkPriority: userPreferencesData?.remote_work_priority || userPreferences?.remoteWorkPriority || defaultPreferences.remoteWorkPriority,
        creativeMobility: userPreferencesData?.creative_mobility || userPreferences?.creativeMobility || defaultPreferences.creativeMobility,
        studentDressCode: userPreferencesData?.student_uniform || userPreferences?.studentDressCode || defaultPreferences.studentDressCode,
        uniformPreference: userPreferencesData?.uniform_preference || userPreferences?.uniformPreference || defaultPreferences.uniformPreference,
        // Map individual style preference fields from the database
        stylePreferences: userPreferencesData ? {
          comfortVsStyle: typeof userPreferencesData.comfort_vs_style === 'number' ? userPreferencesData.comfort_vs_style : 50,
          classicVsTrendy: typeof userPreferencesData.classic_vs_trendy === 'number' ? userPreferencesData.classic_vs_trendy : 50,
          basicsVsStatements: typeof userPreferencesData.basics_vs_statements === 'number' ? userPreferencesData.basics_vs_statements : 50,
          additionalNotes: userPreferencesData.style_additional_notes || ''
        } : userPreferences?.stylePreferences || defaultPreferences.stylePreferences,
        localClimate: userPreferencesData?.local_climate || userPreferences?.localClimate || defaultPreferences.localClimate,
        leisureActivities: parseArrayData(userPreferencesData?.leisure_activities, userPreferences?.leisureActivities || defaultPreferences.leisureActivities),
        // Handle otherLeisureActivity which can be a string or an object with a text property
        otherLeisureActivity: userPreferencesData?.other_leisure_activity || userPreferences?.otherLeisureActivity,
        outdoorFrequency: userPreferencesData ? {
          frequency: typeof userPreferencesData.outdoor_frequency_value === 'number' ? userPreferencesData.outdoor_frequency_value : 
                    typeof userPreferencesData.outdoor_frequency_value === 'string' ? parseInt(userPreferencesData.outdoor_frequency_value) : 0,
          period: userPreferencesData.outdoor_frequency_period || 'weekly'
        } : userPreferences?.outdoorFrequency,
        socialFrequency: userPreferencesData ? {
          frequency: typeof userPreferencesData.social_frequency_value === 'number' ? userPreferencesData.social_frequency_value : 
                    typeof userPreferencesData.social_frequency_value === 'string' ? parseInt(userPreferencesData.social_frequency_value) : 0,
          period: userPreferencesData.social_frequency_period || 'weekly'
        } : userPreferences?.socialFrequency,
        formalEventsFrequency: userPreferencesData ? {
          frequency: typeof userPreferencesData.formal_events_frequency_value === 'number' ? userPreferencesData.formal_events_frequency_value : 
                    typeof userPreferencesData.formal_events_frequency_value === 'string' ? parseInt(userPreferencesData.formal_events_frequency_value) : 0,
          period: userPreferencesData.formal_events_frequency_period || 'monthly'
        } : userPreferences?.formalEventsFrequency,
        travelFrequency: userPreferencesData?.travel_frequency || userPreferences?.travelFrequency,
        wardrobeGoals: parseArrayData(userPreferencesData?.wardrobe_goals, userPreferences?.wardrobeGoals || defaultPreferences.wardrobeGoals),
        otherWardrobeGoal: userPreferencesData?.other_wardrobe_goal || userPreferences?.otherWardrobeGoal,
        scenarios: parseArrayData(userPreferencesData?.scenarios, userPreferences?.scenarios || []),
        // 🎯 IMPORTANT: Map budget data from user_progress table (unified budget service)
        // This ensures we always use the latest data from the unified budget storage
        shoppingLimit: budgetData?.shoppingLimit ? {
          amount: budgetData.shoppingLimit.shoppingLimitAmount || 0,
          frequency: budgetData.shoppingLimit.shoppingLimitFrequency || 'monthly'
        } : {
          amount: 0,
          frequency: 'monthly'
        },
        clothingBudget: budgetData?.clothingBudget ? {
          amount: budgetData.clothingBudget.amount || 0,
          currency: budgetData.clothingBudget.currency || 'USD',
          frequency: budgetData.clothingBudget.frequency || 'monthly'
        } : {
          amount: 0,
          currency: 'USD',
          frequency: 'monthly'
        },
        // Subscription information - now from user_profiles table
        subscriptionPlan: userProfileData?.subscription_plan || 'free',
        subscriptionRenewalDate: userProfileData?.subscription_renewal_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Monthly renewal
      };
      
      return mappedPreferences as UserPreferences;
    }
    return defaultPreferences;
  }, [user, userPreferencesData, userProfileData, budgetData]); // Added budgetData to dependency array for unified budget storage
  
  // Function to save profile data to backend
  const saveProfileData = useCallback(async (data: any) => {
    try {
      // Debug logging for profile data being saved
      console.log('DEBUG - useProfileData - saveProfileData - Before saving:', {
        localClimate: data.localClimate,
        dataKeys: Object.keys(data),
        rawData: JSON.stringify(data)
      });
      
      // Use supabaseAuthService directly instead of API call
      await supabaseAuthService.updateStyleProfile({ styleProfile: data });
      
      // Refresh user data to get the updated profile
      refreshUserData();
      // Success is handled by the component's own UI (modal, toast, etc.)
      return { success: true };
    } catch (error) {
      console.error('Error saving profile data:', error);
      // Error is handled by the component's own UI
      return { success: false, error };
    }
  }, [refreshUserData]);

  // Get subscription data from user profile
  const [subscription, setSubscription] = useState<SubscriptionData>(() => {
    return {
      plan: userProfileData?.subscription_plan || 'free',
      renewalDate: userProfileData?.subscription_renewal_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      features: userProfileData?.subscription_plan === 'pro' ? 
        ['AI Recommendations', 'Unlimited Items', 'Calendar Planning', 'Priority Support'] : 
        ['Basic Recommendations', 'Limited Items (100)', 'Basic Calendar']
    };
  });
  
  // Update subscription when user profile data changes
  useEffect(() => {
    if (userProfileData) {
      setSubscription({
        plan: userProfileData.subscription_plan || 'free',
        renewalDate: userProfileData.subscription_renewal_date || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        features: userProfileData.subscription_plan === 'pro' ? 
          ['AI Recommendations', 'Unlimited Items', 'Calendar Planning', 'Priority Support'] : 
          ['Basic Recommendations', 'Limited Items (100)', 'Basic Calendar']
      });
    }
  }, [userProfileData]);
  
  // Extract shopping limit values
  const limitAmount = (user?.preferences as any)?.shoppingLimit?.limitAmount;
  const amount = (user?.preferences as any)?.shoppingLimit?.amount;
  const shopping_limit_amount = (user?.preferences as any)?.shopping_limit_amount;
  
  // Use mock data for ShoppingLimitData since we're using the actual data in styleProfile
  const [shoppingLimit, setShoppingLimit] = useState<ShoppingLimitData>({
    // Prioritize limitAmount over amount
    amount: limitAmount || amount || shopping_limit_amount || 0,
    frequency: 'monthly',
    notifications: true
  });
  
  // Update shopping limit data when user preferences change
  useEffect(() => {
    if (user?.preferences) {
      // Use type assertion to avoid TypeScript errors
      const preferences = user.preferences as any;
      
      setShoppingLimit(prev => {
        // Prioritize limitAmount over amount
        const limitAmount = preferences?.shoppingLimit?.limitAmount || // First check limitAmount
                         preferences?.shoppingLimit?.amount || // Then check amount
                         preferences?.shopping_limit_amount || // Then check database field
                         prev.amount; // Fall back to current value instead of 0
        
        // Only update if values have actually changed
        if (prev.amount !== limitAmount) {
          return {
            ...prev,
            amount: limitAmount,
            frequency: preferences?.shoppingLimit?.frequency || prev.frequency
          };
        }
        return prev; // Return previous state if no change needed
      });
    } else {
      console.log('No shopping limit data found in user preferences');
    }
  }, [user]);
  
  const [aiSettings, setAiSettings] = useState<AISettingsData>({
    preferredModel: 'Claude',
    enablePersonalization: true,
    saveHistory: true,
    dataSharing: false,
    customPrompts: ''
  });
  
  const [notifications, setNotifications] = useState<NotificationsData>({
    emailNotifications: true,
    pushNotifications: false,
    reminderTime: '08:00',
    weeklyDigest: true,
    specialOffers: false
  });
  
  const [otherSettings, setOtherSettings] = useState<OtherSettingsData>({
    language: 'English',
    theme: 'Light',
    dataExport: false,
    deleteAccount: false
  });
  
  // Event handlers
  const handleSubscriptionChangePlan = useCallback((newPlan: string) => {
    // Update subscription plan in state
    setSubscription(prev => ({
      ...prev,
      plan: newPlan,
      renewalDate: newPlan === 'pro' ? 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : // One year from now
        prev.renewalDate,
      features: newPlan === 'pro' ? 
        ['AI Recommendations', 'Unlimited Items', 'Calendar Planning', 'Priority Support'] : 
        ['Basic Recommendations', 'Limited Items (100)', 'Basic Calendar']
    }));
    
    // Save to database if user is logged in
    if (user?.id) {
      // Create partial preferences object with just the subscription fields
      const subscriptionUpdate: Partial<UserPreferences> = {
        userId: user.id,
        subscriptionPlan: newPlan,
        subscriptionRenewalDate: newPlan === 'pro' ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : // One year from now
          subscription.renewalDate
      };
      
      // Save to database
      updateUserPreferences(user.id, subscriptionUpdate)
        .then(() => {
          console.log('Subscription updated successfully');
        })
        .catch((error: Error) => {
          console.error('Error updating subscription:', error);
        });
    }
  }, [user, subscription]);
  
  const handleSubscriptionManageBilling = useCallback(() => {
    // Handle manage billing action
  }, []);
  
  const handleSubscriptionViewUpgradeOptions = useCallback(() => {
    // Handle view upgrade options action
  }, []);
  
  const handleShoppingLimitSave = useCallback((data: ShoppingLimitData) => {
    setShoppingLimit(data);
  }, []);
  
  const handleAISettingsSave = useCallback((data: AISettingsData) => {
    setAiSettings(data);
  }, []);
  
  const handleAISettingsReset = useCallback(() => {
    setAiSettings({
      preferredModel: 'Claude',
      enablePersonalization: true,
      saveHistory: true,
      dataSharing: false,
      customPrompts: ''
    });
  }, []);
  
  const handleNotificationsSave = useCallback((data: NotificationsData) => {
    setNotifications(data);
  }, []);
  
  const handleOtherSettingsExportData = useCallback(() => {
    // Handle export data action
  }, []);
  
  const handleOtherSettingsDeleteAccount = useCallback(() => {
    // Handle delete account action
  }, []);
  
  const handleOtherSettingsSave = useCallback((data: OtherSettingsData) => {
    setOtherSettings(data);
  }, []);
  
  const handleStyleProfileSave = useCallback((data: UserPreferences) => {
    saveProfileData(data);
  }, [saveProfileData]);

  return {
    // Data
    styleProfile,
    subscription,
    shoppingLimit,
    aiSettings,
    notifications,
    otherSettings,
    
    // Handlers
    handleStyleProfileSave,
    handleSubscriptionChangePlan,
    handleSubscriptionManageBilling,
    handleSubscriptionViewUpgradeOptions,
    handleShoppingLimitSave,
    handleAISettingsSave,
    handleAISettingsReset,
    handleNotificationsSave,
    handleOtherSettingsExportData,
    handleOtherSettingsDeleteAccount,
    handleOtherSettingsSave,
    
    // Utility functions
    saveProfileData,
    refreshUserData
  };
};
