// Removed unused import: import { User } from '../types';

export type ProfileCategory = 
  | 'style-profile' 
  | 'subscription' 
  | 'my-progress' 
  | 'notifications' 
  | 'scenarios' 
  | 'other';

export interface CategoryOption {
  id: ProfileCategory;
  label: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'style-profile', label: 'My Style Profile' },
  { id: 'subscription', label: 'My Subscription' },
  { id: 'my-progress', label: 'My Progress' },
  { id: 'scenarios', label: 'Scenario Settings' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'other', label: 'Other Settings' },
];

export type UserPreferences = {
  // Database identifiers
  id?: string;
  userId?: string;
  
  // Daily activities
  dailyActivities: string[];
  homeActivities?: string[];
  officeDressCode?: string;
  remoteWorkPriority?: string;
  creativeMobility?: string;
  studentDressCode?: string;
  uniformPreference?: string;
  
  // Style preferences
  preferredStyles: string[];
  stylePreferences?: {
    comfortVsStyle?: number;
    classicVsTrendy?: number;
    basicsVsStatements?: number;
    additionalNotes?: string;
  };
  
  // Climate preference
  localClimate: string;
  
  // Leisure activities
  leisureActivities: string[];
  otherLeisureActivity?: string | { text: string };
  outdoorFrequency?: {
    frequency: number;
    period: string;
  };
  socialFrequency?: {
    frequency: number;
    period: string;
  };
  formalEventsFrequency?: {
    frequency: number;
    period: string;
  };
  travelFrequency?: string;
  
  // Wardrobe goals
  wardrobeGoals: string[];
  otherWardrobeGoal?: string;
  
  // Shopping limits and budget
  shoppingLimit?: {
    frequency: string;
    amount: number;
  };
  clothingBudget?: {
    amount: number;
    currency: string;
    frequency: string;
  };
  
  // Subscription information
  subscriptionPlan: string;
  subscriptionRenewalDate?: string;
  
  // Legacy fields
  seasonalPreferences?: string[];
};

export const defaultPreferences: UserPreferences = {
  dailyActivities: [],
  preferredStyles: [],
  stylePreferences: {
    comfortVsStyle: 50,
    classicVsTrendy: 50,
    basicsVsStatements: 50,
    additionalNotes: ''
  },
  localClimate: '',
  leisureActivities: [],
  otherLeisureActivity: '',
  wardrobeGoals: [],
  otherWardrobeGoal: '',
  subscriptionPlan: 'free',
  subscriptionRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  shoppingLimit: {
    frequency: 'monthly',
    amount: 0
  },
  clothingBudget: {
    amount: 0,
    currency: 'USD',
    frequency: 'monthly'
  },
  seasonalPreferences: []
};

export interface SubscriptionData {
  plan: string;
  renewalDate: string;
  features: string[];
}

export interface ShoppingLimitData {
  amount: number;
  frequency: string;
  notifications?: boolean;
  // Database field names
  shopping_limit_amount?: number;
  shopping_limit_frequency?: string;
  // Nested object for mapping to database fields
  shoppingLimit?: {
    amount: number;
    frequency: string;
  };
}

export interface AISettingsData {
  preferredModel: string;
  enablePersonalization: boolean;
  saveHistory: boolean;
  dataSharing: boolean;
  customPrompts: string;
}

export interface NotificationsData {
  emailNotifications: boolean;
  pushNotifications: boolean;
  reminderTime: string;
  weeklyDigest: boolean;
  specialOffers: boolean;
}

export interface ClothingBudgetData {
  amount: number;
  currency: string;
  frequency: string;
}

export interface OtherSettingsData {
  language: string;
  theme: string;
  dataExport: boolean;
  deleteAccount: boolean;
}
