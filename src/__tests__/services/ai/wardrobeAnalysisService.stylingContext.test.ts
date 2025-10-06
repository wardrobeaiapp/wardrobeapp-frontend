/**
 * Integration tests for wardrobeAnalysisService - Styling Context Integration
 */

import { wardrobeAnalysisService } from '../../../services/ai/wardrobeAnalysisService';
import { WardrobeItem, ItemCategory, Season } from '../../../types';

// Mock the axios module
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

// Mock the helper functions
jest.mock('../../../services/ai/wardrobeContextHelpers');
jest.mock('../../../services/ai/itemContextFilter');
jest.mock('../../../services/ai/analysis/userDataService');
jest.mock('../../../services/ai/analysis/coverageService');
jest.mock('../../../services/ai/analysis/imageProcessingService');

import * as wardrobeContextHelpers from '../../../services/ai/wardrobeContextHelpers';
import * as itemContextFilter from '../../../services/ai/itemContextFilter';
import * as userDataService from '../../../services/ai/analysis/userDataService';
import * as coverageService from '../../../services/ai/analysis/coverageService';
import * as imageProcessingService from '../../../services/ai/analysis/imageProcessingService';
import axios from 'axios';

const mockFilterStylingContext = wardrobeContextHelpers.filterStylingContext as jest.MockedFunction<typeof wardrobeContextHelpers.filterStylingContext>;
const mockFilterSimilarContext = wardrobeContextHelpers.filterSimilarContext as jest.MockedFunction<typeof wardrobeContextHelpers.filterSimilarContext>;
const mockFilterItemContextForAI = itemContextFilter.filterItemContextForAI as jest.MockedFunction<typeof itemContextFilter.filterItemContextForAI>;
const mockGetUserAnalysisData = userDataService.getUserAnalysisData as jest.MockedFunction<typeof userDataService.getUserAnalysisData>;
const mockGenerateScenarioCoverage = coverageService.generateScenarioCoverage as jest.MockedFunction<typeof coverageService.generateScenarioCoverage>;
const mockProcessImageForAnalysis = imageProcessingService.processImageForAnalysis as jest.MockedFunction<typeof imageProcessingService.processImageForAnalysis>;

describe('wardrobeAnalysisService - Styling Context Integration', () => {
  const mockWardrobeItems: WardrobeItem[] = [
    {
      id: 'item-1',
      name: 'Navy Trousers',
      category: ItemCategory.BOTTOM,
      subcategory: 'trousers',
      color: 'navy',
      season: [Season.SUMMER],
      scenarios: ['office'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    {
      id: 'item-2',
      name: 'Black Heels',
      category: ItemCategory.FOOTWEAR,
      subcategory: 'heels',
      color: 'black',
      season: [Season.SUMMER],
      scenarios: ['office'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    {
      id: 'item-3',
      name: 'White Basic Tee',
      category: ItemCategory.TOP,
      subcategory: 't-shirt',
      color: 'white',
      season: [Season.SUMMER],
      scenarios: ['casual'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    {
      id: 'item-4',
      name: 'Navy Cardigan',
      category: ItemCategory.OUTERWEAR,
      subcategory: 'cardigan',
      color: 'navy',
      season: [Season.TRANSITIONAL],
      scenarios: ['office'],
      wishlist: false,
      dateAdded: '2024-01-01'
    }
  ];

  const mockStylingContextResult = {
    complementing: [mockWardrobeItems[0], mockWardrobeItems[1]], // Navy trousers, Black heels
    layering: [mockWardrobeItems[2], mockWardrobeItems[3]], // Basic tee, Navy cardigan
    outerwear: []
  };

  const mockFormData = {
    category: 'top',
    subcategory: 'blouse',
    color: 'white',
    seasons: ['summer']
  };

  it('should handle empty styling context gracefully', async () => {
    mockFilterStylingContext.mockReturnValue({
      complementing: {},
      layering: [],
      outerwear: []
    });

    await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData);

    // Should not include stylingContext in API call if empty
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/ai/analyze-simple'),
      expect.objectContaining({
        stylingContext: undefined // Should be undefined for empty context
      })
    );
  });

  describe('Styling context splitting integration', () => {
    it('should log styling context statistics', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generated styling context: 4 items')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle filterStylingContext errors gracefully', async () => {
      mockFilterStylingContext.mockImplementation(() => {
        throw new Error('Styling context error');
      });

      await expect(
        wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData)
      ).rejects.toThrow('Styling context error');
    });

    it('should handle partial styling context results', async () => {
      mockFilterStylingContext.mockReturnValue({
        complementing: { bottoms: [mockWardrobeItems[0]] },
        layering: [], // Empty layering
        outerwear: []
      });

      const result = await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData);

      expect(result).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/ai/analyze-simple'),
        expect.objectContaining({
          stylingContext: expect.arrayContaining([
            expect.objectContaining({ name: 'Navy Trousers' })
          ])
        })
      );
    });
  });

  describe('Different item categories', () => {
    it('should handle ONE_PIECE items correctly', async () => {
      const dressFormData = {
        category: 'one_piece',
        subcategory: 'dress', 
        color: 'black',
        seasons: ['summer']
      };

      mockFilterStylingContext.mockReturnValue({
        complementing: { footwear: [mockWardrobeItems[1]] }, // Just heels
        layering: [], // Dresses typically don't layer
        outerwear: []
      });

      await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, dressFormData);

      expect(mockFilterStylingContext).toHaveBeenCalledWith(
        mockWardrobeItems,
        expect.objectContaining({
          category: 'one_piece',
          subcategory: 'dress'
        })
      );
    });

    it('should handle OUTERWEAR items correctly', async () => {
      const outerwearFormData = {
        category: 'outerwear',
        subcategory: 'blazer',
        color: 'navy',
        seasons: ['spring/fall']
      };

      mockFilterStylingContext.mockReturnValue({
        complementing: { 
          bottoms: [mockWardrobeItems[0]], // Trousers
          footwear: [mockWardrobeItems[1]] // Heels
        },
        layering: [mockWardrobeItems[2]], // Basic tee that can go underneath
        outerwear: []
      });

      await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, outerwearFormData);

      expect(mockFilterStylingContext).toHaveBeenCalledWith(
        mockWardrobeItems,
        expect.objectContaining({
          category: 'outerwear',
          subcategory: 'blazer'
        })
      );
    });
  });

  describe('Performance considerations', () => {
    it('should filter large wardrobes efficiently', async () => {
      const largeWardrobe = Array.from({ length: 100 }, (_, i) => ({
        ...mockWardrobeItems[0],
        id: `item-${i}`,
        name: `Item ${i}`
      }));

      mockGetUserAnalysisData.mockResolvedValue({
        user: { id: 'user-1' },
        climateData: null,
        wardrobeItems: largeWardrobe,
        scenarios: [],
        userGoals: []
      });

      mockFilterStylingContext.mockReturnValue({
        complementing: { 
          bottoms: largeWardrobe.slice(0, 7),
          footwear: largeWardrobe.slice(7, 13), 
          accessories: largeWardrobe.slice(13, 20)
        },
        layering: largeWardrobe.slice(20, 25),
        outerwear: []
      });

      const startTime = Date.now();
      await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData);
      const endTime = Date.now();

      // Should complete in reasonable time (less than 2 seconds)
      expect(endTime - startTime).toBeLessThan(2000);
      
      // Should still call the filtering function
      expect(mockFilterStylingContext).toHaveBeenCalledWith(
        largeWardrobe,
        expect.any(Object)
      );
    });
  });
});
