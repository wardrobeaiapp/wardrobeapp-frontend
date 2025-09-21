import { supabase } from '../../core/supabase';
import { getClimateData } from '../../profile/climateService';
import { getWardrobeGoalsData } from '../../profile/wardrobeGoalsService';
import { getScenariosForUser } from '../../scenarios/scenariosService';
import { getWardrobeItems } from '../../wardrobe/items';
import type { Scenario } from '../../scenarios/types';
import { WardrobeItem } from '../../../types';

export interface UserAnalysisData {
  user: any;
  climateData: any;
  userGoals: string[];
  scenarios: Scenario[];
  wardrobeItems: WardrobeItem[];
}

/**
 * Get all user data needed for wardrobe analysis in a single function
 * Reduces duplicate user auth and data fetching across the service
 */
export async function getUserAnalysisData(): Promise<UserAnalysisData> {
  const result: UserAnalysisData = {
    user: null,
    climateData: null,
    userGoals: [],
    scenarios: [],
    wardrobeItems: []
  };

  try {
    // Get the current authenticated user (only once)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user?.id) {
      console.log('[userDataService] No authenticated user found');
      return result;
    }
    
    result.user = user;
    
    // Fetch all user data in parallel for better performance
    const [climateData, wardrobeGoalsData, scenarios, wardrobeItems] = await Promise.allSettled([
      getClimateData(user.id),
      getWardrobeGoalsData(user.id),
      getScenariosForUser(user.id),
      getWardrobeItems(user.id)
    ]);
    
    // Process climate data
    if (climateData.status === 'fulfilled') {
      result.climateData = climateData.value;
      console.log('[userDataService] Climate data loaded successfully');
    } else {
      console.error('[userDataService] Error fetching climate data:', climateData.reason);
    }
    
    // Process wardrobe goals
    if (wardrobeGoalsData.status === 'fulfilled') {
      result.userGoals = wardrobeGoalsData.value?.wardrobeGoals || [];
      console.log('[userDataService] User wardrobe goals loaded:', result.userGoals);
    } else {
      console.error('[userDataService] Error fetching wardrobe goals:', wardrobeGoalsData.reason);
    }
    
    // Process scenarios
    if (scenarios.status === 'fulfilled') {
      result.scenarios = scenarios.value;
      console.log(`[userDataService] Loaded ${result.scenarios.length} scenarios`);
    } else {
      console.error('[userDataService] Error fetching scenarios:', scenarios.reason);
    }
    
    // Process wardrobe items
    if (wardrobeItems.status === 'fulfilled') {
      result.wardrobeItems = wardrobeItems.value;
      console.log(`[userDataService] Loaded ${result.wardrobeItems.length} wardrobe items for context`);
    } else {
      console.error('[userDataService] Error fetching wardrobe items:', wardrobeItems.reason);
    }
    
  } catch (error) {
    console.error('[userDataService] Error loading user data:', error);
  }
  
  return result;
}
