import React, { useState, ChangeEvent } from 'react';
import { periodOptions } from '../../../data/onboardingOptions';
import { Modal, ModalAction } from '../../common/Modal';
import { Form, FormField, FormInput, FormSelect } from '../../common/Form';
import styled from 'styled-components';
import { getFrequencyLimits, validateFrequency } from '../../../utils/frequencyValidation';

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

export interface Scenario {
  id: string;
  name: string;
  frequency: string;
  description?: string;
}

interface AddScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scenario: Scenario) => void;
  editingScenario?: Scenario | null; // For edit mode
}

const AddScenarioModal: React.FC<AddScenarioModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingScenario
}) => {
  const [newScenarioName, setNewScenarioName] = useState('');
  const [newScenarioDescription, setNewScenarioDescription] = useState('');
  const [newFrequencyValue, setNewFrequencyValue] = useState('3');
  const [newFrequencyPeriod, setNewFrequencyPeriod] = useState('week');

  // Populate form when editing
  React.useEffect(() => {
    if (editingScenario) {
      setNewScenarioName(editingScenario.name);
      setNewScenarioDescription(editingScenario.description || '');
      
      // Parse frequency
      const parts = editingScenario.frequency.split(' ');
      if (parts.length >= 2) {
        setNewFrequencyValue(parts[0]);
        setNewFrequencyPeriod(parts[parts.length - 1]);
      }
    } else {
      // Reset to defaults when not editing
      setNewScenarioName('');
      setNewScenarioDescription('');
      setNewFrequencyValue('3');
      setNewFrequencyPeriod('week');
    }
  }, [editingScenario, isOpen]);

  const handleClose = () => {
    setNewScenarioName('');
    setNewScenarioDescription('');
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
      id: editingScenario?.id || `scenario-${Date.now()}`,
      name: newScenarioName.trim(),
      frequency: frequencyText,
      description: newScenarioDescription.trim() || undefined
    };
    
    onSubmit(newScenario);
    
    // Reset form and close modal
    setNewScenarioName('');
    setNewScenarioDescription('');
    setNewFrequencyValue('3');
    setNewFrequencyPeriod('week');
  };

  const handleNewScenarioNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewScenarioName(e.target.value);
  };

  const handleNewScenarioDescriptionChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewScenarioDescription(e.target.value);
  };

  const handleNewFrequencyValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value)) {
      const validatedValue = validateFrequency(value, newFrequencyPeriod);
      setNewFrequencyValue(validatedValue.toString());
    }
  };

  const handleNewFrequencyPeriodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newPeriod = e.target.value;
    setNewFrequencyPeriod(newPeriod);
    // Validate current frequency against new period limits
    const currentValue = Number(newFrequencyValue);
    if (!isNaN(currentValue)) {
      const validatedValue = validateFrequency(currentValue, newPeriod);
      if (validatedValue !== currentValue) {
        setNewFrequencyValue(validatedValue.toString());
      }
    }
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
      label: editingScenario ? 'Update Scenario' : 'Add Scenario',
      onClick: handleModalSubmit,
      variant: 'primary',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingScenario ? 'Edit Scenario' : 'Add New Scenario'}
      actions={actions}
      size="md"
    >
      <Form onSubmit={handleSubmit}>
        <FormField label="Scenario Name" labelPosition="top">
          <FormInput
            id="scenarioName"
            type="text"
            placeholder="e.g., Weekend Outing"
            value={newScenarioName}
            onChange={handleNewScenarioNameChange}
            autoFocus
            isFullWidth
          />
        </FormField>
        
        <FormField label="Description (Optional)" labelPosition="top">
          <FormInput
            id="scenarioDescription"
            type="text"
            placeholder="e.g., Business casual dress code"
            value={newScenarioDescription}
            onChange={handleNewScenarioDescriptionChange}
            isFullWidth
          />
        </FormField>
        
        <FormField label="Frequency" labelPosition="top">
          <FrequencyControls>
            <FrequencyInput 
              type="number" 
              min="1"
              max={getFrequencyLimits(newFrequencyPeriod).max}
              id="frequencyValue"
              value={newFrequencyValue}
              onChange={handleNewFrequencyValueChange}
              isFullWidth
            />
            
            <FormSelect
              id="frequencyPeriod"
              value={newFrequencyPeriod}
              onChange={handleNewFrequencyPeriodChange}
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

export default AddScenarioModal;
