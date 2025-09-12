import { supabase } from '../core';
import { Scenario, CreateScenarioData, UpdateScenarioData } from './types';

// Cache for scenarios data
let scenariosCache: { data: Scenario[] | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

// Flag to track in-progress scenario updates
let scenarioUpdateInProgress = false;

/**
 * Get all scenarios for a user
 * @param userId The user ID to get scenarios for
 * @returns Promise resolving to an array of scenarios
 */
export const getScenariosForUser = async (userId: string, useCache = true): Promise<Scenario[]> => {
  // Check cache if enabled and valid (less than 5 minutes old)
  const now = Date.now();
  const cacheAge = now - scenariosCache.timestamp;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  if (useCache && scenariosCache.data && cacheAge < CACHE_TTL) {
    return scenariosCache.data;
  }

  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  
  const scenarios = (data as unknown as Scenario[]) || [];
  
  // Update cache
  scenariosCache = { data: scenarios, timestamp: now };
  
  return scenarios;
};

/**
 * Create a new scenario
 * @param scenario The scenario to create (without id, created_at, updated_at)
 * @returns Promise resolving to the created scenario
 */
export const createScenario = async (scenario: CreateScenarioData): Promise<Scenario> => {
  const { data, error } = await supabase
    .from('scenarios')
    .insert(scenario)
    .select()
    .single();
    
  if (error) throw error;
  return data as unknown as Scenario;
};

/**
 * Update an existing scenario
 * @param id The ID of the scenario to update
 * @param updates The fields to update
 * @returns Promise resolving to the updated scenario
 */
export const updateScenario = async (id: string, updates: UpdateScenarioData): Promise<Scenario> => {
  const { data, error } = await supabase
    .from('scenarios')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data as unknown as Scenario;
};

/**
 * Delete a scenario
 * @param id The ID of the scenario to delete
 * @returns Promise resolving when the scenario is deleted
 */
export const deleteScenario = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('scenarios')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
  
  // Invalidate cache
  scenariosCache = { data: null, timestamp: 0 };
};

/**
 * Update multiple scenarios in a batch
 * @param userId The ID of the user
 * @param scenarios Array of scenarios to update
 * @param options Options for the update
 * @returns Promise resolving to the updated scenarios
 */
export const updateUserScenarios = async (
  userId: string, 
  scenarios: Scenario[],
  options: { clearExisting?: boolean } = { clearExisting: true }
): Promise<Scenario[]> => {
  // Validate input
  if (!Array.isArray(scenarios)) {
    throw new Error('Scenarios must be an array');
  }

  // Filter out invalid scenarios
  const validScenarios = scenarios.filter(s => s && typeof s === 'object' && s.name);
  
  if (validScenarios.length === 0 && scenarios.length > 0) {
    throw new Error('All scenarios are invalid');
  }

  // Prevent concurrent updates
  if (scenarioUpdateInProgress) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return updateUserScenarios(userId, scenarios, options);
  }

  scenarioUpdateInProgress = true;
  
  try {
    // Start a transaction
    const { data: updatedScenarios, error } = await supabase.rpc('update_user_scenarios', {
      p_user_id: userId,
      p_scenarios: validScenarios,
      p_clear_existing: options.clearExisting ?? true
    });

    if (error) throw error;
    
    // Update cache
    scenariosCache = { 
      data: updatedScenarios as unknown as Scenario[], 
      timestamp: Date.now() 
    };
    
    return updatedScenarios as unknown as Scenario[];
  } catch (error) {
    console.error('Error updating scenarios:', error);
    throw error;
  } finally {
    scenarioUpdateInProgress = false;
  }
};

/**
 * Get a scenario by ID
 * @param id The ID of the scenario to fetch
 * @returns Promise resolving to the scenario or null if not found
 */
/**
 * Update scenarios for the current user
 * This function handles both creating new scenarios and updating existing ones
 * It will first delete all existing scenarios for the user and then insert the new ones
 */
export const updateScenarios = async (scenarios: Scenario[]): Promise<Scenario[]> => {
  // Validate scenarios
  if (!Array.isArray(scenarios)) {
    throw new Error('Invalid scenarios format: expected an array');
  }
  
  // Validate each scenario has required fields
  const validScenarios = scenarios.filter((s): s is Scenario => {
    return (
      s && 
      typeof s === 'object' && 
      'name' in s && 
      typeof s.name === 'string' &&
      (!('frequency' in s) || typeof s.frequency === 'string')
    );
  });
  
  // If all scenarios are invalid, throw an error
  if (validScenarios.length === 0 && scenarios.length > 0) {
    throw new Error('All scenarios are invalid - each scenario must have at least a name');
  }
  
  // Check if an update is already in progress
  if (scenarioUpdateInProgress) {
    // Wait for the current update to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    return updateScenarios(scenarios); // Try again
  }
  
  // Set the flag to indicate an update is in progress
  scenarioUpdateInProgress = true;
  
  try {
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authData.user) {
      throw new Error('User not authenticated');
    }
    
    const userId = authData.user.id;
    
    // Prepare scenarios for insertion
    const scenariosToInsert = validScenarios.map(scenario => {
      const now = new Date().toISOString();
      return {
        user_id: userId,
        name: scenario.name,
        description: scenario.description || '',
        frequency: scenario.frequency || 'weekly',
        created_at: scenario.created_at || now,
        updated_at: now
      };
    });
    
    // Delete existing scenarios for this user first
    const { error: deleteError } = await supabase
      .from('scenarios')
      .delete()
      .eq('user_id', userId);
      
    if (deleteError) {
      console.error('Error deleting existing scenarios:', deleteError);
      // Continue with insertion even if delete fails
    }
    
    // Insert the new scenarios
    const { data: insertedScenarios, error: insertError } = await supabase
      .from('scenarios')
      .insert(scenariosToInsert)
      .select();
      
    if (insertError) {
      throw new Error(`Failed to insert scenarios: ${insertError.message}`);
    }
    
    // Also update scenarios in localStorage as a backup
    try {
      // Get existing user data from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Update or create preferences object
      if (!userData.preferences) {
        userData.preferences = {};
      }
      
      // Transform scenarios to match the expected format in localStorage
      const scenariosForStorage = validScenarios.map(scenario => ({
        id: scenario.id,
        user_id: scenario.user_id,
        name: scenario.name,
        description: scenario.description || '',
        frequency: scenario.frequency || 'weekly',
        created_at: scenario.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      // Update scenarios in user data
      userData.preferences.scenarios = scenariosForStorage;
      
      // Save back to localStorage
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (storageError) {
      console.error('Error updating scenarios in localStorage:', storageError);
      // Continue even if localStorage update fails
    }
    
    // Update cache with the new scenarios
    scenariosCache = { 
      data: insertedScenarios as unknown as Scenario[], 
      timestamp: Date.now() 
    };
    
    return insertedScenarios as unknown as Scenario[];
  } catch (error) {
    console.error('Error updating scenarios:', error);
    throw error; // Re-throw to allow error handling by the caller
  } finally {
    // Always reset the flag when done
    scenarioUpdateInProgress = false;
  }
};

/**
 * Get a scenario by ID
 */
export const getScenarioById = async (id: string): Promise<Scenario | null> => {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    throw error;
  }
  
  return data as unknown as Scenario;
};
