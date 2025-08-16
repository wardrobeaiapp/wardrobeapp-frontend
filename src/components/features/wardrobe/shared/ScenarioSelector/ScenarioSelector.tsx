import React from 'react';
import { Scenario } from '../../../../../services/api';
import {
  FormGroup,
  SeasonCheckboxes,
  CheckboxItem as StyledCheckboxItem,
  CheckboxLabel as StyledCheckboxLabel,
} from '../../forms/OutfitForm/OutfitForm.styles';

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
      <FormGroup>
        <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
          <legend style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '0.25rem', 
            padding: 0, 
            display: 'block' 
          }}>
            Scenarios
          </legend>
          <SeasonCheckboxes>
            {isLoading ? (
              <div>Loading scenarios...</div>
            ) : scenarios.length === 0 ? (
              <div>No scenarios available. Set them up in Scenario Settings.</div>
            ) : (
              scenarios.map(scenario => (
                <StyledCheckboxItem key={scenario.id}>
                  <input
                    type="checkbox"
                    id={`${namespace}-${scenario.id}`}
                    checked={selectedScenarios.includes(scenario.id)}
                    onChange={() => onScenarioChange(scenario.id)}
                  />
                  <StyledCheckboxLabel htmlFor={`${namespace}-${scenario.id}`}>
                    {scenario.name}
                  </StyledCheckboxLabel>
                </StyledCheckboxItem>
              ))
            )}
          </SeasonCheckboxes>
        </fieldset>
      </FormGroup>
      
      {showCustomScenario && onCustomScenarioChange && (
        <FormGroup>
          <label 
            htmlFor={`${namespace}-custom`}
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem',
              display: 'block'
            }}
          >
            Custom Scenario
          </label>
          <input
            type="text"
            id={`${namespace}-custom`}
            value={customScenario}
            onChange={(e) => onCustomScenarioChange(e.target.value)}
            placeholder="Enter custom scenario"
            style={{
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              border: '1px solid #D1D5DB',
              fontSize: '0.875rem',
              lineHeight: '1.25rem'
            }}
          />
        </FormGroup>
      )}
    </>
  );
};

export default ScenarioSelector;
