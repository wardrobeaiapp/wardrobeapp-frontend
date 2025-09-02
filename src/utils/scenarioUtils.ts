import { v4 as uuidv4 } from 'uuid';

export interface Scenario {
  id: string;
  name: string;
  frequency: string;
  isTravel?: boolean;
  originalFrequency?: string;
}

/**
 * Generate scenario frequencies based on the user's lifestyle choices
 * Includes activities from both DailyActivitiesStep and LeisureActivitiesStep
 * Handles the relationship between Remote Work and Staying at Home scenarios
 */
export const generateScenariosFromLifestyle = (
  dailyActivities: string[],
  leisureActivities: string[],
  socialFrequency: number,
  socialPeriod: string,
  formalEventsFrequency: number,
  formalEventsPeriod: string,
  outdoorFrequency: number,
  outdoorPeriod: string,
  travelFrequency: string,
  remoteWorkPriority: string = '', // Default to empty string if not provided
  otherActivityDescription: string = '', // Other daily activities description
  otherLeisureActivityDescription: string = '' // Other leisure activities description
): Scenario[] => {
  const scenarios: Scenario[] = [];
  
  // Track if we've added a staying at home scenario
  let hasStayingAtHomeScenario = false;

  // Work-related scenarios from DailyActivitiesStep
  if (dailyActivities.includes('office')) {
    scenarios.push({
      id: uuidv4(),
      name: 'Office Work',
      frequency: '5 times per week'
    });
  }

  // Handle Remote Work and Staying at Home relationship
  if (dailyActivities.includes('remote')) {
    // If user has remote work with Zoom meetings (presentable)
    if (remoteWorkPriority === 'presentable') {
      scenarios.push({
        id: uuidv4(),
        name: 'Remote Work (Presentable)',
        frequency: '5 times per week'
      });
      
      // Add staying at home for weekends (2 days)
      scenarios.push({
        id: uuidv4(),
        name: 'Staying at Home (Casual)',
        frequency: '2 times per week'
      });
      hasStayingAtHomeScenario = true;
    } 
    // If user prefers balance between comfort and presentable
    else if (remoteWorkPriority === 'balance') {
      scenarios.push({
        id: uuidv4(),
        name: 'Remote Work',
        frequency: '5 times per week'
      });
      
      // Add staying at home for weekends (2 days)
      scenarios.push({
        id: uuidv4(),
        name: 'Staying at Home (Casual)',
        frequency: '2 times per week'
      });
      hasStayingAtHomeScenario = true;
    }
    // If user prioritizes comfort (no Zoom meetings)
    else if (remoteWorkPriority === 'comfort') {
      // For comfort-focused remote work, we treat it as staying at home
      scenarios.push({
        id: uuidv4(),
        name: 'Staying at Home',
        frequency: '7 times per week'
      });
      hasStayingAtHomeScenario = true;
    }
    // If no remote work priority specified, default behavior
    else {
      scenarios.push({
        id: uuidv4(),
        name: 'Remote Work',
        frequency: '5 times per week'
      });
    }
  }

  if (dailyActivities.includes('creative')) {
    scenarios.push({
      id: uuidv4(),
      name: 'Creative Work',
      frequency: '5 times per week'
    });
  }

  // Education-related scenarios from DailyActivitiesStep
  if (dailyActivities.includes('student')) {
    scenarios.push({
      id: uuidv4(),
      name: 'School/University',
      frequency: '5 times per week'
    });
  }

  // Home-related scenarios from DailyActivitiesStep - break into specific activities
  if (dailyActivities.includes('family')) {
    // These scenarios are generated based on the home activity subquestions
    // For now, we'll generate all common family care scenarios
    // In the future, this could be refined based on specific home activity selections
    
    scenarios.push({
      id: uuidv4(),
      name: 'Housekeeping at Home',
      frequency: '5-7 times per week'
    });
    
    scenarios.push({
      id: uuidv4(),
      name: 'School Drop-off & Pickup',
      frequency: '5 times per week'
    });
    
    scenarios.push({
      id: uuidv4(),
      name: 'Playground Activities with Kids',
      frequency: '2-3 times per week'
    });
    
    scenarios.push({
      id: uuidv4(),
      name: 'Outdoor Home Projects',
      frequency: '1-2 times per week'
    });
    
    scenarios.push({
      id: uuidv4(),
      name: 'School Events & Meetings',
      frequency: '1-2 times per month'
    });
  }

  // Physical work scenarios from DailyActivitiesStep
  if (dailyActivities.includes('physical')) {
    scenarios.push({
      id: uuidv4(),
      name: 'Physical Work',
      frequency: '5 times per week'
    });
  }

  // Leisure scenarios from LeisureActivitiesStep
  
  // Note: 'stay-home' is handled as a scenario option only, not as a daily activity
  // Only add if we haven't already added a staying at home scenario from remote work
  if (leisureActivities.includes('stay-home') && !hasStayingAtHomeScenario) {
    scenarios.push({
      id: uuidv4(),
      name: 'Staying at Home',
      frequency: '7 times per week'
    });
  }

  if (leisureActivities.includes('light-outdoor')) {
    scenarios.push({
      id: uuidv4(),
      name: 'Light Outdoor Activities',
      frequency: `${outdoorFrequency} times per ${outdoorPeriod}`
    });
  }

  if (leisureActivities.includes('social')) {
    scenarios.push({
      id: uuidv4(),
      name: 'Social Outings',
      frequency: `${socialFrequency} times per ${socialPeriod}`
    });
  }

  if (leisureActivities.includes('travel')) {
    // Special case for travel: preserve the exact frequency from LeisureActivitiesStep
    // This ensures the travel scenario shows the same frequency the user selected
    // in the LeisureActivitiesStep (monthly, quarterly, etc.)
    let frequency = '';
    
    // Map the travelFrequency value to a user-friendly display format
    // that matches the format expected in the ScenarioFrequencyStep
    // Map the travelFrequency value to the exact format needed for the ScenarioFrequencyStep
    // Important: Use the exact IDs from frequencyOptions in onboardingOptions.tsx
    switch (travelFrequency) {
      case 'weekly':
        frequency = 'weekly';
        break;
      case 'monthly':
        frequency = 'monthly';
        break;
      case 'quarterly':
        frequency = 'quarterly';
        break;
      case 'semiannual': // Note: This matches the ID in frequencyOptions
        frequency = 'semiannual';
        break;
      case 'yearly':
        frequency = 'yearly';
        break;
      default:
        frequency = 'monthly'; // Default fallback
    }

    scenarios.push({
      id: uuidv4(),
      name: 'Travel',
      frequency,
      // Add a special flag to identify this as a travel scenario with custom frequency
      // This can be used by the ScenarioFrequencyStep to prevent frequency editing
      isTravel: true,
      originalFrequency: travelFrequency
    });
  }

  // Day to night scenario removed

  if (leisureActivities.includes('formal-events') && formalEventsFrequency > 0) {
    scenarios.push({
      id: uuidv4(),
      name: 'Formal Events',
      frequency: `${formalEventsFrequency} times per ${formalEventsPeriod}`
    });
  }

  // Add default scenarios if none were created
  if (scenarios.length === 0) {
    scenarios.push(
      {
        id: uuidv4(),
        name: 'Casual Everyday',
        frequency: '7 times per week'
      },
      {
        id: uuidv4(),
        name: 'Social Outings',
        frequency: '2 times per week'
      }
    );
  }

  // Add custom scenarios for 'other' daily activities if provided
  if (dailyActivities.includes('other') && otherActivityDescription.trim()) {
    scenarios.push({
      id: uuidv4(),
      name: `Other Daily Activity: ${otherActivityDescription.length > 20 ? otherActivityDescription.substring(0, 20) + '...' : otherActivityDescription}`,
      frequency: '3 times per week' // Default frequency
    });
  }

  // Add custom scenarios for 'other' leisure activities if provided
  if (leisureActivities.includes('other') && otherLeisureActivityDescription.trim()) {
    scenarios.push({
      id: uuidv4(),
      name: `Other Leisure Activity: ${otherLeisureActivityDescription.length > 20 ? otherLeisureActivityDescription.substring(0, 20) + '...' : otherLeisureActivityDescription}`,
      frequency: '2 times per month' // Default frequency
    });
  }

  return scenarios;
};

/**
 * Returns an array of default scenario names
 * Used as fallback when user-specific scenarios aren't available
 */
const getDefaultScenarioNames = (): string[] => {
  return [
    'Casual Everyday',
    'Office Work',
    'Remote Work',
    'Remote Work (Presentable)',
    'Staying at Home',
    'Staying at Home (Casual)',
    'Creative Work',
    'School/University',
    'Housekeeping at Home',
    'School Drop-off & Pickup',
    'Playground Activities with Kids',
    'Outdoor Home Projects',
    'School Events & Meetings',
    'Physical Work',
    'Light Outdoor Activities',
    'Social Outings',
    'Travel',
    'Formal Events'
  ];
};

/**
 * Get scenario names for filter options
 * This ensures consistent scenario options across the app
 * @param userId The ID of the user to fetch scenarios for
 */
export const getScenarioNamesForFilters = async (userId?: string): Promise<string[]> => {
  try {
    // Return default scenarios if no user ID provided
    if (!userId) {
      return getDefaultScenarioNames();
    }
    
    // Import dynamically to avoid circular dependencies
    const { fetchScenarios } = await import('../services/api');
    const scenarios = await fetchScenarios(userId);
    
    if (scenarios && scenarios.length > 0) {
      // Return just the names for filter options
      return scenarios.map(scenario => scenario.name);
    }
    
    // Return default scenario names if no scenarios found
    return getDefaultScenarioNames();
  } catch (error) {
    console.error('Error fetching scenarios for filters:', error);
    // Return default scenario names if error occurs
    return getDefaultScenarioNames().slice(0, 5); // Return first 5 default scenarios on error
  }
};
