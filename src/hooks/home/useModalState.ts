import { useState, useCallback } from 'react';

export const useModalState = () => {
  // Modal visibility states with debug logging
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddOutfitModalOpen, setIsAddOutfitModalOpen] = useState(false);
  const [isEditOutfitModalOpen, setIsEditOutfitModalOpen] = useState(false);
  const [isViewOutfitModalOpen, setIsViewOutfitModalOpen] = useState(false);
  const [isViewCapsuleModalOpen, setIsViewCapsuleModalOpen] = useState(false);
  const [isEditCapsuleModalOpen, setIsEditCapsuleModalOpen] = useState(false);
  const [isGenerateWithAIModalOpen, setIsGenerateWithAIModalOpen] = useState(false);
  const [isGenerateCapsuleWithAIModalOpen, setIsGenerateCapsuleWithAIModalOpen] = useState(false);
  const [isAddCapsuleModalOpen, setIsAddCapsuleModalOpen] = useState(false);
  const [isViewItemModalOpen, setIsViewItemModalOpen] = useState(false);

  // Debug wrapper for isViewItemModalOpen setter
  const debugSetIsViewItemModalOpen = useCallback((value: boolean) => {
    console.log('[useModalState] Setting isViewItemModalOpen to', value);
    setIsViewItemModalOpen(value);
  }, []);

  // Handlers for opening modals
  const openAddModal = useCallback(() => setIsAddModalOpen(true), []);
  const openEditModal = useCallback(() => setIsEditModalOpen(true), []);
  const openAddOutfitModal = useCallback(() => setIsAddOutfitModalOpen(true), []);
  const openEditOutfitModal = useCallback(() => setIsEditOutfitModalOpen(true), []);
  const openViewOutfitModal = useCallback(() => setIsViewOutfitModalOpen(true), []);
  const openViewCapsuleModal = useCallback(() => setIsViewCapsuleModalOpen(true), []);
  const openEditCapsuleModal = useCallback(() => setIsEditCapsuleModalOpen(true), []);
  const openGenerateWithAIModal = useCallback(() => setIsGenerateWithAIModalOpen(true), []);
  const openGenerateCapsuleWithAIModal = useCallback(() => setIsGenerateCapsuleWithAIModalOpen(true), []);
  const openAddCapsuleModal = useCallback(() => setIsAddCapsuleModalOpen(true), []);
  const openViewItemModal = useCallback(() => setIsViewItemModalOpen(true), []);

  // Handlers for closing modals
  const closeAddModal = useCallback(() => setIsAddModalOpen(false), []);
  const closeEditModal = useCallback(() => setIsEditModalOpen(false), []);
  const closeAddOutfitModal = useCallback(() => setIsAddOutfitModalOpen(false), []);
  const closeEditOutfitModal = useCallback(() => setIsEditOutfitModalOpen(false), []);
  const closeViewOutfitModal = useCallback(() => setIsViewOutfitModalOpen(false), []);
  const closeViewCapsuleModal = useCallback(() => setIsViewCapsuleModalOpen(false), []);
  const closeEditCapsuleModal = useCallback(() => setIsEditCapsuleModalOpen(false), []);
  const closeGenerateWithAIModal = useCallback(() => setIsGenerateWithAIModalOpen(false), []);
  const closeGenerateCapsuleWithAIModal = useCallback(() => setIsGenerateCapsuleWithAIModalOpen(false), []);
  const closeAddCapsuleModal = useCallback(() => setIsAddCapsuleModalOpen(false), []);
  const closeViewItemModal = useCallback(() => setIsViewItemModalOpen(false), []);

  // Close all modals
  const closeAllModals = useCallback(() => {
    closeAddModal();
    closeEditModal();
    closeAddOutfitModal();
    closeEditOutfitModal();
    closeViewOutfitModal();
    closeViewCapsuleModal();
    closeEditCapsuleModal();
    closeGenerateWithAIModal();
    closeGenerateCapsuleWithAIModal();
    closeAddCapsuleModal();
    closeViewItemModal();
  }, [
    closeAddModal, closeEditModal, closeAddOutfitModal, closeEditOutfitModal,
    closeViewOutfitModal, closeViewCapsuleModal, closeEditCapsuleModal,
    closeGenerateWithAIModal, closeGenerateCapsuleWithAIModal, closeAddCapsuleModal,
    closeViewItemModal
  ]);

  return {
    // Modal states
    isAddModalOpen,
    isEditModalOpen,
    isAddOutfitModalOpen,
    isEditOutfitModalOpen,
    isViewOutfitModalOpen,
    isViewCapsuleModalOpen,
    isEditCapsuleModalOpen,
    isGenerateWithAIModalOpen,
    isGenerateCapsuleWithAIModalOpen,
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
    setIsGenerateWithAIModalOpen,
    setIsGenerateCapsuleWithAIModalOpen,
    setIsAddCapsuleModalOpen,
    // Using the debug wrapper for tracking state changes
    setIsViewItemModalOpen: debugSetIsViewItemModalOpen,

    // Open handlers
    openAddModal,
    openEditModal,
    openAddOutfitModal,
    openEditOutfitModal,
    openViewOutfitModal,
    openViewCapsuleModal,
    openEditCapsuleModal,
    openGenerateWithAIModal,
    openGenerateCapsuleWithAIModal,
    openAddCapsuleModal,
    openViewItemModal,

    // Close handlers
    closeAddModal,
    closeEditModal,
    closeAddOutfitModal,
    closeEditOutfitModal,
    closeViewOutfitModal,
    closeViewCapsuleModal,
    closeEditCapsuleModal,
    closeGenerateWithAIModal,
    closeGenerateCapsuleWithAIModal,
    closeAddCapsuleModal,
    closeViewItemModal,
    closeAllModals,
  };
};
