import React from 'react';
import { Scenario } from '../../../../services/api';
import { FormGroup, SeasonCheckboxes, CheckboxContainer, CheckboxLabel, CheckboxInput } from '../forms/CapsuleForm.styles';

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
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '0.25rem', padding: 0, display: 'block' }}>Scenarios</legend>
          <SeasonCheckboxes>
            {scenarios.length === 0 && isLoading ? (
              <div>Loading scenarios...</div>
            ) : scenarios.length === 0 ? (
              <div>No scenarios available. Set them up in Scenario Settings.</div>
            ) : (
              scenarios.map(scenario => (
                <CheckboxContainer key={scenario.id}>
                  <CheckboxInput
                    type="checkbox"
                    id={`capsule-scenario-${scenario.id}`}
                    checked={selectedScenarios.includes(scenario.id)}
                    onChange={() => onScenarioChange(scenario.id)}
                  />
                  <CheckboxLabel htmlFor={`capsule-scenario-${scenario.id}`}>
                    {scenario.name}
                  </CheckboxLabel>
                </CheckboxContainer>
              ))
            )}
          </SeasonCheckboxes>
        </fieldset>
      </FormGroup>
      
      {/* Custom Scenario field removed as requested */}
    </>
  );
};

export default ScenarioSelector;
