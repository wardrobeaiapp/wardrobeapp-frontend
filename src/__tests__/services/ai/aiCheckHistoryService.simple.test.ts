// Simplified AI Check History Service Tests
// Focuses on core functionality without complex type assertions

// Mock the shared Supabase client
jest.mock('../../../services/core/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn()
    }
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock fetch
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Mock console to reduce noise
console.log = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

import { AICheckHistoryService } from '../../../services/ai/aiCheckHistoryService';

describe('AICheckHistoryService - Core Functionality', () => {
  let service: AICheckHistoryService;
  const mockSupabase = require('../../../services/core/supabase').supabase;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockClear();
    mockFetch.mockClear();
    mockSupabase.auth.getSession.mockClear();
    
    service = AICheckHistoryService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = AICheckHistoryService.getInstance();
      const instance2 = AICheckHistoryService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('Authentication Headers', () => {
    it('should use Supabase session token when available', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'supabase-token-123'
          }
        }
      });

      // Test by calling a method that uses auth headers
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ history: [], total: 0 })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await service.getHistory();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-auth-token': 'supabase-token-123'
          })
        })
      );
    });

    it('should fallback to localStorage token', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      });
      localStorageMock.getItem.mockReturnValue('localStorage-token-456');

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ history: [], total: 0 })
      };
      mockFetch.mockResolvedValue(mockResponse as any);

      await service.getHistory();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-auth-token': 'localStorage-token-456'
          })
        })
      );
    });
  });

  // Helper to create proper Response objects for fetch mocking
  const createMockResponse = (data: any, ok: boolean = true): Response => {
    return {
      ok,
      status: ok ? 200 : 500,
      statusText: ok ? 'OK' : 'Internal Server Error',
      headers: new Headers(),
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(JSON.stringify(data)),
      blob: () => Promise.resolve(new Blob()),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      formData: () => Promise.resolve(new FormData()),
      clone: () => createMockResponse(data, ok),
      body: null,
      bodyUsed: false,
      redirected: false,
      type: 'basic',
      url: 'http://test.com'
    } as Response;
  };

  describe('getHistory', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      });
    });

    it('should successfully fetch history', async () => {
      const mockHistoryData = [
        {
          id: 'item-1',
          analysisData: { score: 8 },
          createdAt: '2024-01-20T10:00:00Z'
        }
      ];

      mockFetch.mockResolvedValue(
        createMockResponse({
          history: mockHistoryData,
          total: 1
        })
      );

      const result = await service.getHistory();

      expect(result.success).toBe(true);
      expect(result.history).toEqual(mockHistoryData);
      expect(result.total).toBe(1);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({
          error: 'Server error'
        }, false)
      );

      const result = await service.getHistory();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Server error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const result = await service.getHistory();

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

    it('should successfully save analysis', async () => {
      const mockAnalysisData = { 
        score: 8, 
        finalReason: 'Good item',
        analysis: 'Test analysis',
        feedback: 'Test feedback'
      } as any;
      const mockItemData = { id: 'item-1', name: 'Test Item' } as any;

      mockFetch.mockResolvedValue(
        createMockResponse({
          history_record: { id: 'history-1' }
        })
      );

      const result = await service.saveAnalysisToHistory(mockAnalysisData, mockItemData);

      expect(result.success).toBe(true);
      expect(result.historyRecord).toEqual({ id: 'history-1' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            analysis_data: mockAnalysisData,
            item_data: mockItemData
          })
        })
      );
    });

    it('should handle save errors', async () => {
      const mockAnalysisData = { 
        score: 8,
        analysis: 'Test analysis', 
        feedback: 'Test feedback'
      } as any;
      const mockItemData = { id: 'item-1' } as any;

      mockFetch.mockResolvedValue(
        createMockResponse({
          error: 'Validation failed'
        }, false)
      );

      const result = await service.saveAnalysisToHistory(mockAnalysisData, mockItemData);

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

    it('should successfully update status', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({})
      );

      const result = await service.updateRecordStatus('history-1', 'saved');

      expect(result.success).toBe(true);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history/history-1/status'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            user_action_status: 'saved'
          })
        })
      );
    });
  });

  describe('getHistoryStats', () => {
    it('should calculate statistics correctly', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: { access_token: 'test-token' } }
      });

      const mockHistoryItems = [
        {
          id: 'item-1',
          analysisData: { 
            score: 8,
            itemDetails: { category: 'tops' }
          },
          userActionStatus: 'saved',
          createdAt: new Date().toISOString()
        },
        {
          id: 'item-2',
          analysisData: { 
            score: 5,
            itemDetails: { category: 'bottoms' }
          },
          userActionStatus: 'dismissed',
          createdAt: new Date().toISOString()
        }
      ];

      mockFetch.mockResolvedValue(
        createMockResponse({
          history: mockHistoryItems,
          total: 2
        })
      );

      const result = await service.getHistoryStats();

      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.stats!.total).toBe(2);
      expect(result.stats!.avgScore).toBe(6.5); // (8 + 5) / 2
      expect(result.stats!.byCategory).toEqual({
        'tops': 1,
        'bottoms': 1
      });
      expect(result.stats!.byStatus).toEqual({
        'saved': 1,
        'dismissed': 1
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase auth errors gracefully', async () => {
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Auth error'));
      localStorageMock.getItem.mockReturnValue('fallback-token');

      mockFetch.mockResolvedValue(
        createMockResponse({ history: [], total: 0 })
      );

      const result = await service.getHistory();

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai-check-history'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-auth-token': 'fallback-token'
          })
        })
      );
    });

    it('should handle missing authentication gracefully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      });
      localStorageMock.getItem.mockReturnValue(null);

      mockFetch.mockResolvedValue(
        createMockResponse({ history: [], total: 0 })
      );

      await service.getHistory();

      // Should still make the request without auth token
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
