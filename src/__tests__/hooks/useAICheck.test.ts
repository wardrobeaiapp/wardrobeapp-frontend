import { renderHook, act } from '@testing-library/react';
import { useAICheck } from '../../hooks/ai/useAICheck';
import { claudeService } from '../../services/ai/claudeService';

// Mock the claudeService
jest.mock('../../services/ai/claudeService', () => ({
  claudeService: {
    analyzeWardrobeItem: jest.fn()
  }
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
    beforeEach(() => {
      // Mock the ximilar service 
      jest.doMock('../../services/ai/ximilarService', () => ({
        detectImageTags: jest.fn().mockResolvedValue({
          status: 'ok',
          records: [{ _tags_map: { category: 'bag', color: 'black' } }]
        }),
        extractTopTags: jest.fn().mockReturnValue({ category: 'bag', color: 'black' })
      }));
    });

    it('should fetch tags successfully', async () => {
      const { result } = renderHook(() => useAICheck());

      let tags;
      await act(async () => {
        tags = await result.current.fetchTags('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD');
      });

      expect(tags).toBeTruthy();
      expect(result.current.extractedTags).toBeTruthy();
    });
  });
});
