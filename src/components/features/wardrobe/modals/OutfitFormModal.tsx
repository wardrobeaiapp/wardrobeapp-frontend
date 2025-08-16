import React from 'react';
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
        onSubmit={onSubmit}
        onGenerateWithAI={onGenerateWithAI}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default OutfitFormModal;
