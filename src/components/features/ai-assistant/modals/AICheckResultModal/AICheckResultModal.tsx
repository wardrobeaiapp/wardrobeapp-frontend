import React from 'react';
import { FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../../../../types';
import { Modal, ModalAction } from '../../../../common/Modal';
import {
  ItemDetails,
} from '../../../wardrobe/modals/ItemViewModal.styles';
import { 
  AnalysisText, 
  RecommendationBox, 
  RecommendationLabel, 
  RecommendationText,
  ImageContainer,
  PreviewImage,
  ErrorLabel,
  ErrorValue,
  ErrorDetails,
  ScoreValue
} from './AICheckResultModal.styles';
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
  recommendationAction?: string; // "SKIP" / "RECOMMEND" / "MAYBE"
  recommendationText?: string; // Human-readable explanation
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
  recommendationAction,
  recommendationText
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
          <ImageContainer>
            <PreviewImage 
              src={imageUrl} 
              alt="Analyzed item" 
            />
          </ImageContainer>
        )}
        
        <AnalysisText 
          dangerouslySetInnerHTML={{
            __html: analysisResult
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br />')
          }}
        />
        
        {/* Final Recommendation - Full width, before other details */}
        {recommendationAction && (() => {
          const recommendation = recommendationAction.toLowerCase();
          const isRecommend = recommendation.startsWith('recommend');
          const isMediumScore = score !== undefined && score >= 4 && score <= 8 && !isRecommend;
          
          return (
            <RecommendationBox
              $isRecommend={isRecommend}
              $isMediumScore={isMediumScore}
            >
              <RecommendationLabel>
                Final Recommendation
              </RecommendationLabel>
              <RecommendationText>
                {recommendationAction}
              </RecommendationText>
              {recommendationText && (
                <RecommendationText style={{ marginTop: '8px', fontSize: '0.9em', opacity: 0.9 }}>
                  {recommendationText}
                </RecommendationText>
              )}
            </RecommendationBox>
          );
        })()}
        
        <ItemDetails>
          {/* Show error information if present */}
          {error && (
            <DetailRow>
              <ErrorLabel>Error:</ErrorLabel>
              <ErrorValue>
                {error.replace(/_/g, ' ')}
              </ErrorValue>
            </DetailRow>
          )}
          
          {/* Show error details if present */}
          {errorDetails && (
            <DetailRow>
              <ErrorLabel>Details:</ErrorLabel>
              <ErrorDetails>
                {errorDetails}
              </ErrorDetails>
            </DetailRow>
          )}
          
          {score !== undefined && (
            <DetailRow>
              <DetailLabel>Score:</DetailLabel>
              <ScoreValue>
                <FaStar size={14} color="#f59e0b" />
                {score}/10
              </ScoreValue>
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
