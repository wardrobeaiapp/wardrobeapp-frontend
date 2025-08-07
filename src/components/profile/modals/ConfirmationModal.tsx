import React from 'react';
import styled from 'styled-components';
import { FaExclamationTriangle } from 'react-icons/fa';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton
} from '../../../pages/HomePage.styles';

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
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.primary ? '#EF4444' : '#f3f4f6'};
  color: ${props => props.primary ? '#ffffff' : '#1f2937'};
  border: 1px solid ${props => props.primary ? '#EF4444' : '#e5e7eb'};
  min-width: 120px;
  
  &:hover {
    background-color: ${props => props.primary ? '#DC2626' : '#e5e7eb'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
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
            <Button onClick={onClose}>Cancel</Button>
            <Button primary onClick={() => {
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
