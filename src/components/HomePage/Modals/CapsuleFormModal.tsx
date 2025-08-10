import React from 'react';
import { Capsule, WardrobeItem } from '../../../types';
import CapsuleForm, { CapsuleFormData } from '../../CapsuleForm';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody
} from '../../../pages/HomePage.styles';

interface CapsuleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, data: CapsuleFormData) => void;
  onGenerateWithAI?: (data: CapsuleFormData) => void;
  editCapsule?: Capsule;
  availableItems: WardrobeItem[];
  isEditing: boolean;
}

const CapsuleFormModal: React.FC<CapsuleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onGenerateWithAI,
  editCapsule,
  availableItems,
  isEditing
}) => {
  if (!isOpen) return null;

  // Create a wrapper function to adapt the signatures
  const handleFormSubmit = (id: string, data: CapsuleFormData) => {
    onSubmit(id, data);
  };

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Capsule' : 'Create New Capsule'}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <CapsuleForm
            availableItems={availableItems}
            editCapsule={editCapsule}
            onSubmit={handleFormSubmit}
            onGenerateWithAI={onGenerateWithAI}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CapsuleFormModal;
