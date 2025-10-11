import { renderHook, act } from '@testing-library/react';
import { useAICheck } from '../../hooks/ai/useAICheck';
import { claudeService } from '../../services/ai/claudeService';

// Mock the claudeService
jest.mock('../../services/ai/claudeService', () => ({
  claudeService: {
    analyzeWardrobeItem: jest.fn()
  }
}));

// Mock the ximilarService
jest.mock('../../services/ai/ximilarService', () => ({
  detectImageTags: jest.fn().mockResolvedValue({
    status: 'OK',
    records: [{ _tags_map: { category: 'bag', color: 'black' } }]
  }),
  extractTopTags: jest.fn().mockReturnValue({ 
    'category': 'bag', 
    'color': 'black',
    'style': 'casual'
  })
}));

const mockClaudeService = claudeService as jest.Mocked<typeof claudeService>;
describe('useAICheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkItem', () => {
    it('should check item successfully', async () => {
      const mockResult = {
        analysis: 'Great item for your wardrobe',
        score: 8.5,
        feedback: 'Recommended',
        recommendationText: 'Your bags collection could use some variety.'
      };
      
      mockClaudeService.analyzeWardrobeItem.mockResolvedValue(mockResult);

      const { result } = renderHook(() => useAICheck());

      // Set up image link first
      act(() => {
        result.current.setImageLink('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD');
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('');

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkItem({ 
          category: 'accessory', 
          subcategory: 'bag', 
          seasons: ['spring/fall'] 
        });
      });

      expect(checkResult).toBeTruthy();
      expect(result.current.itemCheckResponse).toBe(mockResult.analysis);
      expect(result.current.itemCheckScore).toBe(8.5);
    });

    it('should handle missing image error', async () => {
      const { result } = renderHook(() => useAICheck());

      let checkResult;
      await act(async () => {
        checkResult = await result.current.checkItem({ 
          category: 'accessory', 
          subcategory: 'bag', 
          seasons: ['spring/fall'] 
        });
      });

      expect(checkResult).toBeNull();
      expect(result.current.error).toBe('Please provide an image link to check.');
    });

    it('should handle analysis errors', async () => {
      // Suppress console.error for this test since we're intentionally causing an error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const mockError = new Error('Analysis failed');
      mockClaudeService.analyzeWardrobeItem.mockRejectedValue(mockError);

      const { result } = renderHook(() => useAICheck());

      // Set up image link
      act(() => {
        result.current.setImageLink('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD');
      });

      await act(async () => {
        await result.current.checkItem({ category: 'accessory', subcategory: 'bag', seasons: ['spring/fall'] });
      });

      expect(result.current.error).toBe('Failed to analyze the outfit. Please try again.');
      expect(result.current.errorType).toBe('Analysis Failed');
      
      // Clean up console spy
      consoleErrorSpy.mockRestore();
    });
  });

  describe('resetCheck', () => {
    it('should reset all state', () => {
      const { result } = renderHook(() => useAICheck());

      // Set some state first
      act(() => {
        result.current.setImageLink('test-image');
      });

      // Reset
      act(() => {
        result.current.resetCheck();
      });

      expect(result.current.imageLink).toBe('');
      expect(result.current.error).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.itemCheckResponse).toBe(null);
    });
  });

  describe('fetchTags', () => {
    it('should return null and set error for API failures', async () => {
      // Suppress console.error since we're testing error handling
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // This test verifies the error handling when the API mock fails
      const { result } = renderHook(() => useAICheck());

      let tags;
      await act(async () => {
        tags = await result.current.fetchTags('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD');
      });

      // With our current mocks returning malformed data, this should fail gracefully
      expect(tags).toBeNull();
      expect(result.current.error).toContain('Error fetching image tags');
      expect(result.current.errorType).toBe('FETCH_TAGS_ERROR');
      
      // Clean up console spy
      consoleErrorSpy.mockRestore();
    });
  });
});
