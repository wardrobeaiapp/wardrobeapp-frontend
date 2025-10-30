import { useState, useCallback } from 'react';
import { getScenariosForUser, createScenario, updateScenario, deleteScenario } from '../../../../services/scenarios';
import { supabase } from '../../../../services/core';
import { ComponentScenario } from '../../../../types/scenario';

interface UseScenarioManagementReturn {
  scenarios: ComponentScenario[];
  deletedScenarios: ComponentScenario[];
  isLoading: boolean;
  error: string | null;
  loadScenarios: () => Promise<void>;
  addScenario: (scenario: ComponentScenario) => void;
  updateScenarioLocal: (updatedScenario: ComponentScenario) => void;
  deleteScenarioLocal: (id: string) => void;
  saveAllScenarios: () => Promise<void>;
  updateFrequency: (id: string, frequency: number) => void;
  updatePeriod: (id: string, period: string) => void;
  clearError: () => void;
}

/**
 * Custom hook to manage scenario CRUD operations
 */
export const useScenarioManagement = (): UseScenarioManagementReturn => {
  const [scenarios, setScenarios] = useState<ComponentScenario[]>([]);
  const [deletedScenarios, setDeletedScenarios] = useState<ComponentScenario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transform database scenarios to component format
   */
  const transformDbScenarios = (dbScenarios: any[]): ComponentScenario[] => {
    return dbScenarios.map(scenario => {
      // Parse frequency string (e.g., "2 times per week")
      const frequencyParts = scenario.frequency?.split(' ') || [];
      const frequencyValue = parseInt(frequencyParts[0] || '1');
      
      // Extract the period value (week or month) from the frequency string
      let periodValue = 'week'; // Default
      if (scenario.frequency) {
        // Check for 'week' or 'month' in the string
        if (scenario.frequency.includes('week')) {
          periodValue = 'week';
        } else if (scenario.frequency.includes('month')) {
          periodValue = 'month';
        }
      }
      
      return {
        id: scenario.id,
        user_id: scenario.user_id,
        name: scenario.name,
        description: scenario.description || `Settings for ${scenario.name} scenario`,
        frequency: frequencyValue,
        period: periodValue
      };
    });
  };

  /**
   * Load scenarios from the database
   */
  const loadScenarios = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch scenarios from the dedicated scenarios table
      const dbScenarios = await getScenariosForUser(authData.user.id);
      
      // Transform database scenarios to component format
      const formattedScenarios = transformDbScenarios(dbScenarios);
      
      setScenarios(formattedScenarios);
    } catch (err) {
      console.error('Error loading scenarios:', err);
      setError('Failed to load scenarios. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add a new scenario to local state
   */
  const addScenario = useCallback((scenario: ComponentScenario) => {
    setScenarios(prev => [...prev, scenario]);
  }, []);

  /**
   * Update a scenario in local state
   */
  const updateScenarioLocal = useCallback((updatedScenario: ComponentScenario) => {
    console.log('Updating scenario locally:', updatedScenario.id, 'with name:', updatedScenario.name);
    
    // Ensure the updated scenario preserves critical properties
    const safeUpdatedScenario = {
      ...updatedScenario,
      // Ensure isNew flag is not accidentally set for existing scenarios
      isNew: updatedScenario.isNew || false
    };
    
    setScenarios(prev => prev.map(s => 
      s.id === safeUpdatedScenario.id ? safeUpdatedScenario : s
    ));
  }, []);

  /**
   * Delete a scenario from local state
   */
  const deleteScenarioLocal = useCallback((id: string) => {
    try {
      // Find the scenario to delete
      const scenarioToDelete = scenarios.find(s => s.id === id);
      
      if (!scenarioToDelete) {
        console.error('Scenario not found:', id);
        return;
      }
      
      // Remove the scenario from the visible list immediately
      setScenarios(prev => prev.filter(s => s.id !== id));
      
      // If it's an existing scenario (not new), add it to deletedScenarios for later database deletion
      if (!scenarioToDelete.isNew) {
        // Mark it for deletion and add to deletedScenarios state
        const markedScenario = { ...scenarioToDelete, markedForDeletion: true };
        setDeletedScenarios(prev => [...prev, markedScenario]);
      }
    } catch (err) {
      console.error('Error deleting scenario:', err);
      setError('Failed to delete scenario. Please try again.');
    }
  }, [scenarios]);

  /**
   * Update frequency for a scenario
   */
  const updateFrequency = useCallback((id: string, frequency: number) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === id ? { ...scenario, frequency } : scenario
    ));
  }, []);

  /**
   * Update period for a scenario
   */
  const updatePeriod = useCallback((id: string, period: string) => {
    setScenarios(prev => prev.map(scenario => 
      scenario.id === id ? { ...scenario, period } : scenario
    ));
  }, []);

  /**
   * Save all scenarios to database
   */
  const saveAllScenarios = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }
      
      console.log('Save scenarios: authenticated user ID:', authData.user.id);
      
      // First, process deletions from the deletedScenarios state
      for (const scenario of deletedScenarios) {
        console.log('Deleting scenario from database:', scenario.id);
        await deleteScenario(scenario.id);
      }
      
      // Clear the deletedScenarios state after processing
      setDeletedScenarios([]);
      
      // Create a copy of scenarios to update with real IDs after database operations
      let updatedScenarios = [...scenarios];
      
      // Process each remaining scenario in the database
      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        // Format frequency string - ensure we're using the correct period value (week or month)
        const periodValue = scenario.period === 'week' || scenario.period === 'month' ? scenario.period : 'week';
        const frequencyString = `${scenario.frequency} ${scenario.frequency === 1 ? 'time' : 'times'} per ${periodValue}`;
        
        if (scenario.isNew) {
          // This is a new scenario that needs to be created in the database
          console.log('Creating new scenario in database:', scenario.name);
          
          // Create the scenario in the database
          const newDbScenario = await createScenario({
            user_id: authData.user.id,
            name: scenario.name,
            description: scenario.description,
            frequency: frequencyString
          });
          
          // Update the local scenario with the real database ID
          updatedScenarios[i] = {
            ...scenario,
            id: newDbScenario.id,
            user_id: newDbScenario.user_id,
            isNew: false // No longer new after saving
          };
        } else {
          // This is an existing scenario that needs to be updated
          console.log('Updating existing scenario in database:', scenario.id, 'with name:', scenario.name);
          
          // Validate scenario ID before attempting update
          if (!scenario.id || scenario.id.startsWith('temp-')) {
            throw new Error(`Invalid scenario ID for "${scenario.name}": ${scenario.id}`);
          }
          
          try {
            // Update the scenario in the database
            await updateScenario(scenario.id, {
              name: scenario.name,
              description: scenario.description,
              frequency: frequencyString
            });
            console.log('Successfully updated scenario:', scenario.id);
          } catch (updateError) {
            console.error('Failed to update scenario:', scenario.id, updateError);
            const errorMessage = updateError && typeof updateError === 'object' && 'message' in updateError 
              ? updateError.message 
              : updateError;
            throw new Error(`Failed to update scenario "${scenario.name}": ${errorMessage}`);
          }
        }
      }
      
      // Update local state with the updated scenarios (with real IDs)
      setScenarios(updatedScenarios);
      
    } catch (err) {
      console.error('Error saving scenarios:', err);
      
      // Better error message handling
      let errorMessage = 'Failed to save scenarios. Please try again.';
      if (err && typeof err === 'object') {
        if ('message' in err && err.message) {
          errorMessage = `Failed to save scenarios: ${err.message}`;
        } else if ('details' in err && err.details) {
          errorMessage = `Failed to save scenarios: ${err.details}`;
        } else if ('error' in err && err.error) {
          errorMessage = `Failed to save scenarios: ${err.error}`;
        }
      } else if (typeof err === 'string') {
        errorMessage = `Failed to save scenarios: ${err}`;
      }
      
      setError(errorMessage);
      throw err; // Re-throw so component can handle success/failure
    } finally {
      setIsLoading(false);
    }
  }, [scenarios, deletedScenarios]);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    scenarios,
    deletedScenarios,
    isLoading,
    error,
    loadScenarios,
    addScenario,
    updateScenarioLocal,
    deleteScenarioLocal,
    saveAllScenarios,
    updateFrequency,
    updatePeriod,
    clearError
  };
};
