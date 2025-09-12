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
          <FormLabel htmlFor="scenarioDescription">Description (Optional)</FormLabel>
          <FormInput
            id="scenarioDescription"
            type="text"
            placeholder="e.g., Business casual dress code"
            value={newScenarioDescription}
            onChange={handleNewScenarioDescriptionChange}
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
