import { Season } from '../../../../../../types';
import { Scenario } from '../../../../../../services/api';

export interface CapsuleFormData {
  name: string;
  description: string;
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
      // Convert scenario IDs to names for consistent storage
      scenariosArray = selectedScenarios
        .map(id => {
          const scenario = scenarios.find(s => s.id === id);
          return scenario?.name || id; // Use name if available, otherwise fallback to ID
        });
    }

    // Handle custom scenario if provided
    const trimmedCustomScenario = customScenario.trim();
    if (trimmedCustomScenario) {
      // Check if the custom scenario is already in the selected scenarios
      const isCustomScenarioInSelected = scenariosArray.some(
        name => name.toLowerCase() === trimmedCustomScenario.toLowerCase()
      );
      
      if (!isCustomScenarioInSelected) {
        scenariosArray.push(trimmedCustomScenario);
      }
    }

    // Generate capsule name if not provided
    let capsuleName = name.trim();
    if (!capsuleName) {
      // Auto-generate based on seasons and scenarios
      const seasonNames = seasons.join(', ');
      const scenarioText = scenariosArray.length > 0 
        ? scenariosArray.join(', ')
        : 'General';
      capsuleName = `${seasonNames} ${scenarioText} Capsule`;
    }

    return {
      name: capsuleName, // Use the generated name if original was empty
      description: '', // Providing empty string as default
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
