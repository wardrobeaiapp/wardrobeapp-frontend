// Authentication related types

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  onboardingCompleted?: boolean;
  profileCompleted?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OnboardingData {
  // User preferences as a separate object
  preferences: {
    preferredStyles: string[];
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

export interface ProfileData {
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface StyleProfileData {
  styleProfile: any;
}

export interface BudgetData {
  clothingBudget: any;
}

export interface AuthResponse {
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

export interface TemporaryUser {
  id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  onboardingCompleted: boolean;
}

// Define the authService interface for TypeScript
export interface AuthService {
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
