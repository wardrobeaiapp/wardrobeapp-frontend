import React, { useState, ChangeEvent } from 'react';
import { periodOptions } from '../../../data/onboardingOptions';
import { Modal, ModalAction } from '../../common/Modal';
import {
  ModalForm,
  FormGroup,
  FormLabel,
  FormInput,
  ModalFrequencyControls,
  FrequencyInput,
  FrequencySelect
} from './ScenarioFrequencyStep.styles';

export interface Scenario {
  id: string;
  name: string;
  frequency: string;
}

interface AddScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scenario: Scenario) => void;
}

const AddScenarioModal: React.FC<AddScenarioModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newFrequencyValue, setNewFrequencyValue] = useState('3');
  const [newFrequencyPeriod, setNewFrequencyPeriod] = useState('week');

  const handleClose = () => {
    setNewScenarioName('');
    setNewFrequencyValue('3');
    setNewFrequencyPeriod('week');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
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
    
    onSubmit(newScenario);
    
    // Reset form and close modal
    setNewScenarioName('');
    setNewFrequencyValue('3');
    setNewFrequencyPeriod('week');
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
      label: 'Add Scenario',
      onClick: handleModalSubmit,
      variant: 'primary',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Scenario"
      actions={actions}
      size="md"
    >
      <ModalForm onSubmit={handleSubmit}>
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
      </ModalForm>
    </Modal>
  );
};

export default AddScenarioModal;
