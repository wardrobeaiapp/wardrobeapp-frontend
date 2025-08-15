import React from 'react';
import { FaStar } from 'react-icons/fa';
import { AIHistoryItem, WishlistStatus, UserActionStatus } from '../../../../../types';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  CloseButton
} from '../../../../../pages/HomePage.styles';
import {
  ItemImageContainer,
  ItemImage,
  ItemDetails,
  DetailRow,
  DetailLabel,
  DetailValue,
  ButtonsContainer
} from '../../../wardrobe/modals/ItemViewModal.styles';
import Button from '../../../../common/Button';

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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const showActionButtons = (item.type === 'check' && item.userActionStatus === UserActionStatus.PENDING) ||
                             (item.type === 'recommendation' && item.userActionStatus === UserActionStatus.SAVED) ||
                             (item.type === 'recommendation' && item.userActionStatus === UserActionStatus.DISMISSED);
  const showAppliedButtons = item.type === 'recommendation' && item.userActionStatus === UserActionStatus.SAVED;
  const showSaveButton = item.type === 'recommendation' && item.userActionStatus === UserActionStatus.DISMISSED;

  return (
    <Modal onClick={handleOverlayClick}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{item.title}</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          {item.type === 'check' && item.image && (
            <ItemImageContainer>
              <ItemImage src={item.image} alt="Outfit check" />
            </ItemImageContainer>
          )}

          {item.description && (
            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.5',
                margin: '0'
              }}>{item.description}</p>
            </div>
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

            {item.status && (
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

          {showActionButtons && (
            <ButtonsContainer>
              {showAppliedButtons ? (
                <>
                  <Button fullWidth onClick={() => onApply?.(item)}>
                    Applied
                  </Button>
                  <Button variant="secondary" fullWidth onClick={() => onDismiss?.(item)}>
                    Dismiss
                  </Button>
                </>
              ) : showSaveButton ? (
                <Button fullWidth onClick={() => onMoveToWishlist?.(item)}>
                  Save
                </Button>
              ) : (
                <>
                  <Button fullWidth onClick={() => onMoveToWishlist?.(item)}>
                    Move to Wishlist
                  </Button>
                  <Button fullWidth variant="secondary" onClick={() => onDismiss?.(item)}>
                    Dismiss
                  </Button>
                </>
              )}
            </ButtonsContainer>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default HistoryDetailModal;
