import React from 'react';
import { Scenario } from '../../services/api';
import {
  FormGroup,
  SeasonCheckboxes,
  CheckboxItem,
  CheckboxLabel
} from '../OutfitForm.styles';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenarios: string[];
  onScenarioChange: (scenarioName: string) => void;
  isLoading: boolean;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedScenarios,
  onScenarioChange,
  isLoading
}) => {
  return (
    <FormGroup>
      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '0.25rem', padding: 0, display: 'block' }}>Scenarios</legend>
        <SeasonCheckboxes>
          {scenarios.length === 0 && isLoading ? (
            <div>Loading scenarios...</div>
          ) : scenarios.length === 0 ? (
            <div>Using default scenarios since none were found in your profile.</div>
          ) : (
            scenarios.map(scenario => (
              <CheckboxItem key={scenario.id}>
                <input
                  type="checkbox"
                  id={`scenario-${scenario.id}`}
                  checked={selectedScenarios.includes(scenario.name)}
                  onChange={() => onScenarioChange(scenario.name)}
                />
                <CheckboxLabel htmlFor={`scenario-${scenario.id}`}>
                  {scenario.name}
                </CheckboxLabel>
              </CheckboxItem>
            ))
          )}
        </SeasonCheckboxes>
      </fieldset>
    </FormGroup>
  );
};

export default ScenarioSelector;
