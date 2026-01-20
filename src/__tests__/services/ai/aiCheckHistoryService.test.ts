import { AICheckHistoryService, aiCheckHistoryService } from '../../../services/ai/aiCheckHistoryService';
import { WardrobeItem, AICheckHistoryItem } from '../../../types';
import { WardrobeItemAnalysis } from '../../../services/ai/types';

// Mock the shared Supabase client
jest.mock('../../../services/core/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn()
    }
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to avoid test output noise
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

Object.defineProperty(console, 'log', { value: mockConsole.log });
Object.defineProperty(console, 'warn', { value: mockConsole.warn });
Object.defineProperty(console, 'error', { value: mockConsole.error });

describe('AICheckHistoryService', () => {
  let service: AICheckHistoryService;
  const mockSupabase = require('../../../services/core/supabase').supabase;

  const mockAnalysisData = {
    score: 8,
    finalReason: 'Great versatile piece',
    suitableScenarios: ['casual', 'work'],
    compatibleItems: {
      tops: [],
      bottoms: [],
      shoes: [],
      outerwear: [],
      accessories: []
    },
    outfitCombinations: [],
    seasonScenarioCombinations: [],
    coverageGapsWithNoOutfits: [],
    itemDetails: {
      name: 'Test Item',
      category: 'tops',
      imageUrl: 'test-image.jpg'
    },
    recommendationText: 'Highly recommended'
  };

  const mockItemData: WardrobeItem = {
    id: 'item-123',
    name: 'Test Item',
    category: 'tops',
    subcategory: 'shirts',
    color: 'blue',
    brand: 'Test Brand',
    season: 'spring',
    wishlistStatus: 'not_reviewed',
    userId: 'user-123',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  };

  const mockHistoryItem: AICheckHistoryItem = {
    id: 'history-123',
    userId: 'user-123',
    analysisData: mockAnalysisData,
    userActionStatus: 'pending',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
    mockSupabase.auth.getSession.mockClear();
    
    // Get fresh instance for each test
    service = AICheckHistoryService.getInstance();
    
    // Set default API URL
    process.env.REACT_APP_API_URL = 'http://localhost:5000';
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = AICheckHistoryService.getInstance();
      const instance2 = AICheckHistoryService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export a singleton instance', () => {
      const exportedInstance = aiCheckHistoryService;
      const manualInstance = AICheckHistoryService.getInstance();
      expect(exportedInstance).toBe(manualInstance);
    });
  });

  describe('getAuthHeaders', () => {
    it('should use Supabase session token when available', async () => {
      // Mock successful Supabase session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'supabase-token-123'
          }
        }
      });

      // Access private method using type assertion
      const headers = await (service as any).getAuthHeaders();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['x-auth-token']).toBe('supabase-token-123');
      expect(mockSupabase.auth.getSession).toHaveBeenCalledTimes(1);
    });

    it('should fallback to localStorage token when Supabase session is unavailable', async () => {
      // Mock Supabase session failure
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      });

      // Mock localStorage token
      mockLocalStorage.getItem.mockReturnValue('localStorage-token-456');

      const headers = await (service as any).getAuthHeaders();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['x-auth-token']).toBe('localStorage-token-456');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('token');
    });

    it('should handle Supabase errors gracefully', async () => {
      // Mock Supabase error
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Supabase error'));
      
      // Mock localStorage token
      mockLocalStorage.getItem.mockReturnValue('localStorage-token-456');

      const headers = await (service as any).getAuthHeaders();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['x-auth-token']).toBe('localStorage-token-456');
      expect(mockConsole.warn).toHaveBeenCalledWith('🔑 Supabase session not available, falling back to localStorage token');
    });

    it('should handle no authentication token available', async () => {
      // Mock no session and no localStorage token
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null }
      });
      mockLocalStorage.getItem.mockReturnValue(null);

      const headers = await (service as any).getAuthHeaders();

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['x-auth-token']).toBeUndefined();
      expect(mockConsole.warn).toHaveBeenCalledWith('🔑 No authentication token available');
    });
  });

  describe('saveAnalysisToHistory', () => {
    beforeEach(() => {
      // Mock successful auth
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token'
          }
        }
      });
    });

    it('should successfully save analysis to history', async () => {
      // Mock successful API response
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          history_record: { id: 'history-123', ...mockHistoryItem }
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.saveAnalysisToHistory(mockAnalysisData, mockItemData);

      expect(result.success).toBe(true);
      expect(result.historyRecord).toBeDefined();
      expect(result.error).toBeUndefined();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ai-check-history',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-auth-token': 'test-token'
          }),
          body: JSON.stringify({
            analysis_data: mockAnalysisData,
            item_data: mockItemData
          })
        })
      );
    });

    it('should handle API error responses', async () => {
      // Mock error API response
      const mockResponse = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Validation failed'
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.saveAnalysisToHistory(mockAnalysisData, mockItemData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation failed');
      expect(result.historyRecord).toBeUndefined();
    });

    it('should handle network errors', async () => {
      // Mock network error
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'));

      const result = await service.saveAnalysisToHistory(mockAnalysisData, mockItemData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.historyRecord).toBeUndefined();
    });
  });

  describe('getHistory', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token'
          }
        }
      });
    });

    it('should successfully fetch history with default options', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve({
          history: [mockHistoryItem],
          total: 1
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.getHistory();

      expect(result.success).toBe(true);
      expect(result.history).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.error).toBeUndefined();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ai-check-history?',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'x-auth-token': 'test-token'
          })
        })
      );
    });

    it('should handle query parameters correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve({
          history: [],
          total: 0
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const options = {
        limit: 10,
        offset: 20,
        filters: { status: 'approved' }
      };

      await service.getHistory(options);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ai-check-history?limit=10&offset=20&filters=%7B%22status%22%3A%22approved%22%7D',
        expect.objectContaining({
          method: 'GET'
        })
      );
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        headers: new Map(),
        json: () => Promise.resolve({
          error: 'Internal server error'
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.getHistory();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
      expect(result.history).toBeUndefined();
    });
  });

  describe('getHistoryRecord', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token'
          }
        }
      });
    });

    it('should successfully fetch a specific history record', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          record: mockHistoryItem
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.getHistoryRecord('history-123');

      expect(result.success).toBe(true);
      expect(result.record).toEqual(mockHistoryItem);
      expect(result.error).toBeUndefined();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ai-check-history/history-123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'x-auth-token': 'test-token'
          })
        })
      );
    });

    it('should handle record not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: () => Promise.resolve({
          error: 'Record not found'
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.getHistoryRecord('nonexistent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Record not found');
      expect(result.record).toBeUndefined();
    });
  });

  describe('updateRecordStatus', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token'
          }
        }
      });
    });

    it('should successfully update record status', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({})
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.updateRecordStatus('history-123', 'saved');

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ai-check-history/history-123/status',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-auth-token': 'test-token'
          }),
          body: JSON.stringify({
            user_action_status: 'saved'
          })
        })
      );
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Invalid status value'
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.updateRecordStatus('history-123', 'invalid' as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid status value');
    });
  });

  describe('getHistoryStats', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'test-token'
          }
        }
      });
    });

    it('should calculate statistics correctly', async () => {
      const mockHistoryItems: AICheckHistoryItem[] = [
        {
          ...mockHistoryItem,
          id: 'item-1',
          analysisData: {
            ...mockAnalysisData,
            score: 8,
            itemDetails: { ...mockAnalysisData.itemDetails, category: 'tops' }
          },
          userActionStatus: 'saved',
          createdAt: new Date().toISOString() // Recent item
        },
        {
          ...mockHistoryItem,
          id: 'item-2',
          analysisData: {
            ...mockAnalysisData,
            score: 5,
            itemDetails: { ...mockAnalysisData.itemDetails, category: 'bottoms' }
          },
          userActionStatus: 'dismissed',
          createdAt: '2024-01-01T10:00:00Z' // Older item
        },
        {
          ...mockHistoryItem,
          id: 'item-3',
          analysisData: {
            ...mockAnalysisData,
            score: 3,
            itemDetails: { ...mockAnalysisData.itemDetails, category: 'tops' }
          },
          userActionStatus: 'pending',
          createdAt: new Date().toISOString() // Recent item
        }
      ];

      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve({
          history: mockHistoryItems,
          total: 3
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.getHistoryStats();

      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.stats?.total).toBe(3);
      expect(result.stats?.avgScore).toBe(5.3); // (8 + 5 + 3) / 3 = 5.33... rounded to 5.3
      expect(result.stats?.byCategory).toEqual({
        'tops': 2,
        'bottoms': 1
      });
      expect(result.stats?.byStatus).toEqual({
        'saved': 1,
        'dismissed': 1,
        'pending': 1
      });
      expect(result.stats?.recentCount).toBe(2); // Items created today
    });

    it('should handle empty history', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve({
          history: [],
          total: 0
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.getHistoryStats();

      expect(result.success).toBe(true);
      expect(result.stats?.total).toBe(0);
      expect(result.stats?.avgScore).toBe(0);
      expect(result.stats?.byCategory).toEqual({});
      expect(result.stats?.byStatus).toEqual({});
      expect(result.stats?.recentCount).toBe(0);
    });

    it('should handle API errors when fetching history', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        headers: new Map(),
        json: () => Promise.resolve({
          error: 'Database error'
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await service.getHistoryStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
      expect(result.stats).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected errors gracefully', async () => {
      // Mock auth to throw unexpected error
      mockSupabase.auth.getSession.mockRejectedValue(new Error('Unexpected error'));
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = await service.saveAnalysisToHistory(mockAnalysisData, mockItemData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('localStorage error');
    });

    it('should handle non-Error exceptions', async () => {
      // Mock fetch to throw a string instead of Error object
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue('String error');

      const result = await service.getHistory();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });
  });
});
