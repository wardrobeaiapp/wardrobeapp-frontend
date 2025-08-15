import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton
} from '../../../../pages/HomePage.styles';
import Button from '../../../common/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const ModalBody = styled.div`
  padding: 24px 32px;
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

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Title = styled.h2`
  font-size: 20px;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 24px;
`;

const EnhancedModalContent = styled(ModalContent)`
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-width: 450px;
  animation: modalFadeIn 0.3s ease-out;
  
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const EnhancedModalHeader = styled(ModalHeader)`
  padding: 20px 32px;
  border-bottom: 1px solid #e5e7eb;
`;

const EnhancedModalTitle = styled(ModalTitle)`
  font-size: 20px;
  color: #1a1a1a;
  font-weight: 600;
`;

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?'
}) => {

  if (!isOpen) return null;

  return (
    <Modal>
      <EnhancedModalContent>
        <EnhancedModalHeader>
          <EnhancedModalTitle>{title}</EnhancedModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </EnhancedModalHeader>
        <ModalBody>
          <WarningIcon>
            <FaExclamationTriangle />
          </WarningIcon>
          <Title>Confirmation Required</Title>
          <Message>{message}</Message>
          <ButtonContainer>
            <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={() => {
              onConfirm();
              onClose();
            }}>Confirm</Button>
          </ButtonContainer>
        </ModalBody>
      </EnhancedModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
