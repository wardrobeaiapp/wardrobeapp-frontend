import React from 'react';
import { FaStar } from 'react-icons/fa';
import { WishlistStatus, UserActionStatus } from '../../../../../types';
import { AIHistoryItem } from '../../../../../types/ai';
import { Modal, ModalAction } from '../../../../common/Modal';
import { ItemDetails } from '../../../wardrobe/modals/ItemViewModal.styles';
import {
  ItemImageContainer,
  ItemImage,
  DetailRow,
  DetailLabel,
  DetailValue,
} from '../../../wardrobe/modals/modalCommon.styles';
import CompatibleItemsSection from '../AICheckResultModal/CompatibleItemsSection';
import OutfitCombinations from '../AICheckResultModal/OutfitCombinations';
import RecommendationSection from '../AICheckResultModal/RecommendationSection';

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: AIHistoryItem | null;
  onMoveToWishlist?: (item: AIHistoryItem) => void;
  onDismiss?: (item: AIHistoryItem) => void;
  onApply?: (item: AIHistoryItem) => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onMoveToWishlist,
  onDismiss,
  onApply
}) => {
  if (!isOpen || !item) return null;



  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusDisplay = (status: WishlistStatus) => {
    switch (status) {
      case WishlistStatus.APPROVED:
        return 'Approved';
      case WishlistStatus.POTENTIAL_ISSUE:
        return 'Potential Issue';
      case WishlistStatus.NOT_REVIEWED:
        return 'Not Reviewed';
      default:
        return status;
    }
  };

  const getUserActionDisplay = (userActionStatus: UserActionStatus) => {
    switch (userActionStatus) {
      case UserActionStatus.SAVED:
        return 'Saved';
      case UserActionStatus.DISMISSED:
        return 'Dismissed';
      case UserActionStatus.PENDING:
        return 'Pending';
      case UserActionStatus.APPLIED:
        return 'Applied';
      default:
        return userActionStatus;
    }
  };

  const showActionButtons = (item.type === 'check' && item.userActionStatus === UserActionStatus.PENDING) ||
                             (item.type === 'recommendation' && item.userActionStatus === UserActionStatus.SAVED) ||
                             (item.type === 'recommendation' && item.userActionStatus === UserActionStatus.DISMISSED);
  const showAppliedButtons = item.type === 'recommendation' && item.userActionStatus === UserActionStatus.SAVED;
  const showSaveButton = item.type === 'recommendation' && item.userActionStatus === UserActionStatus.DISMISSED;

  const actions: ModalAction[] = [];
  if (showActionButtons) {
    if (showAppliedButtons) {
      actions.push(
        { label: 'Applied', onClick: () => onApply?.(item), variant: 'primary', fullWidth: true },
        { label: 'Dismiss', onClick: () => onDismiss?.(item), variant: 'secondary', fullWidth: true }
      );
    } else if (showSaveButton) {
      actions.push(
        { label: 'Save', onClick: () => onMoveToWishlist?.(item), variant: 'primary', fullWidth: true }
      );
    } else {
      actions.push(
        { label: 'Move to Wishlist', onClick: () => onMoveToWishlist?.(item), variant: 'primary', fullWidth: true },
        { label: 'Dismiss', onClick: () => onDismiss?.(item), variant: 'secondary', fullWidth: true }
      );
    }
  }

  // Debug logging - only for check items
  if (item.type === 'check') {
    const checkItem = item as any; // Type assertion for debugging
    console.log('🔍 HistoryDetailModal - Debug item data:', {
      itemType: item.type,
      hasRichData: !!checkItem.richData,
      compatibleItemsKeys: checkItem.richData ? Object.keys(checkItem.richData.compatibleItems || {}) : [],
      outfitCombinationsLength: checkItem.richData?.outfitCombinations?.length || 0,
      fullItem: item
    });
  }

  // Check if we have rich data to display visual format (only for check items)
  const hasRichData = item.type === 'check' && (item as any).richData && 
    (Object.keys((item as any).richData.compatibleItems || {}).length > 0 || 
     (item as any).richData.outfitCombinations?.length > 0);

  console.log('🎯 HistoryDetailModal - hasRichData:', hasRichData);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item.title}
      actions={actions}
      size="md"
    >
          {item.type === 'check' && item.image && (
            <ItemImageContainer>
              <ItemImage src={item.image} alt="Outfit check" />
            </ItemImageContainer>
          )}

          {hasRichData ? (
            <>
              {/* Rich visual display - same as AICheckResultModal */}
              <CompatibleItemsSection compatibleItems={(item as any).richData.compatibleItems} />

              <OutfitCombinations
                outfitCombinations={(item as any).richData.outfitCombinations}
                seasonScenarioCombinations={(item as any).richData.seasonScenarioCombinations}
                coverageGapsWithNoOutfits={(item as any).richData.coverageGapsWithNoOutfits}
                itemSubcategory={(item as any).richData.itemDetails?.subcategory || ''}
                imageUrl={item.image}
                compatibleItems={(item as any).richData.compatibleItems}
                selectedWishlistItem={(item as any).richData.itemDetails}
              />

              {(item as any).richData.recommendationText && (
                <RecommendationSection 
                  recommendationAction="RECOMMEND"
                  recommendationText={(item as any).richData.recommendationText}
                  score={item.score}
                />
              )}
            </>
          ) : (
            <>
              {/* Fallback to text display when no rich data */}
              {item.description && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ 
                    color: '#6b7280', 
                    lineHeight: '1.5',
                    margin: '0'
                  }}>{item.description}</p>
                </div>
              )}
            </>
          )}

          <ItemDetails>
            

            {item.type === 'check' && item.score && (
              <DetailRow>
                <DetailLabel>Score</DetailLabel>
                <DetailValue style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                  <FaStar size={16} color="#f59e0b" />
                  {item.score}/10
                </DetailValue>
              </DetailRow>
            )}

            {item.type === 'check' && item.status && (
              <DetailRow>
                <DetailLabel>Analysis Status</DetailLabel>
                <DetailValue>{getStatusDisplay(item.status)}</DetailValue>
              </DetailRow>
            )}

            {item.userActionStatus && (
              <DetailRow>
                <DetailLabel>User Action</DetailLabel>
                <DetailValue>{getUserActionDisplay(item.userActionStatus)}</DetailValue>
              </DetailRow>
            )}

            {item.type === 'recommendation' && item.season && (
              <DetailRow>
                <DetailLabel>Season</DetailLabel>
                <DetailValue>{item.season}</DetailValue>
              </DetailRow>
            )}

            {item.type === 'recommendation' && item.scenario && (
              <DetailRow>
                <DetailLabel>Scenario</DetailLabel>
                <DetailValue>{item.scenario}</DetailValue>
              </DetailRow>
            )}

            <DetailRow>
              <DetailLabel>Date</DetailLabel>
              <DetailValue>{formatDate(item.date)}</DetailValue>
            </DetailRow>
          </ItemDetails>
    </Modal>
  );
};

export default HistoryDetailModal;
