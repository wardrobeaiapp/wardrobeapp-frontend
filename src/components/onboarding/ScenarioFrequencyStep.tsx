import React, { useState, useEffect, ChangeEvent } from 'react';
import { frequencyOptions, periodOptions } from '../../data/onboardingOptions';
import { StepTitle, StepDescription } from '../../pages/OnboardingPage.styles';
import { FaLaptop, FaHome, FaWalking, FaUsers, FaCalendarAlt, FaTrashAlt, FaPlus } from 'react-icons/fa';
import {
  PageContainer,
  ScenarioList,
  ScenarioItem,
  ScenarioIcon,
  ScenarioContent,
  ScenarioName,
  FrequencyControls,
  FrequencyInput,
  FrequencySelect,
  DeleteButton,
  AddScenarioButton,
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalForm,
  FormGroup,
  FormLabel,
  FormInput,
  ButtonGroup,
  CancelButton,
  SaveButton,
  ModalFrequencyControls
} from './ScenarioFrequencyStep.styles';

// Types
export interface Scenario {
  id: string;
  name: string;
  frequency: string;
}

interface ScenarioFrequencyStepProps {
  scenarios: Scenario[];
  onScenariosChange: (scenarios: Scenario[]) => void;
  onNext: () => void;
  onBack: () => void;
}

// Helper function to get icon based on scenario name
const getScenarioIcon = (scenarioName: string): { icon: React.ReactNode; className: string } => {
  const nameLower = scenarioName.toLowerCase();
  
  if (nameLower.includes('remote') || nameLower.includes('work') || nameLower.includes('office')) {
    return { icon: <FaLaptop />, className: 'computer' };
  } else if (nameLower.includes('home') || nameLower.includes('staying')) {
    return { icon: <FaHome />, className: 'home' };
  } else if (nameLower.includes('outdoor') || nameLower.includes('activity')) {
    return { icon: <FaWalking />, className: 'outdoor' };
  } else if (nameLower.includes('social') || nameLower.includes('outing')) {
    return { icon: <FaUsers />, className: 'social' };
  }
  
  return { icon: <FaCalendarAlt />, className: 'computer' }; // Default
};

// Parse frequency string into number and period
const parseFrequency = (frequency: string): { value: string; period: string } => {
  // Handle special case for frequency options from dropdown
  if (frequencyOptions.some(option => option.id === frequency)) {
    return { value: '1', period: frequency };
  }
  
  // Handle numeric frequency with period
  const parts = frequency.split(' ');
  if (parts.length >= 2) {
    // Check for 'times per week/month' format
    if (parts.includes('times') && parts.includes('per')) {
      return {
        value: parts[0],
        period: parts[parts.length - 1] // Get the last part (week/month)
      };
    }
    return {
      value: parts[0],
      period: parts.slice(1).join(' ')
    };
  }
  return { value: '1', period: 'week' };
};

const ScenarioFrequencyStep: React.FC<ScenarioFrequencyStepProps> = ({
  scenarios,
  onScenariosChange,
}) => {
  const [localScenarios, setLocalScenarios] = useState<Scenario[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newFrequencyValue, setNewFrequencyValue] = useState('3');
  const [newFrequencyPeriod, setNewFrequencyPeriod] = useState('week');
  
  useEffect(() => {
    setLocalScenarios(scenarios);
  }, [scenarios]);

  const handleFrequencyValueChange = (id: string, value: string) => {
    const updatedScenarios = localScenarios.map(scenario => {
      if (scenario.id === id) {
        const { period } = parseFrequency(scenario.frequency);
        return { ...scenario, frequency: `${value} ${period}` };
      }
      return scenario;
    });
    setLocalScenarios(updatedScenarios);
    onScenariosChange(updatedScenarios);
  };

  const handleFrequencyPeriodChange = (id: string, period: string) => {
    const updatedScenarios = localScenarios.map(scenario => {
      if (scenario.id === id) {
        const { value } = parseFrequency(scenario.frequency);
        // Use the period ID directly from periodOptions
        return { ...scenario, frequency: `${value} ${period}` };
      }
      return scenario;
    });
    setLocalScenarios(updatedScenarios);
    onScenariosChange(updatedScenarios);
  };

  const handleDeleteScenario = (id: string) => {
    const updatedScenarios = localScenarios.filter(scenario => scenario.id !== id);
    setLocalScenarios(updatedScenarios);
    onScenariosChange(updatedScenarios);
  };

  const handleAddNewScenario = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewScenarioName('');
    setNewFrequencyValue('3');
    setNewFrequencyPeriod('week');
  };

  const handleSubmitNewScenario = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newScenarioName.trim()) {
      return; // Don't add empty scenarios
    }
    
    // Format the frequency string based on the period option
    const frequencyText = `${newFrequencyValue} ${newFrequencyPeriod}`;
    
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: newScenarioName.trim(),
      frequency: frequencyText
    };
    
    const updatedScenarios = [...localScenarios, newScenario];
    setLocalScenarios(updatedScenarios);
    onScenariosChange(updatedScenarios);
    
    // Reset form and close modal
    setNewScenarioName('');
    setNewFrequencyValue('3');
    setNewFrequencyPeriod('week');
    setShowModal(false);
  };

  const handleNewScenarioNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewScenarioName(e.target.value);
  };

  const handleNewFrequencyValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewFrequencyValue(e.target.value);
  };

  const handleNewFrequencyPeriodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setNewFrequencyPeriod(e.target.value);
  };

  return (
    <PageContainer>
      <StepTitle>Scenario Settings</StepTitle>
      <StepDescription>
        Manage your lifestyle scenarios and how frequently you engage in them.
        These settings help us recommend appropriate outfits and capsules for your
        lifestyle.
      </StepDescription>

      <ScenarioList>
        {localScenarios.map(scenario => {
          const { icon, className } = getScenarioIcon(scenario.name);
          const { value, period } = parseFrequency(scenario.frequency);
          
          return (
            <ScenarioItem key={scenario.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <ScenarioContent>
                  <ScenarioIcon className={className}>{icon}</ScenarioIcon>
                  <ScenarioName>{scenario.name}</ScenarioName>
                </ScenarioContent>
                
                <DeleteButton onClick={() => handleDeleteScenario(scenario.id)}>
                  <FaTrashAlt />
                </DeleteButton>
              </div>
              
              <FrequencyControls>
                {scenario.name === 'Travel' ? (
                  // Special case for Travel scenario - use the same frequency selector as in LeisureActivitiesStep
                  <FrequencySelect
                    value={scenario.frequency}
                    onChange={(e) => {
                      // Update the entire frequency string directly
                      const updatedScenarios = localScenarios.map(s => 
                        s.id === scenario.id ? { ...s, frequency: e.target.value } : s
                      );
                      setLocalScenarios(updatedScenarios);
                    }}
                    style={{ width: '100%' }} // Full width for this select
                  >
                    {/* Use the exact frequency options from frequencyOptions */}
                    {frequencyOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </FrequencySelect>
                ) : (
                  // Standard frequency controls for all other scenarios
                  <>
                    <FrequencyInput 
                      type="number" 
                      min="1"
                      value={value}
                      onChange={(e) => handleFrequencyValueChange(scenario.id, e.target.value)}
                    />
                    
                    <FrequencySelect
                      id={`period-${scenario.id}`}
                      name={`period-${scenario.id}`}
                      value={period || 'week'}
                      onChange={(e) => handleFrequencyPeriodChange(scenario.id, e.target.value)}
                      aria-label={`Period for ${scenario.name}`}
                    >
                      {periodOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </FrequencySelect>
                  </>
                )}
              </FrequencyControls>
            </ScenarioItem>
          );
        })}
      </ScenarioList>
      
      <AddScenarioButton onClick={handleAddNewScenario}>
        <FaPlus style={{ marginRight: '10px' }} /> Add New Scenario
      </AddScenarioButton>

      {showModal && (
        <ModalOverlay>
          <ModalContent>
            <ModalTitle>Add New Scenario</ModalTitle>
            <ModalForm onSubmit={handleSubmitNewScenario}>
              <FormGroup>
                <FormLabel htmlFor="scenarioName">Scenario Name</FormLabel>
                <FormInput
                  id="scenarioName"
                  type="text"
                  placeholder="e.g., Weekend Outing"
                  value={newScenarioName}
                  onChange={handleNewScenarioNameChange}
                  autoFocus
                />
              </FormGroup>
              
              <FormGroup>
                <FormLabel htmlFor="scenarioFrequency">Frequency</FormLabel>
                <ModalFrequencyControls>
                  <FrequencyInput 
                    type="number" 
                    min="1"
                    id="frequencyValue"
                    value={newFrequencyValue}
                    onChange={handleNewFrequencyValueChange}
                    style={{ width: '80px' }}
                  />
                  
                  <FrequencySelect
                    id="frequencyPeriod"
                    value={newFrequencyPeriod}
                    onChange={handleNewFrequencyPeriodChange}
                    style={{ flex: 1 }}
                  >
                    {periodOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </FrequencySelect>
                </ModalFrequencyControls>
              </FormGroup>
              
              <ButtonGroup>
                <CancelButton type="button" onClick={handleCloseModal}>Cancel</CancelButton>
                <SaveButton type="submit">Add Scenario</SaveButton>
              </ButtonGroup>
            </ModalForm>
          </ModalContent>
        </ModalOverlay>
      )}
    </PageContainer>
  );
};

export default ScenarioFrequencyStep;
