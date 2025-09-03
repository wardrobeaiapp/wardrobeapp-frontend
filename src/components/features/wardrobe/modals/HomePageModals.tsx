import React from 'react';
import { Outfit, Capsule, WardrobeItem } from '../../../../types';
import { ItemFormModal, OutfitFormModal, CapsuleFormModal } from '.';
import CapsuleDetailModal from './CapsuleDetailModal';
import OutfitDetailModal from './OutfitDetailModal';
import ItemViewModal from './ItemViewModal';
import DeleteItemConfirmModal from './DeleteItemConfirmModal';
import { CapsuleFormData } from '../forms/CapsuleForm';

interface HomePageModalsProps {
  // Items
  items: WardrobeItem[];
  currentItem?: WardrobeItem;
  selectedItem?: WardrobeItem;
  itemToDelete?: WardrobeItem;
  activeTab: string;
  
  // Outfits
  currentOutfit?: Outfit;
  selectedOutfit: Outfit | null;
  
  // Capsules
  selectedCapsule?: Capsule;
  
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
  isDeleteConfirmModalOpen: boolean;
  
  // Modal close handlers
  setIsAddModalOpen: (isOpen: boolean) => void;
  setIsEditModalOpen: (isOpen: boolean) => void;
  setIsAddOutfitModalOpen: (isOpen: boolean) => void;
  setIsEditOutfitModalOpen: (isOpen: boolean) => void;
  setIsViewOutfitModalOpen: (isOpen: boolean) => void;
  setIsViewCapsuleModalOpen: (isOpen: boolean) => void;
  setIsEditCapsuleModalOpen: (isOpen: boolean) => void;
  setIsAddCapsuleModalOpen: (isOpen: boolean) => void;
  setIsViewItemModalOpen: (isOpen: boolean) => void;
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

const HomePageModals: React.FC<HomePageModalsProps> = ({
  // Items
  items,
  currentItem,
  selectedItem,
  itemToDelete,
  activeTab,
  
  // Outfits
  currentOutfit,
  selectedOutfit,
  
  // Capsules
  selectedCapsule,
  
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
  isDeleteConfirmModalOpen,
  
  // Modal close handlers
  setIsAddModalOpen,
  setIsEditModalOpen,
  setIsAddOutfitModalOpen,
  setIsEditOutfitModalOpen,
  setIsViewOutfitModalOpen,
  setIsViewCapsuleModalOpen,
  setIsEditCapsuleModalOpen,
  setIsAddCapsuleModalOpen,
  setIsViewItemModalOpen,
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
  return (
    <>
      {/* Item Modals */}
      <ItemFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleSubmitAdd}
        isEditing={false}
        defaultWishlist={activeTab === 'wishlist'}
      />

      <ItemFormModal
        isOpen={isEditModalOpen && !!currentItem}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleSubmitEdit}
        initialItem={currentItem}
        isEditing={true}
      />

      <ItemViewModal
        isOpen={isViewItemModalOpen}
        onClose={() => setIsViewItemModalOpen(false)}
        item={selectedItem}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
      />

      {/* Outfit Modals */}
      <OutfitFormModal
        isOpen={isAddOutfitModalOpen}
        onClose={() => setIsAddOutfitModalOpen(false)}
        onSubmit={handleAddOutfit}
        availableItems={items}
        isEditing={false}
      />

      <OutfitFormModal
        isOpen={isEditOutfitModalOpen && !!currentOutfit}
        onClose={() => {
          setIsEditOutfitModalOpen(false);
          setCurrentOutfitId(null);
        }}
        onSubmit={handleEditOutfitSubmit}
        initialOutfit={currentOutfit}
        availableItems={items}
        isEditing={true}
      />

      {isViewOutfitModalOpen && selectedOutfit && (
        <OutfitDetailModal
          isOpen={isViewOutfitModalOpen}
          outfit={selectedOutfit}
          items={items}
          onClose={() => {
            setIsViewOutfitModalOpen(false);
            setSelectedOutfit(null);
          }}
          onEdit={handleEditOutfit}
          onDelete={handleDeleteOutfit}
        />
      )}

      {/* Capsule Modals */}
      <CapsuleFormModal
        isOpen={isAddCapsuleModalOpen}
        onClose={() => setIsAddCapsuleModalOpen(false)}
        onSubmit={handleAddCapsule}
        availableItems={items}
        isEditing={false}
      />

      <CapsuleFormModal
        isOpen={isEditCapsuleModalOpen && !!selectedCapsule}
        onClose={() => setIsEditCapsuleModalOpen(false)}
        onSubmit={handleEditCapsuleSubmit}
        editCapsule={selectedCapsule}
        availableItems={items}
        isEditing={true}
      />

      {isViewCapsuleModalOpen && selectedCapsule && (
        <CapsuleDetailModal
          isOpen={isViewCapsuleModalOpen}
          capsule={selectedCapsule}
          items={items}
          onClose={() => {
            setIsViewCapsuleModalOpen(false);
            setSelectedCapsule(undefined);
          }}
          onEdit={handleEditCapsule}
          onDelete={handleDeleteCapsule}
        />
      )}


      {/* Delete Confirmation Modal */}
      <DeleteItemConfirmModal
        isOpen={isDeleteConfirmModalOpen}
        onClose={() => setIsDeleteConfirmModalOpen(false)}
        onConfirm={confirmDeleteItem}
        item={itemToDelete}
      />
    </>
  );
};

export default HomePageModals;
