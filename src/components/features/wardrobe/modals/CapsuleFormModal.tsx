import React from 'react';
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
  // Create a wrapper function to adapt the signatures
  const handleFormSubmit = (id: string, data: CapsuleFormData) => {
    onSubmit(id, data);
  };

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
