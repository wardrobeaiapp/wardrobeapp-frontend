import { useState, useCallback } from 'react';
import { useCapsules } from '../wardrobe/capsules/useCapsules';
import { Capsule } from '../../types';
import { CapsuleFormData } from '../../components/features/wardrobe/forms/CapsuleForm';

/**
 * Hook for managing capsule operations (add, update, delete)
 */
export const useCapsuleManagement = (modalState?: ReturnType<typeof import('./useModalState').useModalState>) => {
  // Use capsules hook for better capsule-items relationship management
  const {
    addCapsule,
    updateCapsuleById,
    deleteCapsuleById
  } = useCapsules();
  
  // Local state for capsule management
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | undefined>(undefined);
  
  /**
   * View a capsule by setting it as the selected capsule
   */
  const handleViewCapsule = useCallback((capsule: Capsule) => {
    console.log('[useCapsuleManagement] handleViewCapsule called:', capsule.id, capsule.name);
    setSelectedCapsule(capsule);
    
    // Open the modal directly if modalState is provided
    if (modalState?.setIsViewCapsuleModalOpen) {
      console.log('[useCapsuleManagement] Opening view modal via modalState');
      modalState.setIsViewCapsuleModalOpen(true);
    }
  }, [modalState]);
  
  /**
   * Edit a capsule
   */
  const handleEditCapsule = useCallback((capsule: Capsule) => {
    setSelectedCapsule(capsule);
  }, []);
  
  /**
   * Delete a capsule by ID
   */
  const handleDeleteCapsule = useCallback((id: string) => {
    deleteCapsuleById(id);
    setSelectedCapsule(undefined);
  }, [deleteCapsuleById]);
  
  /**
   * Handle edit capsule submit
   */
  const handleEditCapsuleSubmit = useCallback(async (id: string, data: CapsuleFormData) => {
    const capsuleData = {
      name: data.name,
      scenario: data.scenario,
      seasons: data.seasons,
      selectedItems: data.selectedItems,
      mainItemId: data.mainItemId || ''
    };
    
    await updateCapsuleById(id, capsuleData);
  }, [updateCapsuleById]);
  
  /**
   * Add a new capsule
   */
  const handleAddCapsule = useCallback(async (id: string, data: CapsuleFormData) => {
    try {
      // For new capsules, we ignore the id parameter (it will be 'new')
      const capsuleData = {
        name: data.name,
        style: '', // Default empty style since it's required by the Capsule type
        scenario: data.scenarios?.[0] || '', // Use first scenario or empty string
        scenarios: data.scenarios || [],
        seasons: data.seasons,
        selectedItems: data.selectedItems || [],
        mainItemId: data.mainItemId || ''
      };
      
      // Add the capsule and wait for it to complete
      await addCapsule(capsuleData);
    } catch (error) {
      console.error('Error adding capsule:', error);
      throw error; // Re-throw to handle in the component
    }
  }, [addCapsule]);
  
  return {
    // State
    selectedCapsule,
    setSelectedCapsule,
    
    // Handlers
    handleViewCapsule,
    handleEditCapsule,
    handleDeleteCapsule,
    handleEditCapsuleSubmit,
    handleAddCapsule,
  };
};
