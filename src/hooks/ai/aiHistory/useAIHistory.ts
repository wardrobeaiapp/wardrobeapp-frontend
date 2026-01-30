import { useEffect, useMemo, useState } from 'react';
import { aiCheckHistoryService } from '../../../services/ai/aiCheckHistoryService';
import { supabase } from '../../../services/core/supabaseClient';
import { UserActionStatus } from '../../../types';
import { AIHistoryItem } from '../../../types/ai';
import { filterHistoryItems } from './filters';
import { HISTORY_CREATED_EVENT, type ActivityType, type CheckStatus } from './types';
import { transformHistoryRecord } from './transform';

export const useAIHistory = () => {
  const [historyItems, setHistoryItems] = useState<AIHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all');
  const [checkStatusFilter, setCheckStatusFilter] = useState<CheckStatus>('all');
  const [userActionFilter, setUserActionFilter] = useState<string>('all');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);

  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        setIsLoadingHistory(true);
        const result = await aiCheckHistoryService.getHistory({ limit: 20 });

        if (result.success && result.history) {
          console.log('[AIHistory] Loaded history items:', result.history.length);
          const transformedHistory: AIHistoryItem[] = result.history.map((item: any) => transformHistoryRecord(item));
          setHistoryItems(transformedHistory);
        } else {
          console.error('Failed to load AI Check history:', result.error);
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

  useEffect(() => {
    const handler = async (event: Event) => {
      const customEvent = event as CustomEvent<{ historyRecordId?: string }>;
      const historyRecordId = customEvent?.detail?.historyRecordId;
      if (!historyRecordId) return;

      const recordResult = await aiCheckHistoryService.getHistoryRecord(historyRecordId);
      if (!recordResult.success || !recordResult.record) return;

      const newItem = transformHistoryRecord(recordResult.record as any);

      setHistoryItems(prev => {
        const next = prev.some(i => i.id === newItem.id)
          ? prev.map(i => (i.id === newItem.id ? newItem : i))
          : [newItem, ...prev];

        const sorted = [...next].sort((a, b) => b.date.getTime() - a.date.getTime());
        return sorted.slice(0, 20);
      });
    };

    window.addEventListener(HISTORY_CREATED_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(HISTORY_CREATED_EVENT, handler as EventListener);
    };
  }, []);

  const filteredHistoryItems = useMemo(() => {
    return filterHistoryItems(historyItems, activityFilter, checkStatusFilter, userActionFilter);
  }, [historyItems, activityFilter, checkStatusFilter, userActionFilter]);

  const handleViewAllHistory = () => {
    setShowFullHistory(true);
  };

  const handleBackToMain = () => {
    setShowFullHistory(false);
  };

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

  const handleMoveToWishlist = async (itemId: string) => {
    try {
      const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'saved');

      if (!result.success) {
        throw new Error(result.error);
      }

      setHistoryItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId
            ? { ...item, userActionStatus: UserActionStatus.SAVED }
            : item
        )
      );
      setIsHistoryDetailModalOpen(false);
    } catch (error: any) {
      console.error('Failed to update record status:', error.message || error);
    }
  };

  const handleMarkAsPurchased = async (itemId: string) => {
    try {
      const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'obtained');

      if (!result.success) {
        throw new Error(result.error);
      }

      setHistoryItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId
            ? { ...item, userActionStatus: UserActionStatus.OBTAINED }
            : item
        )
      );
      setIsHistoryDetailModalOpen(false);
    } catch (error: any) {
      console.error('Failed to mark item as purchased:', error.message || error);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string): Promise<boolean> => {
    try {
      const historyItem = historyItems.find(item => item.id === itemId);

      let wardrobeItemId = historyItem?.type === 'check' ? historyItem.wardrobeItemId : undefined;

      if (!wardrobeItemId) {
        const recordResult = await aiCheckHistoryService.getHistoryRecord(itemId);
        if (!recordResult.success || !recordResult.record) {
          throw new Error(recordResult.error || 'History item not found');
        }
        const recordAny = recordResult.record as any;
        wardrobeItemId = recordAny.wardrobe_item_id || recordAny.wardrobeItemId;
      }

      console.log('[AIHistory] Remove from wishlist: cleanup');

      const cleanupResult = await aiCheckHistoryService.cleanupRichData(itemId);
      if (!cleanupResult.success) {
        console.warn('⚠️ Failed to clean AI history data:', cleanupResult.error);
        throw new Error(`Failed to clean AI history data: ${cleanupResult.error}`);
      }

      if (wardrobeItemId) {
        console.log('[AIHistory] Remove from wishlist: delete wardrobe item');
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

          let authToken = '';
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
              authToken = sessionData.session.access_token;
            }
          } catch (e) {
          }
          if (!authToken) {
            authToken = localStorage.getItem('token') || '';
          }

          const response = await fetch(`${apiUrl}/api/wardrobe-items/${wardrobeItemId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': authToken
            }
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Failed to delete wardrobe item:', errorText);
            throw new Error(`Failed to delete wardrobe item: ${response.status} - ${errorText}`);
          }

          window.dispatchEvent(
            new CustomEvent('wardrobe:changed', { detail: { type: 'deleted', id: wardrobeItemId } })
          );
        } catch (error) {
          console.error('❌ Error deleting wardrobe item:', error);
          throw new Error(`Failed to delete wardrobe item: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        throw new Error('No wardrobeItemId found on history item; cannot delete wardrobe item safely');
      }

      console.log('[AIHistory] Remove from wishlist: set dismissed status');
      const statusResult = await aiCheckHistoryService.updateRecordStatus(itemId, 'dismissed');
      if (!statusResult.success) {
        throw new Error(statusResult.error || 'Failed to set dismissed status');
      }

      setHistoryItems(prevItems => {
        if (!prevItems.some(item => item.id === itemId)) return prevItems;

        const updatedItems = prevItems.map(item =>
          item.id === itemId
            ? {
              ...item,
              userActionStatus: UserActionStatus.DISMISSED,
              ...(item.type === 'check' && item.richData ? {
                richData: {
                  ...item.richData,
                  compatibleItems: {},
                  outfitCombinations: [],
                  itemDetails: item.richData?.itemDetails ? {
                    name: item.richData.itemDetails.name,
                    imageUrl: undefined
                  } : undefined
                }
              } : {}),
              wardrobeItemId: undefined
            }
            : item
        );
        return updatedItems;
      });

      console.log('[AIHistory] Remove from wishlist: done');

      setIsHistoryDetailModalOpen(false);
      setSelectedHistoryItem(null);
      return true;
    } catch (error: any) {
      console.error('Failed to remove item from wishlist:', error.message || error);
      alert('Failed to remove item from wishlist. Please try again.');
      return false;
    }
  };

  const handleDismissHistoryItem = async (itemId: string) => {
    try {
      const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'dismissed');

      if (!result.success) {
        throw new Error(result.error);
      }

      setHistoryItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId
            ? { ...item, userActionStatus: UserActionStatus.DISMISSED }
            : item
        )
      );
      setIsHistoryDetailModalOpen(false);
    } catch (error: any) {
      console.error('Failed to update record status:', error.message || error);
    }
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
