// Import from the consolidated client to prevent multiple instances
import { supabase } from './supabaseClientMigration';
import { saveClothingBudgetData, saveShoppingLimitData } from './userBudgetsService';

// Types
interface RegisterData {
  name: string;
  email: string;
  password: string;
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface OnboardingData {
  // User preferences as a separate object
  preferences: {
    favoriteColors: string[];
    preferredStyles: string[];
    // seasonalPreferences removed as redundant with climate preference
    scenarios?: any[];
    dailyActivities?: string[];
    leisureActivities?: string[];
    wardrobeGoals?: string[];
    stylePreferences?: {
      comfortVsStyle?: number;
      classicVsTrendy?: number;
      basicsVsStatements?: number;
      additionalNotes?: string;
    };
    localClimate?: string;
    // Lifestyle preferences
    socialFrequency?: string;
    socialPeriod?: string;
    formalEventsFrequency?: string;
    formalEventsPeriod?: string;
    outdoorFrequency?: string;
    outdoorPeriod?: string;
    travelFrequency?: string;
    otherWardrobeGoal?: string;
    shoppingLimit?: {
      hasLimit?: boolean;
      limitFrequency?: string;
      limitAmount?: number;
    };
  };
  
  // Work-related preferences as a separate object
  workStyle?: {
    officeDressCode?: string;
    remoteWorkPriority?: string;
    creativeMobility?: string;
    studentDressCode?: string;
  };
  
  // Budget information as a separate object
  clothingBudget?: {
    amount?: number;
    currency?: string;
    frequency?: string;
  };
  
  [key: string]: any; // Allow for additional fields
}

interface ProfileData {
  name?: string;
  email?: string;
}

interface StyleProfileData {
  styleProfile: any;
}

interface BudgetData {
  clothingBudget: any;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    profileCompleted: boolean;
    onboardingCompleted: boolean;
  };
  emailConfirmationRequired?: boolean;
}

interface TemporaryUser {
  id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  onboardingCompleted: boolean;
}

// Define the authService interface for TypeScript
interface AuthService {
  _userCache: {
    data: any | null;
    timestamp: number;
    expiryMs: number;
  };
  register(userData: RegisterData): Promise<AuthResponse>;
  login(userData: LoginData): Promise<AuthResponse>;
  getCurrentUser(): Promise<any>;
  createTemporaryUserFromToken(token: string): TemporaryUser | null;
  completeOnboarding(data: OnboardingData): Promise<any>;
  updateProfile(profileData: ProfileData): Promise<any>;
  updateStyleProfile(styleProfile: StyleProfileData): Promise<any>;
  updateBudget(budgetData: BudgetData): Promise<any>;
  logout(): void;
  isAuthenticated(): Promise<boolean>;
  createUserProfile(userId: string, userData: RegisterData): Promise<void>;
}

// Helper function to convert camelCase to snake_case for database compatibility
const camelToSnakeCase = (obj: any): any => {
  const snakeCaseObj: any = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Convert camelCase to snake_case
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      snakeCaseObj[snakeKey] = obj[key];
    }
  }
  
  return snakeCaseObj;
};

// Debug flag to control console logging
const DEBUG_MODE = false;

// Helper function for conditional logging
const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }
};

// Helper function to store user metadata in Supabase
const updateUserMetadata = async (userId: string, metadata: any): Promise<any> => {
  try {
    // Convert camelCase properties to snake_case for Supabase
    const snakeCaseMetadata = camelToSnakeCase(metadata);
    
    // Remove preferences field if it exists since the column has been dropped
    if (snakeCaseMetadata.preferences) {
      console.log('WARNING: Attempted to save to removed preferences column. This field will be ignored.');
      delete snakeCaseMetadata.preferences;
    }
    
    // 🎯 Use update-or-insert pattern to prevent duplicate records (same pattern as budget service)
    // First, check if a profile already exists for this user
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_uuid', userId)
      .order('id', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error checking existing user profile:', fetchError);
      throw fetchError;
    }
    
    let data, error;
    
    if (existingProfile) {
      // Update existing record by ID to preserve position and prevent duplicates
      console.log(`👤 updateUserMetadata - Updating existing profile ID ${existingProfile.id} for user ${userId}`);
      const updateResult = await supabase
        .from('user_profiles')
        .update({
          ...snakeCaseMetadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingProfile.id as number)
        .select()
        .single();
      
      data = updateResult.data;
      error = updateResult.error;
    } else {
      // Insert new record only if none exists
      console.log(`👤 updateUserMetadata - Creating new profile for user ${userId}`);
      const insertResult = await supabase
        .from('user_profiles')
        .insert({
          user_uuid: userId,
          ...snakeCaseMetadata,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      data = insertResult.data;
      error = insertResult.error;
    }
      
    if (error) {
      // Always log errors even in non-debug mode
      console.error('Error updating user metadata:', error);
      throw error;
    }
    
    debugLog('User metadata updated successfully', data);
    return data;
  } catch (error) {
    // Always log errors even in non-debug mode
    console.error('Error updating user metadata:', error);
    throw error;
  }
};

// Helper function to get user metadata from Supabase
export const getUserProfileByUserId = async (userId: string) => {
  try {
    debugLog('Getting user profile for user ID:', userId);
    
    // Import the workaround helper
    const { getUserProfileByUuid, getUserProfileById } = await import('./userProfilesWorkaround');
    
    // Try with user_uuid field first (newer approach)
    const { data: uuidData, error: uuidError } = await getUserProfileByUuid(userId);
      
    if (!uuidError && uuidData) {
      debugLog('Found user profile by UUID');
      return uuidData;
    }
    
    // Fall back to legacy id field if needed
    const { data: idData, error: idError } = await getUserProfileById(userId);
    
    if (!idError && idData) {
      debugLog('Found user profile by ID');
      return idData;
    }
    
    if (uuidError) {
      // Only log in debug mode unless it's the final error
      if (!idError) {
        console.error('Error getting user profile by UUID:', uuidError);
      } else {
        debugLog('Error getting user profile by UUID:', uuidError);
      }
    }
    
    if (idError) {
      console.error('Error getting user profile by ID:', idError);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Implement the authService with Supabase
const supabaseAuthServiceImpl: AuthService = {
  // Register a new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      debugLog('Starting registration process...');
      
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          // Store user metadata for later use
          data: {
            name: userData.name,
            email: userData.email,
            profileCompleted: false,
            onboardingCompleted: false
          },
          // Redirect to homepage after email confirmation
          emailRedirectTo: window.location.origin
        }
      });
      
      if (authError) {
        console.error('Auth error during signup:', authError);
        throw authError;
      }
      
      debugLog('Auth signup successful:', authData);
      
      if (!authData.user) {
        throw new Error('Registration failed: No user returned');
      }
      
      // Check if email confirmation is required
      const needsEmailConfirmation = authData.session === null;
      
      // Get the current session to verify authentication state
      const { data: sessionData } = await supabase.auth.getSession();
      debugLog('Current session after signup:', sessionData);
      
      // If we have a session, create the user profile
      if (sessionData?.session) {
        try {
          await this.createUserProfile(authData.user.id, userData);
        } catch (profileError) {
          console.error('Failed to create user profile after signup:', profileError);
          // Continue with registration even if profile creation fails
        }
      } else if (needsEmailConfirmation) {
        debugLog('Email confirmation required. User profile will be created after email confirmation and login.');
        // Don't attempt auto sign-in as it will fail with email not confirmed error
      } else {
        debugLog('No session available yet. User profile will be created on first login.');
      }
      
      // Get the latest session data after potential sign-in
      const { data: finalSessionData } = await supabase.auth.getSession();
      
      // Check if email confirmation is still required after all attempts
      const isEmailConfirmationRequired = authData.session === null && finalSessionData?.session === null;
      
      return {
        user: {
          id: authData.user.id,
          email: authData.user.email || '',
          name: userData.name,
          profileCompleted: false,
          onboardingCompleted: false
        },
        token: finalSessionData?.session?.access_token || '',
        emailConfirmationRequired: isEmailConfirmationRequired
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Helper function to create user profile
  async createUserProfile(userId: string, userData: RegisterData): Promise<void> {
    try {
      debugLog('Creating user profile for user ID:', userId);
      
      // Get current session to verify we're authenticated
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        console.error('No active session when trying to create user profile');
        throw new Error('Authentication required to create user profile');
      }
      
      debugLog('Creating user profile with session:', 
        sessionData.session.access_token.substring(0, 10) + '...');
      
      // Try direct insert first
      const { data: directInsertData, error: directInsertError } = await supabase
        .from('user_profiles')
        .insert({
          user_uuid: userId,
          name: userData.name,
          email: userData.email,
          profile_completed: false,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (directInsertError) {
        debugLog('Direct insert error:', directInsertError);
        // Fall back to the normal method if direct insert fails
        debugLog('Falling back to updateUserMetadata...');
        
        // Create a clean profile object without password
        const { password, ...cleanUserData } = userData;
        
        await updateUserMetadata(userId, {
          name: cleanUserData.name,
          email: cleanUserData.email,
          profileCompleted: false,
          onboardingCompleted: false,
          created_at: new Date().toISOString()
        });
      } else {
        debugLog('Direct insert successful:', directInsertData);
      }
    } catch (insertError: any) {
      console.error('Error during profile creation:', insertError);
      // Continue with registration even if profile creation fails
      // We can handle this later when the user logs in
    }
  },
  
  // Login user
  async login(userData: LoginData): Promise<AuthResponse> {
    try {
      // Login with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Login failed: No user returned');
      }
      
      // Check if this might be the first login after email confirmation
      // We'll check for a specific metadata flag or session property
      const isFirstLogin = !authData.user.user_metadata?.profile_created;
      let userProfile = null;
      
      // Only try to fetch the profile if it's not the first login
      if (!isFirstLogin) {
        debugLog('Not first login, attempting to fetch existing profile');
        userProfile = await getUserProfileByUserId(authData.user.id);
      } else {
        debugLog('Detected first login, skipping profile fetch attempt');
      }
      
      // Create the user profile if it doesn't exist
      if ((!userProfile || isFirstLogin) && authData.user) {
        debugLog('No user profile found. This might be the first login after email confirmation.');
        try {
          // Create a user profile with basic information and get the result directly
          // IMPORTANT: Set onboardingCompleted to false for new profiles to ensure users go through onboarding
          const profileData = {
            name: authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
            email: authData.user.email || userData.email,
            // Remove password field as it doesn't exist in the Supabase schema
            onboardingCompleted: false, // Ensure new users go through onboarding
            profileCompleted: false // Ensure profile is marked as incomplete
          };
          
          // Create the profile and get the result directly
          const createdProfile = await updateUserMetadata(authData.user.id, profileData);
          debugLog('Direct profile creation successful:', createdProfile);
          
          // Update user metadata to mark that profile has been created
          try {
            await supabase.auth.updateUser({
              data: { profile_created: true }
            });
            console.log('Updated user metadata to mark profile as created');
          } catch (metadataError) {
            console.error('Failed to update user metadata:', metadataError);
            // Continue even if metadata update fails
          }
          
          // Use the created profile directly instead of fetching again
          userProfile = createdProfile;
          console.log('Created user profile during first login with onboardingCompleted=false:', userProfile);
        } catch (profileError) {
          console.error('Failed to create user profile during login:', profileError);
          // Continue with login even if profile creation fails
        }
      }
      
      // Store session token in localStorage
      if (authData.session) {
        localStorage.setItem('token', authData.session.access_token);
      }
      
      // Return formatted response
      return {
        token: authData.session?.access_token || '',
        user: {
          id: authData.user.id,
          name: userProfile?.name || authData.user.user_metadata?.name || authData.user.email?.split('@')[0] || 'User',
          email: authData.user.email || userData.email,
          profileCompleted: userProfile?.profile_completed || userProfile?.profileCompleted || false,
          onboardingCompleted: userProfile?.onboarding_completed || userProfile?.onboardingCompleted || false
        }
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  },
  
  // Cache for user data to improve performance
  _userCache: {
    data: null,
    timestamp: 0,
    expiryMs: 60000 // Cache expires after 1 minute
  },

  // Get current user data with caching
  async getCurrentUser() {
    try {
      debugLog('Getting current user data');
      
      // Check if we have a valid cached user
      const now = Date.now();
      if (this._userCache.data && (now - this._userCache.timestamp < this._userCache.expiryMs)) {
        debugLog('Returning cached user data');
        return this._userCache.data;
      }
      
      // Get session directly from Supabase Auth
      const { data: sessionData } = await supabase.auth.getSession();
      
      // If no session, user is not authenticated
      if (!sessionData.session || !sessionData.session.user) {
        debugLog('No active session found');
        return null;
      }
      
      // Get user from session
      const user = sessionData.session.user;
      debugLog('User authenticated, fetching profile data');
      
      // Get user profile data - optimized to avoid multiple DB calls
      let userProfile = null;
      try {
        userProfile = await getUserProfileByUserId(user.id);
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Continue with basic user data even if profile fetch fails
      }
      
      // Prepare user data with fallbacks
      const userData = {
        id: user.id || '',
        name: userProfile?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        profileCompleted: userProfile?.profile_completed || userProfile?.profileCompleted || false,
        onboardingCompleted: userProfile?.onboarding_completed || userProfile?.onboardingCompleted || false,
        preferences: userProfile?.preferences || {},
        styleProfile: userProfile?.style_profile || userProfile?.styleProfile || {},
        clothingBudget: userProfile?.clothing_budget || userProfile?.clothingBudget || {}
      };
      
      // If no profile exists, create one asynchronously but don't wait for it
      if (!userProfile) {
        debugLog('No user profile found, creating basic profile asynchronously');
        updateUserMetadata(user.id, {
          name: user.email?.split('@')[0] || 'User',
          email: user.email,
          profileCompleted: false,
          onboardingCompleted: false,
          created_at: new Date().toISOString()
        }).catch(error => {
          console.error('Error creating user profile:', error);
        });
      }
      
      // Update cache with longer expiry for better performance
      this._userCache = {
        data: userData,
        timestamp: Date.now(),
        expiryMs: 300000 // 5 minutes
      };
      
      // Return user data
      return userData;
    } catch (error) {
      // Always log errors even in non-debug mode
      console.error('Error getting current user:', error);
      return null;
    }
  },
  
  // Helper method to create a temporary user from a JWT token
  createTemporaryUserFromToken(token: string): TemporaryUser | null {
    try {
      // This is a simplified version - in a real app, you'd decode the JWT
      // For now, we'll just create a basic temporary user
      return {
        id: 'temp-user',
        name: 'Guest User',
        email: 'guest@example.com',
        profileCompleted: false,
        onboardingCompleted: false
      };
    // eslint-disable-next-line no-unreachable
    } catch (error) {
      console.error('Error creating temporary user:', error);
      return null;
    }
  },
  
  // Complete onboarding
  async completeOnboarding(data: OnboardingData): Promise<any> {
    console.log('DEBUG - completeOnboarding - ENTRY POINT with data:', JSON.stringify(data, null, 2));
    
    // Validate input data
    if (!data) {
      console.error('ERROR - completeOnboarding - Missing data');
      throw new Error('Missing onboarding data');
    }
    
    // Ensure preferences object exists
    if (!data.preferences) {
      console.error('ERROR - completeOnboarding - Missing preferences');
      // Initialize with required properties to satisfy TypeScript
      data.preferences = {
        favoriteColors: [],
        preferredStyles: [],
        // seasonalPreferences removed as redundant with climate preference
        dailyActivities: [],
        leisureActivities: []
      };
    }
    
    // Handle the case where preferences might be nested inside preferences
    // This happens when AuthContext or SupabaseAuthContext calls completeOnboarding({ preferences })
    if (data.preferences && typeof data.preferences === 'object') {
      if ((data.preferences as any).preferences) {
        console.log('DEBUG - completeOnboarding - Found nested preferences structure');
        
        // Create a new data object with the nested preferences flattened
        const flattenedData = {
          ...data,
          // Extract workStyle from the nested preferences if it exists there
          workStyle: data.workStyle || (data.preferences as any).workStyle,
          // Extract clothingBudget from the nested preferences if it exists there
          clothingBudget: data.clothingBudget || (data.preferences as any).clothingBudget,
          // Replace the preferences with the nested ones
          preferences: (data.preferences as any).preferences
        };
        
        // Use the flattened data for the rest of the function
        data = flattenedData as OnboardingData;
        console.log('DEBUG - completeOnboarding - Flattened data structure:', JSON.stringify(data, null, 2));
      }
    }
    try {
      // Log the entire data object to see its structure
      console.log('DEBUG - COMPLETE DATA OBJECT:', JSON.stringify(data, null, 2));
      console.log('DEBUG - DATA Office Dress Code:', data);
      // Access the raw data directly to ensure we're getting the correct values
      let officeDressCodeValue = '';
      
      // Check if workStyle exists and has officeDressCode (new structure)
      if (data.workStyle && typeof data.workStyle === 'object' && 'officeDressCode' in data.workStyle) {
        officeDressCodeValue = data.workStyle.officeDressCode ?? '';
        console.log('DEBUG - Found officeDressCode in workStyle:', officeDressCodeValue);
      }
      
      // If not found in workStyle, check preferences (for backward compatibility)
      if (!officeDressCodeValue && data.preferences && typeof data.preferences === 'object' && 'officeDressCode' in data.preferences) {
        // Use type assertion to handle the dynamic property access
        officeDressCodeValue = (data.preferences as any).officeDressCode?.toString() ?? '';
        console.log('DEBUG - Found officeDressCode in preferences:', officeDressCodeValue);
      }
      
      console.log('DEBUG - Final officeDressCodeValue:', officeDressCodeValue);
      
      // If still not found but office is in dailyActivities, use default
      if (!officeDressCodeValue && 
          data.preferences?.dailyActivities && 
          Array.isArray(data.preferences.dailyActivities) && 
          data.preferences.dailyActivities.includes('office')) {
        officeDressCodeValue = 'business-casual';
        console.log('DEBUG - Using default officeDressCode:', officeDressCodeValue);
      }
      
      console.log('DEBUG - Final officeDressCode value to be used:', officeDressCodeValue);
      
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        console.error('User not authenticated during onboarding completion');
        throw new Error('User not authenticated');
      }
      
      console.log(`Updating profile for user ${authData.user.id} with onboarding data`);
      
      // Update user profile with onboarding data in user_profiles table
      // Extract daily activities from preferences for logging
      const dailyActivities = data.preferences?.dailyActivities || [];
      console.log('DEBUG - dailyActivities to save:', dailyActivities);
      
      // We no longer need to create a consolidated preferences object since the preferences column has been removed
      // The individual components (scenarios, preferences) are saved to their respective tables
      
      // No longer save to preferences column as it's been removed
      // Just mark onboarding as completed
      const updatedProfile = await updateUserMetadata(authData.user.id, {
        onboardingCompleted: true
      });
      
      // Also save to user_preferences table
      try {
        console.log('DEBUG - completeOnboarding - BEFORE saving to user_preferences');
        console.log('DEBUG - completeOnboarding - data structure:', JSON.stringify(data, null, 2));
        
        // Dynamically import to avoid circular dependencies
        const { saveUserPreferences } = await import('./userPreferencesService');
        
        // Start with all existing preferences
        const { outdoorFrequency, socialFrequency, formalEventsFrequency, ...otherPrefs } = data.preferences || {};
        
        console.log('DEBUG - completeOnboarding - extracted preferences:', JSON.stringify({ outdoorFrequency, socialFrequency, formalEventsFrequency, otherPrefs }, null, 2));
        
        // Ensure all required fields in ProfileData are provided with default values
        const profileData = {
          // Include other fields from preferences (except those we'll handle specially)
          ...otherPrefs,
          
          // Required fields with default empty arrays if undefined - these will override any properties from otherPrefs
          dailyActivities: Array.isArray(data.preferences.dailyActivities) ? data.preferences.dailyActivities : [],
          preferredStyles: Array.isArray(data.preferences.preferredStyles) ? data.preferences.preferredStyles : [],
          localClimate: typeof data.preferences.localClimate === 'string' ? data.preferences.localClimate : '',
          leisureActivities: Array.isArray(data.preferences.leisureActivities) ? data.preferences.leisureActivities : [],
          wardrobeGoals: Array.isArray(data.preferences.wardrobeGoals) ? data.preferences.wardrobeGoals : [],
          // Explicitly include homeActivities with type assertion to handle TypeScript errors
          homeActivities: Array.isArray((data.preferences as any).homeActivities) ? (data.preferences as any).homeActivities : [],
          
          // Include otherActivityDescription for daily activities
          otherActivityDescription: typeof (data.preferences as any).otherActivityDescription === 'string' ? (data.preferences as any).otherActivityDescription : '',
          
          // Add workStyle data
          ...(data.workStyle || {}),
          
          // Add clothing budget data - handle both nested and flattened structure
          clothingBudgetAmount: data.clothingBudgetAmount || data.clothingBudget?.amount || null,
          clothingBudgetCurrency: data.clothingBudgetCurrency || data.clothingBudget?.currency || null,
          clothingBudgetFrequency: data.clothingBudgetFrequency || data.clothingBudget?.frequency || null,
          
          // Debug logging for clothing budget in supabaseAuthService
          ...(function() {
            console.log('DEBUG - supabaseAuthService - Input clothing budget data:', {
              fromFlattened: {
                amount: data.clothingBudgetAmount,
                currency: data.clothingBudgetCurrency,
                frequency: data.clothingBudgetFrequency
              },
              fromNested: data.clothingBudget,
              finalValues: {
                amount: data.clothingBudgetAmount || data.clothingBudget?.amount || null,
                currency: data.clothingBudgetCurrency || data.clothingBudget?.currency || null,
                frequency: data.clothingBudgetFrequency || data.clothingBudget?.frequency || null
              }
            });
            return {};
          })(),
          
          // Explicitly include specific fields that might be missing - preserve actual selected values
          // Check both direct properties and nested workStyle object
          // Use our carefully extracted and validated officeDressCode value
          officeDressCode: officeDressCodeValue,
          // Access work-related preferences with proper type safety
          remoteWorkPriority: data.workStyle?.remoteWorkPriority || 
            // For backward compatibility, check direct properties on preferences
            (typeof data.preferences === 'object' ? 
              // Use type assertion for accessing non-standard properties
              (data.preferences as Record<string, any>).remoteWorkPriority || 
              // Check for nested preferences structure
              ((data.preferences as Record<string, any>)['preferences']?.remoteWorkPriority) : 
              undefined),
          
          creativeMobility: data.workStyle?.creativeMobility || 
            // For backward compatibility, check direct properties on preferences
            (typeof data.preferences === 'object' ? 
              // Use type assertion for accessing non-standard properties
              (data.preferences as Record<string, any>).creativeMobility || 
              // Check for nested preferences structure
              ((data.preferences as Record<string, any>)['preferences']?.creativeMobility) : 
              undefined),
              
          // Handle uniform preference for physical work
          uniformPreference: (typeof data.preferences === 'object' ? 
              // Use type assertion for accessing non-standard properties
              (data.preferences as Record<string, any>).uniformPreference || 
              // Check for nested preferences structure
              ((data.preferences as Record<string, any>)['preferences']?.uniformPreference) : 
              undefined),
              
          // Handle student dress code
          studentDressCode: (typeof data.preferences === 'object' ? 
              // Use type assertion for accessing non-standard properties
              (data.preferences as Record<string, any>).studentDressCode || 
              // Check for nested preferences structure
              ((data.preferences as Record<string, any>)['preferences']?.studentDressCode) : 
              undefined),
          // Handle complex object types correctly
          outdoorFrequency: typeof outdoorFrequency === 'string' ? 
            { frequency: 0, period: outdoorFrequency || '' } : outdoorFrequency,
          
          socialFrequency: typeof socialFrequency === 'string' ? 
            { frequency: 0, period: socialFrequency || '' } : socialFrequency,
            
          formalEventsFrequency: typeof formalEventsFrequency === 'string' ? 
            { frequency: 0, period: formalEventsFrequency || '' } : formalEventsFrequency,
            
          // Add shoppingLimit with the correct structure to match ProfileData interface
          shoppingLimit: data.preferences?.shoppingLimit ? {
            frequency: data.preferences.shoppingLimit.limitFrequency || '',
            amount: data.preferences.shoppingLimit.limitAmount || 0
          } : (typeof data.preferences === 'object' && (data.preferences as Record<string, any>)['preferences']?.shoppingLimit) ? {
            frequency: (data.preferences as Record<string, any>)['preferences'].shoppingLimit.frequency || '',
            amount: (data.preferences as Record<string, any>)['preferences'].shoppingLimit.amount || 0
          } : undefined
        };

        // 🚀 HYBRID SAVE STRATEGY: Save budget data to user_progress table
        console.log('DEBUG - completeOnboarding - Implementing hybrid save strategy for budget data');
        
        // Remove budget data from profileData before saving to user_preferences
        const { shoppingLimit, clothingBudgetAmount, clothingBudgetCurrency, clothingBudgetFrequency, ...preferencesOnlyData } = profileData;
        
        try {
          // Extract clothing budget data
          const clothingBudgetData = {
            amount: data.clothingBudgetAmount || 0,
            currency: data.clothingBudgetCurrency || 'USD', 
            frequency: data.clothingBudgetFrequency || 'monthly',
            currentSpent: 0,
            periodStartDate: undefined,
            periodEndDate: undefined
          };

          // Extract shopping limit data
          const shoppingLimitData = profileData.shoppingLimit ? {
            shoppingLimitAmount: profileData.shoppingLimit.amount,
            shoppingLimitFrequency: profileData.shoppingLimit.frequency,
            shoppingLimitUsed: 0, // Initialize as 0 for new users
            periodStartDate: undefined,
            periodEndDate: undefined
          } : null;

          console.log('DEBUG - completeOnboarding - Budget data extracted:', {
            clothingBudget: clothingBudgetData,
            shoppingLimit: shoppingLimitData
          });

          // Save clothing budget to user_progress table (if amount > 0)
          if (clothingBudgetData.amount > 0) {
            console.log('DEBUG - completeOnboarding - Saving clothing budget to user_progress');
            await saveClothingBudgetData(authData.user.id, clothingBudgetData);
            console.log('DEBUG - completeOnboarding - Clothing budget saved successfully');
          }

          // Save shopping limit to user_progress table (if exists)
          if (shoppingLimitData && shoppingLimitData.shoppingLimitAmount > 0) {
            console.log('DEBUG - completeOnboarding - Saving shopping limit to user_progress');
            await saveShoppingLimitData(authData.user.id, shoppingLimitData);
            console.log('DEBUG - completeOnboarding - Shopping limit saved successfully');
          }

          console.log('DEBUG - completeOnboarding - BEFORE calling saveUserPreferences with preferencesOnlyData (budget data removed):', JSON.stringify(preferencesOnlyData, null, 2));
          
        } catch (budgetSaveError) {
          console.error('ERROR - completeOnboarding - Failed to save budget data to user_progress:', budgetSaveError);
          // Continue with regular preferences save even if budget save fails
        }
        
        try {
          // Call saveUserPreferences with preferences data only (budget data removed)
          const result = await saveUserPreferences(preferencesOnlyData || profileData, authData.user.id);
          
          console.log('DEBUG - completeOnboarding - AFTER calling saveUserPreferences, result:', result);
          console.log('Successfully synced onboarding data to user_preferences table');
          return updatedProfile;
        } catch (saveError) {
          console.error('ERROR - completeOnboarding - Failed to save user preferences:', saveError);
          // Still return the updated profile even if saving preferences failed
          // This ensures onboarding is marked as complete in the user metadata
          return updatedProfile;
        }
      } catch (prefsError) {
        console.error('Error syncing onboarding data to user_preferences table:', prefsError);
        // Continue even if user_preferences sync fails
      }
      
      console.log('Onboarding completed successfully. Updated profile:', updatedProfile);
      
      return updatedProfile;
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      throw new Error(error.message || 'Failed to complete onboarding');
    }
  },
  
  // Update user profile
  async updateProfile(profileData: ProfileData): Promise<any> {
    try {
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }
      
      // Update user profile
      const updatedProfile = await updateUserMetadata(authData.user.id, {
        ...profileData,
        profileCompleted: true
      });
      
      return updatedProfile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  },
  
  // Update style profile
  async updateStyleProfile(styleProfile: StyleProfileData): Promise<any> {
    try {
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }
      
      // Skip updating user_profiles table since 'style_profile' column doesn't exist
      // and focus on saving to user_preferences table which is the source of truth
      
      // Save to user_preferences table
      try {
        // Debug logging for profile data being saved
        console.log('DEBUG - supabaseAuthService - updateStyleProfile - Before saving:', {
          localClimate: styleProfile.styleProfile.localClimate,
          styleProfileKeys: Object.keys(styleProfile.styleProfile),
          rawStyleProfile: JSON.stringify(styleProfile.styleProfile)
        });
        
        // Dynamically import to avoid circular dependencies
        const { saveUserPreferences } = await import('./userPreferencesService');
        const result = await saveUserPreferences(styleProfile.styleProfile, authData.user.id);
        console.log('Successfully saved profile data to user_preferences table');
        return result;
      } catch (error) {
        const prefsError = error as Error;
        console.error('Error saving to user_preferences table:', prefsError);
        throw new Error('Failed to update style profile: ' + (prefsError.message || 'Database error'));
      }
    } catch (error: any) {
      console.error('Error updating style profile:', error);
      throw new Error(error.message || 'Failed to update style profile');
    }
  },
  
  // Update budget settings
  async updateBudget(budgetData: BudgetData): Promise<any> {
    try {
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }
      
      // Update user budget settings
      const updatedProfile = await updateUserMetadata(authData.user.id, {
        clothingBudget: budgetData.clothingBudget
      });
      
      return updatedProfile;
    } catch (error: any) {
      console.error('Error updating budget:', error);
      throw new Error(error.message || 'Failed to update budget');
    }
  },
  
  // Logout user
  logout(): void {
    try {
      // Sign out from Supabase
      supabase.auth.signOut();
      
      // Remove token from localStorage
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },
  
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },
};

// Test function to check if onboarding data was saved correctly
export const testOnboardingDataSaved = async () => {
  try {
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      console.error('User not authenticated');
      return { success: false, error: 'User not authenticated' };
    }
    
    // Get user profile data
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_uuid', authData.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: error.message };
    }
    
    if (!data) {
      console.error('No user profile found');
      return { success: false, error: 'No user profile found' };
    }
    
    console.log('User profile data:', data);
    console.log('Onboarding completed:', data.onboarding_completed);
    console.log('Preferences data:', data.preferences);
    
    return { 
      success: true, 
      onboardingCompleted: data.onboarding_completed, 
      preferences: data.preferences 
    };
  } catch (error: any) {
    console.error('Error testing onboarding data:', error);
    return { success: false, error: error.message };
  }
};

// Export the authService
export const supabaseAuthService = supabaseAuthServiceImpl;
