import React from 'react';
import { FaTimes, FaCheckCircle, FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  CloseButton,
  ModalBody
} from '../../pages/HomePage.styles';
import {
  ItemDetails,
  DetailRow,
  DetailLabel,
  DetailValue,
  ButtonsContainer
} from '../ItemViewModal.styles';
import {
  ActionButton,
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
    <Modal onClick={onClose}>
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
          <div style={{ 
            fontSize: '1rem', 
            color: '#374151', 
            lineHeight: 1.6, 
            marginBottom: '1.5rem' 
          }}>
            {analysisResult}
          </div>
          
          <ItemDetails>
            {score !== undefined && (
              <DetailRow>
                <DetailLabel>Score:</DetailLabel>
                <DetailValue style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaStar size={14} color="#f59e0b" />
                  {score}/10
                </DetailValue>
              </DetailRow>
            )}
            {status && (
              <DetailRow>
                <DetailLabel>Status:</DetailLabel>
                <DetailValue>
                  {status.replace('_', ' ')}
                </DetailValue>
              </DetailRow>
            )}
          </ItemDetails>
          
          <ButtonsContainer>
            <ActionButton onClick={() => {
              onAddToWishlist?.();
              onClose();
            }}>
              Add to wishlist
            </ActionButton>
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
          </ButtonsContainer>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default AICheckResultModal;
