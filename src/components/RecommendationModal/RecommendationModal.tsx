import React, { MouseEvent } from 'react';
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalText,
  ActionButtonsContainer,
  SaveButton,
  SkipButton,
  CloseButton
} from './RecommendationModal.styles';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: string;
  onSave: () => void;
  onSkip: () => void;
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  onSave,
  onSkip
}) => {
  if (!isOpen) return null;

  const handleSave = () => {
    onSave();
    onClose();
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContainer onClick={(e: MouseEvent) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>🎯 AI Recommendation</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close modal">
            ×
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <ModalText>{recommendation}</ModalText>
          
          <ActionButtonsContainer>
            <SaveButton onClick={handleSave}>
              💾 Save
            </SaveButton>
            <SkipButton onClick={handleSkip}>
              ⏭️ Dismiss
            </SkipButton>
          </ActionButtonsContainer>
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default RecommendationModal;
