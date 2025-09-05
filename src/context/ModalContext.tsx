import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ModalContextType = {
  // Modal states
  isAddModalOpen: boolean;
  isEditModalOpen: boolean;
  isAddOutfitModalOpen: boolean;
  isEditOutfitModalOpen: boolean;
  isViewOutfitModalOpen: boolean;
  isViewCapsuleModalOpen: boolean;
  isEditCapsuleModalOpen: boolean;
  isAddCapsuleModalOpen: boolean;
  isViewItemModalOpen: boolean;
  isGenerateWithAIModalOpen: boolean;
  isGenerateCapsuleWithAIModalOpen: boolean;
  
  // Modal state setters
  setIsAddModalOpen: (isOpen: boolean) => void;
  setIsEditModalOpen: (isOpen: boolean) => void;
  setIsAddOutfitModalOpen: (isOpen: boolean) => void;
  setIsEditOutfitModalOpen: (isOpen: boolean) => void;
  setIsViewOutfitModalOpen: (isOpen: boolean) => void;
  setIsViewCapsuleModalOpen: (isOpen: boolean) => void;
  setIsEditCapsuleModalOpen: (isOpen: boolean) => void;
  setIsAddCapsuleModalOpen: (isOpen: boolean) => void;
  setIsViewItemModalOpen: (isOpen: boolean) => void;
  setIsGenerateWithAIModalOpen: (isOpen: boolean) => void;
  setIsGenerateCapsuleWithAIModalOpen: (isOpen: boolean) => void;
  
  // Open handlers
  openAddModal: () => void;
  openEditModal: () => void;
  openAddOutfitModal: () => void;
  openEditOutfitModal: () => void;
  openViewOutfitModal: () => void;
  openViewCapsuleModal: () => void;
  openEditCapsuleModal: () => void;
  openGenerateWithAIModal: () => void;
  openGenerateCapsuleWithAIModal: () => void;
  openAddCapsuleModal: () => void;
  openViewItemModal: () => void;
  
  // Close handlers
  closeAddModal: () => void;
  closeEditModal: () => void;
  closeAddOutfitModal: () => void;
  closeEditOutfitModal: () => void;
  closeViewOutfitModal: () => void;
  closeViewCapsuleModal: () => void;
  closeEditCapsuleModal: () => void;
  closeGenerateWithAIModal: () => void;
  closeGenerateCapsuleWithAIModal: () => void;
  closeAddCapsuleModal: () => void;
  closeViewItemModal: () => void;
  closeAllModals: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Modal visibility states
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

  const contextValue = {
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
    setIsViewItemModalOpen,

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

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within a ModalProvider');
  }
  return context;
};
