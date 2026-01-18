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
          console.log('🔍 useAIHistory - Raw service response:', {
            resultSuccess: result.success,
            historyLength: result.history?.length,
            firstItem: result.history?.[0]
          });
          
          // Preserve rich data from database while maintaining AIHistoryItem compatibility
          const transformedHistory: AIHistoryItem[] = result.history.map((item: any, index: number) => {
            console.log(`🔍 useAIHistory - Transforming item ${index}:`, {
              itemId: item.id,
              serviceResponseFields: Object.keys(item),
              compatibleItemsField: item.compatibleItems,
              outfitCombinationsField: item.outfitCombinations,
              hasCompatibleItems: !!item.compatibleItems,
              hasOutfitCombinations: !!item.outfitCombinations && item.outfitCombinations.length > 0,
              itemDetails: item.itemDetails
            });
            
            // Check if compatibleItems and outfitCombinations exist and have data
            const hasRealCompatibleItems = item.compatibleItems && 
              typeof item.compatibleItems === 'object' && 
              Object.keys(item.compatibleItems).length > 0;
            
            const hasRealOutfitCombinations = item.outfitCombinations && 
              Array.isArray(item.outfitCombinations) && 
              item.outfitCombinations.length > 0;

            console.log(`🔍 useAIHistory - Rich data check for item ${index}:`, {
              hasRealCompatibleItems,
              hasRealOutfitCombinations,
              compatibleItemsType: typeof item.compatibleItems,
              outfitCombinationsType: typeof item.outfitCombinations
            });
            
            // Create richData object
            const richDataObject = {
              compatibleItems: item.compatibleItems || {},
              outfitCombinations: item.outfitCombinations || [],
              suitableScenarios: item.suitableScenarios || [],
              seasonScenarioCombinations: item.seasonScenarioCombinations || [],
              coverageGapsWithNoOutfits: item.coverageGapsWithNoOutfits || [],
              itemDetails: item.itemDetails || {},
              recommendationText: item.recommendationText,
              rawAnalysis: item.rawAnalysis
            };
            
            console.log(`🔍 useAIHistory - Created richData for item ${index}:`, {
              richDataKeys: Object.keys(richDataObject),
              compatibleItemsKeys: Object.keys(richDataObject.compatibleItems),
              outfitCombinationsLength: richDataObject.outfitCombinations.length,
              fullRichData: richDataObject
            });
            
            const transformedItem = {
              id: item.id,
              type: 'check' as const,
              title: item.title || `AI Check: ${item.itemDetails?.name || 'Unknown Item'}`,
              description: item.description || item.feedback || 'AI analysis completed',
              summary: item.summary || `Score: ${item.score}/10`,
              score: item.score || 0,
              image: item.itemDetails?.imageUrl,
              date: new Date(item.analysisDate || item.createdAt),
              status: item.itemDetails?.wishlistStatus || item.status || 'pending',
              userActionStatus: item.userActionStatus || 'pending',
              // Preserve rich analysis data for detail modal
              richData: richDataObject
            };
            
            console.log(`🔍 useAIHistory - Final transformed item ${index}:`, {
              transformedItemId: transformedItem.id,
              hasRichDataField: !!transformedItem.richData,
              richDataCompatibleItemsKeys: Object.keys(transformedItem.richData.compatibleItems),
              richDataOutfitCombinationsLength: transformedItem.richData.outfitCombinations.length
            });
            
            return transformedItem;
          });
          
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

  const handleHistoryItemClick = (itemIdOrItem: any) => {
    console.log('🔍 handleHistoryItemClick called with:', itemIdOrItem, typeof itemIdOrItem);
    
    // Handle both ID string and full item object
    let fullItem;
    if (typeof itemIdOrItem === 'string') {
      // Find the transformed item with richData by ID
      fullItem = historyItems.find(item => item.id === itemIdOrItem);
      console.log('🔍 Found full item by ID:', fullItem?.id, !!(fullItem as any)?.richData);
    } else {
      // Use the full item object directly
      fullItem = itemIdOrItem;
      console.log('🔍 Using full item object:', fullItem?.id, !!fullItem?.richData);
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
