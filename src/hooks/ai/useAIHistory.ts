import { useState, useMemo, useEffect } from 'react';
import { aiCheckHistoryService } from '../../services/ai/aiCheckHistoryService';
import { supabase } from '../../services/core/supabaseClient';
import { WishlistStatus, UserActionStatus } from '../../types';
import { AIHistoryItem } from '../../types/ai';

export type ActivityType = 'all' | 'check' | 'recommendation';
export type CheckStatus = 'all' | 'approved' | 'potential_issue' | 'not_recommended' | 'not_reviewed';

export const useAIHistory = () => {
  const HISTORY_CREATED_EVENT = 'ai-history:created';
  const [historyItems, setHistoryItems] = useState<AIHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [activityFilter, setActivityFilter] = useState<ActivityType>('all');
  const [checkStatusFilter, setCheckStatusFilter] = useState<CheckStatus>('all');
  const [userActionFilter, setUserActionFilter] = useState<string>('all');
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [isHistoryDetailModalOpen, setIsHistoryDetailModalOpen] = useState(false);

  const transformHistoryRecord = (item: any): AIHistoryItem => {
    let richDataObject;

    if (item.analysisData) {
      richDataObject = {
        compatibleItems: item.analysisData.compatibleItems || {},
        outfitCombinations: item.analysisData.outfitCombinations || [],
        suitableScenarios: item.analysisData.suitableScenarios || [],
        seasonScenarioCombinations: item.analysisData.seasonScenarioCombinations || [],
        coverageGapsWithNoOutfits: item.analysisData.coverageGapsWithNoOutfits || [],
        itemDetails: item.analysisData.itemDetails || item.itemDetails || {},
        recommendationText: item.analysisData.recommendationText || item.recommendationText,
        analysis: item.analysisData.analysis || item.analysis,
        rawAnalysis: item.rawAnalysis
      };
    } else {
      richDataObject = undefined;
    }

    const score = item.analysisData ? (item.analysisData.score || item.score || 0) : 0;
    let mappedStatus: WishlistStatus;
    if (score >= 8) {
      mappedStatus = WishlistStatus.APPROVED;
    } else if (score >= 6) {
      mappedStatus = WishlistStatus.POTENTIAL_ISSUE;
    } else {
      mappedStatus = WishlistStatus.NOT_RECOMMENDED;
    }

    return {
      id: item.id,
      type: 'check' as const,
      title: item.title || `AI Check: ${item.itemDetails?.name || 'Unknown Item'}`,
      description: item.description || item.feedback || 'AI analysis completed',
      summary: item.summary || `Score: ${score}/10`,
      score: score,
      image: item.image_url || item.itemDetails?.imageUrl,
      wardrobeItemId: item.wardrobe_item_id || item.wardrobeItemId,
      date: new Date(item.analysisDate || item.createdAt),
      status: mappedStatus,
      userActionStatus: item.userActionStatus || UserActionStatus.PENDING,
      richData: richDataObject
    };
  };

  // Load real AI Check history data on component mount
  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        setIsLoadingHistory(true);
        const result = await aiCheckHistoryService.getHistory({ limit: 20 }); // Limit for recent activity
        
        if (result.success && result.history) {
          console.log('[AIHistory] Loaded history items:', result.history.length);
          
          // Preserve rich data from database while maintaining AIHistoryItem compatibility
          const transformedHistory: AIHistoryItem[] = result.history.map((item: any) => transformHistoryRecord(item));
          
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
        if (checkStatusFilter === 'not_recommended' && item.status !== WishlistStatus.NOT_RECOMMENDED) {
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

  const handleOpenHistoryDetailModal = async (itemIdOrItem: string | AIHistoryItem) => {
    // Handle both ID string and full item object
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
      // Call the service to update status in database
      const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'saved');
      
      // Check if service returned error
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update local state
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
      // Call the service to update status in database
      const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'obtained');
      
      // Check if service returned error
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update local state
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
      // Find the history item to get the wardrobe item details.
      // NOTE: Right after an AI check, the history record may exist in DB but not yet be in local state.
      const historyItem = historyItems.find(item => item.id === itemId);

      // Capture wardrobe item id BEFORE cleanup detaches it in DB
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
      
      // Step 1: Clean extra data from AI history item
      const cleanupResult = await aiCheckHistoryService.cleanupRichData(itemId);
      if (cleanupResult.success) {
        // ok
      } else {
        console.warn('⚠️ Failed to clean AI history data:', cleanupResult.error);
        throw new Error(`Failed to clean AI history data: ${cleanupResult.error}`);
      }
      
      // Step 2: Remove the wardrobe item from wardrobe table (MUST use real wardrobeItemId)
      if (wardrobeItemId) {
        console.log('[AIHistory] Remove from wishlist: delete wardrobe item');
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';

          // Prefer Supabase session token to avoid stale/expired localStorage tokens
          let authToken = '';
          try {
            const { data: sessionData } = await supabase.auth.getSession();
            if (sessionData?.session?.access_token) {
              authToken = sessionData.session.access_token;
            }
          } catch (e) {
            // Ignore and fallback to localStorage
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

      // Step 2.5: Persist status change ONLY AFTER wardrobe item is deleted
      console.log('[AIHistory] Remove from wishlist: set dismissed status');
      const statusResult = await aiCheckHistoryService.updateRecordStatus(itemId, 'dismissed');
      if (!statusResult.success) {
        throw new Error(statusResult.error || 'Failed to set dismissed status');
      }
      
      // Step 3: Update local state - clear rich data and update status to dismissed
      setHistoryItems(prevItems => {
        if (!prevItems.some(item => item.id === itemId)) return prevItems;

        const updatedItems = prevItems.map(item =>
          item.id === itemId
            ? { 
                ...item, 
                userActionStatus: UserActionStatus.DISMISSED, // Step 3: Change status to dismissed
                // Only clear richData if it exists (only on AICheckHistoryItem)
                ...(item.type === 'check' && item.richData ? {
                  richData: {
                    ...item.richData,
                    // Clear heavy data immediately
                    compatibleItems: {},
                    outfitCombinations: [],
                    itemDetails: item.richData?.itemDetails ? {
                      name: item.richData.itemDetails.name,
                      // Remove imageUrl and other heavy fields
                      imageUrl: undefined
                    } : undefined
                  }
                } : {}),
                // Also clear the wardrobe item reference
                wardrobeItemId: undefined
              }
            : item
        );
        return updatedItems;
      });

      console.log('[AIHistory] Remove from wishlist: done');
      
      // Close modal AFTER all steps are complete
      setIsHistoryDetailModalOpen(false);
      setSelectedHistoryItem(null);
      return true;
    } catch (error: any) {
      console.error('Failed to remove item from wishlist:', error.message || error);
      // Show user-friendly error message
      alert('Failed to remove item from wishlist. Please try again.');
      return false;
    }
  };

  const handleDismissHistoryItem = async (itemId: string) => {
    try {
      // Call the service to update status in database  
      const result = await aiCheckHistoryService.updateRecordStatus(itemId, 'dismissed');
      
      // Check if service returned error
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update local state
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
    handleOpenHistoryDetailModal,
    handleCloseHistoryDetailModal,
    handleMoveToWishlist,
    handleMarkAsPurchased,
    handleRemoveFromWishlist,
    handleDismissHistoryItem,
  };
};
