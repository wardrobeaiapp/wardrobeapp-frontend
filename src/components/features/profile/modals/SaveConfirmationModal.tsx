import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa';
import { Modal, ModalAction } from '../../../common/Modal';

interface SaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 16px 0;
`;

const SuccessIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  color: #34A853;
  width: 80px;
  height: 80px;
  background-color: rgba(52, 168, 83, 0.1);
  border-radius: 50%;
`;


const Message = styled.p`
  font-size: 18px;
  color: #1a1a1a;
  font-weight: 500;
  margin: 16px 0 0 0;
`;

const SaveConfirmationModal: React.FC<SaveConfirmationModalProps> = ({
  isOpen,
  onClose,
  message = 'Profile Saved!'
}) => {
  const actions: ModalAction[] = [
    {
      label: 'OK',
      onClick: onClose,
      variant: 'primary',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Success"
      actions={actions}
      size="sm"
    >
      <ModalBody>
        <SuccessIcon>
          <FaCheckCircle />
        </SuccessIcon>
        <Message>{message}</Message>
      </ModalBody>
    </Modal>
  );
};

export default SaveConfirmationModal;
