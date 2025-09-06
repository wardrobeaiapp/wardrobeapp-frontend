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
  
  useEffect(() => {
    if (isOpen) {
      console.log('[ItemFormModal] Modal opened with defaultWishlist:', defaultWishlist);
      console.log('[ItemFormModal] Modal opened with initialItem:', initialItem);
      
      // Add null check before spreading initialItem
      console.log('[ItemFormModal] initialItem with wishlist:', initialItem ? {
        ...initialItem,
        wishlist: initialItem?.wishlist ?? defaultWishlist
      } : { wishlist: defaultWishlist });
    }
  }, [isOpen, initialItem, defaultWishlist]);

  const handleSubmit = useCallback((item: any, file?: File) => {
    console.log('[ItemFormModal] Handling submit with file:', !!file);
    onSubmit(item, file);
    // Close the modal after submission
    if (isMounted) {
      console.log('[ItemFormModal] Closing modal after successful submission');
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
