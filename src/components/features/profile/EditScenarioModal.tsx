import React, { useState, ChangeEvent, useEffect } from 'react';
import { periodOptions } from '../../../data/onboardingOptions';
import { Modal, ModalAction } from '../../common/Modal';
import { Form, FormField, FormInput, FormSelect } from '../../common/Form';
import styled from 'styled-components';
import { ComponentScenario } from '../../../types/scenario';

// Simple styled components for frequency controls
const FrequencyControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FrequencyInput = styled(FormInput)`
  width: 80px;
  flex: none;
`;

interface EditScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scenario: ComponentScenario) => void;
  scenario: ComponentScenario | null;
}

const EditScenarioModal: React.FC<EditScenarioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  scenario
}) => {
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [frequencyValue, setFrequencyValue] = useState('1');
  const [frequencyPeriod, setFrequencyPeriod] = useState('week');

  // Populate form when editing
  useEffect(() => {
    if (scenario) {
      setScenarioName(scenario.name);
      
      // Check if description is generic template text and don't populate it
      const isGenericDescription = scenario.description?.startsWith('Settings for') && scenario.description?.endsWith('scenario');
      setScenarioDescription(!isGenericDescription ? (scenario.description || '') : '');
      
      setFrequencyValue(scenario.frequency.toString());
      setFrequencyPeriod(scenario.period);
    } else {
      // Reset to defaults
      setScenarioName('');
      setScenarioDescription('');
      setFrequencyValue('1');
      setFrequencyPeriod('week');
    }
  }, [scenario, isOpen]);

  const handleClose = () => {
    setScenarioName('');
    setScenarioDescription('');
    setFrequencyValue('1');
    setFrequencyPeriod('week');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scenarioName.trim() || !scenario) {
      return;
    }
    
    const updatedScenario: ComponentScenario = {
      ...scenario,
      name: scenarioName.trim(),
      description: scenarioDescription.trim() || `Settings for ${scenarioName.trim()} scenario`,
      frequency: parseInt(frequencyValue) || 1,
      period: frequencyPeriod
    };
    
    onSubmit(updatedScenario);
    handleClose();
  };

  const handleScenarioNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setScenarioName(e.target.value);
  };

  const handleScenarioDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setScenarioDescription(e.target.value);
  };

  const handleFrequencyValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFrequencyValue(e.target.value);
  };

  const handleFrequencyPeriodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFrequencyPeriod(e.target.value);
  };

  const handleModalSubmit = () => {
    const mockEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(mockEvent);
  };

  const actions: ModalAction[] = [
    {
      label: 'Cancel',
      onClick: handleClose,
      variant: 'secondary',
      fullWidth: true
    },
    {
      label: 'Update Scenario',
      onClick: handleModalSubmit,
      variant: 'primary',
      fullWidth: true
    }
  ];

  if (!scenario) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Scenario"
      actions={actions}
      size="md"
    >
      <Form onSubmit={handleSubmit}>
        <FormField label="Scenario Name" labelPosition="top">
          <FormInput
            id="scenarioName"
            type="text"
            placeholder="e.g., Weekend Outing"
            value={scenarioName}
            onChange={handleScenarioNameChange}
            autoFocus
            isFullWidth
          />
        </FormField>
        
        <FormField label="Description" labelPosition="top">
          <FormInput
            id="scenarioDescription"
            type="text"
            placeholder="e.g., Business casual dress code"
            value={scenarioDescription}
            onChange={handleScenarioDescriptionChange}
            isFullWidth
          />
        </FormField>
        
        <FormField label="Frequency" labelPosition="top">
          <FrequencyControls>
            <FrequencyInput 
              type="number" 
              min="1"
              max="7"
              id="frequencyValue"
              value={frequencyValue}
              onChange={handleFrequencyValueChange}
              isFullWidth
            />
            
            <FormSelect
              id="frequencyPeriod"
              value={frequencyPeriod}
              onChange={handleFrequencyPeriodChange}
              style={{ flex: 1 }}
            >
              {periodOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </FormSelect>
          </FrequencyControls>
        </FormField>
      </Form>
    </Modal>
  );
};

export default EditScenarioModal;
