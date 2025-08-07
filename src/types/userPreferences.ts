/**
 * TypeScript interface for the new user_preferences table structure
 */
export interface UserPreferences {
  id?: string;
  userId: string;
  
  // Daily activities
  dailyActivities: string[];
  // Subquestion answers for 'I take care of family / home'
  homeActivities?: string[];
  officeDressCode?: string;
  remoteWorkPriority?: string;
  creativeMobility?: string;
  uniformPreference?: string;
  studentDressCode?: string;
  // studyEnvironment property removed - using studentDressCode instead
  
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
  otherLeisureActivity?: { text: string } | string;
  outdoorFrequencyValue?: number;
  outdoorFrequencyPeriod?: string;
  socialFrequencyValue?: number;
  socialFrequencyPeriod?: string;
  formalEventsFrequencyValue?: number;
  formalEventsFrequencyPeriod?: string;
  travelFrequency?: string;
  
  // Wardrobe goals
  wardrobeGoals: string[];
  otherWardrobeGoal?: string;
  
  // Shopping limits and budget
  shoppingLimitFrequency?: string;
  shoppingLimitAmount?: number;
  clothingBudgetAmount?: number;
  clothingBudgetCurrency?: string;
  
  // Subscription information
  subscriptionPlan?: string; // 'free' or 'pro'
  subscriptionRenewalDate?: string; // ISO date string
  clothingBudgetFrequency?: string;
  
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Default values for user preferences
 */
export const defaultPreferences: UserPreferences = {
  userId: '',
  dailyActivities: [],
  homeActivities: [],
  preferredStyles: [],
  stylePreferences: {
    comfortVsStyle: 50,
    classicVsTrendy: 50,
    basicsVsStatements: 50,
    additionalNotes: ''
  },
  localClimate: '',
  leisureActivities: [],
  wardrobeGoals: [],
  otherWardrobeGoal: '',
  shoppingLimitFrequency: 'monthly',
  shoppingLimitAmount: 0,
  clothingBudgetAmount: 0,
  clothingBudgetCurrency: 'USD',
  clothingBudgetFrequency: 'monthly',
  // Subscription defaults
  subscriptionPlan: 'free',
  subscriptionRenewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // One year from now
  // No legacy fields
};
