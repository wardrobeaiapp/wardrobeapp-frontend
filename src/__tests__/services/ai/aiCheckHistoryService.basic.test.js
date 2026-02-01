// Basic AI Check History Service Tests - JavaScript version to avoid TypeScript parsing issues

// Mock the shared Supabase client
jest.mock('../../../services/core/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn()
    }
  }
}));

// Mock localStorage for Node.js environment
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

// Mock window and localStorage for Node.js environment
global.window = global.window || {};
Object.defineProperty(global.window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Also set it directly on global for compatibility
global.localStorage = localStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock console
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

const { AICheckHistoryService } = require('../../../services/ai/aiCheckHistoryService');

describe('AICheckHistoryService - Basic Tests', () => {
  let service;
  let mockSupabase;

  beforeAll(() => {
    mockSupabase = require('../../../services/core/supabase').supabase;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    global.fetch.mockClear();
    mockSupabase.auth.getSession.mockClear();
    
    service = AICheckHistoryService.getInstance();
  });

  describe('Singleton Pattern', () => {
    test('should return the same instance on multiple calls', () => {
      const instance1 = AICheckHistoryService.getInstance();
      const instance2 = AICheckHistoryService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Authentication', () => {
    test('should use Supabase token when available', async () => {
      // Setup
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'supabase-token-123'
          }
        }
      });

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ history: [], total: 0 })
      });

      // Execute
      await service.getHistory();

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-auth-token': 'supabase-token-123'
          })
        })
      );
    });

    test('should fallback to localStorage token', async () => {
      // Setup
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      });
      window.localStorage.getItem.mockReturnValue('localStorage-token');

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ history: [], total: 0 })
      });

      // Execute
      await service.getHistory();

      // Verify
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-auth-token': 'localStorage-token'
          })
        })
      );
    });
  });

  describe('getHistory', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      });
    });

    test('should fetch history successfully', async () => {
      // Setup
      const mockData = [
        { id: 'item-1', score: 8, createdAt: '2024-01-20T10:00:00Z' }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          history: mockData,
          total: 1
        })
      });

      // Execute
      const result = await service.getHistory();

      // Verify
      expect(result.success).toBe(true);
      expect(result.history).toEqual(mockData);
      expect(result.total).toBe(1);
    });

    test('should handle API errors', async () => {
      // Setup
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' })
      });

      // Execute
      const result = await service.getHistory();

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    test('should handle network errors', async () => {
      // Setup
      global.fetch.mockRejectedValue(new Error('Network error'));

      // Execute
      const result = await service.getHistory();

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('saveAnalysisToHistory', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      });
    });

    test('should save analysis successfully', async () => {
      // Setup
      const analysisData = { score: 8, finalReason: 'Good item' };
      const itemData = { id: 'item-1', name: 'Test Item' };

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          history_record: { id: 'history-1' }
        })
      });

      // Execute
      const result = await service.saveAnalysisToHistory(analysisData, itemData);

      // Verify
      expect(result.success).toBe(true);
      expect(result.historyRecord.id).toBe('history-1');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            analysis_data: analysisData,
            item_data: itemData
          })
        })
      );
    });

    test('should handle save errors', async () => {
      // Setup
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Validation failed' })
      });

      // Execute
      const result = await service.saveAnalysisToHistory({}, {});

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
    });
  });

  describe('updateRecordStatus', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      });
    });

    test('should update status successfully', async () => {
      // Setup
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      // Execute
      const result = await service.updateRecordStatus('history-1', 'saved');

      // Verify
      expect(result.success).toBe(true);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history/history-1/status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ user_action_status: 'saved' })
        })
      );
    });

    test('should handle update errors', async () => {
      // Setup
      global.fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Record not found' })
      });

      // Execute
      const result = await service.updateRecordStatus('invalid-id', 'saved');

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBe('Record not found');
    });
  });

  describe('getHistoryStats', () => {
    test('should calculate stats correctly', async () => {
      // Setup
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      });

      const mockHistory = [
        {
          analysisData: { 
            score: 8,
            itemDetails: { category: 'tops' }
          },
          userActionStatus: 'saved',
          createdAt: new Date().toISOString()
        },
        {
          analysisData: { 
            score: 5,
            itemDetails: { category: 'bottoms' }
          },
          userActionStatus: 'dismissed',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          history: mockHistory,
          total: 2
        })
      });

      // Execute
      const result = await service.getHistoryStats();

      // Verify
      expect(result.success).toBe(true);
      expect(result.stats.total).toBe(2);
      expect(result.stats.savedCount).toBe(1);
      expect(result.stats.byCategory.tops).toBe(1);
      expect(result.stats.byCategory.bottoms).toBe(1);
      expect(result.stats.byStatus.saved).toBe(1);
      expect(result.stats.byStatus.dismissed).toBe(1);
    });

    test('should handle empty history', async () => {
      // Setup
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      });

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ history: [], total: 0 })
      });

      // Execute
      const result = await service.getHistoryStats();

      // Verify
      expect(result.success).toBe(true);
      expect(result.stats.total).toBe(0);
      expect(result.stats.savedCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle auth errors gracefully', async () => {
      // Setup
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Auth error'));
      localStorageMock.getItem.mockReturnValue('fallback-token');

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ history: [], total: 0 })
      });

      // Execute
      const result = await service.getHistory();

      // Verify
      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-auth-token': 'fallback-token'
          })
        })
      );
    });

    test('should handle missing auth gracefully', async () => {
      // Setup
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      });
      localStorageMock.getItem.mockReturnValue(null);

      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ history: [], total: 0 })
      });

      // Execute
      await service.getHistory();

      // Verify - should still make the request
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});
