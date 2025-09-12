export enum WishlistStatus {
  APPROVED = 'approved',
  POTENTIAL_ISSUE = 'potential_issue',
  NOT_REVIEWED = 'not_reviewed'
}

export enum UserActionStatus {
  SAVED = 'saved',
  DISMISSED = 'dismissed', 
  PENDING = 'pending',
  APPLIED = 'applied'
}

export interface WardrobeItem {
  id: string;
  userId?: string; // Added for database association
  name: string;
  category: ItemCategory;
  subcategory?: string;
  color: string;
  pattern?: string;
  size?: string;
  material?: string;
  brand?: string;
  price?: number;
  silhouette?: string;
  length?: string;
  sleeves?: string;
  style?: string;
  rise?: string;
  neckline?: string;
  heelHeight?: string;
  bootHeight?: string;
  type?: string;
  season: Season[];
  scenarios?: string[]; // Array of scenario names this item is suitable for
  imageUrl?: string;
  imageExpiry?: Date | string; // Timestamp when stored signed URL expires
  dateAdded: string;
  lastWorn?: string;
  timesWorn: number;
  tags?: Record<string, any>; // Allow any value type to preserve complete tag structure
  wishlist?: boolean;
  wishlistStatus?: WishlistStatus;
}

export enum ItemCategory {
  TOP = 'top',
  BOTTOM = 'bottom',
  ONE_PIECE = 'one_piece',  // Changed back from DRESS to ONE_PIECE to match updated DB constraint
  OUTERWEAR = 'outerwear',
  FOOTWEAR = 'footwear',
  ACCESSORY = 'accessory',
  OTHER = 'other'
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  FALL = 'fall',
  WINTER = 'winter'
}

export interface Outfit {
  id: string;
  name: string;
  items: string[]; // Array of WardrobeItem ids
  scenarios?: string[]; // Array of scenario IDs
  scenarioNames?: string[]; // Array of scenario names (for backward compatibility)
  season: Season[];
  dateCreated: string;
}

export interface ClaudeResponse {
  outfitSuggestion?: Outfit;
  styleAdvice?: string;
  message: string;
}

export interface User {
  id: string;
  name: string;
  preferences?: {
    dislikedColors?: string[];
    preferredStyles?: string[];
    dailyActivities?: string[];
    leisureActivities?: string[];
    wardrobeGoals?: string[];
    scenarios?: any[];
    stylePreferences?: {
      [key: string]: any;
    };
    localClimate?: string;
    officeDressCode?: string;
    remoteWorkPriority?: string;
    creativeMobility?: string;
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
    subscriptionPlan?: string; // 'free' or 'pro'
    subscriptionRenewalDate?: string; // ISO date string
  };
}

// Daily activities related data
export interface DailyActivitiesData {
  /** @deprecated No longer displayed in MyStyleProfile UI. Still used in onboarding and scenario generation. */
  dailyActivities: string[];
  /** @deprecated Related to dailyActivities which is no longer displayed in UI. */
  otherActivityDescription?: string;
  /** @deprecated Related to dailyActivities which is no longer displayed in UI. */
  officeDressCode?: string;
  /** @deprecated Related to dailyActivities which is no longer displayed in UI. */
  remoteWorkPriority?: string;
  /** @deprecated Related to dailyActivities which is no longer displayed in UI. */
  creativeMobility?: string;
  /** @deprecated Related to dailyActivities which is no longer displayed in UI. */
  studentDressCode?: string;
  /** @deprecated Related to dailyActivities which is no longer displayed in UI. */
  uniformPreference?: string;
  /** @deprecated Related to dailyActivities which is no longer displayed in UI. */
  homeActivities?: string[];
}

// Style preferences related data
export interface StylePreferencesData {
  preferredStyles: string[];
  stylePreferences?: {
    comfortVsStyle?: number;
    classicVsTrendy?: number;
    basicsVsStatements?: number;
    additionalNotes?: string;
  };
}

// Climate related data
export interface ClimateData {
  localClimate: string;
}

// Frequency period type used in leisure activities
export interface FrequencyPeriod {
  frequency: number;
  period: string;
}

// Leisure activities related data
export interface LeisureActivitiesData {
  /** @deprecated No longer displayed in MyStyleProfile UI. Still used in onboarding and scenario generation. */
  leisureActivities: string[];
  /** @deprecated Related to leisureActivities which is no longer displayed in UI. */
  otherLeisureActivity?: { text: string } | string;
  /** @deprecated Related to leisureActivities which is no longer displayed in UI. */
  outdoorFrequency?: FrequencyPeriod;
  /** @deprecated Related to leisureActivities which is no longer displayed in UI. */
  socialFrequency?: FrequencyPeriod;
  /** @deprecated Related to leisureActivities which is no longer displayed in UI. */
  formalEventsFrequency?: FrequencyPeriod;
  /** @deprecated Related to leisureActivities which is no longer displayed in UI. */
  travelFrequency?: string;
}

// Shopping limit data
export interface ShoppingLimit {
  frequency: string;
  amount: number;
  limitAmount?: number;
  currency?: string;
}

// Clothing budget data
export interface ClothingBudget {
  amount: number;
  currency: string;
  frequency: string;
}

// Shopping and budget related data
export interface ShoppingData {
  shoppingLimit?: ShoppingLimit;
  shopping_limit_amount?: number;
  shopping_limit_currency?: string;
  shopping_limit_frequency?: string;
  
  clothingBudget?: ClothingBudget;
  clothing_budget_amount?: number;
  clothing_budget_currency?: string;
  clothing_budget_frequency?: string;
}

// Wardrobe goals related data
export interface WardrobeGoalsData {
  wardrobeGoals: string[];
  otherWardrobeGoal?: string;
}

// Subscription related data
export interface SubscriptionData {
  subscriptionPlan?: string; // 'free' or 'pro'
  subscriptionRenewalDate?: string; // ISO date string
}

// Main ProfileData interface using composition
export interface ProfileData extends 
  DailyActivitiesData,
  StylePreferencesData,
  ClimateData,
  LeisureActivitiesData,
  ShoppingData,
  WardrobeGoalsData,
  SubscriptionData {
  // Any additional properties that don't fit in the above categories would go here
}

// Type for array fields in ProfileData to use with handleCheckboxChange function
export type ArrayFieldsOfProfileData = 'dailyActivities' | 'preferredStyles' | 'leisureActivities' | 'wardrobeGoals' | 'homeActivities';

export interface Capsule {
  id: string;
  name: string;
  scenarios: string[]; // Array of scenario IDs or names
  seasons: Season[];
  mainItemId?: string; // ID of the main item (single-select)
  selectedItems: string[]; // Made required with default empty array
  dateCreated: string;
  
  // Database fields (snake_case) - kept for backward compatibility
  date_created?: string; // Matches database column name
  main_item_id?: string; // Matches database column name
  selected_items?: string[]; // Matches database column name
  user_id?: string; // Matches database column name
}

export interface DayPlan {
  id: string;
  userId: string;
  date: string; // ISO date string format
  outfitIds: string[];
  itemIds: string[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  frequency?: string;
  created_at?: string;
  updated_at?: string;
}

// AI History Types - Using discriminated unions for type safety and scalability
interface BaseAIHistoryItem {
  id: string;
  title: string;
  description: string;
  summary: string;
  date: Date;
  status?: WishlistStatus;
  userActionStatus?: UserActionStatus;
}

export interface AICheckHistoryItem extends BaseAIHistoryItem {
  type: 'check';
  score?: number;
  itemsChecked?: number;
  image?: string;
  analysisResults?: {
    recommendations: string[];
    issues: string[];
    suggestions?: string[];
  };
}

export interface AIRecommendationHistoryItem extends BaseAIHistoryItem {
  type: 'recommendation';
  season?: string;
  scenario?: string;
  outfitDetails?: string[];
  recommendedItems?: string[];
}

// Discriminated union type for all AI history items
export type AIHistoryItem = AICheckHistoryItem | AIRecommendationHistoryItem;
