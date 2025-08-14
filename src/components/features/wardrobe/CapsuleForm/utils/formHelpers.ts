import { Season } from '../../../../../types';
import { Scenario } from '../../../../../services/api';

export interface CapsuleFormData {
  name: string;
  description: string;
  scenario: string; // Kept for backward compatibility
  scenarios?: string[]; // Array of scenario IDs
  seasons: Season[];
  selectedItems: string[];
  mainItemId: string; // ID of the main item (single-select)
}

/**
 * Generate a capsule name based on seasons and scenarios
 */
export const generateCapsuleName = (
  seasons: Season[],
  scenarioValue: string
): string => {
  const seasonNames = seasons.join(', ');
  const scenarioText = scenarioValue || 'General';
  return `${seasonNames} ${scenarioText} Capsule`;
};

/**
 * Convert scenario IDs to names for backward compatibility
 */
export const convertScenarioIdsToNames = (
  selectedScenarios: string[],
  scenarios: Scenario[]
): string => {
  const scenarioNames = selectedScenarios
    .map(id => scenarios.find(s => s.id === id)?.name)
    .filter(Boolean) as string[];
  return scenarioNames.join(', ');
};

/**
 * Prepare complete scenario value including custom scenario
 */
export const prepareScenarioValue = (
  selectedScenarios: string[],
  scenarios: Scenario[],
  customScenario: string
): { scenarioValue: string; scenariosArray: string[] } => {
  let scenarioValue = '';
  const scenariosArray = selectedScenarios;

  // Convert scenario IDs to names for backward compatibility
  if (selectedScenarios.length > 0) {
    scenarioValue = convertScenarioIdsToNames(selectedScenarios, scenarios);
  }

  // If there's a custom scenario, add it
  if (customScenario.trim()) {
    scenarioValue = scenarioValue 
      ? `${scenarioValue}, ${customScenario.trim()}` 
      : customScenario.trim();
  }

  return { scenarioValue, scenariosArray };
};

/**
 * Prepare complete form data for submission
 */
export const prepareFormData = (
  name: string,
  selectedScenarios: string[],
  customScenario: string,
  seasons: Season[],
  selectedItems: string[],
  mainItemId: string,
  scenarios: Scenario[]
): CapsuleFormData => {
  const { scenarioValue, scenariosArray } = prepareScenarioValue(
    selectedScenarios,
    scenarios,
    customScenario
  );

  // Generate capsule name if not provided
  let capsuleName = name.trim();
  if (!capsuleName) {
    capsuleName = generateCapsuleName(seasons, scenarioValue);
  }

  return {
    name: capsuleName,
    description: '', // Providing empty string as default
    scenario: scenarioValue,
    scenarios: scenariosArray,
    seasons,
    selectedItems,
    mainItemId
  };
};

/**
 * Validate form data before submission
 */
export const validateFormData = (
  selectedItems: string[],
  mainItemId: string,
  seasons: Season[]
): string | null => {
  // Validate required fields
  if (selectedItems.length === 0 && !mainItemId) {
    return 'Please select at least one item for your capsule';
  }
  
  if (seasons.length === 0) {
    return 'Please select at least one season';
  }

  return null; // Form is valid
};
