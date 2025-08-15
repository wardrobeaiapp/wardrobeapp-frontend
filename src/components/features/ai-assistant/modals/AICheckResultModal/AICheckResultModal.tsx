import React from 'react';
import { FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../../../../types';
import { Modal, ModalAction, ModalBody } from '../../../../common/Modal';
import {
  ItemDetails,
  DetailRow,
  DetailLabel,
  DetailValue
} from '../../../wardrobe/modals/ItemViewModal.styles';
import { AnalysisText } from './AICheckResultModal.styles';

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
  const handleAddToWishlist = () => {
    onAddToWishlist?.();
    onClose();
  };

  const handleSkip = () => {
    onSkip?.();
    onClose();
  };

  const handleDecideLater = () => {
    onDecideLater?.();
    onClose();
  };

  const actions: ModalAction[] = [
    {
      label: 'Add to wishlist',
      onClick: handleAddToWishlist,
      variant: 'primary',
      fullWidth: true
    },
    {
      label: 'Dismiss',
      onClick: handleSkip,
      variant: 'secondary',
      fullWidth: true
    },
    {
      label: 'Decide later',
      onClick: handleDecideLater,
      variant: 'secondary',
      fullWidth: true
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Analysis Complete"
      actions={actions}
      size="md"
    >
      <ModalBody>
        <AnalysisText>
          {analysisResult}
        </AnalysisText>
        
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
      </ModalBody>
    </Modal>
  );
};

export default AICheckResultModal;
