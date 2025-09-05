import { useState, useCallback, useMemo } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { Outfit, Capsule, WardrobeItem } from '../../types';
import { useWardrobe, OutfitExtended } from '../../context/WardrobeContext';
import { useCapsules } from '../wardrobe/capsules/useCapsules';
import { CapsuleFormData } from '../../components/features/wardrobe/forms/CapsuleForm';
import { useModalState } from './useModalState';
import { useItemManagement } from './useItemManagement';

// No props needed for this hook
export const useHomePageData = () => {
  const { user } = useSupabaseAuth();
  
  const { 
    items, 
    outfits, 
    addItem, 
    updateItem, 
    deleteItem, 
    addOutfit, 
    updateOutfit, 
    deleteOutfit,
  } = useWardrobe();
    
  // Use our new useCapsules hook for better capsule-items relationship management
  const {
    // error: capsulesError,
    addCapsule,
    updateCapsuleById,
    deleteCapsuleById
  } = useCapsules();
  
  // Modal states and handlers
  const {
    // Modal states
    isAddModalOpen,
    isEditModalOpen,
    isAddOutfitModalOpen,
    isEditOutfitModalOpen,
    isViewOutfitModalOpen,
    isViewCapsuleModalOpen,
    isEditCapsuleModalOpen,
    isAddCapsuleModalOpen,
    isViewItemModalOpen,
    
    // Modal state setters
    setIsAddModalOpen,
    setIsEditModalOpen,
    setIsAddOutfitModalOpen,
    setIsEditOutfitModalOpen,
    setIsViewOutfitModalOpen,
    setIsViewCapsuleModalOpen,
    setIsEditCapsuleModalOpen,
    setIsAddCapsuleModalOpen,
    setIsViewItemModalOpen,
    
    // Modal handlers
    openEditOutfitModal,
    openViewOutfitModal,
    openViewCapsuleModal,
    openEditCapsuleModal,
    
    // Close handlers
    closeViewOutfitModal,
    closeViewCapsuleModal,
  } = useModalState();
  
  // Item management
  const {
    // State
    currentItemId,
    selectedItem,
    isDeleteConfirmModalOpen,
    setIsDeleteConfirmModalOpen,
    itemToDelete,
    
    // Handlers
    handleAddItem,
    handleViewItem,
    handleEditItem,
    handleDeleteItem: handleDeleteItemInternal,
    confirmDeleteItem,
    handleSubmitAdd,
    handleSubmitEdit,
  } = useItemManagement({
    addItem,
    updateItem,
    deleteItem,
  });
  
  // Outfit and capsule states
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | undefined>(undefined);
  const [currentOutfitId, setCurrentOutfitId] = useState<string | null>(null);
  
  // Derived states
  const currentOutfit = useMemo(() => {
    if (!currentOutfitId) return undefined;
    return outfits.find(outfit => outfit.id === currentOutfitId) || undefined;
  }, [outfits, currentOutfitId]);
  
  const currentItem = useMemo(() => 
    currentItemId ? items.find(item => item.id === currentItemId) : undefined
  , [items, currentItemId]);
  
  // Handle item deletion with items context
  const handleDeleteItem = useCallback((id: string) => {
    handleDeleteItemInternal(items, id);
  }, [handleDeleteItemInternal, items]);
  
  // Additional modal state management
  const handleViewItemWithModal = useCallback((item: WardrobeItem) => {
    handleViewItem(item);
    setIsViewItemModalOpen(true);
  }, [handleViewItem, setIsViewItemModalOpen]);
  
  const handleEditItemWithModal = useCallback((id: string) => {
    if (isViewItemModalOpen) {
      setIsViewItemModalOpen(false);
    }
    handleEditItem(id);
    setIsEditModalOpen(true);
  }, [handleEditItem, isViewItemModalOpen, setIsViewItemModalOpen, setIsEditModalOpen]);
  
  const handleViewOutfit = useCallback((outfit: Outfit) => {
    setSelectedOutfit(outfit);
    openViewOutfitModal();
  }, [openViewOutfitModal]);
  
  const handleEditOutfit = useCallback((outfit: Outfit) => {
    setCurrentOutfitId(outfit.id);
    closeViewOutfitModal();
    openEditOutfitModal();
  }, [closeViewOutfitModal, openEditOutfitModal]);
  
  const handleDeleteOutfit = useCallback((id: string) => {
    deleteOutfit(id);
    closeViewOutfitModal();
    setSelectedOutfit(null);
  }, [deleteOutfit, closeViewOutfitModal, setSelectedOutfit]);
  
  const handleViewCapsule = useCallback((capsule: Capsule) => {
    setSelectedCapsule(capsule);
    openViewCapsuleModal();
  }, [openViewCapsuleModal]);
  
  const handleEditCapsule = useCallback((capsule: Capsule) => {
    setSelectedCapsule(capsule);
    closeViewCapsuleModal();
    openEditCapsuleModal();
  }, [closeViewCapsuleModal, openEditCapsuleModal, setSelectedCapsule]);
  
  const handleEditCapsuleSubmit = useCallback(async (id: string, data: CapsuleFormData) => {
    const capsuleData = {
      name: data.name,
      scenario: data.scenario,
      seasons: data.seasons,
      selectedItems: data.selectedItems,
      mainItemId: data.mainItemId || ''
    };
    
    await updateCapsuleById(id, capsuleData);
    setIsEditCapsuleModalOpen(false);
  }, [updateCapsuleById, setIsEditCapsuleModalOpen]);
  
  const handleDeleteCapsule = useCallback((id: string) => {
    deleteCapsuleById(id);
    setIsViewCapsuleModalOpen(false);
    setSelectedCapsule(undefined);
  }, [deleteCapsuleById, setIsViewCapsuleModalOpen, setSelectedCapsule]);
  
  // Wrappers for submit handlers to handle modal state
  const handleSubmitAddWithModal = useCallback(async (item: Omit<WardrobeItem, 'id' | 'dateCreated'>, file?: File) => {
    try {
      await handleSubmitAdd(item, file);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error in handleSubmitAddWithModal:', error);
      throw error;
    }
  }, [handleSubmitAdd, setIsAddModalOpen]);
  
  const handleSubmitEditWithModal = useCallback(async (updates: Partial<WardrobeItem>) => {
    try {
      await handleSubmitEdit(updates);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error in handleSubmitEditWithModal:', error);
      throw error;
    }
  }, [handleSubmitEdit, setIsEditModalOpen]);
  
  const handleAddOutfit = useCallback(async (outfitData: Omit<Outfit, 'id' | 'dateCreated' | 'scenarioNames' | 'scenarios' | 'items' | 'userId'> & { items: string[] }, scenarioNames?: string[]) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }
    
    try {
      // Create the new outfit with all required fields for OutfitExtended
      const newOutfit = {
        ...outfitData,
        id: '', // Will be set by the database
        userId: user.id,
        items: outfitData.items,
        season: outfitData.season || [],
        dateCreated: new Date().toISOString()
      } as Omit<OutfitExtended, 'id' | 'dateCreated'>;
      
      await addOutfit(newOutfit);
      setIsAddOutfitModalOpen(false);
    } catch (error) {
      console.error('Failed to add outfit:', error);
      // Consider adding error state to show in UI
    }
  }, [addOutfit, user, setIsAddOutfitModalOpen]);
  
  const handleEditOutfitSubmit = useCallback(async (outfitData: Partial<Outfit> & { id?: string }) => {
    if (!currentOutfitId) {
      console.error('No outfit selected for editing');
      return;
    }
    
    try {
      // Create a safe updates object with only the fields we want to update
      const { id, dateCreated, scenarioNames, ...updates } = outfitData;
      
      // Ensure required fields are not accidentally removed
      const safeUpdates: Partial<Outfit> = {
        ...updates,
        items: updates.items || [],
        season: updates.season || [],
      };
      
      await updateOutfit(currentOutfitId, safeUpdates);
      setIsEditOutfitModalOpen(false);
      setCurrentOutfitId(null);
    } catch (error) {
      console.error('Failed to update outfit:', error);
      // Consider adding error state to show in UI
    }
  }, [currentOutfitId, updateOutfit, setIsEditOutfitModalOpen, setCurrentOutfitId]);
  
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
      
      // Close the modal after successful addition
      setIsAddCapsuleModalOpen(false);
      
      // No need to dispatch refreshCapsules event here
      // The addCapsule function already dispatches this event
      // Dispatching it twice can cause a race condition where the second fetch
      // happens before the capsule-items relationships are fully established
    } catch (error) {
      console.error('Error adding capsule:', error);
      throw error; // Re-throw to handle in the component
    }
  }, [addCapsule, setIsAddCapsuleModalOpen]);
  
  return {    
    // Status filter is now handled in HomePage component
    
    isDeleteConfirmModalOpen,
    setIsDeleteConfirmModalOpen,
    itemToDelete,
    
    // Modal states
    isAddModalOpen,
    setIsAddModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isAddOutfitModalOpen,
    setIsAddOutfitModalOpen,
    isEditOutfitModalOpen,
    setIsEditOutfitModalOpen,
    isViewOutfitModalOpen,
    setIsViewOutfitModalOpen,
    isViewCapsuleModalOpen,
    setIsViewCapsuleModalOpen,
    isEditCapsuleModalOpen,
    setIsEditCapsuleModalOpen,
    isAddCapsuleModalOpen,
    setIsAddCapsuleModalOpen,
    isViewItemModalOpen,
    setIsViewItemModalOpen,
    
    // Selected items
    selectedOutfit,
    setSelectedOutfit,
    selectedCapsule,
    setSelectedCapsule,
    currentOutfit,
    currentItem,
    selectedItem,
    setCurrentOutfitId,
    
    // Event handlers
    handleAddItem: () => {
      handleAddItem();
      setIsAddModalOpen(true);
    },
    handleViewItem: handleViewItemWithModal,
    handleEditItem: handleEditItemWithModal,
    handleDeleteItem,
    confirmDeleteItem,
    handleViewOutfit,
    handleEditOutfit,
    handleDeleteOutfit,
    handleViewCapsule,
    handleEditCapsule,
    handleEditCapsuleSubmit,
    handleDeleteCapsule,
    handleSubmitAdd: handleSubmitAddWithModal,
    handleSubmitEdit: handleSubmitEditWithModal,
    handleAddOutfit,
    handleEditOutfitSubmit,
    handleAddCapsule,
  };
};
