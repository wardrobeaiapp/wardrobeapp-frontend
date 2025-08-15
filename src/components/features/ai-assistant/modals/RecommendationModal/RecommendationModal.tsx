import React, { MouseEvent } from 'react';
import { UserActionStatus } from '../../../../../types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody
} from '../../../../../pages/HomePage.styles';
import {
  ButtonsContainer
} from '../../../wardrobe/modals/ItemViewModal.styles';
import Button from '../../../../common/Button';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: string;
  userActionStatus?: UserActionStatus;
  onSave: () => void;
  onSkip: () => void;
  onApply?: () => void;
}

const RecommendationModal: React.FC<RecommendationModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  userActionStatus,
  onSave,
  onSkip,
  onApply
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

  const handleApply = () => {
    onApply?.();
    onClose();
  };

  const isSavedRecommendation = userActionStatus === UserActionStatus.SAVED;

  return (
    <Modal onClick={onClose}>
      <ModalContent onClick={(e: MouseEvent) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>🎯 AI Recommendation</ModalTitle>
          <CloseButton onClick={onClose} aria-label="Close modal">
            ×
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <div style={{ 
            fontSize: '1rem', 
            color: '#374151', 
            lineHeight: 1.6, 
            marginBottom: '2rem' 
          }}>
            {recommendation}
          </div>
          
          <ButtonsContainer>
            {isSavedRecommendation ? (
              <>
                <Button fullWidth onClick={handleApply}>
                  Applied
                </Button>
                <Button fullWidth variant="secondary" onClick={handleSkip}>
                  Dismiss
                </Button>
              </>
            ) : (
              <>
                <Button fullWidth onClick={handleSave}>
                  Save
                </Button>
                <Button fullWidth variant="secondary" onClick={handleSkip}>
                  Dismiss
                </Button>
              </>
            )}
          </ButtonsContainer>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RecommendationModal;
