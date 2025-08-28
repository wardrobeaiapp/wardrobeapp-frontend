import React, { useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../../../../types';
import { Modal, ModalAction } from '../../../../common/Modal';
import {
  ItemDetails,
} from '../../../wardrobe/modals/ItemViewModal.styles';
import { AnalysisText } from './AICheckResultModal.styles';
import { DetailLabel, DetailRow, DetailValue } from '../../../wardrobe/modals/modalCommon.styles';
import { DetectedTags } from '../../../../../services/formAutoPopulation';

interface AICheckResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: string;
  score?: number;
  status?: WishlistStatus;
  imageUrl?: string;
  extractedTags?: DetectedTags | null;
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
  imageUrl,
  extractedTags,
  onAddToWishlist,
  onSkip,
  onDecideLater
}) => {
  // Log all detected tags to console whenever they change
  useEffect(() => {
    if (extractedTags) {
      console.log('[AICheckResultModal] All detected tags:', extractedTags);
    }
  }, [extractedTags]);

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
      fullWidth: true,
      outlined: true
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
        {imageUrl && (
          <div style={{ 
            marginBottom: '16px', 
            textAlign: 'center',
            padding: '8px'
          }}>
            <img 
              src={imageUrl} 
              alt="Analyzed item" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '240px', 
                objectFit: 'contain',
                borderRadius: '8px',
                background: '#f3f4f6',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }} 
            />
          </div>
        )}
        
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
    </Modal>
  );
};

export default AICheckResultModal;
