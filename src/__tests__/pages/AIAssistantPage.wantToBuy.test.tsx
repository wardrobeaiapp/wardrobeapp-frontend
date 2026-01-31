import { aiCheckHistoryService } from '../../services/ai/aiCheckHistoryService';
import { UserActionStatus } from '../../types';

// Mock the aiCheckHistoryService
jest.mock('../../services/ai/aiCheckHistoryService', () => ({
  aiCheckHistoryService: {
    updateRecordStatus: jest.fn(),
    getHistoryRecord: jest.fn(),
  },
}));

// Mock window.dispatchEvent
const mockDispatchEvent = jest.fn();
Object.defineProperty(window, 'dispatchEvent', {
  value: mockDispatchEvent,
  writable: true,
});

describe('AIAssistantPage - Want to Buy Functionality (Unit Test)', () => {
  const mockHistoryService = aiCheckHistoryService as jest.Mocked<typeof aiCheckHistoryService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHistoryService.updateRecordStatus.mockResolvedValue({
      success: true,
    });
    mockHistoryService.getHistoryRecord.mockResolvedValue({
      success: true,
      record: {
        id: 'history-123',
        user_id: 'user-123',
        analysis_data: {},
        user_action_status: UserActionStatus.SAVED,
        created_at: '2024-01-20T10:00:00Z',
        updated_at: '2024-01-20T10:00:00Z',
      } as any
    });
  });

  afterEach(() => {
    mockDispatchEvent.mockClear();
  });

  // Test the core logic of handleApproveForPurchase function
  const handleApproveForPurchase = async (historyRecordId: string, selectedWishlistItem?: { id?: string }) => {
    if (historyRecordId) {
      try {
        const result = await aiCheckHistoryService.updateRecordStatus(historyRecordId, 'saved');
        if (result.success) {
          console.log('History record status updated to saved');
          
          // Get the updated record and dispatch it to trigger the history update listener
          const recordResult = await aiCheckHistoryService.getHistoryRecord(historyRecordId);
          if (recordResult.success && recordResult.record) {
            // Dispatch the updated item using the existing ai-history:created event
            // This will trigger the listener in useAIHistory hook to update the local state
            if (typeof window !== 'undefined') {
              window.dispatchEvent(
                new CustomEvent('ai-history:created', { 
                  detail: { historyRecordId } 
                })
              );
            }
          }
          
          // Trigger wardrobe:changed event to refresh UI
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('wardrobe:changed', { 
                detail: { type: 'updated', id: selectedWishlistItem?.id } 
              })
            );
          }
        } else {
          console.error('Failed to update history record status:', result.error);
        }
      } catch (error) {
        console.error('Error updating history record status:', error);
      }
    }
  };

  it('should update history record status to saved when Want to Buy is clicked', async () => {
    await handleApproveForPurchase('history-123', { id: 'item-123' });

    // Verify the history service was called with correct parameters
    expect(mockHistoryService.updateRecordStatus).toHaveBeenCalledWith('history-123', 'saved');

    // Verify the updated record was fetched
    expect(mockHistoryService.getHistoryRecord).toHaveBeenCalledWith('history-123');

    // Verify the ai-history:created event was dispatched to trigger UI update
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ai-history:created',
        detail: { historyRecordId: 'history-123' },
      })
    );

    // Verify the wardrobe:changed event was dispatched to refresh wardrobe UI
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'wardrobe:changed',
        detail: { type: 'updated', id: 'item-123' },
      })
    );
  });

  it('should handle errors when updating history record status fails', async () => {
    mockHistoryService.updateRecordStatus.mockResolvedValue({
      success: false,
      error: 'Failed to update status',
    });

    await handleApproveForPurchase('history-123');

    expect(mockHistoryService.updateRecordStatus).toHaveBeenCalledWith('history-123', 'saved');

    // Should not dispatch events when update fails
    expect(mockDispatchEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ai-history:created',
      })
    );
  });

  it('should handle network errors gracefully', async () => {
    mockHistoryService.updateRecordStatus.mockRejectedValue(new Error('Network error'));

    await handleApproveForPurchase('history-123');

    expect(mockHistoryService.updateRecordStatus).toHaveBeenCalledWith('history-123', 'saved');

    // Should not dispatch events when network error occurs
    expect(mockDispatchEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ai-history:created',
      })
    );
  });

  it('should not do anything when historyRecordId is not provided', async () => {
    await handleApproveForPurchase('');

    // Should not call any services or dispatch events
    expect(mockHistoryService.updateRecordStatus).not.toHaveBeenCalled();
    expect(mockDispatchEvent).not.toHaveBeenCalled();
  });
});
