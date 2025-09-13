import React, { useState, useEffect, useCallback } from 'react';
import { WardrobeItem } from '../../../../types';
import WardrobeItemForm from '../forms/WardrobeItemForm';
import { Modal } from '../../../common/Modal';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: any, file?: File) => void;
  initialItem?: WardrobeItem;
  isEditing: boolean;
  defaultWishlist?: boolean;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialItem,
  isEditing,
  defaultWishlist = false
}) => {
  // Track if component is mounted to prevent state updates after unmount
  const [isMounted, setIsMounted] = useState(true);
  
  useEffect(() => {
    // Set up component mount state
    setIsMounted(true);
    
    // Clean up function to run when component unmounts
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  // Removed blocking console.log operations for performance

  const handleSubmit = useCallback((item: any, file?: File) => {
    onSubmit(item, file);
    // Close the modal after submission
    if (isMounted) {
      onClose();
    }
  }, [onSubmit, onClose, isMounted]);

  if (!isMounted) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Item' : 'Add New Item'}
      size="md"
    >
      <WardrobeItemForm
        initialItem={initialItem ? {
          ...initialItem,
          wishlist: initialItem?.wishlist ?? defaultWishlist
        } : undefined}
        defaultWishlist={defaultWishlist}
        onSubmit={handleSubmit}
        onCancel={() => {
          if (isMounted) {
            onClose();
          }
        }}
      />
    </Modal>
  );
};

export default ItemFormModal;
