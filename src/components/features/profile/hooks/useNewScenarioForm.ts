import { useState, useRef, useCallback } from 'react';
import { ComponentScenario } from '../../../../types/scenario';

interface UseNewScenarioFormReturn {
  newScenarioName: string;
  setNewScenarioName: (name: string) => void;
  showNewScenarioInput: boolean;
  newScenarioInputRef: React.RefObject<HTMLInputElement | null>;
  handleAddNewScenario: () => void;
  handleCreateScenario: () => ComponentScenario | null;
  handleCancelNewScenario: () => void;
}

/**
 * Custom hook to manage new scenario form state and operations
 */
export const useNewScenarioForm = (): UseNewScenarioFormReturn => {
  const [newScenarioName, setNewScenarioName] = useState('');
  const [showNewScenarioInput, setShowNewScenarioInput] = useState(false);
  const newScenarioInputRef = useRef<HTMLInputElement>(null);

  /**
   * Start adding a new scenario
   */
  const handleAddNewScenario = useCallback(() => {
    setShowNewScenarioInput(true);
    // Focus the input after it's rendered
    setTimeout(() => {
      if (newScenarioInputRef.current) {
        newScenarioInputRef.current.focus();
      }
    }, 100);
  }, []);

  /**
   * Create a new scenario object
   */
  const handleCreateScenario = useCallback((): ComponentScenario | null => {
    if (newScenarioName.trim() === '') {
      return null;
    }

    try {
      const scenarioType = newScenarioName.trim();
      const isTravel = scenarioType.toLowerCase().includes('travel');
      
      // Create a temporary ID for the new scenario
      const tempId = `temp-${Date.now()}`;
      
      // Create a component scenario with temporary ID
      const newScenario: ComponentScenario = {
        id: tempId,
        user_id: 'temp-user-id', // Will be updated when saved to database
        name: scenarioType,
        description: `Settings for ${scenarioType} scenario`,
        frequency: isTravel ? 1 : 1,
        period: isTravel ? 'year' : 'week',
        isNew: true // Flag to identify newly added scenarios that need to be created in the database
      };

      // Reset form
      setNewScenarioName('');
      setShowNewScenarioInput(false);

      return newScenario;
    } catch (err) {
      console.error('Error creating scenario:', err);
      return null;
    }
  }, [newScenarioName]);

  /**
   * Cancel adding a new scenario
   */
  const handleCancelNewScenario = useCallback(() => {
    setShowNewScenarioInput(false);
    setNewScenarioName('');
  }, []);

  return {
    newScenarioName,
    setNewScenarioName,
    showNewScenarioInput,
    newScenarioInputRef,
    handleAddNewScenario,
    handleCreateScenario,
    handleCancelNewScenario
  };
};
