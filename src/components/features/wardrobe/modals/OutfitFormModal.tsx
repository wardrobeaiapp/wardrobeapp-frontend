import React, { useState, useEffect, useCallback } from 'react';
import { Outfit, WardrobeItem } from '../../../../types';
import OutfitForm from '../forms/OutfitForm/OutfitForm';
import { Modal } from '../../../common/Modal';

interface OutfitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (outfit: any) => void;
  onGenerateWithAI?: (outfit: any) => void;
  initialOutfit?: Outfit;
  availableItems: WardrobeItem[];
  isEditing: boolean;
}

const OutfitFormModal: React.FC<OutfitFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onGenerateWithAI,
  initialOutfit,
  availableItems,
  isEditing
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

  const handleSubmit = useCallback((outfit: any) => {
    console.log('[OutfitFormModal] Handling submit');
    onSubmit(outfit);
    // Close the modal after submission
    if (isMounted) {
      console.log('[OutfitFormModal] Closing modal after successful submission');
      onClose();
    }
  }, [onSubmit, onClose, isMounted]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Outfit' : 'Create New Outfit'}
      size="md"
    >
      <OutfitForm
        availableItems={availableItems}
        initialOutfit={initialOutfit}
        onSubmit={handleSubmit}
        onGenerateWithAI={onGenerateWithAI}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default OutfitFormModal;
