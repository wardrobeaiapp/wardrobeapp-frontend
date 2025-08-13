import React from 'react';
import { FaSearch, FaMagic, FaClipboardList, FaStar } from 'react-icons/fa';
import { WishlistStatus, UserActionStatus } from '../../types';
import {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalText,
  ActionButtonsContainer,
  CloseButton,
  DetailSection,
  DetailLabel,
  DetailValue,
  ScoreContainer,
  StatusContainer,
  StatusBadge,
  ActionButton,
  DismissButton,
  TagsContainer,
  Tag
} from './HistoryDetailModal.styles';

interface HistoryItemData {
  id: string;
  type: 'check' | 'recommendation';
  title: string;
  description: string;
  date: Date;
  status?: WishlistStatus;
  userActionStatus?: UserActionStatus;
  score?: number;
  season?: string;
  scenario?: string;
}

interface HistoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: HistoryItemData | null;
  onMoveToWishlist?: (item: HistoryItemData) => void;
  onDismiss?: (item: HistoryItemData) => void;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onMoveToWishlist,
  onDismiss
}) => {
  if (!isOpen || !item) return null;

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'check':
        return <FaSearch size={20} />;
      case 'recommendation':
        return <FaMagic size={20} />;
      default:
        return <FaClipboardList size={20} />;
    }
  };

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
        return '✅ Approved';
      case WishlistStatus.POTENTIAL_ISSUE:
        return '⚠️ Potential Issue';
      case WishlistStatus.NOT_REVIEWED:
        return '⏳ Not Reviewed';
      default:
        return status;
    }
  };

  const getUserActionDisplay = (userActionStatus: UserActionStatus) => {
    switch (userActionStatus) {
      case UserActionStatus.SAVED:
        return '💾 Saved';
      case UserActionStatus.DISMISSED:
        return '❌ Dismissed';
      case UserActionStatus.PENDING:
        return '⏳ Pending';
      default:
        return userActionStatus;
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const showActionButtons = item.type === 'check' && item.userActionStatus === UserActionStatus.PENDING;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            {getHistoryIcon(item.type)}
            {item.type === 'check' ? 'AI Check Details' : 'Recommendation Details'}
          </ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <DetailSection>
            <DetailLabel>Title</DetailLabel>
            <DetailValue>{item.title}</DetailValue>
          </DetailSection>

          <DetailSection>
            <DetailLabel>Description</DetailLabel>
            <ModalText>{item.description}</ModalText>
          </DetailSection>

          <DetailSection>
            <DetailLabel>Date</DetailLabel>
            <DetailValue>{formatDate(item.date)}</DetailValue>
          </DetailSection>

          <DetailSection>
            <DetailLabel>Type</DetailLabel>
            <DetailValue style={{ textTransform: 'capitalize' }}>{item.type}</DetailValue>
          </DetailSection>

          {item.score && (
            <DetailSection>
              <DetailLabel>Score</DetailLabel>
              <ScoreContainer>
                <FaStar size={16} color="#f59e0b" />
                <DetailValue>{item.score}/10</DetailValue>
              </ScoreContainer>
            </DetailSection>
          )}

          {item.status && (
            <DetailSection>
              <DetailLabel>Analysis Status</DetailLabel>
              <StatusContainer>
                <StatusBadge $status={item.status}>
                  {getStatusDisplay(item.status)}
                </StatusBadge>
              </StatusContainer>
            </DetailSection>
          )}

          {item.userActionStatus && (
            <DetailSection>
              <DetailLabel>User Action</DetailLabel>
              <StatusContainer>
                <StatusBadge $status={item.userActionStatus === UserActionStatus.SAVED ? 'approved' : 
                                     item.userActionStatus === UserActionStatus.DISMISSED ? 'potential_issue' : 'not_reviewed'}>
                  {getUserActionDisplay(item.userActionStatus)}
                </StatusBadge>
              </StatusContainer>
            </DetailSection>
          )}

          {(item.season || item.scenario) && (
            <DetailSection>
              <DetailLabel>Tags</DetailLabel>
              <TagsContainer>
                {item.season && <Tag>{item.season}</Tag>}
                {item.scenario && <Tag>{item.scenario}</Tag>}
              </TagsContainer>
            </DetailSection>
          )}

          {showActionButtons && (
            <ActionButtonsContainer>
              <ActionButton onClick={() => onMoveToWishlist?.(item)}>
                💾 Move to Wishlist
              </ActionButton>
              <DismissButton onClick={() => onDismiss?.(item)}>
                ❌ Dismiss
              </DismissButton>
            </ActionButtonsContainer>
          )}
        </ModalBody>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default HistoryDetailModal;
