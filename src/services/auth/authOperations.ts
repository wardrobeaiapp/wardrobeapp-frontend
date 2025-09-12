import { supabase } from '../core/supabase';
import { updateUserMetadata, getUserProfileByUserId } from './userProfile';
import { debugLog } from './utils/authUtils';
import type {
  RegisterData,
  LoginData,
  AuthResponse,
  TemporaryUser
} from '../../types/auth.types';

// Helper function to create user profile
export const createUserProfile = async (userId: string, userData: RegisterData): Promise<void> => {
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
};

// Register a new user
export const register = async (userData: RegisterData): Promise<AuthResponse> => {
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
        await createUserProfile(authData.user.id, userData);
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
};

// Login user
export const login = async (userData: LoginData): Promise<AuthResponse> => {
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
};

// Cache for user data to improve performance
const _userCache = {
  data: null,
  timestamp: 0,
  expiryMs: 60000 // Cache expires after 1 minute
};

// Get current user data with caching
export const getCurrentUser = async () => {
  try {
    debugLog('Getting current user data');
    
    // Check if we have a valid cached user
    const now = Date.now();
    if (_userCache.data && (now - _userCache.timestamp < _userCache.expiryMs)) {
      debugLog('Returning cached user data');
      return _userCache.data;
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
    _userCache.data = userData as any;
    _userCache.timestamp = Date.now();
    _userCache.expiryMs = 300000; // 5 minutes
    
    // Return user data
    return userData;
  } catch (error) {
    // Always log errors even in non-debug mode
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper method to create a temporary user from a JWT token
export const createTemporaryUserFromToken = (token: string): TemporaryUser | null => {
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
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    // Clear user cache first
    _userCache.data = null;
    _userCache.timestamp = 0;
    
    // Sign out from Supabase (this is async)
    await supabase.auth.signOut();
    
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    debugLog('Logout completed successfully');
  } catch (error) {
    console.error('Error during logout:', error);
    // Even if logout fails, clear local data
    _userCache.data = null;
    _userCache.timestamp = 0;
    localStorage.removeItem('token');
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
