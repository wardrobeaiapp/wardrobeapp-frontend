import { useState, useEffect } from 'react';
import { fetchScenarios, Scenario } from '../../../../../../services/api';
import { Capsule } from '../../../../../../types';

export interface UseScenarioHandlingProps {
  editCapsule?: Capsule;
  setSelectedScenarios: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface UseScenarioHandlingReturn {
  scenarios: Scenario[];
  scenariosLoading: boolean;
}

export const useScenarioHandling = ({ 
  editCapsule,
  setSelectedScenarios 
}: UseScenarioHandlingProps): UseScenarioHandlingReturn => {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenariosLoading, setScenariosLoading] = useState(false);

  // Fetch scenarios when component mounts
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        setScenariosLoading(true);
        const data = await fetchScenarios();
        setScenarios(data);
        
        // If editing a capsule with scenarios, find matching scenario IDs
        if (editCapsule?.scenarios && editCapsule.scenarios.length > 0) {
          // Convert scenario names to lowercase for case-insensitive comparison
          const scenarioNames = editCapsule.scenarios.map(s => s.toLowerCase());
          
          // Find all scenarios where the name matches any of the capsule's scenario names
          const matchingScenarios = data.filter(s => 
            scenarioNames.includes(s.name.toLowerCase())
          );
          
          if (matchingScenarios.length > 0) {
            setSelectedScenarios(matchingScenarios.map(s => s.id));
          }
        }
      } catch (err) {
        console.error('Error loading scenarios:', err);
      } finally {
        setScenariosLoading(false);
      }
    };
    
    loadScenarios();
  }, [editCapsule, setSelectedScenarios]);

  return {
    scenarios,
    scenariosLoading,
  };
};
