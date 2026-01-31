import { renderHook, act } from '@testing-library/react';
import { useAICheckPersistence } from '../../hooks/ai/useAICheckPersistence';
import { WishlistStatus } from '../../types';
import { aiCheckHistoryService } from '../../services/ai/aiCheckHistoryService';
import { updateWardrobeItem } from '../../services/wardrobe/items';

jest.mock('../../services/ai/aiCheckHistoryService', () => ({
  aiCheckHistoryService: {
    saveAnalysisToHistory: jest.fn()
  }
}));

jest.mock('../../services/wardrobe/items', () => ({
  updateWardrobeItem: jest.fn()
}));

describe('useAICheckPersistence', () => {
  const mockHistoryService = aiCheckHistoryService as jest.Mocked<typeof aiCheckHistoryService>;
  const mockUpdateWardrobeItem = updateWardrobeItem as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'dispatchEvent');
    mockHistoryService.saveAnalysisToHistory.mockResolvedValue({
      success: true,
      historyRecord: { id: 'history-1' }
    } as any);
    mockUpdateWardrobeItem.mockResolvedValue({ id: 'wardrobe-1' });
  });

  afterEach(() => {
    (window.dispatchEvent as jest.Mock | any).mockRestore?.();
  });

  it('updates wishlistStatus and dispatches wardrobe:changed for wishlist items', async () => {
    const { result } = renderHook(() => useAICheckPersistence());

    await act(async () => {
      await result.current.saveAnalysisResults(
        'analysis',
        8,
        WishlistStatus.APPROVED,
        { feedback: 'ok', recommendationText: 'rec' },
        'image',
        {
          id: 'wardrobe-1',
          name: 'Item',
          category: 'tops',
          wishlist: true,
          wishlistStatus: WishlistStatus.NOT_REVIEWED,
          season: ['summer'],
          scenarios: []
        } as any
      );
    });

    expect(mockUpdateWardrobeItem).toHaveBeenCalledWith('wardrobe-1', { wishlistStatus: WishlistStatus.APPROVED });

    const dispatched = (window.dispatchEvent as jest.Mock).mock.calls
      .map(call => call[0])
      .find((evt: any) => evt?.type === 'wardrobe:changed');

    expect(dispatched).toBeTruthy();
  });
});
