import axios from 'axios';

// API URLs - using relative paths for proxy support
const AUTH_API_URL = '/api/auth';
const PROFILE_API_URL = '/api/profile';

// Types
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface OnboardingData {
  preferences: {
    preferredStyles: string[];
    scenarios?: any[]; // Added scenarios property
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
    officeDressCode?: string;
    remoteWorkPriority?: string;
    creativeMobility?: string;
    studentDressCode?: string;
    socialFrequency?: string;
    socialPeriod?: string;
    formalEventsFrequency?: string;
    formalEventsPeriod?: string;
    outdoorFrequency?: string;
    outdoorPeriod?: string;
    travelFrequency?: string;
    otherWardrobeGoal?: string;
    shoppingLimit?: any;
    clothingBudget?: any;
    [key: string]: any; // Allow for additional fields
  };
  scenarios?: any[]; // Allow scenarios at top level for backward compatibility
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
  officeDressCode?: string;
  remoteWorkPriority?: string;
  creativeMobility?: string;
  studentDressCode?: string;
  socialFrequency?: string;
  socialPeriod?: string;
  formalEventsFrequency?: string;
  formalEventsPeriod?: string;
  outdoorFrequency?: string;
  outdoorPeriod?: string;
  travelFrequency?: string;
  otherWardrobeGoal?: string;
  shoppingLimit?: any;
  clothingBudget?: any;
  [key: string]: any; // Allow for additional fields
}

interface ProfileData {
  name?: string;
  email?: string;
  [key: string]: any;
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
}

interface TemporaryUser {
  id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  onboardingCompleted: boolean;
}

// Set auth token for axios requests
const setAuthToken = (token: string | null): void => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

// Define the authService interface for TypeScript
interface AuthService {
  register(userData: RegisterData): Promise<AuthResponse>;
  login(userData: LoginData): Promise<AuthResponse>;
  getCurrentUser(): Promise<any>;
  createTemporaryUserFromToken(token: string): TemporaryUser | null;
  completeOnboarding(data: OnboardingData): Promise<any>;
  updateProfile(profileData: ProfileData): Promise<any>;
  updateStyleProfile(styleProfile: StyleProfileData): Promise<any>;
  updateBudget(budgetData: BudgetData): Promise<any>;
  logout(): void;
  isAuthenticated(): boolean;
}

// Implement the authService
const authServiceImpl: AuthService = {
  // Register a new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${AUTH_API_URL}/register`, userData);
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set auth token in axios headers
      setAuthToken(response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(userData: LoginData): Promise<AuthResponse> {
    try {
      console.log('Sending login request with data:', userData);
      
      // Use fetch instead of axios for more direct control
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set auth token in axios headers for future requests
      setAuthToken(data.token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user data
  async getCurrentUser(): Promise<any> {
    // Set auth token if it exists in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      // Quietly return null without logging if no token
      return null;
    }
    
    // Set the token in axios headers
    setAuthToken(token);
    
    // Check if we've recently had a server error to avoid repeated attempts
    const lastServerErrorTime = localStorage.getItem('auth_server_error_time');
    if (lastServerErrorTime) {
      const errorTime = parseInt(lastServerErrorTime, 10);
      const now = Date.now();
      // If we've had a server error in the last 5 minutes, use the fallback user
      if (now - errorTime < 5 * 60 * 1000) { // 5 minutes
        console.log('Using temporary user due to recent server error');
        return this.createTemporaryUserFromToken(token);
      }
    }
    
    // Try to get user data with retry logic
    let retries = 2; // Reduced from 3 to 2 retries
    let lastError: any = null;
    
    while (retries > 0) {
      try {
        // Only log in development environment
        if (process.env.NODE_ENV === 'development' && retries === 2) {
          console.log('Fetching user data');
        }
        const response = await axios.get(`${AUTH_API_URL}/user`);
        
        // Only log minimal info in development environment
        if (process.env.NODE_ENV === 'development') {
          console.log('User data received');
        }
        
        // Ensure the user data includes preferences
        if (response.data && !response.data.preferences) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('User data is missing preferences');
          }
          
          // Try to get preferences from localStorage as a fallback
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (storedUser.preferences) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Using preferences from localStorage as fallback');
            }
            response.data.preferences = storedUser.preferences;
          }
        }
        
        return response.data;
      } catch (err: any) {
        lastError = err;
        // Only log detailed error on final retry
        if (retries === 1) {
          console.error('Error fetching user data:', err);
        }
        retries--;
        
        // Wait before retrying (fixed delay)
        if (retries > 0) {
          const delay = 2000; // Fixed 2 second delay
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // If we get a 500 error but have a valid token, return a minimal user object
    // This prevents logout on server errors
    if (lastError && axios.isAxiosError(lastError) && lastError.response?.status === 500) {
      console.log('Server returned 500 error, using temporary user from token');
      // Store the time of the server error to avoid repeated attempts
      localStorage.setItem('auth_server_error_time', Date.now().toString());
      return this.createTemporaryUserFromToken(token);
    }
    
    // Only clear token if we get a 401 Unauthorized
    if (lastError && axios.isAxiosError(lastError) && lastError.response?.status === 401) {
      console.log('Unauthorized error, clearing token');
      localStorage.removeItem('token');
      setAuthToken(null);
    }
    
    // If we reach here, we failed to get user data
    return null;
  },
  
  // Helper method to create a temporary user from a JWT token
  createTemporaryUserFromToken(token: string): TemporaryUser | null {
    try {
      // Decode the token to get the user ID
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      if (payload && payload.user && payload.user.id) {
        return {
          id: payload.user.id,
          name: 'Temporary User',
          email: 'user@example.com',
          profileCompleted: true,
          onboardingCompleted: true
        };
      }
      return null;
    } catch (decodeErr) {
      console.error('Error decoding token:', decodeErr);
      return null;
    }
  },

  // Complete onboarding
  async completeOnboarding(data: OnboardingData): Promise<any> {
    try {
      console.log('Complete onboarding with data:', JSON.stringify(data, null, 2));
      
      // Ensure the preferences object exists for the backend
      data.preferences = data.preferences || {};
      
      // Note: Scenarios are now stored only in the dedicated scenarios table,
      // not in the preferences field of user_profiles
      
      // Ensure all onboarding data is included in the preferences object
      if (data.dailyActivities) {
        data.preferences.dailyActivities = data.dailyActivities;
      }
      
      if (data.leisureActivities) {
        data.preferences.leisureActivities = data.leisureActivities;
      }
      
      if (data.wardrobeGoals) {
        data.preferences.wardrobeGoals = data.wardrobeGoals;
      }
      
      if (data.stylePreferences) {
        data.preferences.stylePreferences = data.stylePreferences;
      }
      
      if (data.localClimate) {
        data.preferences.localClimate = data.localClimate;
      }
      
      // Include other onboarding fields
      const fieldsToInclude = [
        'officeDressCode', 'remoteWorkPriority', 'creativeMobility', 'studentDressCode',
        'socialFrequency', 'socialPeriod', 'formalEventsFrequency', 'formalEventsPeriod',
        'outdoorFrequency', 'outdoorPeriod', 'travelFrequency', 'otherWardrobeGoal',
        'shoppingLimit', 'clothingBudget'
      ];
      
      fieldsToInclude.forEach(field => {
        if (data[field] !== undefined) {
          data.preferences[field] = data[field];
        }
      });
      
      console.log('Sending onboarding data to backend:', JSON.stringify(data, null, 2));
      
      const response = await axios.post(`${PROFILE_API_URL}/onboarding`, data);
      
      // Ensure the response data has onboardingCompleted set to true
      const userData = response.data;
      userData.onboardingCompleted = true;
      
      // Make sure the preferences from the response include all the onboarding data
      if (!userData.preferences) {
        userData.preferences = data.preferences;
      }
      
      console.log('Received user data from backend:', JSON.stringify(userData, null, 2));
      
      // Update the user data in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      currentUser.onboardingCompleted = true;
      currentUser.preferences = userData.preferences || data.preferences;
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      // Ensure the auth token is still present
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
      }
      
      return userData;
    } catch (error) {
      console.error('Onboarding error:', error);
      throw error;
    }
  },
  
  // Update user profile
  async updateProfile(profileData: ProfileData): Promise<any> {
    try {
      const response = await axios.put(`${PROFILE_API_URL}`, profileData);
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
  
  // Update style profile
  async updateStyleProfile(styleProfile: StyleProfileData): Promise<any> {
    try {
      const response = await axios.put(`${PROFILE_API_URL}/style`, styleProfile);
      return response.data;
    } catch (error) {
      console.error('Style profile update error:', error);
      throw error;
    }
  },
  
  // Update budget settings
  async updateBudget(budgetData: BudgetData): Promise<any> {
    try {
      const response = await axios.put(`${PROFILE_API_URL}/budget`, budgetData);
      return response.data;
    } catch (error) {
      console.error('Budget update error:', error);
      throw error;
    }
  },

  // Logout user
  logout(): void {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove auth header
    setAuthToken(null);
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return localStorage.getItem('token') !== null;
  }
};

// Export the authService
export const authService = authServiceImpl;

// Set auth token on initial load
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}
