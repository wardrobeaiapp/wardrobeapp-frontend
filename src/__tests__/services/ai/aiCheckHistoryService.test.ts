import { aiCheckHistoryService } from '../../../services/ai/aiCheckHistoryService';
import { ItemCategory, Season, WishlistStatus, UserActionStatus } from '../../../types';

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

describe('aiCheckHistoryService (facade)', () => {
  const mockSupabase = require('../../../services/core/supabase').supabase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    (fetch as jest.MockedFunction<typeof fetch>).mockClear();
    mockSupabase.auth.getSession.mockClear();
    
    process.env.REACT_APP_API_URL = 'http://localhost:5000';
  });

  describe('Facade API', () => {
    it('should export expected methods', () => {
      expect(typeof aiCheckHistoryService.getHistory).toBe('function');
      expect(typeof aiCheckHistoryService.getHistoryRecord).toBe('function');
      expect(typeof aiCheckHistoryService.saveAnalysisToHistory).toBe('function');
      expect(typeof aiCheckHistoryService.updateRecordStatus).toBe('function');
      expect(typeof aiCheckHistoryService.cleanupRichData).toBe('function');
      expect(typeof aiCheckHistoryService.detachHistoryRecord).toBe('function');
      expect(typeof aiCheckHistoryService.getHistoryByWardrobeItemId).toBe('function');
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

    it('should fetch history with default options', async () => {
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

      const result = await aiCheckHistoryService.getHistory();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ai-check-history?',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
      expect(result.success).toBe(true);
      expect(result.history).toEqual([]);
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

      await aiCheckHistoryService.getHistory(options);

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

      const result = await aiCheckHistoryService.getHistory();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Internal server error');
      expect(result.history).toBeUndefined();
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

    it('should update record status', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve({ success: true })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await aiCheckHistoryService.updateRecordStatus('history-123', 'saved' as UserActionStatus);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/ai-check-history/history-123/status',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ user_action_status: 'saved' })
        })
      );
      expect(result.success).toBe(true);
    });

    it('should handle validation errors', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        headers: new Map(),
        json: () => Promise.resolve({
          error: 'Invalid status value'
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue(mockResponse as Response);

      const result = await aiCheckHistoryService.updateRecordStatus('history-123', 'invalid' as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid status value');
    });
  });
});
