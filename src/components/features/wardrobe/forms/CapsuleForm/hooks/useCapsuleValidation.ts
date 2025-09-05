import { Season, Scenario } from '../../../../../../types';

export interface CapsuleFormData {
  name: string;
  scenarios: string[]; // Array of scenario IDs or names
  seasons: Season[];
  selectedItems: string[];
  mainItemId: string; // ID of the main item (single-select)
}

export interface UseCapsuleValidationProps {
  name: string;
  selectedScenarios: string[];
  customScenario: string;
  seasons: Season[];
  selectedItems: string[];
  mainItemId: string;
  scenarios: Scenario[];
}

export interface UseCapsuleValidationReturn {
  validateForm: () => string | null; // Returns error message or null if valid
  prepareFormData: () => CapsuleFormData;
}

export const useCapsuleValidation = ({
  name,
  selectedScenarios,
  customScenario,
  seasons,
  selectedItems,
  mainItemId,
  scenarios,
}: UseCapsuleValidationProps): UseCapsuleValidationReturn => {

  const validateForm = (): string | null => {
    // Validate required fields
    if (selectedItems.length === 0 && !mainItemId) {
      return 'Please select at least one item for your capsule';
    }
    
    if (seasons.length === 0) {
      return 'Please select at least one season';
    }

    return null; // Form is valid
  };

  const prepareFormData = (): CapsuleFormData => {
    let scenariosArray: string[] = [];

    // Handle selected scenarios
    if (selectedScenarios.length > 0) {
      // Use scenario IDs directly for proper join table insertion
      // The IDs will be used to link to scenarios in the capsule_scenarios join table
      scenariosArray = [...selectedScenarios];
    }

    // Handle custom scenario if provided
    const trimmedCustomScenario = customScenario.trim();
    if (trimmedCustomScenario) {
      // First check if this scenario already exists in the scenarios list (by name)
      const existingScenario = scenarios.find(
        s => s.name.toLowerCase() === trimmedCustomScenario.toLowerCase()
      );
      
      // Check if the scenario ID is already in our selected scenarios
      const isScenarioAlreadySelected = existingScenario && 
        scenariosArray.includes(existingScenario.id);
      
      if (existingScenario && !isScenarioAlreadySelected) {
        // If it exists but isn't selected yet, add its ID
        scenariosArray.push(existingScenario.id);
      } else if (!existingScenario) {
        // If it's a completely new scenario, we would need to create it first
        // For now we'll just log this as it would require API changes
        console.warn('Custom scenario handling requires creating a new scenario first:', trimmedCustomScenario);
      }
    }

    // Generate capsule name if not provided
    let capsuleName = name.trim();
    if (!capsuleName) {
      // Auto-generate based on seasons and scenarios
      const seasonNames = seasons.join(', ');
      
      // Map scenario IDs to names for display purposes
      const scenarioNames = scenariosArray.map(scenarioId => {
        const scenario = scenarios.find(s => s.id === scenarioId);
        return scenario ? scenario.name : 'Unknown';
      });
      
      const scenarioText = scenarioNames.length > 0 
        ? scenarioNames.join(', ')
        : 'General';
        
      capsuleName = `${seasonNames} ${scenarioText} Capsule`;
    }

    return {
      name: capsuleName, // Use the generated name if original was empty
      scenarios: scenariosArray,
      seasons,
      selectedItems,
      mainItemId // Include the mainItemId in the form submission
    };
  };

  return {
    validateForm,
    prepareFormData,
  };
};
