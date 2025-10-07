import React from 'react';
import { FaStar } from 'react-icons/fa';
import { WishlistStatus } from '../../../../../types';
import { Modal, ModalAction } from '../../../../common/Modal';
import {
  ItemDetails,
} from '../../../wardrobe/modals/ItemViewModal.styles';
import { 
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
import { 
  ItemCard,
  ItemImageContainer,
  ItemImage,
  PlaceholderImage,
  ItemContent,
  ItemName,
} from '../../../wardrobe/forms/OutfitForm/OutfitForm.styles';

interface AICheckResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: string; // Technical analysis (for debugging, not displayed)
  suitableScenarios?: string[]; // Clean scenarios for display
  compatibleItems?: { [category: string]: any[] }; // Compatible items by category
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
  suitableScenarios,
  compatibleItems,
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
  // Clean user interface ready

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
        
        {/* User-friendly display instead of technical analysis */}
        {suitableScenarios && suitableScenarios.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#374151' }}>
              Perfect for:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {suitableScenarios.map((scenario, index) => (
                <span 
                  key={index}
                  style={{
                    background: '#f3f4f6',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    color: '#374151'
                  }}
                >
                  {scenario}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {compatibleItems && Object.keys(compatibleItems).length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#374151' }}>
              Works well with:
            </h4>
            {Object.entries(compatibleItems).map(([category, items]) => (
              items.length > 0 && (
                <div key={category} style={{ marginBottom: '12px' }}>
                  <h5 style={{ 
                    margin: '0 0 6px 0', 
                    fontSize: '14px', 
                    color: '#6b7280',
                    textTransform: 'capitalize'
                  }}>
                    {category === 'one_piece' ? 'Dresses' : category}:
                  </h5>
                  <div style={{ paddingLeft: '12px' }}>
                    {/* Check if we have full item objects with IDs for card display */}
                    {items.some(item => item.id) ? (
                      // Render as popup-style cards when we have full item objects
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                        gap: '0.75rem', 
                        marginTop: '8px' 
                      }}>
                        {items.map((item, index) => (
                          <ItemCard key={item.id || index} $isSelected={false}>
                            <ItemImageContainer>
                              {item.imageUrl ? (
                                <ItemImage 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <PlaceholderImage>No Image</PlaceholderImage>
                              )}
                            </ItemImageContainer>
                            <ItemContent>
                              <ItemName>{item.name}</ItemName>
                              {/* Hide category/color details for cleaner compatibility cards */}
                            </ItemContent>
                          </ItemCard>
                        ))}
                      </div>
                    ) : (
                      // Fallback to text when we don't have full item objects
                      <>
                        {items.map((item, index) => (
                          <div key={index} style={{ 
                            fontSize: '14px', 
                            color: '#374151',
                            marginBottom: '4px'
                          }}>
                            • {item.name || 'Unnamed item'}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
        
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
