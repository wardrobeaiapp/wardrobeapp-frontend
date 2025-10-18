import { FaTree, FaWalking, FaUtensils, FaPlane, FaMoon, FaBriefcase, FaHeart, FaTshirt, FaHome, FaEllipsisH, FaSun, FaWater, FaSnowflake, FaCloudRain, FaLeaf, FaUmbrella, FaGlobeAmericas, FaCog, FaMagic, FaShoppingCart, FaCoins, FaClock, FaGift, FaBroom, FaFlask, FaBusinessTime, FaRunning, FaMinusSquare, FaHatCowboy, FaHistory, FaBolt } from 'react-icons/fa';
import { Season } from '../types';
import { ActivityOption } from '../types/onboarding';

// Activity options
export const activityOptions: ActivityOption[] = [
  { id: 'office', label: 'I work in an office', icon: <FaBriefcase />, bgColor: '#e8f0fe', iconColor: '#4285f4' },
  { id: 'remote', label: 'I work remotely / freelance / hybrid', icon: <FaHome />, bgColor: '#e6f4ea', iconColor: '#34a853' },
  { id: 'family', label: 'I take care of family / home', icon: <FaHeart />, bgColor: '#ffebee', iconColor: '#f06292' },
  { id: 'student', label: "I'm studying", icon: <FaTree />, bgColor: '#f3e8fd', iconColor: '#a142f4' },
  { id: 'creative', label: 'I work in a creative / client-facing role', icon: <FaTshirt />, bgColor: '#fff8e1', iconColor: '#fbbc04' },
  { id: 'physical', label: 'I wear a uniform or do physical work', icon: <FaWalking />, bgColor: '#fce8e6', iconColor: '#ea4335' },
  { id: 'other', label: 'Other', icon: <FaEllipsisH />, bgColor: '#f5f5f5', iconColor: '#9e9e9e' }
];

// Style options (simple string array for backward compatibility)
export const styleOptions = [
  'Casual',
  'Smart Casual',
  'Sporty',
  'Bohemian',
  'Minimalist',
  'Streetwear',
  'Vintage',
  'Edgy / Grunge'
];

// Style preferences step content
export const stylePreferencesStepContent = {
  title: 'What styles do you prefer?',
  description: 'Select all styles that you like or would like to incorporate into your wardrobe.',
  morePreferencesDescription: 'Tell us more about your style preferences:',
  comfortVsStyleTitle: 'Comfort vs. Style',
  classicVsTrendyTitle: 'Classic vs. Trendy',
  basicsVsStatementsTitle: 'Basics vs. Statement Pieces',
  sliderLabels: {
    comfort: {
      left: 'Comfort First',
      middle: 'Balance',
      right: 'Style First'
    },
    classic: {
      left: 'Timeless Classics',
      middle: 'Mix',
      right: 'Latest Trends'
    },
    basics: {
      left: 'Versatile Basics',
      middle: 'Balance',
      right: 'Bold Statements'
    }
  },
  additionalNotesTitle: 'Anything else about your style preferences?',
  additionalNotesPlaceholder: 'Tell us about any specific style preferences, colors you love or avoid, fit preferences, or anything else that would help us understand your style better...',
  
  // Profile section content
  profileSection: {
    title: 'Style Preferences',
    selectStylesLabel: 'Select styles you prefer',
    preferencesLabel: 'Let\'s get to know your style preferences',
    comfortVsStyleLabel: 'Comfort vs. Style',
    classicVsTrendyLabel: 'Classic vs. Trendy',
    basicsVsStatementsLabel: 'Basics vs. Statement Pieces',
    additionalNotesLabel: 'Is there anything else we should know about your style?',
    additionalNotesPlaceholder: 'Enter any additional style notes'
  }
};

// Style options with details (icons, colors, descriptions)
export const styleOptionsWithDetails = [
  {
    id: 'casual',
    label: 'Casual',
    icon: <FaTshirt />,
    bgColor: '#e3f2fd',
    iconColor: '#1976d2',
    description: 'Relaxed and comfortable'
  },
  {
    id: 'smart casual',
    label: 'Smart Casual',
    icon: <FaBusinessTime />,
    bgColor: '#e8f5e9',
    iconColor: '#2e7d32',
    description: 'Polished yet approachable'
  },
  {
    id: 'sporty',
    label: 'Sporty',
    icon: <FaRunning />,
    bgColor: '#fff8e1',
    iconColor: '#f57c00',
    description: 'Athletic and active'
  },
  {
    id: 'bohemian',
    label: 'Bohemian',
    icon: <FaLeaf />,
    bgColor: '#f3e5f5',
    iconColor: '#9c27b0',
    description: 'Free-spirited and artistic'
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    icon: <FaMinusSquare />,
    bgColor: '#f5f5f5',
    iconColor: '#616161',
    description: 'Clean and simple'
  },
  {
    id: 'streetwear',
    label: 'Streetwear',
    icon: <FaHatCowboy />,
    bgColor: '#ffebee',
    iconColor: '#d32f2f',
    description: 'Urban and trendy'
  },
  {
    id: 'vintage',
    label: 'Vintage',
    icon: <FaHistory />,
    bgColor: '#fff3e0',
    iconColor: '#e65100',
    description: 'Classic and timeless'
  },
  {
    id: 'edgy / grunge',
    label: 'Edgy / Grunge',
    icon: <FaBolt />,
    bgColor: '#eeeeee',
    iconColor: '#212121',
    description: 'Bold and rebellious'
  }
];

// Season options
export const seasonOptions = Object.values(Season);

// Climate options with icons and descriptions
// Import icons at the top of the file to avoid duplicate imports

export const climateOptions = [
  'Warm & dry',
  'Hot & humid',
  'Cold with snow',
  'Mild & rainy',
  'Temperate with distinct seasons',
  'Hot with cold nights / desert climate',
  'Tropical with rainy season',
  'Other / Changes frequently'
];

// Climate preference step content
export const climatePreferenceStepContent = {
  title: 'What\'s your local climate?',
  description: 'This helps us recommend appropriate clothing for your weather conditions.',
  
  // Profile section content
  profileSection: {
    title: 'Climate',
    localClimateLabel: 'What is your local climate?'
  }
};

export const climateOptionsWithDetails = [
  {
    id: 'warm-dry',
    label: 'Warm & dry',
    description: 'Consistent warm temperatures',
    icon: FaSun,
    bgColor: '#FFF8D6',
    iconColor: '#F9A826'
  },
  {
    id: 'hot-humid',
    label: 'Hot & humid',
    description: 'High heat with moisture',
    icon: FaWater,
    bgColor: '#FFEDD8',
    iconColor: '#FF6B35'
  },
  {
    id: 'cold-with-snow',
    label: 'Cold with snow',
    description: 'Winter conditions',
    icon: FaSnowflake,
    bgColor: '#E6F0FF',
    iconColor: '#4285F4'
  },
  {
    id: 'mild-rainy',
    label: 'Mild & rainy',
    description: 'Moderate temps with rain',
    icon: FaCloudRain,
    bgColor: '#F0F0F0',
    iconColor: '#4F4F4F'
  },
  {
    id: 'temperate-with-distinct-seasons',
    label: 'Temperate with distinct seasons',
    description: 'Four season climate',
    icon: FaLeaf,
    bgColor: '#E6F7E9',
    iconColor: '#2E7D32'
  },
  {
    id: 'hot-with-cold-nights-desert-climate',
    label: 'Hot with cold nights / desert climate',
    description: 'Extreme temperature swings',
    icon: FaMoon,
    bgColor: '#FFE6E6',
    iconColor: '#D81B60'
  },
  {
    id: 'tropical-with-rainy-season',
    label: 'Tropical with rainy season',
    description: 'Warm with wet/dry seasons',
    icon: FaUmbrella,
    bgColor: '#E6F7F7',
    iconColor: '#00897B'
  },
  {
    id: 'other-changes-frequently',
    label: 'Other / Changes frequently',
    description: 'Variable or unique climate',
    icon: FaGlobeAmericas,
    bgColor: '#F3E5F5',
    iconColor: '#8E24AA'
  }
];

// Wardrobe goal options
export const wardrobeGoalOptions = [
  'Optimize my wardrobe',
  'Define or upgrade my personal style',
  'Buy less / shop more intentionally',
  'Save money',
  'Make getting dressed easier / faster',
  'Build a capsule wardrobe',
  'Declutter / downsize',
  'Experiment or try something new',
  'Feel more confident in what I wear',
  'Other'
];

// Wardrobe goals step content
export const wardrobeGoalsStepContent = {
  title: 'What are your wardrobe goals?',
  description: 'Select all that apply. This helps us tailor our recommendations to your needs.',
  otherGoalPlaceholder: 'Describe your other wardrobe goal here...',
  
  // Profile section content
  profileSection: {
    title: 'Wardrobe Goals',
    mainGoalLabel: 'What\'s your main goal with your wardrobe right now?',
    otherGoalLabel: 'Tell us more about your other goal:',
    otherGoalPlaceholder: 'Describe your other wardrobe goal here...'
  }
};

export const wardrobeGoalOptionsWithDetails = [
  {
    id: 'optimize-my-wardrobe',
    label: 'Optimize my wardrobe',
    description: '',
    icon: FaCog,
    bgColor: '#E6F0FF',
    iconColor: '#4285F4'
  },
  {
    id: 'define-or-upgrade-my-personal-style',
    label: 'Define or upgrade my personal style',
    description: '',
    icon: FaMagic,
    bgColor: '#F3E5F5',
    iconColor: '#9C27B0'
  },
  {
    id: 'buy-less-shop-more-intentionally',
    label: 'Buy less / shop more intentionally',
    description: '',
    icon: FaShoppingCart,
    bgColor: '#E8F5E9',
    iconColor: '#4CAF50'
  },
  {
    id: 'save-money',
    label: 'Save money',
    description: '',
    icon: FaCoins,
    bgColor: '#FFF9C4',
    iconColor: '#FFC107'
  },
  {
    id: 'make-getting-dressed-easier-faster',
    label: 'Make getting dressed easier / faster',
    description: '',
    icon: FaClock,
    bgColor: '#E0F7FA',
    iconColor: '#00BCD4'
  },
  {
    id: 'build-a-capsule-wardrobe',
    label: 'Build a capsule wardrobe',
    description: '',
    icon: FaGift,
    bgColor: '#E8EAF6',
    iconColor: '#3F51B5'
  },
  {
    id: 'declutter-downsize',
    label: 'Declutter / downsize',
    description: '',
    icon: FaBroom,
    bgColor: '#FFEBEE',
    iconColor: '#F44336'
  },
  {
    id: 'experiment-or-try-something-new',
    label: 'Experiment or try something new',
    description: '',
    icon: FaFlask,
    bgColor: '#FCE4EC',
    iconColor: '#E91E63'
  },
  {
    id: 'feel-more-confident-in-what-i-wear',
    label: 'Feel more confident in what I wear',
    description: '',
    icon: FaHeart,
    bgColor: '#FFF3E0',
    iconColor: '#FF9800'
  },
  {
    id: 'other',
    label: 'Other',
    description: '',
    icon: FaEllipsisH,
    bgColor: '#F5F5F5',
    iconColor: '#9E9E9E'
  }
];

// Question texts for onboarding and profile
export const questionTexts = {
  dailyActivities: {
    title: 'What do you do on a daily basis?',
    description: 'Select all that apply. Add how often you do them, if you want — it helps us tailor your wardrobe.'
  },
  officeDressCode: {
    title: 'What\'s your office dress code?',
    description: ''
  },
  remoteWorkPriority: {
    title: 'What matters most in your daily clothing?',
    description: ''
  },
  creativeMobility: {
    title: 'How much mobility do you need in your creative job?',
    description: ''
  },
  homeActivities: {
    title: 'What types of activities do you do at home?',
    description: 'Select all that apply'
  },
  studentDressCode: {
    title: 'What is your study environment like?',
    description: 'This helps us recommend appropriate clothing for your academic needs'
  },
  uniformUsage: {
    title: 'Do you wear a uniform for your work?',
    description: 'Tell us about your uniform requirements'
  },
  otherActivityDescription: {
    title: 'Please tell us more about your daily activities',
    description: 'Describe your typical day and activities'
  },
  leisureActivities: {
    title: 'What do you do in your free time?',
    description: 'Select all that apply to help us tailor your wardrobe for leisure activities'
  },
  otherLeisureActivity: {
    title: 'Please specify your other leisure activity',
    description: 'Describe your specific leisure activities'
  },
  outdoorFrequency: {
    title: 'How often do you do light outdoor activities?',
    description: 'This helps us recommend appropriate clothing for your outdoor needs'
  },
  socialFrequency: {
    title: 'How often do you go out socially?',
    description: 'This helps us recommend appropriate clothing for your social needs'
  },
  formalEventsFrequency: {
    title: 'How often do you attend formal events?',
    description: 'This helps us recommend appropriate clothing for formal occasions'
  },
  travelFrequency: {
    title: 'How often do you travel?',
    description: 'This helps us recommend appropriate clothing for your travel needs'
  }
};

// Conditional follow-up options
export const dressCodeOptions = [
  { id: 'strict', label: 'Strict dress code' },
  { id: 'business-casual', label: 'Business casual' },
  { id: 'no-code', label: 'No dress code' }
];

export const remoteWorkOptions = [
  { id: 'comfort', label: 'Comfort and ease' },
  { id: 'presentable', label: 'Looking presentable (for Zoom, errands, events)' },
  { id: 'balance', label: 'A balance of both' }
];

export const creativeMobilityOptions = [
  { id: 'frequently', label: 'Frequently — I move a lot' },
  { id: 'rarely', label: 'Rarely — I mostly stay in one place' },
  { id: 'varies', label: 'It varies a lot — I need flexible outfits' }
];

export const uniformUsageOptions = [
  { id: 'always', label: 'Yes, all the time' },
  { id: 'sometimes', label: 'Sometimes / for certain tasks' },
  { id: 'never', label: 'No, I wear my own clothes' }
];

export const homeActivityOptions = [
  { id: 'housekeeping', label: 'Housekeeping at home (cleaning, cooking, etc.)' },
  { id: 'outdoor', label: 'Outdoor work around the house (gardening, yard care, etc.)' },
  { id: 'driving', label: 'Driving kids (to school, activities, errands)' },
  { id: 'events', label: 'Attending events at kids\' school (meetings, performances, etc.)' },
  { id: 'playtime', label: 'Playground activities with kids' },
  { id: 'other', label: 'Other' }
];

export const studentDressCodeOptions = [
  { id: 'uniform', label: 'Yes, I wear a uniform' },
  { id: 'dress-code', label: 'Yes, there\'s a dress code' },
  { id: 'no-code', label: 'No, I can wear anything I want' }
];

// Leisure activity options
export const leisureActivityOptions = [
  { id: 'stay-home', label: 'I usually stay at home', icon: <FaHome />, bgColor: '#e8f0fe', iconColor: '#4285f4', description: 'Comfortable home activities' },
  { id: 'light-outdoor', label: 'I go for walks or light outdoor activity', icon: <FaWalking />, bgColor: '#e6f4ea', iconColor: '#34a853', description: 'Casual outdoor activities' },
  { id: 'social', label: 'I go out (restaurants, social events)', icon: <FaUtensils />, bgColor: '#ffebee', iconColor: '#f06292', description: 'Social dining and events' },
  { id: 'travel', label: 'I travel regularly', icon: <FaPlane />, bgColor: '#fff8e1', iconColor: '#fbbc04', description: 'Business or leisure travel' },
  { id: 'other', label: 'Other', icon: <FaEllipsisH />, bgColor: '#f5f5f5', iconColor: '#9e9e9e', description: 'Describe your specific activities' }
];

// Uniform options for physical work
export const uniformOptions = [
  { id: 'yes', label: 'Yes — most of the day' },
  { id: 'no', label: 'No — I wear my own clothes' },
  { id: 'depends', label: 'It depends' }
];

// Frequency options
export const frequencyOptions = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'yearly', label: 'Yearly' }
];

// Period options for frequency dropdowns (e.g. times per week/month)
export const periodOptions = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' }
];

// Weekly/Monthly period options for outdoor and social activities
export const weeklyMonthlyPeriodOptions = [
  { id: 'weekly', label: 'per week' },
  { id: 'monthly', label: 'per month' }
];

// Formal events period options
export const formalEventsPeriodOptions = [
  { id: 'monthly', label: 'per month' },
  { id: 'quarterly', label: 'per quarter' },
  { id: 'annually', label: 'per year' }
];

// Currency options
export const currencyOptions = [
  { id: 'USD', label: 'USD ($)' },
  { id: 'EUR', label: 'EUR (€)' },
  { id: 'GBP', label: 'GBP (£)' },
  { id: 'CAD', label: 'CAD (C$)' },
  { id: 'AUD', label: 'AUD (A$)' },
  { id: 'JPY', label: 'JPY (¥)' }
];

// Shopping limit step content
export const shoppingLimitStepContent = {
  title: 'Set your shopping limit',
  description: 'This helps us recommend items that fit within your budget and shopping goals.',
  settingsNote: 'You can change this anytime in your settings',
  profileSection: {
    title: 'Shopping Limit',
    mainLabel: 'Set your shopping limit',
    monthlyOption: 'Monthly',
    quarterlyOption: 'Quarterly',
    yearlyOption: 'Yearly'
  }
};

// Clothing budget step content
export const clothingBudgetStepContent = {
  title: 'Clothing Budget',
  description: 'What\'s your usual clothing budget? This helps us recommend items within your price range.',
  settingsNote: 'You can change this anytime in your settings',
  profileSection: {
    title: 'Clothing Budget',
    mainLabel: 'Set your clothing budget'
  }
};
