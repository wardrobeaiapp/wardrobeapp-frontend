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
      <SeasonCheckboxes>
        {scenarios.length === 0 && isLoading ? (
          <div>Loading scenarios...</div>
        ) : scenarios.length === 0 ? (
          <div>Using default scenarios since none were found in your profile.</div>
        ) : (
          scenarios.map(scenario => (
            <CheckboxItem key={scenario.id}>
              <CheckboxLabel>
                <input
                  type="checkbox"
                  checked={selectedScenarios.includes(scenario.name)}
                  onChange={() => onScenarioChange(scenario.name)}
                />
                {scenario.name}
              </CheckboxLabel>
            </CheckboxItem>
          ))
        )}
      </SeasonCheckboxes>
    </FormGroup>
  );
};

export default ScenarioSelector;
