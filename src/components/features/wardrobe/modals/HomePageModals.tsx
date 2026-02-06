import React, { useCallback, useMemo } from 'react';
import { Outfit, Capsule, WardrobeItem } from '../../../../types';
import { TabType } from '../../../../hooks/home/useTabState';
import { ItemFormModal, OutfitFormModal, CapsuleFormModal } from '.';
import CapsuleDetailModal from './CapsuleDetailModal';
import OutfitDetailModal from './OutfitDetailModal';
import ItemViewModal from './ItemViewModal';
import DeleteItemConfirmModal from './DeleteItemConfirmModal';
import { CapsuleFormData } from '../forms/CapsuleForm';

interface HomePageModalsProps {
  // Modal state
  modalState: ReturnType<typeof import('../../../../hooks/home/useModalState').useModalState>;
  // Items
  items: WardrobeItem[];
  currentItem?: WardrobeItem;
  selectedItem?: WardrobeItem;
  itemToDelete?: WardrobeItem;
  initialItem?: WardrobeItem; // For AI history pre-filling
  activeTab: TabType;
  
  // Outfits
  currentOutfit?: Outfit;
  selectedOutfit: Outfit | null;
  
  // Capsules
  selectedCapsule?: Capsule;
  
  // Delete confirmation modal state
  isDeleteConfirmModalOpen: boolean;
  setIsDeleteConfirmModalOpen: (isOpen: boolean) => void;
  
  // Action handlers
  handleSubmitAdd: (item: any, file?: File) => void;
  handleSubmitEdit: (item: any) => void;
  handleAddOutfit: (outfit: any) => void;
  handleEditOutfitSubmit: (outfitData: any) => void;
  handleAddCapsule: (id: string, data: CapsuleFormData) => void;
  handleEditCapsuleSubmit: (id: string, data: CapsuleFormData) => void;
  confirmDeleteItem: () => void;
  
  // Item handlers
  handleEditItem: (id: string) => void;
  handleDeleteItem: (id: string) => void;
  
  // Outfit handlers
  handleEditOutfit: (outfit: Outfit) => void;
  handleDeleteOutfit: (id: string) => void;
  setCurrentOutfitId: (id: string | null) => void;
  
  // Capsule handlers
  handleEditCapsule: (capsule: Capsule) => void;
  handleDeleteCapsule: (id: string) => void;
  setSelectedCapsule: (capsule: Capsule | undefined) => void;
  setSelectedOutfit: (outfit: Outfit | null) => void;
}

// Memoize modal components to prevent unnecessary re-renders
const MemoizedItemFormModal = React.memo(ItemFormModal);
const MemoizedOutfitFormModal = React.memo(OutfitFormModal);
const MemoizedCapsuleFormModal = React.memo(CapsuleFormModal);
const MemoizedItemViewModal = React.memo(ItemViewModal);
const MemoizedOutfitDetailModal = React.memo(OutfitDetailModal);
const MemoizedCapsuleDetailModal = React.memo(CapsuleDetailModal);
const MemoizedDeleteItemConfirmModal = React.memo(DeleteItemConfirmModal);

const HomePageModals: React.FC<HomePageModalsProps> = ({
  // Modal state
  modalState,
  // Items
  items,
  currentItem,
  selectedItem,
  itemToDelete,
  initialItem, // For AI history pre-filling
  activeTab,
  
  // Outfits
  currentOutfit,
  selectedOutfit,
  
  // Capsules
  selectedCapsule,
  
  // Delete confirmation modal state
  isDeleteConfirmModalOpen,
  setIsDeleteConfirmModalOpen,
  
  // Action handlers
  handleSubmitAdd,
  handleSubmitEdit,
  handleAddOutfit,
  handleEditOutfitSubmit,
  handleAddCapsule,
  handleEditCapsuleSubmit,
  confirmDeleteItem,
  
  // Item handlers
  handleEditItem,
  handleDeleteItem,
  
  // Outfit handlers
  handleEditOutfit,
  handleDeleteOutfit,
  setCurrentOutfitId,
  
  // Capsule handlers
  handleEditCapsule,
  handleDeleteCapsule,
  setSelectedCapsule,
  setSelectedOutfit
}) => {
  // Destructure modal state from props
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
  } = modalState;

  // Memoize callbacks to prevent unnecessary re-renders
  const closeAddModal = useCallback(() => setIsAddModalOpen(false), [setIsAddModalOpen]);
  const closeEditModal = useCallback(() => setIsEditModalOpen(false), [setIsEditModalOpen]);
  const closeAddOutfitModal = useCallback(() => setIsAddOutfitModalOpen(false), [setIsAddOutfitModalOpen]);
  const closeEditOutfitModal = useCallback(() => {
    setIsEditOutfitModalOpen(false);
    setCurrentOutfitId(null);
  }, [setIsEditOutfitModalOpen, setCurrentOutfitId]);
  const closeViewOutfitModal = useCallback(() => {
    setIsViewOutfitModalOpen(false);
    setSelectedOutfit(null);
  }, [setIsViewOutfitModalOpen, setSelectedOutfit]);
  const closeViewCapsuleModal = useCallback(() => {
    setIsViewCapsuleModalOpen(false);
    setSelectedCapsule(undefined);
  }, [setIsViewCapsuleModalOpen, setSelectedCapsule]);
  const closeEditCapsuleModal = useCallback(() => {
    setIsEditCapsuleModalOpen(false);
    setSelectedCapsule(undefined);
  }, [setIsEditCapsuleModalOpen, setSelectedCapsule]);
  const closeAddCapsuleModal = useCallback(() => setIsAddCapsuleModalOpen(false), [setIsAddCapsuleModalOpen]);
  const closeViewItemModal = useCallback(() => setIsViewItemModalOpen(false), [setIsViewItemModalOpen]);
  const closeDeleteConfirmModal = useCallback(() => setIsDeleteConfirmModalOpen(false), [setIsDeleteConfirmModalOpen]);

  // Memoize modal props that don't need to be recreated on every render
  const itemFormModalProps = useMemo(() => ({
    isOpen: isAddModalOpen,
    onClose: closeAddModal,
    onSubmit: handleSubmitAdd,
    isEditing: false,
    initialItem: initialItem, // Pass AI history data for pre-filling
    defaultWishlist: activeTab === 'wishlist'
  }), [isAddModalOpen, closeAddModal, handleSubmitAdd, activeTab, initialItem]);

  const editItemFormModalProps = useMemo(() => ({
    isOpen: isEditModalOpen && !!currentItem,
    onClose: closeEditModal,
    onSubmit: handleSubmitEdit,
    initialItem: currentItem,
    isEditing: true
  }), [isEditModalOpen, closeEditModal, handleSubmitEdit, currentItem]);

  const viewItemModalProps = useMemo(() => ({
    isOpen: isViewItemModalOpen && !!selectedItem,
    onClose: closeViewItemModal,
    item: selectedItem!,
    onEdit: handleEditItem,
    onDelete: handleDeleteItem
  }), [isViewItemModalOpen, closeViewItemModal, selectedItem, handleEditItem, handleDeleteItem]);


  // Memoize modal props for better performance
  const outfitFormModalProps = useMemo(() => ({
    availableItems: items,
    isEditing: false,
    onSubmit: handleAddOutfit,
    onClose: closeAddOutfitModal,
    isOpen: isAddOutfitModalOpen
  }), [items, handleAddOutfit, closeAddOutfitModal, isAddOutfitModalOpen]);

  const editOutfitFormModalProps = useMemo(() => ({
    isOpen: isEditOutfitModalOpen && !!currentOutfit,
    onClose: closeEditOutfitModal,
    onSubmit: handleEditOutfitSubmit,
    initialOutfit: currentOutfit!,
    availableItems: items,
    isEditing: true
  }), [isEditOutfitModalOpen, currentOutfit, closeEditOutfitModal, handleEditOutfitSubmit, items]);

  const outfitDetailModalProps = useMemo(() => ({
    isOpen: isViewOutfitModalOpen && !!selectedOutfit,
    onClose: closeViewOutfitModal,
    outfit: selectedOutfit!,
    items,
    onEdit: handleEditOutfit,
    onDelete: handleDeleteOutfit
  }), [isViewOutfitModalOpen, selectedOutfit, closeViewOutfitModal, items, handleEditOutfit, handleDeleteOutfit]);

  const capsuleFormModalProps = useMemo(() => ({
    isOpen: isAddCapsuleModalOpen,
    onClose: closeAddCapsuleModal,
    onSubmit: handleAddCapsule,
    availableItems: items,
    isEditing: false
  }), [isAddCapsuleModalOpen, closeAddCapsuleModal, handleAddCapsule, items]);

  const editCapsuleFormModalProps = useMemo(() => ({
    isOpen: isEditCapsuleModalOpen && !!selectedCapsule,
    onClose: closeEditCapsuleModal,
    onSubmit: handleEditCapsuleSubmit,
    editCapsule: selectedCapsule!,
    availableItems: items,
    isEditing: true
  }), [isEditCapsuleModalOpen, selectedCapsule, closeEditCapsuleModal, handleEditCapsuleSubmit, items]);

  const capsuleDetailModalProps = useMemo(() => ({
    isOpen: isViewCapsuleModalOpen && !!selectedCapsule,
    onClose: closeViewCapsuleModal,
    capsule: selectedCapsule!,
    items,
    onEdit: handleEditCapsule,
    onDelete: handleDeleteCapsule
  }), [isViewCapsuleModalOpen, selectedCapsule, closeViewCapsuleModal, items, handleEditCapsule, handleDeleteCapsule]);

  const deleteConfirmModalProps = useMemo(() => ({
    isOpen: isDeleteConfirmModalOpen && !!itemToDelete,
    onClose: closeDeleteConfirmModal,
    onConfirm: confirmDeleteItem,
    item: itemToDelete!
  }), [isDeleteConfirmModalOpen, itemToDelete, closeDeleteConfirmModal, confirmDeleteItem]);

  return (
    <>
      {/* Item Modals */}
      <MemoizedItemFormModal {...itemFormModalProps} />
      <MemoizedItemFormModal {...editItemFormModalProps} />
      
      {/* ItemViewModal */}
      {viewItemModalProps.isOpen && (
        <MemoizedItemViewModal {...viewItemModalProps} />
      )}

      {/* Outfit Modals */}
      {outfitFormModalProps.isOpen && (
        <MemoizedOutfitFormModal {...outfitFormModalProps} />
      )}
      
      {editOutfitFormModalProps.isOpen && (
        <MemoizedOutfitFormModal {...editOutfitFormModalProps} />
      )}
      
      {outfitDetailModalProps.isOpen && (
        <MemoizedOutfitDetailModal {...outfitDetailModalProps} />
      )}

      {/* Capsule Modals */}
      {capsuleFormModalProps.isOpen && (
        <MemoizedCapsuleFormModal {...capsuleFormModalProps} />
      )}
      
      {editCapsuleFormModalProps.isOpen && (
        <MemoizedCapsuleFormModal {...editCapsuleFormModalProps} />
      )}
      
      {capsuleDetailModalProps.isOpen && (
        <MemoizedCapsuleDetailModal {...capsuleDetailModalProps} />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModalProps.isOpen && (
        <MemoizedDeleteItemConfirmModal {...deleteConfirmModalProps} />
      )}
    </>
  );
};

export default HomePageModals;
