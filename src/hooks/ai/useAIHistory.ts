import { useState, useMemo } from 'react';
import { mockHistoryItems } from '../../mocks/aiAssistantMockData';
import { WishlistStatus, UserActionStatus } from '../../types';

export type ActivityType = 'all' | 'check' | 'recommendation';
export type CheckStatus = 'all' | 'approved' | 'potential_issue' | 'not_reviewed';

export const useAIHistory = () => {
  const [historyItems, setHistoryItems] = useState(mockHistoryItems);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all');
  const [checkStatusFilter, setCheckStatusFilter] = useState<CheckStatus>('all');
  const [userActionFilter, setUserActionFilter] = useState<string>('all');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);

  const filteredHistoryItems = useMemo(() => {
    return historyItems.filter(item => {
      // Filter by activity type
      if (activityFilter !== 'all' && item.type !== activityFilter) {
        return false;
      }

      // Filter by check status (only for 'check' type items)
      if (item.type === 'check' && checkStatusFilter !== 'all') {
        if (checkStatusFilter === 'approved' && item.status !== WishlistStatus.APPROVED) {
          return false;
        }
        if (checkStatusFilter === 'potential_issue' && item.status !== WishlistStatus.POTENTIAL_ISSUE) {
          return false;
        }
        if (checkStatusFilter === 'not_reviewed' && item.status !== WishlistStatus.NOT_REVIEWED) {
          return false;
        }
      }

      // Filter by user action status
      if (userActionFilter !== 'all' && item.userActionStatus !== userActionFilter) {
        return false;
      }

      return true;
    });
  }, [historyItems, activityFilter, checkStatusFilter, userActionFilter]);

  const handleViewAllHistory = () => {
    setShowFullHistory(true);
  };

  const handleBackToMain = () => {
    setShowFullHistory(false);
  };

  const handleHistoryItemClick = (item: any) => {
    setSelectedHistoryItem(item);
    setIsHistoryDetailModalOpen(true);
  };

  const handleCloseHistoryDetailModal = () => {
    setIsHistoryDetailModalOpen(false);
    setSelectedHistoryItem(null);
  };

  const handleMoveToWishlist = (itemId: string) => {
    setHistoryItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, userActionStatus: UserActionStatus.SAVED }
          : item
      )
    );
    setIsHistoryDetailModalOpen(false);
  };

  const handleDismissHistoryItem = (itemId: string) => {
    setHistoryItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, userActionStatus: UserActionStatus.DISMISSED }
          : item
      )
    );
    setIsHistoryDetailModalOpen(false);
  };

  return {
    // State
    historyItems,
    showFullHistory,
    activityFilter,
    checkStatusFilter,
    userActionFilter,
    filteredHistoryItems,
    selectedHistoryItem,
    isHistoryDetailModalOpen,
    
    // Handlers
    setHistoryItems,
    setActivityFilter,
    setCheckStatusFilter,
    setUserActionFilter,
    handleViewAllHistory,
    handleBackToMain,
    handleHistoryItemClick,
    handleCloseHistoryDetailModal,
    handleMoveToWishlist,
    handleDismissHistoryItem,
  };
};
