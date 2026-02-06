import { useMemo } from 'react';
import { filterHistoryItems } from './filters';
import { useAIHistoryState } from './useAIHistoryState';
import { useAIHistoryData } from './useAIHistoryData';
import { useAIHistoryModals } from './useAIHistoryModals';
import { useAIHistoryActions } from './useAIHistoryActions';

export const useAIHistory = () => {
  const {
    historyItems,
    isLoadingHistory,
    showFullHistory,
    activityFilter,
    checkStatusFilter,
    userActionFilter,
    selectedHistoryItem,
    isHistoryDetailModalOpen,
    setHistoryItems,
    setIsLoadingHistory,
    setShowFullHistory,
    setActivityFilter,
    setCheckStatusFilter,
    setUserActionFilter,
    setSelectedHistoryItem,
    setIsHistoryDetailModalOpen,
  } = useAIHistoryState();

  // Initialize data loading
  useAIHistoryData(setHistoryItems, setIsLoadingHistory);

  // Modal management
  const {
    handleOpenHistoryDetailModal,
    handleCloseHistoryDetailModal,
    handleViewAllHistory: modalHandleViewAllHistory,
    handleBackToMain: modalHandleBackToMain,
  } = useAIHistoryModals(
    selectedHistoryItem,
    isHistoryDetailModalOpen,
    setSelectedHistoryItem,
    setIsHistoryDetailModalOpen,
    historyItems
  );

  // Action handlers
  const {
    handleMoveToWishlist,
    handleMarkAsPurchased,
    handleRemoveFromWishlist,
    handleDismissHistoryItem,
  } = useAIHistoryActions(historyItems, setHistoryItems, setIsHistoryDetailModalOpen);

  const filteredHistoryItems = useMemo(() => {
    return filterHistoryItems(historyItems, activityFilter, checkStatusFilter, userActionFilter);
  }, [historyItems, activityFilter, checkStatusFilter, userActionFilter]);

  const handleViewAllHistory = () => {
    setShowFullHistory(true);
    modalHandleViewAllHistory();
  };

  const handleBackToMain = () => {
    setShowFullHistory(false);
    modalHandleBackToMain();
  };

  return {
    historyItems,
    isLoadingHistory,
    showFullHistory,
    activityFilter,
    checkStatusFilter,
    userActionFilter,
    filteredHistoryItems,
    selectedHistoryItem,
    isHistoryDetailModalOpen,

    setHistoryItems,
    setActivityFilter,
    setCheckStatusFilter,
    setUserActionFilter,
    handleViewAllHistory,
    handleBackToMain,
    handleOpenHistoryDetailModal,
    handleCloseHistoryDetailModal,
    handleMoveToWishlist,
    handleMarkAsPurchased,
    handleRemoveFromWishlist,
    handleDismissHistoryItem,
  };
};
