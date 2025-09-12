import React, { useState, useEffect } from 'react';
import { frequencyOptions, periodOptions } from '../../../data/onboardingOptions';
import { StepTitle, StepDescription } from '../../../pages/OnboardingPage.styles';
import { FaLaptop, FaHome, FaWalking, FaUsers, FaCalendarAlt, FaTrashAlt, FaPlus, FaEdit } from 'react-icons/fa';
import Button from '../../common/Button';
import AddScenarioModal from './AddScenarioModal';
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
  ScenarioDescription,
} from './ScenarioFrequencyStep.styles';

// Types
export interface Scenario {
  id: string;
  name: string;
  frequency: string;
  description?: string; // Additional context from follow-up questions
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
      let valueStr = parts[0];
      
      // Handle range values like "1-2", "2-3", etc. - use the first number
      if (valueStr.includes('-')) {
        valueStr = valueStr.split('-')[0];
      }
      
      // Ensure we have a valid number, fallback to '1' if not
      const numValue = parseInt(valueStr, 10);
      const finalValue = isNaN(numValue) ? '1' : numValue.toString();
      
      return {
        value: finalValue,
        period: parts[parts.length - 1] // Get the last part (week/month)
      };
    }
    
    let valueStr = parts[0];
    
    // Handle range values in other formats too
    if (valueStr.includes('-')) {
      valueStr = valueStr.split('-')[0];
    }
    
    // Ensure we have a valid number, fallback to '1' if not
    const numValue = parseInt(valueStr, 10);
    const finalValue = isNaN(numValue) ? '1' : numValue.toString();
    
    return {
      value: finalValue,
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
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  
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
    setEditingScenario(null);
    setShowModal(true);
  };

  const handleEditScenario = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingScenario(null);
  };

  const handleAddScenario = (scenario: Scenario) => {
    let updatedScenarios;
    if (editingScenario) {
      // Update existing scenario
      updatedScenarios = localScenarios.map(s => 
        s.id === scenario.id ? scenario : s
      );
    } else {
      // Add new scenario
      updatedScenarios = [...localScenarios, scenario];
    }
    setLocalScenarios(updatedScenarios);
    onScenariosChange(updatedScenarios);
    setShowModal(false);
    setEditingScenario(null);
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
          
          // Debug log to see scenario data
          console.log('Scenario data:', scenario.name, 'description:', scenario.description);
          
          return (
            <ScenarioItem key={scenario.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <ScenarioContent>
                  <ScenarioIcon className={className}>{icon}</ScenarioIcon>
                  <ScenarioName>{scenario.name}</ScenarioName>
                </ScenarioContent>
                
                <div style={{ display: 'flex', gap: '4px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEditScenario(scenario)}
                    style={{ background: 'none', border: 'none', color: '#666', padding: '4px', minHeight: 'auto' }}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="error"
                    size="sm"
                    onClick={() => handleDeleteScenario(scenario.id)}
                    style={{ background: 'none', border: 'none', color: '#888', padding: '4px', minHeight: 'auto' }}
                  >
                    <FaTrashAlt />
                  </Button>
                </div>
              </div>
              
              {scenario.description && (
                <ScenarioDescription>{scenario.description}</ScenarioDescription>
              )}
              
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
      
      <Button 
        fullWidth
        variant="secondary" 
        outlined
        size="lg"
        onClick={handleAddNewScenario}
      >
        <FaPlus /> Add New Scenario
      </Button>

      <AddScenarioModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={handleAddScenario}
        editingScenario={editingScenario}
      />
    </PageContainer>
  );
};

export default ScenarioFrequencyStep;
