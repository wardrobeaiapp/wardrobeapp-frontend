import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { supabase } from '../../../../../services/core';
import { FormField, FormSelect } from '../../../../common/Form';

const StyledSelect = styled(FormSelect)`
  min-width: 160px;
`;

interface ScenarioFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const ScenarioFilter: React.FC<ScenarioFilterProps> = ({ value, onChange }) => {
  const [scenarios, setScenarios] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('scenarios')
          .select('id, name')
          .order('name', { ascending: true });
          
        if (error) {
          console.error('[ScenarioFilter] Error fetching scenarios:', error);
          return;
        }
        
        if (data) {
          setScenarios(data as Array<{ id: string; name: string }>);
        }
      } catch (error) {
        console.error('[ScenarioFilter] Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchScenarios();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormField label="Scenarios" htmlFor="scenario-filter">
      <StyledSelect
        id="scenario-filter"
        value={value}
        onChange={handleChange}
        disabled={isLoading || scenarios.length === 0}
      >
        <option value="all">All Scenarios</option>
        {scenarios.map(scenario => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name}
          </option>
        ))}
      </StyledSelect>
    </FormField>
  );
};

export default ScenarioFilter;
