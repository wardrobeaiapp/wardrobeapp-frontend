import React from 'react';
import { FaTimes, FaCheckCircle, FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../types';
import {
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody,
  AnalysisText,
  ScoreStatusContainer,
  ScoreDisplay,
  ScoreText,
  StatusBadge,
  ActionButtonsContainer,
  PrimaryActionButton,
  SecondaryActionButton,
  TertiaryActionButton
} from './AICheckResultModal.styles';

interface AICheckResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: string;
  score?: number;
  status?: WishlistStatus;
  onAddToWishlist?: () => void;
  onSkip?: () => void;
  onDecideLater?: () => void;
}

const AICheckResultModal: React.FC<AICheckResultModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  score,
  status,
  onAddToWishlist,
  onSkip,
  onDecideLater
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <FaCheckCircle style={{ color: '#10b981', marginRight: '0.5rem' }} />
            AI Analysis Complete
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <AnalysisText>{analysisResult}</AnalysisText>
          
          {/* Score and Status Display */}
          {(score !== undefined || status) && (
            <ScoreStatusContainer>
              {score !== undefined && (
                <ScoreDisplay>
                  <FaStar size={14} color="#f59e0b" />
                  <ScoreText>{score}/10</ScoreText>
                </ScoreDisplay>
              )}
              {status && (
                <StatusBadge $status={status}>
                  {status.replace('_', ' ')}
                </StatusBadge>
              )}
            </ScoreStatusContainer>
          )}
          
          <ActionButtonsContainer>
            <PrimaryActionButton onClick={() => {
              onAddToWishlist?.();
              onClose();
            }}>
              Add to wishlist
            </PrimaryActionButton>
            <SecondaryActionButton onClick={() => {
              onSkip?.();
              onClose();
            }}>
              Dismiss
            </SecondaryActionButton>
            <TertiaryActionButton onClick={() => {
              onDecideLater?.();
              onClose();
            }}>
              Decide later
            </TertiaryActionButton>
          </ActionButtonsContainer>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AICheckResultModal;
