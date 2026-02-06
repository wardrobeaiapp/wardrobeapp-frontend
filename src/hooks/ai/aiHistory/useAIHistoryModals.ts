import { AIHistoryItem } from '../../../types/ai';

export const useAIHistoryModals = (
  selectedHistoryItem: any,
  isHistoryDetailModalOpen: boolean,
  setSelectedHistoryItem: (item: any) => void,
  setIsHistoryDetailModalOpen: (open: boolean) => void,
  historyItems: AIHistoryItem[]
) => {
  const handleOpenHistoryDetailModal = async (itemIdOrItem: string | AIHistoryItem) => {
    let fullItem;
    if (typeof itemIdOrItem === 'string') {
      fullItem = historyItems.find(item => item.id === itemIdOrItem);
    } else {
      fullItem = itemIdOrItem;
    }

    if (fullItem) {
      setSelectedHistoryItem(fullItem);
      setIsHistoryDetailModalOpen(true);
    } else {
      console.error('🔍 Could not find history item:', itemIdOrItem);
    }
  };

  const handleCloseHistoryDetailModal = () => {
    setIsHistoryDetailModalOpen(false);
    setSelectedHistoryItem(null);
  };

  const handleViewAllHistory = () => {
    // This will be handled by parent hook with setShowFullHistory
    console.log('📋 View all history requested');
  };

  const handleBackToMain = () => {
    // This will be handled by parent hook with setShowFullHistory
    console.log('🔙 Back to main view requested');
  };

  return {
    handleOpenHistoryDetailModal,
    handleCloseHistoryDetailModal,
    handleViewAllHistory,
    handleBackToMain,
  };
};
