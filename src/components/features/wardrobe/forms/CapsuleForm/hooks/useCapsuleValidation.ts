import { Season } from '../../../../../../types';
import { Scenario } from '../../../../../../services/api';

export interface CapsuleFormData {
  name: string;
  description: string;
  scenario: string; // Kept for backward compatibility
  scenarios?: string[]; // Array of scenario IDs
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
    let scenarioValue = '';
    let scenariosArray: string[] = [];

    // Handle scenarios - collect names for backward compatibility and IDs for new approach
    if (selectedScenarios.length > 0) {
      scenariosArray = selectedScenarios;
      // Convert scenario IDs to names for backward compatibility
      const scenarioNames = selectedScenarios
        .map(id => scenarios.find(s => s.id === id)?.name)
        .filter(Boolean) as string[];
      scenarioValue = scenarioNames.join(', ');
    }

    // If there's a custom scenario, add it
    if (customScenario.trim()) {
      scenarioValue = scenarioValue ? `${scenarioValue}, ${customScenario.trim()}` : customScenario.trim();
    }

    // Generate capsule name if not provided
    let capsuleName = name.trim();
    if (!capsuleName) {
      // Auto-generate based on seasons and scenarios
      const seasonNames = seasons.join(', ');
      const scenarioText = scenarioValue || 'General';
      capsuleName = `${seasonNames} ${scenarioText} Capsule`;
    }

    return {
      name: capsuleName, // Use the generated name if original was empty
      description: '', // Providing empty string as default
      scenario: scenarioValue,
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
