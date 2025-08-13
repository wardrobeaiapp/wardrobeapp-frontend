import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle } from 'react-icons/fa';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton
} from '../../../../pages/HomePage.styles';

interface SaveConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const ModalBody = styled.div`
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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

const Button = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  min-width: 120px;
  
  &:hover {
    background-color: #e5e7eb;
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

// Secondary button removed - no longer needed

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

const Title = styled.h2`
  font-size: 20px;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 16px;
`;

const SaveConfirmationModal: React.FC<SaveConfirmationModalProps> = ({
  isOpen,
  onClose,
  message = 'Profile Saved!'
}) => {

  if (!isOpen) return null;

  return (
    <Modal>
      <EnhancedModalContent>
        <EnhancedModalHeader>
          <EnhancedModalTitle>Success</EnhancedModalTitle>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </EnhancedModalHeader>
        <ModalBody>
          <SuccessIcon>
            <FaCheckCircle />
          </SuccessIcon>
          <Title>{message}</Title>
          <Button onClick={onClose}>OK</Button>
        </ModalBody>
      </EnhancedModalContent>
    </Modal>
  );
};

export default SaveConfirmationModal;
