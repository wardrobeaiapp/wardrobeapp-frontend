import { supabase } from './core';
import { Scenario } from '../types';

/**
 * Get all scenarios for a user
 * @param userId The user ID to get scenarios for
 * @returns Promise resolving to an array of scenarios
 */
export const getScenariosForUser = async (userId: string): Promise<Scenario[]> => {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('user_id', userId);
    
  if (error) throw error;
  return (data as unknown as Scenario[]) || [];
};

/**
 * Create a new scenario
 * @param scenario The scenario to create (without id, created_at, updated_at)
 * @returns Promise resolving to the created scenario
 */
export const createScenario = async (scenario: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>): Promise<Scenario> => {
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
export const updateScenario = async (id: string, updates: Partial<Scenario>): Promise<Scenario> => {
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
};
