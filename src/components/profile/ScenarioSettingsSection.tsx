import React, { useState, useEffect, useRef } from 'react';
import { 
  Description, 
  FormGroup,
  StyledFieldset,
  SectionWrapper,
  ContentHeader
} from '../../pages/ProfilePage.styles';
import { getScenariosForUser, createScenario, updateScenario, deleteScenario } from '../../services/scenariosService';
import { supabase } from '../../services/supabase';
import { FaPlus } from 'react-icons/fa';
import {
  ScenarioList,
  SaveButton,
  AddButton
} from './ScenarioSettingsSection.styles';
import { ComponentScenario } from '../../types/scenario';
import ScenarioItemComponent from './ScenarioItem';
import SaveConfirmationModal from './modals/SaveConfirmationModal';

function ScenarioSettingsSection(): React.ReactElement | null {
  // State for scenarios from database
  const [scenarios, setScenarios] = useState<ComponentScenario[]>([]);
  // State for scenarios that have been deleted but not yet persisted to the database
  const [deletedScenarios, setDeletedScenarios] = useState<ComponentScenario[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [showNewScenarioInput, setShowNewScenarioInput] = useState(false);
  const newScenarioInputRef = useRef<HTMLInputElement>(null);

  // Fetch scenarios from database on component mount
  useEffect(() => {
    loadScenarios();
  }, []);
  
  // Load scenarios from the database
  const loadScenarios = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }
      
      // Fetch scenarios from the dedicated scenarios table
      const dbScenarios = await getScenariosForUser(authData.user.id);
      
      // Transform database scenarios to component format
      const formattedScenarios: ComponentScenario[] = dbScenarios.map(scenario => {
        // Parse frequency string (e.g., "2 times per week")
        const frequencyParts = scenario.frequency?.split(' ') || [];
        const frequencyValue = parseInt(frequencyParts[0] || '1');
        
        // Extract the period value (week or month) from the frequency string
        let periodValue = 'week'; // Default
        if (scenario.frequency) {
          // Check for 'week' or 'month' in the string
          if (scenario.frequency.includes('week')) {
            periodValue = 'week';
          } else if (scenario.frequency.includes('month')) {
            periodValue = 'month';
          }
        }
        
        return {
          id: scenario.id,
          user_id: scenario.user_id,
          type: scenario.name,
          description: scenario.description || `Settings for ${scenario.name} scenario`,
          frequency: frequencyValue,
          period: periodValue
        };
      });
      
      setScenarios(formattedScenarios);
      setError(null);
    } catch (err) {
      console.error('Error loading scenarios:', err);
      setError('Failed to load scenarios. Please try again later.');
    } finally {
      setIsLoading(false);
    }
    return;
  };
  
  // Simulate pending changes for demo purposes

  // Show success message modal
  const showSuccessMessage = () => {
    setIsModalOpen(true);
  };
  
  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle deleting a scenario
  const handleDeleteScenario = (id: string) => {
    try {
      // Find the scenario to delete
      const scenarioToDelete = scenarios.find(s => s.id === id);
      
      if (!scenarioToDelete) {
        console.error('Scenario not found:', id);
        return;
      }
      
      // Remove the scenario from the visible list immediately
      setScenarios(scenarios.filter(s => s.id !== id));
      
      // If it's an existing scenario (not new), add it to deletedScenarios for later database deletion
      if (!scenarioToDelete.isNew) {
        // Mark it for deletion and add to deletedScenarios state
        const markedScenario = { ...scenarioToDelete, markedForDeletion: true };
        setDeletedScenarios([...deletedScenarios, markedScenario]);
      }
      // If it's a new scenario, we don't need to track it since it was never in the database
    } catch (err) {
      console.error('Error deleting scenario:', err);
      setError('Failed to delete scenario. Please try again.');
    }
  };

  // Update frequency
  const handleFrequencyChange = (id: string, frequency: number): void => {
    const updatedScenarios = scenarios.map(scenario => {
      if (scenario.id === id) {
        return { ...scenario, frequency };
      }
      return scenario;
    });
    setScenarios(updatedScenarios);
  };

  // Update period
  const handlePeriodChange = (id: string, period: string) => {
    setScenarios(prevScenarios => 
      prevScenarios.map(scenario => 
        scenario.id === id ? { ...scenario, period } : scenario
      )
    );
  };
  


  // Add new scenario
  const handleAddNewScenario = () => {
    setShowNewScenarioInput(true);
    // Focus the input after it's rendered
    setTimeout(() => {
      if (newScenarioInputRef.current) {
        newScenarioInputRef.current.focus();
      }
    }, 100);
  };

  // Handle creating a new scenario
  const handleCreateScenario = () => {
    if (newScenarioName.trim() === '') {
      return;
    }

    try {
      // Note: We don't need to get user ID here as it's handled in handleSaveScenarios
      // const user_id = supabase.auth.getUser().then(({ data }) => data.user?.id || 'temp-user-id');
      
      const scenarioType = newScenarioName.trim();
      const isTravel = scenarioType.toLowerCase().includes('travel');
      
      // Create a temporary ID for the new scenario
      const tempId = `temp-${Date.now()}`;
      
      // Create a component scenario with temporary ID
      const newScenario: ComponentScenario = {
        id: tempId,
        user_id: 'temp-user-id', // Will be updated when saved to database
        type: scenarioType,
        description: `Settings for ${scenarioType} scenario`,
        frequency: isTravel ? 1 : 1,
        period: isTravel ? 'year' : 'week',
        isNew: true // Flag to identify newly added scenarios that need to be created in the database
      };

      // Add to scenarios list (local state only)
      setScenarios([...scenarios, newScenario]);
      
      // Reset input
      setNewScenarioName('');
      setShowNewScenarioInput(false);
      // Success message is only shown when saving all scenarios, not when adding a single one
    } catch (err) {
      console.error('Error creating scenario:', err);
      setError('Failed to create scenario. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  
  // Save scenarios to database
  const handleSaveScenarios = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        throw new Error('User not authenticated');
      }
      
      // First, process deletions from the deletedScenarios state
      for (const scenario of deletedScenarios) {
        console.log('Deleting scenario from database:', scenario.id);
        await deleteScenario(scenario.id);
      }
      
      // Clear the deletedScenarios state after processing
      setDeletedScenarios([]);
      
      // Create a copy of scenarios to update with real IDs after database operations
      let updatedScenarios = [...scenarios];
      
      // Process each remaining scenario in the database
      for (let i = 0; i < scenarios.length; i++) {
        const scenario = scenarios[i];
        // Format frequency string - ensure we're using the correct period value (week or month)
        const periodValue = scenario.period === 'week' || scenario.period === 'month' ? scenario.period : 'week';
        const frequencyString = `${scenario.frequency} ${scenario.frequency === 1 ? 'time' : 'times'} per ${periodValue}`;
        
        if (scenario.isNew) {
          // This is a new scenario that needs to be created in the database
          console.log('Creating new scenario in database:', scenario.type);
          
          // Create the scenario in the database
          const newDbScenario = await createScenario({
            user_id: authData.user.id,
            name: scenario.type,
            type: scenario.period === 'year' ? 'travel' : 'regular',
            description: scenario.description,
            frequency: frequencyString
          });
          
          // Update the local scenario with the real database ID
          updatedScenarios[i] = {
            ...scenario,
            id: newDbScenario.id,
            user_id: newDbScenario.user_id,
            isNew: false // No longer new after saving
          };
        } else {
          // This is an existing scenario that needs to be updated
          console.log('Updating existing scenario in database:', scenario.id);
          
          // Update the scenario in the database
          await updateScenario(scenario.id, {
            name: scenario.type,
            description: scenario.description,
            frequency: frequencyString
          });
        }
      }
      
      // Update local state with the updated scenarios (with real IDs)
      setScenarios(updatedScenarios);
      
      showSuccessMessage();
    } catch (err) {
      console.error('Error saving scenarios:', err);
      setError('Failed to save scenarios. Please try again.');
    } finally {
      setIsLoading(false);
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

          <ScenarioList>
            {scenarios.map(scenario => (
              <ScenarioItemComponent
                key={scenario.id}
                id={scenario.id}
                type={scenario.type}
                description={scenario.description}
                frequency={scenario.frequency}
                period={scenario.period}
                onDelete={handleDeleteScenario}
                onFrequencyChange={handleFrequencyChange}
                onPeriodChange={handlePeriodChange}
              />
            ))}

            {/* Add new scenario button or input */}
            {showNewScenarioInput ? (
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={newScenarioInputRef}
                  type="text"
                  id="new-scenario-input"
                  name="newScenarioName"
                  placeholder="Enter scenario name (e.g., Office Work, Social Event)"
                  value={newScenarioName}
                  onChange={(e) => setNewScenarioName(e.target.value)}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateScenario();
                    } else if (e.key === 'Escape') {
                      setShowNewScenarioInput(false);
                      setNewScenarioName('');
                    }
                  }}
                />
                <button
                  onClick={handleCreateScenario}
                  style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#4f46e5', color: 'white', border: '1px solid #4f46e5', cursor: 'pointer' }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowNewScenarioInput(false);
                    setNewScenarioName('');
                  }}
                  style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', borderRadius: '4px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </ScenarioList>
        </StyledFieldset>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          {!showNewScenarioInput && (
            <AddButton onClick={handleAddNewScenario}>
              <FaPlus size={14} style={{ marginRight: '0.5rem' }} />
              Add New Scenario
            </AddButton>
          )}
          {error && (
            <div className="error-message" style={{ padding: '0.625rem 1rem', margin: '0.625rem 0', borderRadius: '0.375rem', fontSize: '0.875rem', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}
          
          <SaveConfirmationModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            message="Scenarios saved successfully!" 
          />
          <SaveButton onClick={handleSaveScenarios}>
            Save Scenarios
          </SaveButton>
        </div>
      </FormGroup>
    </SectionWrapper>
  );
}

export default ScenarioSettingsSection;
