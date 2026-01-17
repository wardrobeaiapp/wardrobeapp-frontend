import { useState, useMemo, useEffect } from 'react';
import { aiCheckHistoryService } from '../../services/ai/aiCheckHistoryService';
import { WishlistStatus, UserActionStatus } from '../../types';
import { AIHistoryItem } from '../../types/ai';

export type ActivityType = 'all' | 'check' | 'recommendation';
export type CheckStatus = 'all' | 'approved' | 'potential_issue' | 'not_reviewed';

export const useAIHistory = () => {
  const [historyItems, setHistoryItems] = useState<AIHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all');
  const [checkStatusFilter, setCheckStatusFilter] = useState<CheckStatus>('all');
  const [userActionFilter, setUserActionFilter] = useState<string>('all');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);

  // Load real AI Check history data on component mount
  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        setIsLoadingHistory(true);
        const result = await aiCheckHistoryService.getHistory({ limit: 20 }); // Limit for recent activity
        
        if (result.success && result.history) {
          // Transform the enhanced data to the simpler AIHistoryItem format
          const transformedHistory: AIHistoryItem[] = result.history.map((item: any) => ({
            id: item.id,
            type: 'check' as const,
            title: item.title || `AI Check: ${item.itemName}`,
            description: item.description || item.feedback || 'AI analysis completed',
            summary: item.summary || `Score: ${item.score}/10`,
            score: item.score || 0,
            image: item.itemImageUrl,
            date: new Date(item.analysisDate || item.createdAt),
            status: item.itemWishlistStatus || item.status || 'pending',
            userActionStatus: item.userActionStatus || 'pending'
          }));
          
          setHistoryItems(transformedHistory);
        } else {
          console.error('Failed to load AI Check history:', result.error);
          // Keep empty array on error
          setHistoryItems([]);
        }
      } catch (error) {
        console.error('Error loading AI Check history:', error);
        setHistoryItems([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistoryData();
  }, []);

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
    isLoadingHistory,
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
