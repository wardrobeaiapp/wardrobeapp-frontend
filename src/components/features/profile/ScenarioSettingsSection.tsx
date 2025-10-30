import React, { useEffect, useState } from 'react';
import { 
  Description, 
  FormGroup,
  StyledFieldset,
  SectionWrapper,
  ContentHeader
} from '../../../pages/ProfilePage.styles';
import { FaPlus } from 'react-icons/fa';
import {
  ScenarioList,
  SaveButton,
  AddButton
} from './ScenarioSettingsSection.styles';
import ScenarioItemComponent from './ScenarioItem';
import SaveConfirmationModal from './modals/SaveConfirmationModal';
import EditScenarioModal from './EditScenarioModal';
import NewScenarioInput from './components/NewScenarioInput';
import { useScenarioManagement } from './hooks/useScenarioManagement';
import { useNewScenarioForm } from './hooks/useNewScenarioForm';
import { ComponentScenario } from '../../../types/scenario';

function ScenarioSettingsSection(): React.ReactElement | null {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ComponentScenario | null>(null);

  // Custom hooks for scenario management and form handling
  const {
    scenarios,
    isLoading,
    error,
    loadScenarios,
    addScenario,
    updateScenarioLocal,
    deleteScenarioLocal,
    saveAllScenarios,
    updateFrequency,
    updatePeriod
  } = useScenarioManagement();

  const {
    newScenarioName,
    setNewScenarioName,
    showNewScenarioInput,
    newScenarioInputRef,
    handleAddNewScenario,
    handleCreateScenario,
    handleCancelNewScenario
  } = useNewScenarioForm();

  // Load scenarios on component mount
  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  // Modal management
  const showSuccessMessage = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Scenario editing
  const handleEditScenario = (id: string) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
      setEditingScenario(scenario);
      setShowEditModal(true);
    }
  };

  const handleUpdateScenario = (updatedScenario: ComponentScenario) => {
    updateScenarioLocal(updatedScenario);
    setShowEditModal(false);
    setEditingScenario(null);
  };

  // New scenario creation
  const handleSubmitNewScenario = () => {
    const newScenario = handleCreateScenario();
    if (newScenario) {
      addScenario(newScenario);
    }
  };

  // Save all scenarios
  const handleSaveScenarios = async () => {
    try {
      await saveAllScenarios();
      showSuccessMessage();
    } catch (err) {
      // Error is already handled in the hook
    }
  };

  return (
    <SectionWrapper>
      <ContentHeader>Scenario Settings</ContentHeader>
      <FormGroup>
        <StyledFieldset>
          <Description>
            Configure the scenarios that influence your wardrobe recommendations.
          </Description>

          {isLoading && <p>Loading scenarios...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <ScenarioList>
            {scenarios.map(scenario => (
              <ScenarioItemComponent
                key={scenario.id}
                id={scenario.id}
                type={scenario.name}
                description={scenario.description}
                frequency={scenario.frequency}
                period={scenario.period}
                onDelete={deleteScenarioLocal}
                onFrequencyChange={updateFrequency}
                onPeriodChange={updatePeriod}
                onEdit={handleEditScenario}
              />
            ))}

            {/* New scenario input inside the list */}
            {showNewScenarioInput && (
              <NewScenarioInput
                value={newScenarioName}
                onChange={setNewScenarioName}
                onSubmit={handleSubmitNewScenario}
                onCancel={handleCancelNewScenario}
                inputRef={newScenarioInputRef}
              />
            )}
          </ScenarioList>

          {/* Buttons in one row */}
          <div style={{ 
            marginTop: '2rem', 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center' 
          }}>
            {!showNewScenarioInput && (
              <AddButton onClick={handleAddNewScenario}>
                <FaPlus size={12} style={{ marginRight: '0.5rem' }} />
                Add New Scenario
              </AddButton>
            )}
            
            <SaveButton onClick={handleSaveScenarios} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Scenarios'}
            </SaveButton>
          </div>
        </StyledFieldset>
      </FormGroup>

      {/* Save confirmation modal */}
      <SaveConfirmationModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Edit scenario modal */}
      <EditScenarioModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingScenario(null);
        }}
        onSubmit={handleUpdateScenario}
        scenario={editingScenario}
      />
    </SectionWrapper>
  );
}

export default ScenarioSettingsSection;
