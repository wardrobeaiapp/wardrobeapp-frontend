import { useScenarios as useSharedScenarios } from '../../../../../../hooks/scenarios';

/**
 * PERFORMANCE OPTIMIZATION:
 * This hook now uses the shared useScenarios hook to prevent duplicate database queries.
 * 
 * Previous issue: WardrobeItemForm was making separate Supabase queries even after
 * ScenarioFilter components were optimized, causing continued 161ms blocking operations.
 * 
 * Custom hook for fetching and managing scenarios for the current user
 * @returns Object containing scenarios, loading state, and error state
 */
export const useScenarios = () => {
  // Use shared scenario hook - eliminates duplicate queries
  const { scenarios: sharedScenarios, isLoading, error } = useSharedScenarios();
  
  // Convert shared scenario format to the format expected by form components
  // ScenarioSelector only needs id and name, so this is a safe conversion
  const scenarios = sharedScenarios.map(scenario => ({
    id: scenario.id,
    name: scenario.name
  }));

  return {
    scenarios,
    isLoading,
    error
  };
};
