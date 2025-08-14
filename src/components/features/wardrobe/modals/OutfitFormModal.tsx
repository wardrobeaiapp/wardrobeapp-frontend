import React from 'react';
import { Outfit, WardrobeItem } from '../../../../types';
import OutfitForm from '../OutfitForm';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  CloseButton
} from '../../../../pages/HomePage.styles';

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
  if (!isOpen) return null;

  return (
    <Modal>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{isEditing ? 'Edit Outfit' : 'Create New Outfit'}</ModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>
          <OutfitForm
            availableItems={availableItems}
            initialOutfit={initialOutfit}
            onSubmit={onSubmit}
            onGenerateWithAI={onGenerateWithAI}
            onCancel={onClose}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default OutfitFormModal;
