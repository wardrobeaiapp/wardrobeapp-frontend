import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FormField, FormSelect } from '../../../../common/Form';
import { getDemoScenarios, isDemoUser } from '../../../../../services/scenarios/demoScenarioService';
import { useScenarios } from '../../../../../hooks/scenarios';
import { WardrobeItem } from '../../../../../types';

const StyledSelect = styled(FormSelect)`
  min-width: 160px;
`;

interface ScenarioFilterProps {
  value: string;
  onChange: (value: string) => void;
  includeAllOption?: boolean;
  allowUnauthenticated?: boolean; // For demo mode - allows fetching scenarios without authentication
  items?: WardrobeItem[]; // Optional: items being filtered (to auto-detect demo user)
}

const ScenarioFilter: React.FC<ScenarioFilterProps> = ({ 
  value, 
  onChange, 
  includeAllOption = false,
  allowUnauthenticated = false,
  items
}) => {
  // Use shared scenario hook for authenticated users (performance optimization)
  const { scenarios: sharedScenarios, isLoading: sharedIsLoading } = useScenarios();
  
  // Local state for demo mode scenarios 
  const [demoScenarios, setDemoScenarios] = useState<Array<{ id: string; name: string }>>([]);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Auth context no longer needed since we use shared useScenarios hook
  // const { user, isAuthenticated } = useSupabaseAuth();

  // Handle demo mode scenarios separately
  useEffect(() => {
    const fetchDemoScenarios = async () => {
      // Check if we're in demo mode (unauthenticated with demo items)
      if (allowUnauthenticated && items && items.length > 0) {
        const detectedUserId = items[0]?.userId;
        if (detectedUserId && isDemoUser(detectedUserId)) {
          console.log(`[ScenarioFilter] PERFORMANCE: Using demo mode for ${detectedUserId}`);
          setIsDemoMode(true);
          setIsDemoLoading(true);
          
          try {
            const demoScenariosData = await getDemoScenarios(detectedUserId);
            setDemoScenarios(demoScenariosData);
          } catch (error) {
            console.error('[ScenarioFilter] Demo scenarios error:', error);
            setDemoScenarios([]);
          } finally {
            setIsDemoLoading(false);
          }
          return;
        }
      }
      
      // Not demo mode
      setIsDemoMode(false);
      setDemoScenarios([]);
    };
    
    fetchDemoScenarios();
  }, [allowUnauthenticated, items]);

  // Determine which scenarios and loading state to use
  const scenarios = isDemoMode ? demoScenarios : sharedScenarios;
  const isLoading = isDemoMode ? isDemoLoading : sharedIsLoading;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormField label="Scenario" htmlFor="scenario-filter">
      <StyledSelect
        id="scenario-filter"
        value={value}
        onChange={handleChange}
        disabled={isLoading}
      >
        {includeAllOption && <option value="all">All Scenarios</option>}
        {scenarios.map((scenario) => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </StyledSelect>
    </FormField>
  );
};

export default ScenarioFilter;
