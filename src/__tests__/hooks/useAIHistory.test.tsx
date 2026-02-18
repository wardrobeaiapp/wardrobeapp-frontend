import { renderHook, act, waitFor } from '@testing-library/react';
import { useAIHistory } from '../../hooks/ai/useAIHistory';
import { aiCheckHistoryService } from '../../services/ai/aiCheckHistoryService';
import { UserActionStatus, WishlistStatus } from '../../types';
import { AIHistoryItem } from '../../types/ai';

// Mock aiCheckHistoryService
jest.mock('../../services/ai/aiCheckHistoryService', () => ({
  aiCheckHistoryService: {
    getHistory: jest.fn(),
    getHistoryRecord: jest.fn(),
    updateRecordStatus: jest.fn(),
    cleanupRichData: jest.fn()
  }
}));

jest.mock('../../services/core/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn()
    }
  }
}));

// Mock console methods
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

Object.defineProperty(console, 'log', { value: mockConsole.log });
Object.defineProperty(console, 'warn', { value: mockConsole.warn });
Object.defineProperty(console, 'error', { value: mockConsole.error });

describe('useAIHistory', () => {
  const mockAICheckHistoryService = aiCheckHistoryService as jest.Mocked<typeof aiCheckHistoryService>;

  // Mock raw service response structure (what the service actually returns)
  const mockServiceResponse = {
    success: true,
    history: [{
      // Raw service fields that get transformed by the hook
      id: 'history-123',
      score: 8,
      title: 'Test Item Analysis',
      description: 'AI analysis of test item', 
      summary: 'Great versatile piece',
      feedback: 'AI analysis completed',
      itemDetails: {
        name: 'Test Item',
        imageUrl: 'test-image.jpg',
        wishlistStatus: WishlistStatus.APPROVED,
        category: 'tops'
      },
      userActionStatus: UserActionStatus.PENDING,
      createdAt: '2024-01-20T10:00:00Z',
      analysisDate: '2024-01-20T10:00:00Z',
      status: WishlistStatus.APPROVED,
      // Rich analysis data that gets transformed into richData
      analysisData: {
        compatibleItems: {
          tops: [{ id: 'top-1', name: 'Test Top', category: 'tops' }],
          bottoms: [],
          shoes: [],
          outerwear: [],
          accessories: []
        },
        outfitCombinations: [
          {
            id: 'combo-1',
            items: ['test-top', 'test-bottom'],
            description: 'Great combo'
          }
        ],
        suitableScenarios: ['work', 'casual'],
        seasonScenarioCombinations: [],
        coverageGapsWithNoOutfits: [],
        itemDetails: {
          name: 'Test Item',
          category: 'tops',
          imageUrl: 'test-image.jpg'
        },
        recommendationText: 'Highly recommended'
      }
    } as any], // Raw service response - not typed as AIHistoryItem
    total: 1
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsole.log.mockClear();
    mockConsole.warn.mockClear();
    mockConsole.error.mockClear();
    
    // Default mock response
    mockAICheckHistoryService.getHistory.mockResolvedValue(mockServiceResponse);
    mockAICheckHistoryService.getHistoryRecord.mockResolvedValue({ success: false });
    mockAICheckHistoryService.cleanupRichData.mockResolvedValue({ success: true });

    (global as any).fetch = jest.fn();
    jest.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    (window.dispatchEvent as jest.Mock | any).mockRestore?.();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useAIHistory());

      expect(result.current.historyItems).toEqual([]);
      expect(result.current.activityFilter).toBe('all');
      expect(result.current.checkStatusFilter).toBe('all');
      expect(result.current.userActionFilter).toBe('all');
      expect(result.current.selectedHistoryItem).toBeNull();
      expect(result.current.isHistoryDetailModalOpen).toBe(false);
    });
  });

  describe('Data Loading', () => {
    it('should load history data on mount', async () => {
      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: [mockServiceResponse.history[0]],
        total: 1
      });

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(mockAICheckHistoryService.getHistory).toHaveBeenCalledWith({ limit: 20 });
        expect(result.current.historyItems).toHaveLength(1);
      });
    });

    it('should handle loading errors gracefully', async () => {
      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: false,
        error: 'Failed to load history'
      });

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(mockAICheckHistoryService.getHistory).toHaveBeenCalled();
        expect(result.current.historyItems).toEqual([]);
        expect(mockConsole.error).toHaveBeenCalledWith('Failed to load AI Check history:', 'Failed to load history');
      });
    });

    it('should handle service exceptions', async () => {
      const mockError = new Error('Network error');
      mockAICheckHistoryService.getHistory.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(mockAICheckHistoryService.getHistory).toHaveBeenCalled();
        expect(result.current.historyItems).toEqual([]);
        expect(mockConsole.error).toHaveBeenCalledWith('Error loading AI Check history:', mockError);
      });
    });
  });

  describe('Data Transformation', () => {
    it('should transform history items with rich data correctly', async () => {
      const testServiceResponse = {
        success: true,
        history: [mockServiceResponse.history[0]],
        total: 1
      };

      mockAICheckHistoryService.getHistory.mockResolvedValue(testServiceResponse);

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        const transformedItem = result.current.historyItems[0];
        expect(transformedItem.type).toBe('check');
        if (transformedItem.type === 'check') {
          expect(transformedItem.richData).toBeDefined();
          expect(transformedItem.richData?.compatibleItems).toBeDefined();
          expect(transformedItem.richData?.outfitCombinations).toHaveLength(1);
        }
      });
    });

    it('should handle items without rich data', async () => {
      const itemWithoutRichData = {
        ...mockServiceResponse.history[0],
        analysisData: undefined
      };

      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: [itemWithoutRichData],
        total: 1
      });

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        const transformedItem = result.current.historyItems[0];
        expect(transformedItem.type).toBe('check');
        if (transformedItem.type === 'check') {
          expect(transformedItem.richData).toBeUndefined();
        }
      });
    });
  });

  describe('Filtering', () => {
    beforeEach(async () => {
      const mockItems = [
        { ...mockServiceResponse.history[0], id: 'item-1', score: 8, status: WishlistStatus.APPROVED, userActionStatus: UserActionStatus.SAVED },
        { ...mockServiceResponse.history[0], id: 'item-2', score: 3, status: WishlistStatus.NOT_RECOMMENDED, userActionStatus: UserActionStatus.DISMISSED },
        { ...mockServiceResponse.history[0], id: 'item-3', score: 6, status: WishlistStatus.POTENTIAL_ISSUE, userActionStatus: UserActionStatus.PENDING }
      ];

      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: mockItems,
        total: 3
      });
    });

    it('should filter by check status correctly', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(3);
      });

      act(() => {
        result.current.setCheckStatusFilter('approved');
      });

      expect(result.current.filteredHistoryItems).toHaveLength(1);
      const checkItem = result.current.filteredHistoryItems[0];
      if (checkItem.type === 'check') {
        expect(checkItem.status).toBe('approved');
      }
    });

    it('should filter by user action status correctly', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(3);
      });

      act(() => {
        result.current.setUserActionFilter('saved');
      });

      expect(result.current.filteredHistoryItems).toHaveLength(1);
      expect(result.current.filteredHistoryItems[0].userActionStatus).toBe(UserActionStatus.SAVED);
    });

    it('should combine filters correctly', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(3);
      });

      act(() => {
        result.current.setCheckStatusFilter('not_recommended');
        result.current.setUserActionFilter(UserActionStatus.DISMISSED);
      });

      expect(result.current.filteredHistoryItems).toHaveLength(1);
      const checkItem = result.current.filteredHistoryItems[0];
      if (checkItem.type === 'check') {
        expect(checkItem.status).toBe(WishlistStatus.NOT_RECOMMENDED);
        expect(checkItem.userActionStatus).toBe(UserActionStatus.DISMISSED);
      }
    });

    it('should return all items when filters are set to "all"', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(3);
      });

      act(() => {
        result.current.setCheckStatusFilter('all');
        result.current.setUserActionFilter('all');
      });

      expect(result.current.filteredHistoryItems).toHaveLength(3);
    });
  });

  describe('Modal Management', () => {
    beforeEach(async () => {
      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: [mockServiceResponse.history[0]],
        total: 1
      });
    });

    it('should handle history item selection', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(1);
      });

      act(() => {
        result.current.handleOpenHistoryDetailModal('history-123');
      });

      expect(result.current.selectedHistoryItem).toBe(result.current.historyItems[0]);
      expect(result.current.isHistoryDetailModalOpen).toBe(true);
    });

    it('should handle modal close', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(1);
      });

      // Open modal first
      act(() => {
        result.current.handleOpenHistoryDetailModal('history-123');
      });

      expect(result.current.isHistoryDetailModalOpen).toBe(true);

      // Close modal
      act(() => {
        result.current.handleCloseHistoryDetailModal();
      });

      expect(result.current.isHistoryDetailModalOpen).toBe(false);
      expect(result.current.selectedHistoryItem).toBeNull();
    });
  });

  describe('Score Mapping', () => {
    it('should map scores to correct statuses', async () => {
      const mockItems = [
        {
          ...mockServiceResponse.history[0],
          id: 'high-score',
          analysisData: { ...mockServiceResponse.history[0].analysisData, score: 9 }
        },
        {
          ...mockServiceResponse.history[0],
          id: 'medium-score',
          analysisData: { ...mockServiceResponse.history[0].analysisData, score: 6 }
        },
        {
          ...mockServiceResponse.history[0],
          id: 'low-score',
          analysisData: { ...mockServiceResponse.history[0].analysisData, score: 3 }
        }
      ];

      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: mockItems,
        total: 3
      });

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        const items = result.current.historyItems;
        
        const highScoreItem = items.find(item => item.id === 'high-score');
        const mediumScoreItem = items.find(item => item.id === 'medium-score');
        const lowScoreItem = items.find(item => item.id === 'low-score');

        expect((highScoreItem as any)?.status).toBe('approved');
        expect((mediumScoreItem as any)?.status).toBe('potential_issue');
        expect((lowScoreItem as any)?.status).toBe('not_recommended');
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty history gracefully', async () => {
      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: [],
        total: 0
      });

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toEqual([]);
        expect(result.current.filteredHistoryItems).toEqual([]);
      });
    });

    it('should handle missing analysisData gracefully', async () => {
      const itemWithoutAnalysisData = {
        ...mockServiceResponse.history[0],
        analysisData: undefined
      };

      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: [itemWithoutAnalysisData],
        total: 1
      });

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(1);
        expect((result.current.historyItems[0] as any).score).toBe(0);
        expect((result.current.historyItems[0] as any).status).toBe('not_recommended');
      });
    });

    it('should handle invalid item ID in click handler', async () => {
      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: [mockServiceResponse.history[0]],
        total: 1
      });

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(1);
      });

      act(() => {
        result.current.handleOpenHistoryDetailModal('nonexistent-id');
      });

      expect(result.current.selectedHistoryItem).toBeNull();
      expect(result.current.isHistoryDetailModalOpen).toBe(false);
    });
  });

  describe('Actions', () => {
    it('handleRemoveFromWishlist should cleanup, delete wardrobe item, set dismissed status, update local state, and dispatch wardrobe:changed', async () => {
      const historyItem = {
        ...mockServiceResponse.history[0],
        id: 'history-remove-1',
        wardrobe_item_id: 'wardrobe-123',
        analysisData: {
          ...mockServiceResponse.history[0].analysisData,
          score: 8
        },
        createdAt: '2024-01-20T10:00:00Z',
        analysisDate: '2024-01-20T10:00:00Z'
      } as any;

      mockAICheckHistoryService.getHistory.mockResolvedValue({
        success: true,
        history: [historyItem],
        total: 1
      });

      mockAICheckHistoryService.cleanupRichData.mockResolvedValue({ success: true });
      mockAICheckHistoryService.updateRecordStatus.mockResolvedValue({ success: true });

      (global as any).fetch.mockResolvedValue({ ok: true, text: async () => '' });

      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(1);
      });

      await act(async () => {
        const ok = await result.current.handleRemoveFromWishlist('history-remove-1');
        expect(ok).toBe(true);
      });

      expect(mockAICheckHistoryService.cleanupRichData).toHaveBeenCalledWith('history-remove-1');

      expect((global as any).fetch).toHaveBeenCalled();
      const fetchArgs = (global as any).fetch.mock.calls[0];
      expect(fetchArgs[0]).toContain('/api/wardrobe-items/wardrobe-123');
      expect(fetchArgs[1]?.method).toBe('DELETE');

      expect(mockAICheckHistoryService.updateRecordStatus).toHaveBeenCalledWith('history-remove-1', 'dismissed');

      expect(window.dispatchEvent).toHaveBeenCalled();
      const dispatched = (window.dispatchEvent as jest.Mock).mock.calls
        .map(call => call[0])
        .find((evt: any) => evt?.type === 'wardrobe:changed');
      expect(dispatched).toBeTruthy();

      await waitFor(() => {
        const updated = result.current.historyItems.find(i => i.id === 'history-remove-1') as AIHistoryItem | undefined;
        expect(updated).toBeTruthy();
        if (updated && updated.type === 'check') {
          expect(updated.userActionStatus).toBe(UserActionStatus.DISMISSED);
          expect(updated.wardrobeItemId).toBeUndefined();
        }
      });
    });
  });

  describe('ai-history:created event handling', () => {
    it('should update history item when ai-history:created event is dispatched', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(1);
      });

      const originalItem = result.current.historyItems[0];
      expect(originalItem.userActionStatus).toBe('pending');

      // Mock the getHistoryRecord service to return updated record
      (aiCheckHistoryService.getHistoryRecord as jest.Mock).mockResolvedValue({
        success: true,
        record: {
          id: 'history-123',
          userId: 'user-123',
          analysisData: {
            compatibleItems: {
              tops: [{ id: 'top-1', name: 'Test Top', category: 'tops' }],
              bottoms: [],
              shoes: [],
              outerwear: [],
              accessories: []
            },
            outfitCombinations: [
              {
                id: 'combo-1',
                items: ['test-top', 'test-bottom'],
                description: 'Great combo'
              }
            ],
            suitableScenarios: ['work', 'casual'],
            seasonScenarioCombinations: [],
            coverageGapsWithNoOutfits: [],
            itemDetails: {
              name: 'Test Item',
              category: 'tops',
              imageUrl: 'test-image.jpg'
            },
            recommendationText: 'Highly recommended'
          },
          userActionStatus: 'saved',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:01:00Z',
        }
      });

      // Dispatch the ai-history:created event
      act(() => {
        window.dispatchEvent(
          new CustomEvent('ai-history:created', {
            detail: { historyRecordId: 'history-123' }
          })
        );
      });

      await waitFor(() => {
        const updatedItems = result.current.historyItems;
        expect(updatedItems).toHaveLength(1);
        const updatedItem = updatedItems[0];
        expect(updatedItem.userActionStatus).toBe('saved');
        expect(updatedItem.id).toBe('history-123');
      });

      expect((aiCheckHistoryService.getHistoryRecord as jest.Mock)).toHaveBeenCalledWith('history-123');
    });

    it('should add new history item when ai-history:created event is dispatched for new record', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(1);
      });

      // Mock the getHistoryRecord service to return new record
      (aiCheckHistoryService.getHistoryRecord as jest.Mock).mockResolvedValue({
        success: true,
        record: {
          id: 'history-456',
          userId: 'user-123',
          analysisData: {
            compatibleItems: { tops: [], bottoms: [], shoes: [], outerwear: [], accessories: [] },
            outfitCombinations: [],
            suitableScenarios: ['casual'],
            seasonScenarioCombinations: [],
            coverageGapsWithNoOutfits: [],
            itemDetails: { name: 'New Item', category: 'tops', imageUrl: 'new-image.jpg' },
            recommendationText: 'Recommended'
          },
          userActionStatus: 'pending',
          createdAt: '2024-01-20T11:00:00Z',
          updatedAt: '2024-01-20T11:00:00Z',
        }
      });

      // Dispatch the ai-history:created event for new record
      act(() => {
        window.dispatchEvent(
          new CustomEvent('ai-history:created', {
            detail: { historyRecordId: 'history-456' }
          })
        );
      });

      await waitFor(() => {
        const updatedItems = result.current.historyItems;
        expect(updatedItems).toHaveLength(2);
        const newItem = updatedItems.find(item => item.id === 'history-456');
        expect(newItem).toBeDefined();
        expect(newItem?.userActionStatus).toBe('pending');
      });

      expect((aiCheckHistoryService.getHistoryRecord as jest.Mock)).toHaveBeenCalledWith('history-456');
    });

    it('should handle errors gracefully when getHistoryRecord fails', async () => {
      const { result } = renderHook(() => useAIHistory());

      await waitFor(() => {
        expect(result.current.historyItems).toHaveLength(1);
      });

      const originalItems = result.current.historyItems;

      // Mock the getHistoryRecord service to return error
      (aiCheckHistoryService.getHistoryRecord as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Record not found'
      });

      // Dispatch the ai-history:created event
      act(() => {
        window.dispatchEvent(
          new CustomEvent('ai-history:created', {
            detail: { historyRecordId: 'nonexistent-id' }
          })
        );
      });

      // Items should remain unchanged
      await waitFor(() => {
        expect(result.current.historyItems).toEqual(originalItems);
      });
    });
  });
});
