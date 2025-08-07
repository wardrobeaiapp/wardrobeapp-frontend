import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

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

// Auth context state
interface AuthContextState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  completeOnboarding: (preferences: any) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  updateStyleProfile: (styleProfile: any) => Promise<void>;
  updateBudget: (budgetData: any) => Promise<void>;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on initial render if token exists
  useEffect(() => {
    const loadUser = async () => {
      try {
        // First set initial auth state based on token presence for faster UI response
        const hasToken = authService.isAuthenticated();
        if (hasToken) {
          // Set authenticated immediately based on token presence
          setIsAuthenticated(true);
          
          // Then load the full user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Register user
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Complete onboarding
  const completeOnboarding = async (preferences: any) => {
    setLoading(true);
    try {
      const updatedUser = await authService.completeOnboarding({ preferences });
      
      // Ensure onboardingCompleted is set to true
      if (updatedUser) {
        updatedUser.onboardingCompleted = true;
      }
      
      setUser(updatedUser);
      
      // Update localStorage to ensure onboardingCompleted is true
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.onboardingCompleted = true;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      // Refresh user data to ensure we have the latest data from the backend
      // This is important to ensure all onboarding data is available in the profile
      setTimeout(() => {
        // Use setTimeout to ensure the backend has time to process the onboarding data
        refreshUserData();
      }, 1000);
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData: any) => {
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  // Update style profile
  const updateStyleProfile = async (styleProfile: any) => {
    setLoading(true);
    try {
      const updatedUser = await authService.updateStyleProfile(styleProfile);
      setUser(updatedUser);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Style profile update failed');
    } finally {
      setLoading(false);
    }
  };

  // Update budget settings
  const updateBudget = async (budgetData: any) => {
    setLoading(true);
    try {
      const updatedUser = await authService.updateBudget(budgetData);
      setUser(updatedUser);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Budget update failed');
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Refresh user data from the backend
  const refreshUserData = async () => {
    // Skip refresh if already loading to prevent multiple simultaneous calls
    if (loading) return;
    
    setLoading(true);
    try {
      // Get the latest user data from the backend
      const userData = await authService.getCurrentUser();
      
      // Update the user state with the latest data
      setUser(userData);
      // Only log in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('User data refreshed');
      }
      setError(null);
    } catch (err: any) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error refreshing user data:', err);
      } else {
        console.error('Error refreshing user data');
      }
      setError(err.message || 'Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
