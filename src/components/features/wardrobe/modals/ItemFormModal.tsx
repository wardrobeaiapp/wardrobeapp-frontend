import React, { useState, useEffect } from 'react';
import { WardrobeItem } from '../../../../types';
import WardrobeItemForm from '../forms/WardrobeItemForm';
import { Modal } from '../../../common/Modal';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: any) => void;
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
  
  console.log('[ItemFormModal] defaultWishlist:', defaultWishlist);
  console.log('[ItemFormModal] initialItem:', initialItem);
  
  // Add null check before spreading initialItem
  console.log('[ItemFormModal] initialItem with wishlist:', initialItem ? {
    ...initialItem,
    wishlist: initialItem?.wishlist ?? defaultWishlist
  } : { wishlist: defaultWishlist });

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
        onSubmit={(item: WardrobeItem) => {
          if (isMounted) {
            onSubmit(item);
          }
        }}
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
