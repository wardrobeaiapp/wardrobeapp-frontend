import React from 'react';
import { Scenario } from '../../services/api';
import {
  FormGroup,
  Label,
  TextArea,
  SeasonCheckboxes as ScenarioCheckboxes,
  CheckboxItem,
  CheckboxLabel
} from './AIComponents.styles';

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  selectedScenarios: string[];
  customScenario: string;
  onScenarioChange: (scenarioId: string) => void;
  onCustomScenarioChange: (value: string) => void;
  isLoading: boolean;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedScenarios,
  customScenario,
  onScenarioChange,
  onCustomScenarioChange,
  isLoading
}) => {
  return (
    <>
      <FormGroup>
        <Label>Scenarios</Label>
        <ScenarioCheckboxes>
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
                    checked={selectedScenarios.includes(scenario.id)}
                    onChange={() => onScenarioChange(scenario.id)}
                  />
                  {scenario.name}
                </CheckboxLabel>
              </CheckboxItem>
            ))
          )}
        </ScenarioCheckboxes>
      </FormGroup>
    </>
  );
};

export default ScenarioSelector;
