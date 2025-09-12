// Import the modular auth operations
import {
  register,
  login,
  getCurrentUser,
  createTemporaryUserFromToken,
  logout,
  isAuthenticated,
  createUserProfile
} from './authOperations';
import { completeOnboarding } from './onboardingOperations';
import {
  updateProfile,
  updateStyleProfile,
  updateBudget
} from './profileManagement';
import type { AuthService } from '../../types/auth.types';

// Re-export getUserProfileByUserId for external use
export { getUserProfileByUserId } from './userProfile';

// Implement the authService with Supabase using modular functions
const supabaseAuthServiceImpl: AuthService = {
  // Cache for user data (required by AuthService interface but implemented in authOperations)
  _userCache: {
    data: null,
    timestamp: 0,
    expiryMs: 60000
  },

  // Register a new user
  register,
  
  // Login user  
  login,

  // Get current user data with caching
  getCurrentUser,
  
  // Helper method to create a temporary user from a JWT token
  createTemporaryUserFromToken,

  // Helper function to create user profile
  createUserProfile,
  
  // Complete onboarding
  completeOnboarding,
  
  // Update user profile
  updateProfile,
  
  // Update style profile
  updateStyleProfile,
  
  // Update budget settings
  updateBudget,
  
  // Logout user
  logout,
  
  // Check if user is authenticated
  isAuthenticated
}

// Export the Supabase auth service implementation
export default supabaseAuthServiceImpl;
