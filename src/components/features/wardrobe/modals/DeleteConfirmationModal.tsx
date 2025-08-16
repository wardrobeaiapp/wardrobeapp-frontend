import React from 'react';
import { Modal, ModalAction } from '../../../common/Modal';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
}) => {
  const actions: ModalAction[] = [
    {
      label: cancelText,
      onClick: onClose,
      variant: 'secondary',
      fullWidth: true,
    },
    {
      label: confirmText,
      onClick: () => {
        onConfirm();
        onClose();
      },
      variant: 'danger',
      fullWidth: true,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
      size="sm"
    >
      <p>{message}</p>
    </Modal>
  );
};

export default DeleteConfirmationModal;
