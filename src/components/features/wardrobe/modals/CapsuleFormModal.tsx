import React, { useState, useEffect, useCallback } from 'react';
import { WardrobeItem, Capsule } from '../../../../types';
import CapsuleForm, { CapsuleFormData } from '../forms/CapsuleForm';
import { Modal } from '../../../common/Modal';

interface CapsuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: CapsuleFormData) => void;
  editCapsule?: Capsule;
  availableItems: WardrobeItem[];
  isEditing: boolean;
}

const CapsuleFormModal: React.FC<CapsuleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editCapsule,
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

  // Create a wrapper function to adapt the signatures and close the modal after submission
  const handleFormSubmit = useCallback((id: string, data: CapsuleFormData) => {
    console.log('[CapsuleFormModal] Handling submit');
    onSubmit(id, data);
    // Close the modal after submission
    if (isMounted) {
      console.log('[CapsuleFormModal] Closing modal after successful submission');
      onClose();
    }
  }, [onSubmit, onClose, isMounted]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Capsule' : 'Create New Capsule'}
      size="md"
    >
      <CapsuleForm
        availableItems={availableItems}
        editCapsule={editCapsule}
        onSubmit={handleFormSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default CapsuleFormModal;
