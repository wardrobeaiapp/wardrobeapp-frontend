import React from 'react';
import { FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../../../../types';
import { Modal, ModalAction } from '../../../../common/Modal';
import {
  ItemDetails,
} from '../../../wardrobe/modals/ItemViewModal.styles';
import { AnalysisText } from './AICheckResultModal.styles';
import { DetailLabel, DetailRow, DetailValue } from '../../../wardrobe/modals/modalCommon.styles';
import { DetectedTags } from '../../../../../services/ai/formAutoPopulation';

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
  error?: string; // Error type from Claude API
  errorDetails?: string; // Detailed error message
  finalRecommendation?: string; // Final recommendation from Claude
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
  onDecideLater,
  error,
  errorDetails,
  finalRecommendation
}) => {
  // Tags are now logged in AICheckModal
  // We still display them here if passed from parent component

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
        
        <AnalysisText 
          dangerouslySetInnerHTML={{
            __html: analysisResult
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br />')
          }}
        />
        
        {/* Final Recommendation - Full width, before other details */}
        {finalRecommendation && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: finalRecommendation.toLowerCase().includes('recommend') ? '#ecfdf5' : '#fef2f2',
            border: `2px solid ${finalRecommendation.toLowerCase().includes('recommend') ? '#d1fae5' : '#fecaca'}`,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '4px'
            }}>
              Final Recommendation
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 'bold',
              color: finalRecommendation.toLowerCase().includes('recommend') ? '#059669' : '#dc2626',
              lineHeight: '1.4'
            }}>
              {finalRecommendation}
            </div>
          </div>
        )}
        
        <ItemDetails>
          {/* Show error information if present */}
          {error && (
            <DetailRow>
              <DetailLabel style={{ color: '#e11d48' }}>Error:</DetailLabel>
              <DetailValue style={{ color: '#e11d48' }}>
                {error.replace(/_/g, ' ')}
              </DetailValue>
            </DetailRow>
          )}
          
          {/* Show error details if present */}
          {errorDetails && (
            <DetailRow>
              <DetailLabel style={{ color: '#e11d48' }}>Details:</DetailLabel>
              <DetailValue style={{ color: '#e11d48', fontSize: '0.9rem' }}>
                {errorDetails}
              </DetailValue>
            </DetailRow>
          )}
          
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
