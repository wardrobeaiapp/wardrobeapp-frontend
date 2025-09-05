import { useCallback } from 'react';
import { WardrobeItem, Outfit, Capsule } from '../../types';

/**
 * Hook that combines business logic from homePageData with UI state from useModalState
 * to provide tab-specific action handlers.
 */
export const useTabActions = (
  modalState: ReturnType<typeof import('./useModalState').useModalState>,
  homePageData: any // Accept homePageData as parameter instead of using the hook directly
) => {
  // Extract handlers and data from homePageData
  const {
    // Data
    items,
    // Delete confirmation
    handleDeleteItem,
    confirmDeleteItem,
    
    // Item handlers
    handleAddItem: addItemLogic,
    handleViewItem: viewItemLogic,
    handleEditItem: editItemLogic,
    
    // Outfit handlers
    handleViewOutfit: viewOutfitLogic,
    handleEditOutfit: editOutfitLogic,
    handleDeleteOutfit: deleteOutfitLogic,
    
    // Capsule handlers
    handleViewCapsule: viewCapsuleLogic,
    handleEditCapsule: editCapsuleLogic,
    handleDeleteCapsule: deleteCapsuleLogic,
  } = homePageData;
  
  // Extract modal state from parameter - only include the setters we directly use
  const {
    // Item modal setters
    setIsAddModalOpen,
    setIsEditModalOpen,
    
    // Outfit modal setters
    setIsAddOutfitModalOpen,
    setIsEditOutfitModalOpen,
    
    // Capsule modal setters
    setIsAddCapsuleModalOpen,
    setIsEditCapsuleModalOpen,
  } = modalState;
  
  // Combine data and modal logic for tab actions
  
  // Item actions
  const onAddItem = useCallback(() => {
    addItemLogic();
    setIsAddModalOpen(true);
  }, [addItemLogic, setIsAddModalOpen]);
  
  const onViewItem = useCallback((item: WardrobeItem) => {
    console.log('[useTabActions] onViewItem called:', item.id, item.name);
    // Just call the logic function which will now handle both setting the item and opening the modal
    viewItemLogic(item);
    // Modal open is now handled directly in the viewItemLogic function
  }, [viewItemLogic]);
  
  const onEditItem = useCallback((id: string) => {
    editItemLogic(id);
    setIsEditModalOpen(true);
  }, [editItemLogic, setIsEditModalOpen]);
  
  // Outfit actions
  const onAddOutfit = useCallback(() => {
    setIsAddOutfitModalOpen(true);
  }, [setIsAddOutfitModalOpen]);
  
  const onViewOutfit = useCallback((outfit: Outfit) => {
    console.log('[useTabActions] onViewOutfit called:', outfit.id, outfit.name);
    // Just call the logic function which will now handle both setting the outfit and opening the modal
    viewOutfitLogic(outfit);
    // Modal open is now handled directly in the viewOutfitLogic function
  }, [viewOutfitLogic]);
  
  const onEditOutfit = useCallback((outfit: Outfit) => {
    editOutfitLogic(outfit);
    setIsEditOutfitModalOpen(true);
  }, [editOutfitLogic, setIsEditOutfitModalOpen]);
  
  // Capsule actions
  const onAddCapsule = useCallback(() => {
    setIsAddCapsuleModalOpen(true);
  }, [setIsAddCapsuleModalOpen]);
  
  const onViewCapsule = useCallback((capsule: Capsule) => {
    console.log('[useTabActions] onViewCapsule called:', capsule.id, capsule.name);
    // Just call the logic function which will now handle both setting the capsule and opening the modal
    viewCapsuleLogic(capsule);
    // Modal open is now handled directly in the viewCapsuleLogic function
  }, [viewCapsuleLogic]);
  
  const onEditCapsule = useCallback((capsule: Capsule) => {
    editCapsuleLogic(capsule);
    setIsEditCapsuleModalOpen(true);
  }, [editCapsuleLogic, setIsEditCapsuleModalOpen]);
  
  // Create adapter for onDeleteItem to match expected signature
  const onDeleteItem = useCallback((id: string) => {
    // Call the original handler with items array and id
    handleDeleteItem(items, id);
  }, [handleDeleteItem, items]);

  return {
    // Item actions
    onAddItem,
    onViewItem,
    onEditItem,
    onDeleteItem,
    confirmDeleteItem,
    
    // Outfit actions
    onAddOutfit,
    onViewOutfit,
    onEditOutfit,
    onDeleteOutfit: deleteOutfitLogic,
    
    // Capsule actions
    onAddCapsule,
    onViewCapsule,
    onEditCapsule,
    onDeleteCapsule: deleteCapsuleLogic,
  };
};
