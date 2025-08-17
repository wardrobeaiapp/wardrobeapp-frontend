import React from 'react';
import { Scenario } from '../../../../../services/api';
import { Checkbox, FormField, FormInput } from '../../../../../components/common/Form';
import styled from 'styled-components';

const ScenarioCheckboxes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const CheckboxItem = styled.div`
  padding: 0.25rem 0;
`;

export interface ScenarioSelectorProps {
  /** List of available scenarios */
  scenarios: Scenario[];
  /** Currently selected scenario IDs */
  selectedScenarios: string[];
  /** Callback when a scenario selection changes */
  onScenarioChange: (scenarioId: string) => void;
  /** Whether the component is in a loading state */
  isLoading: boolean;
  /** Optional custom scenario value */
  customScenario?: string;
  /** Optional callback for custom scenario changes */
  onCustomScenarioChange?: (value: string) => void;
  /** Optional namespace for checkbox IDs to prevent collisions */
  namespace?: string;
  /** Whether to show the custom scenario input */
  showCustomScenario?: boolean;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  scenarios,
  selectedScenarios,
  onScenarioChange,
  isLoading,
  customScenario = '',
  onCustomScenarioChange,
  namespace = 'scenario',
  showCustomScenario = false,
}) => {
  return (
    <>
      <FormField
        label="Scenarios"
        labelPosition="top"
        className={isLoading || scenarios.length === 0 ? 'no-margin' : ''}
      >
        <ScenarioCheckboxes>
          {isLoading ? (
            <div>Loading scenarios...</div>
          ) : scenarios.length === 0 ? (
            <div>No scenarios available. Set them up in Scenario Settings.</div>
          ) : (
            scenarios.map(scenario => (
              <CheckboxItem key={scenario.id}>
                <Checkbox
                  id={`${namespace}-${scenario.id}`}
                  checked={selectedScenarios.includes(scenario.id)}
                  onChange={() => onScenarioChange(scenario.id)}
                  label={scenario.name}
                />
              </CheckboxItem>
            ))
          )}
        </ScenarioCheckboxes>
      </FormField>
      
      {showCustomScenario && onCustomScenarioChange && (
        <FormField
          label="Custom Scenario"
          htmlFor={`${namespace}-custom`}
        >
          <FormInput
            id={`${namespace}-custom`}
            type="text"
            value={customScenario}
            onChange={(e) => onCustomScenarioChange(e.target.value)}
            placeholder="Enter custom scenario"
            variant="outline"
            isFullWidth
          />
        </FormField>
      )}
    </>
  );
};

export default ScenarioSelector;
