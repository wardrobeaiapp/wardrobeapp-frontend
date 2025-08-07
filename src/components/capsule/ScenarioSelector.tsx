import React from 'react';
import { Scenario } from '../../services/api';
import {
  FormGroup,
  Label,
  SeasonCheckboxes,
  CheckboxContainer,
  CheckboxLabel
} from '../CapsuleForm.styles';

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
        <SeasonCheckboxes>
          {scenarios.length === 0 && isLoading ? (
            <div>Loading scenarios...</div>
          ) : scenarios.length === 0 ? (
            <div>No scenarios available. Set them up in Scenario Settings.</div>
          ) : (
            scenarios.map(scenario => (
              <CheckboxContainer key={scenario.id}>
                <CheckboxLabel>
                  <input
                    type="checkbox"
                    checked={selectedScenarios.includes(scenario.id)}
                    onChange={() => onScenarioChange(scenario.id)}
                  />
                  {scenario.name}
                </CheckboxLabel>
              </CheckboxContainer>
            ))
          )}
        </SeasonCheckboxes>
      </FormGroup>
      
      {/* Custom Scenario field removed as requested */}
    </>
  );
};

export default ScenarioSelector;
