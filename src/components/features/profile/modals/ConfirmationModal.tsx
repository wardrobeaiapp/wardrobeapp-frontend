import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Modal, ModalAction, ModalBody } from '../../../common/Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const StyledModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const WarningIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 48px;
  color: #F59E0B;
  width: 80px;
  height: 80px;
  background-color: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
`;


const SubTitle = styled.h3`
  font-size: 18px;
  color: #1a1a1a;
  font-weight: 600;
  margin: 16px 0 8px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 0;
`;


const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?'
}) => {
  const actions: ModalAction[] = [
    {
      label: 'Cancel',
      onClick: onClose,
      variant: 'secondary',
      fullWidth: true
    },
    {
      label: 'Confirm',
      onClick: () => {
        onConfirm();
        onClose();
      },
      variant: 'primary',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      actions={actions}
      size="sm"
    >
      <ModalBody>
        <StyledModalBody>
          <WarningIcon>
            <FaExclamationTriangle />
          </WarningIcon>
          <SubTitle>Confirmation Required</SubTitle>
          <Message>{message}</Message>
        </StyledModalBody>
      </ModalBody>
    </Modal>
  );
};

export default ConfirmationModal;
