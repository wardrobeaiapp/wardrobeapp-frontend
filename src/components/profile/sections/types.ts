// Import ProfileData from the main types file
import { ProfileData } from '../../../types';

// Common types for profile section components
export interface FrequencyPeriod {
  frequency: number;
  period: string;
}

export interface ShoppingLimit {
  frequency: string;
  amount: number;
  limitAmount?: number;
  currency?: string;
}

export interface ClothingBudget {
  amount: number;
  currency: string;
  frequency: string;
}

export interface StylePreferences {
  comfortVsStyle?: number;
  classicVsTrendy?: number;
  basicsVsStatements?: number;
  additionalNotes?: string;
}

// Section-specific interfaces
export interface DailyActivitiesData {
  dailyActivities: string[];
  officeDressCode?: string;
  remoteWorkPriority?: string;
  creativeMobility?: string;
  homeActivities?: string[];
  studentDressCode?: string;
  uniformPreference?: string;
  otherActivityDescription?: string;
}

export interface StylePreferencesData {
  preferredStyles: string[];
  stylePreferences?: StylePreferences;
}

export interface ClimateData {
  localClimate: string;
}

export interface LeisureActivitiesData {
  leisureActivities: string[];
  otherLeisureActivity?: { text: string } | string;
  outdoorFrequency?: FrequencyPeriod;
  socialFrequency?: FrequencyPeriod;
  formalEventsFrequency?: FrequencyPeriod;
  travelFrequency?: string;
}

export interface WardrobeGoalsData {
  wardrobeGoals: string[];
  otherWardrobeGoal?: string;
}

export interface SubscriptionData {
  subscriptionPlan?: string;
  subscriptionRenewalDate?: string;
}

export interface ScenariosData {
  scenarios?: any[]; // Replace with proper type
  deletedScenarios?: any[]; // Replace with proper type
}

// Note: ProfileData is now imported from the main types file
// This helps maintain a single source of truth and prevents type compatibility issues

// Define the profile sections
export type ProfileSection = 'all' | 'dailyActivities' | 'leisureActivities' | 'wardrobeGoals' | 'stylePreferences' | 'climate' | 'subscription' | 'scenarios' | 'shoppingLimit' | 'clothingBudget';

// Map each section to its corresponding data interface
export interface SectionDataMap {
  dailyActivities: DailyActivitiesData;
  leisureActivities: LeisureActivitiesData;
  wardrobeGoals: WardrobeGoalsData;
  stylePreferences: StylePreferencesData;
  climate: ClimateData;
  subscription: SubscriptionData;
  scenarios: ScenariosData;
  shoppingLimit: { shoppingLimit: ShoppingLimit };
  clothingBudget: { clothingBudget: ClothingBudget };
  all: ProfileData;
}

// Define a type for profile data keys that have string array values
export type ArrayFieldsOfProfileData = 'dailyActivities' | 'preferredStyles' | 'leisureActivities' | 'wardrobeGoals' | 'homeActivities';

// Common props for all section components
export interface SectionProps {
  profileData: Partial<ProfileData>;
  setProfileData?: React.Dispatch<React.SetStateAction<ProfileData>>;
  handleCheckboxChange?: (field: ArrayFieldsOfProfileData, value: string) => void;
  handleNestedChange?: (parentField: keyof ProfileData, field: string, value: any) => void;
  
  // Individual handlers for specific sections
  onPreferredStylesChange?: (value: string[]) => void;
  onComfortVsStyleChange?: (value: number) => void;
  onTrendinessChange?: (value: number) => void;
  onBasicsVsStatementsChange?: (value: number) => void;
  onAdditionalNotesChange?: (value: string) => void;
  
  // Leisure activities handlers
  onLeisureActivitiesChange?: (value: string[]) => void;
  onOutdoorFrequencyValueChange?: (value: number) => void;
  onOutdoorFrequencyPeriodChange?: (value: string) => void;
  onSocialFrequencyValueChange?: (value: number) => void;
  onSocialFrequencyPeriodChange?: (value: string) => void;
  onFormalEventsFrequencyValueChange?: (value: number) => void;
  onFormalEventsFrequencyPeriodChange?: (value: string) => void;
  onTravelFrequencyChange?: (value: string) => void;
}
