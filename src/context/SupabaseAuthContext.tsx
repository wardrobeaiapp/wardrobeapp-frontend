import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supabaseAuthService from '../services/auth/supabaseAuthService';

// User type definition
interface User {
  id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  onboardingCompleted: boolean;
  preferences?: {
    favoriteColors: string[];
    preferredStyles: string[];
    seasonalPreferences: string[];
    dailyActivities?: string[];
    leisureActivities?: string[];
    wardrobeGoals?: string[];
    scenarios?: any[];
    stylePreferences?: {
      comfortVsStyle: number;
      classicVsTrendy: number;
      basicsVsStatements: number;
      additionalNotes?: string;
    };
    localClimate?: string;
    // Add other onboarding fields as needed
  };
  styleProfile?: any;
  clothingBudget?: any;
}

// Define AuthResponse type
interface AuthResponse {
  user: User;
  token: string;
  emailConfirmationRequired?: boolean;
}

// Auth context state
interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<AuthResponse>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (preferences: any) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  updateStyleProfile: (styleProfile: any) => Promise<void>;
  refreshUserData: () => Promise<void>;
  updateBudget: (budgetData: any) => Promise<void>;
  clearError: () => void;
}

// Create context
const SupabaseAuthContext = createContext<AuthContextState | undefined>(undefined);

// Provider component
export const SupabaseAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated - now async
        const isUserAuthenticated = await supabaseAuthService.isAuthenticated();
        if (isUserAuthenticated) {
          // Get current user data
          const userData = await supabaseAuthService.getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token exists but is invalid
            supabaseAuthService.logout();
            setIsAuthenticated(false);
            setUser(null);
          }
        } else {
          // Not authenticated
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setError(err.message || 'Authentication error');
        // Ensure we're not in a loading state on error
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Register a new user
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supabaseAuthService.register({ name, email, password });
      
      // Check if email confirmation is required
      if (response.emailConfirmationRequired) {
        // Don't set user or authenticated state if email confirmation is required
        return response;
      }
      
      // If no email confirmation required, set user and authenticated state
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supabaseAuthService.login({ email, password });
      
      // Check if user profile exists, if not, it might be a first login after email confirmation
      // The supabaseAuthService.login will attempt to create the profile if needed
      
      // Store user data in localStorage to ensure proper redirection
      localStorage.setItem('user', JSON.stringify(response.user));
      console.log('Stored user in localStorage during login:', response.user);
      
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    supabaseAuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Complete onboarding
  const completeOnboarding = async (onboardingData: any) => {
    setLoading(true);
    setError(null);
    try {
      console.log('DEBUG - SupabaseAuthContext - completeOnboarding called with:', JSON.stringify(onboardingData, null, 2));
      // Pass the complete onboarding data structure directly
      await supabaseAuthService.completeOnboarding(onboardingData);
      // Update user state with new onboarding status
      setUser(prev => prev ? { 
        ...prev, 
        onboardingCompleted: true, 
        preferences: onboardingData.preferences,
        workStyle: onboardingData.workStyle,
        clothingBudget: onboardingData.clothingBudget 
      } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData: any) => {
    setLoading(true);
    setError(null);
    try {
      await supabaseAuthService.updateProfile(profileData);
      // Update user state with new profile data
      setUser(prev => prev ? { ...prev, ...profileData, profileCompleted: true } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update style profile
  const updateStyleProfile = async (styleProfile: any) => {
    setLoading(true);
    setError(null);
    try {
      await supabaseAuthService.updateStyleProfile({ styleProfile });
      // Update user state with new style profile
      setUser(prev => prev ? { ...prev, styleProfile } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to update style profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // This refreshUserData implementation has been moved to line ~258

  // Update budget
  const updateBudget = async (budgetData: any) => {
    setLoading(true);
    setError(null);
    try {
      await supabaseAuthService.updateBudget({ clothingBudget: budgetData });
      // Update user state with new budget data
      setUser(prev => prev ? { ...prev, clothingBudget: budgetData } : null);
    } catch (err: any) {
      setError(err.message || 'Failed to update budget');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Refresh user data
  const refreshUserData = async () => {
    // Don't set loading state to avoid UI blinking
    setError(null);
    try {
      // Reset the cache in the auth service
      if (supabaseAuthService._userCache) {
        supabaseAuthService._userCache.timestamp = 0; // This will force a refresh
      }
      
      // Fetch fresh user data
      const userData = await supabaseAuthService.getCurrentUser();
      
      // Only update state if the user data has actually changed
      if (userData) {
        // Compare with current user data to prevent unnecessary updates
        const shouldUpdate = !user || user.id !== userData.id || JSON.stringify(user) !== JSON.stringify(userData);
        if (shouldUpdate) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } else if (user !== null) { // Only update if current state is not already null
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh user data';
      setError(errorMessage);
      // Removed console.error for performance
    }
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    register,
    login,
    logout,
    completeOnboarding,
    updateProfile,
    updateStyleProfile,
    updateBudget,
    clearError,
    refreshUserData
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useSupabaseAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export default SupabaseAuthContext;
