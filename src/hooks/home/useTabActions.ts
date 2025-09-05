import { useCallback } from 'react';
import { useHomePageData } from './useHomePageData';
import { useModalState } from './useModalState';
import { WardrobeItem, Outfit, Capsule } from '../../types';

/**
 * Hook that combines business logic from useHomePageData with UI state from useModalState
 * to provide tab-specific action handlers.
 */
export const useTabActions = () => {
  // Get data handlers and data from useHomePageData
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
  } = useHomePageData();
  
  // Get modal state management from useModalState
  const {
    // Item modal setters
    setIsAddModalOpen,
    setIsEditModalOpen,
    setIsViewItemModalOpen,
    
    // Outfit modal setters
    setIsAddOutfitModalOpen,
    setIsEditOutfitModalOpen,
    setIsViewOutfitModalOpen,
    
    // Capsule modal setters
    setIsAddCapsuleModalOpen,
    setIsEditCapsuleModalOpen,
    setIsViewCapsuleModalOpen,
  } = useModalState();
  
  // Combine data and modal logic for tab actions
  
  // Item actions
  const onAddItem = useCallback(() => {
    addItemLogic();
    setIsAddModalOpen(true);
  }, [addItemLogic, setIsAddModalOpen]);
  
  const onViewItem = useCallback((item: WardrobeItem) => {
    viewItemLogic(item);
    setIsViewItemModalOpen(true);
  }, [viewItemLogic, setIsViewItemModalOpen]);
  
  const onEditItem = useCallback((id: string) => {
    editItemLogic(id);
    setIsEditModalOpen(true);
  }, [editItemLogic, setIsEditModalOpen]);
  
  // Outfit actions
  const onAddOutfit = useCallback(() => {
    setIsAddOutfitModalOpen(true);
  }, [setIsAddOutfitModalOpen]);
  
  const onViewOutfit = useCallback((outfit: Outfit) => {
    viewOutfitLogic(outfit);
    setIsViewOutfitModalOpen(true);
  }, [viewOutfitLogic, setIsViewOutfitModalOpen]);
  
  const onEditOutfit = useCallback((outfit: Outfit) => {
    editOutfitLogic(outfit);
    setIsEditOutfitModalOpen(true);
  }, [editOutfitLogic, setIsEditOutfitModalOpen]);
  
  // Capsule actions
  const onAddCapsule = useCallback(() => {
    setIsAddCapsuleModalOpen(true);
  }, [setIsAddCapsuleModalOpen]);
  
  const onViewCapsule = useCallback((capsule: Capsule) => {
    viewCapsuleLogic(capsule);
    setIsViewCapsuleModalOpen(true);
  }, [viewCapsuleLogic, setIsViewCapsuleModalOpen]);
  
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
