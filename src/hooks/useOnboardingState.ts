import { useState } from 'react';

export const useOnboardingState = () => {
  // Daily activities
  const [dailyActivities, setDailyActivities] = useState<string[]>([]);
  const [officeDressCode, setOfficeDressCodeInternal] = useState<string>('');
  
  // Wrapper function to ensure state updates properly
  const setOfficeDressCode = (value: string) => {
    console.log('DEBUG - setOfficeDressCode wrapper called with:', value);
    setOfficeDressCodeInternal(value);
  };
  const [remoteWorkPriority, setRemoteWorkPriority] = useState<string>('');
  const [creativeMobility, setCreativeMobility] = useState<string>('');
  const [uniformPreference, setUniformPreference] = useState<string>('');
  const [studentDressCode, setStudentDressCode] = useState<string>('');
  const [homeActivities, setHomeActivities] = useState<string[]>([]);
  const [otherActivityDescription, setOtherActivityDescription] = useState<string>('');
  
  // Leisure activities
  const [leisureActivities, setLeisureActivities] = useState<string[]>([]);
  const [otherLeisureActivityDescription, setOtherLeisureActivityDescription] = useState<string>('');
  const [outdoorFrequency, setOutdoorFrequency] = useState<number>(0);
  const [outdoorPeriod, setOutdoorPeriod] = useState<string>('week');
  const [socialFrequency, setSocialFrequency] = useState<number>(0);
  const [socialPeriod, setSocialPeriod] = useState<string>('week');
  const [formalEventsFrequency, setFormalEventsFrequency] = useState<number>(0);
  const [formalEventsPeriod, setFormalEventsPeriod] = useState<string>('week');
  const [travelFrequency, setTravelFrequency] = useState<string>('monthly');
  
  // Style preferences
  const [preferredStyles, setPreferredStyles] = useState<string[]>([]);
  const [comfortVsStyleValue, setComfortVsStyleValue] = useState<number>(50);
  const [classicVsTrendyValue, setClassicVsTrendyValue] = useState<number>(50);
  const [basicsVsStatementsValue, setBasicsVsStatementsValue] = useState<number>(50);
  const [additionalStyleNotes, setAdditionalStyleNotes] = useState<string>('');
  
  // Climate preference
  const [climatePreference, setClimatePreference] = useState<string>('');
  
  // Wardrobe goals
  const [wardrobeGoals, setWardrobeGoals] = useState<string[]>([]);
  const [otherWardrobeGoalDescription, setOtherWardrobeGoalDescription] = useState<string>('');
  
  // Scenarios
  const [scenarios, setScenarios] = useState<Array<{
    id: string;
    name: string;
    description?: string;
    frequency: string;
    priority?: string;
    items?: string[];
    outfits?: string[];
    tags?: string[];
    isActive?: boolean;
  }>>([]);
  
  // Shopping limit
  const [hasShoppingLimit, setHasShoppingLimit] = useState<boolean>(true);
  const [shoppingLimitAmount, setShoppingLimitAmount] = useState<number>(0);
  const [shoppingLimitFrequency, setShoppingLimitFrequency] = useState<string>('monthly');
  
  // Clothing budget
  const [clothingBudgetAmount, setClothingBudgetAmount] = useState<number>(0);
  const [clothingBudgetCurrency, setClothingBudgetCurrency] = useState<string>('USD');
  const [clothingBudgetFrequency, setClothingBudgetFrequency] = useState<string>('monthly');

  // Handler functions
  const handleDailyActivityToggle = (activity: string) => {
    if (activity === 'other') {
      // Special handling for the 'other' option
      setDailyActivities(prev => {
        // Check if 'other' or any 'other:' entries exist
        const hasOther = prev.includes('other') || prev.some(a => a.startsWith('other:'));
        
        if (hasOther) {
          // If toggling off, remove both 'other' and any 'other:' entries
          console.log('Removing other option');
          return prev.filter(a => a !== 'other' && !a.startsWith('other:'));
        } else {
          // If toggling on, add 'other'
          console.log('Adding other option');
          return [...prev, 'other'];
        }
      });
      
      // Log the current state after the update
      setTimeout(() => {
        console.log('Daily activities after other toggle:', dailyActivities);
      }, 100);
    } else {
      // Standard handling for other activities
      setDailyActivities(prev => 
        prev.includes(activity)
          ? prev.filter(a => a !== activity)
          : [...prev, activity]
      );
    }
  };

  const handleLeisureActivityToggle = (activity: string) => {
    setLeisureActivities(prev => 
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleOtherLeisureActivityDescriptionChange = (description: string) => {
    setOtherLeisureActivityDescription(description);
  };

  const handleStyleToggle = (style: string) => {
    setPreferredStyles(prev => 
      prev.includes(style)
        ? prev.filter(s => s !== style)
        : [...prev, style]
    );
  };

  const handleClimateSelection = (climate: string) => {
    setClimatePreference(climate);
  };

  const handleWardrobeGoalToggle = (goal: string) => {
    setWardrobeGoals(prev => 
      prev.includes(goal)
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const handleOtherWardrobeGoalDescriptionChange = (description: string) => {
    setOtherWardrobeGoalDescription(description);
  };

  const handleShoppingLimitAmountChange = (amount: number) => {
    setShoppingLimitAmount(amount);
  };

  const handleShoppingLimitFrequencyChange = (frequency: string) => {
    setShoppingLimitFrequency(frequency);
  };

  const handleClothingBudgetAmountChange = (amount: number) => {
    setClothingBudgetAmount(amount);
  };

  const handleClothingBudgetCurrencyChange = (currency: string) => {
    setClothingBudgetCurrency(currency);
  };

  const handleClothingBudgetFrequencyChange = (frequency: string) => {
    setClothingBudgetFrequency(frequency);
  };

  const handleHomeActivityToggle = (activity: string) => {
    setHomeActivities(prev => 
      prev.includes(activity)
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleOtherActivityDescriptionChange = (description: string) => {
    setOtherActivityDescription(description);
  };

  // Return all state and handlers
  return {
    // Daily activities
    dailyActivities,
    handleDailyActivityToggle,
    officeDressCode,
    setOfficeDressCode,
    remoteWorkPriority,
    setRemoteWorkPriority,
    creativeMobility,
    setCreativeMobility,
    uniformPreference,
    setUniformPreference,
    studentDressCode,
    setStudentDressCode,
    homeActivities,
    handleHomeActivityToggle,
    otherActivityDescription,
    handleOtherActivityDescriptionChange,
    
    // Leisure activities
    leisureActivities,
    handleLeisureActivityToggle,
    otherLeisureActivityDescription,
    handleOtherLeisureActivityDescriptionChange,
    outdoorFrequency,
    setOutdoorFrequency,
    outdoorPeriod,
    setOutdoorPeriod,
    socialFrequency,
    setSocialFrequency,
    socialPeriod,
    setSocialPeriod,
    formalEventsFrequency,
    setFormalEventsFrequency,
    formalEventsPeriod,
    setFormalEventsPeriod,
    travelFrequency,
    setTravelFrequency,
    
    // Style preferences
    preferredStyles,
    handleStyleToggle,
    comfortVsStyleValue,
    setComfortVsStyleValue,
    classicVsTrendyValue,
    setClassicVsTrendyValue,
    basicsVsStatementsValue,
    setBasicsVsStatementsValue,
    additionalStyleNotes,
    setAdditionalStyleNotes,
    
    // Climate preference
    climatePreference,
    handleClimateSelection,
    
    // Wardrobe goals
    wardrobeGoals,
    handleWardrobeGoalToggle,
    otherWardrobeGoalDescription,
    handleOtherWardrobeGoalDescriptionChange,
    
    // Shopping limit
    hasShoppingLimit,
    setHasShoppingLimit,
    shoppingLimitAmount,
    handleShoppingLimitAmountChange,
    shoppingLimitFrequency,
    handleShoppingLimitFrequencyChange,
    
    // Clothing budget
    clothingBudgetAmount,
    handleClothingBudgetAmountChange,
    clothingBudgetCurrency,
    handleClothingBudgetCurrencyChange,
    clothingBudgetFrequency,
    handleClothingBudgetFrequencyChange,
    
    // Scenarios
    scenarios,
    handleScenariosChange: (newScenarios: Array<{id: string; name: string; frequency: string}>) => {
      setScenarios(newScenarios);
    }
  };
};

// Export type for the hook return value
export type OnboardingStateHook = ReturnType<typeof useOnboardingState>;
