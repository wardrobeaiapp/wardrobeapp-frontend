/**
 * Integration tests for wardrobeAnalysisService - Styling Context Integration
 */

import { wardrobeAnalysisService } from '../../../services/ai/wardrobeAnalysisService';
import { WardrobeItem, ItemCategory, Season } from '../../../types';
import axios from 'axios';

// Mock the axios module
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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

const mockFilterStylingContext = wardrobeContextHelpers.filterStylingContext as jest.MockedFunction<typeof wardrobeContextHelpers.filterStylingContext>;
const mockFilterSimilarContext = wardrobeContextHelpers.filterSimilarContext as jest.MockedFunction<typeof wardrobeContextHelpers.filterSimilarContext>;
const mockFlattenComplementingItems = wardrobeContextHelpers.flattenComplementingItems as jest.MockedFunction<typeof wardrobeContextHelpers.flattenComplementingItems>;
const mockFilterItemContextForAI = itemContextFilter.filterItemContextForAI as jest.MockedFunction<typeof itemContextFilter.filterItemContextForAI>;
const mockGetPayloadStats = itemContextFilter.getPayloadStats as jest.MockedFunction<typeof itemContextFilter.getPayloadStats>;
const mockGetUserAnalysisData = userDataService.getUserAnalysisData as jest.MockedFunction<typeof userDataService.getUserAnalysisData>;
const mockGenerateScenarioCoverage = coverageService.generateScenarioCoverage as jest.MockedFunction<typeof coverageService.generateScenarioCoverage>;
const mockProcessImageForAnalysis = imageProcessingService.processImageForAnalysis as jest.MockedFunction<typeof imageProcessingService.processImageForAnalysis>;

describe('wardrobeAnalysisService - Styling Context Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockGetUserAnalysisData.mockResolvedValue({
      user: { id: 'user-1' },
      climateData: null,
      wardrobeItems: mockWardrobeItems,
      scenarios: [],
      userGoals: []
    });

    mockGenerateScenarioCoverage.mockResolvedValue([]);
    mockProcessImageForAnalysis.mockResolvedValue({
      processedImage: 'processed-image-data'
    });
    mockFilterItemContextForAI.mockImplementation((items) => items);
    mockGetPayloadStats.mockReturnValue({
      originalSize: 10000,
      filteredSize: 8800,
      reductionPercent: 15,
      reduction: 1200
    });
    
    // Mock successful axios response
    mockedAxios.post.mockResolvedValue({
      data: {
        analysis: 'Mock analysis result',
        score: 85,
        suitableScenarios: ['office'],
        compatibleItems: {}
      }
    });

    // Setup styling context mocks
    mockFilterStylingContext.mockReturnValue(mockStylingContextResult);
    mockFilterSimilarContext.mockReturnValue([]);
    mockFlattenComplementingItems.mockImplementation((complementingItems) => {
      if (!complementingItems) return [];
      const result = [];
      if (complementingItems.bottoms) result.push(...complementingItems.bottoms);
      if (complementingItems.footwear) result.push(...complementingItems.footwear);
      if (complementingItems.accessories) result.push(...complementingItems.accessories);
      return result;
    });
  });

  const mockWardrobeItems: WardrobeItem[] = [
    {
      id: 'item-1',
      name: 'Navy Trousers',
      category: ItemCategory.BOTTOM,
      subcategory: 'trousers',
      color: 'navy',
      details: 'straight-leg with belt loops',
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
      details: 'pointed toe with 3-inch block heel',
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
      details: 'crew neck with short sleeves',
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
      details: 'button-front with ribbed cuffs',
      season: [Season.TRANSITIONAL],
      scenarios: ['office'],
      wishlist: false,
      dateAdded: '2024-01-01'
    }
  ];

  const mockStylingContextResult = {
    complementing: {
      bottoms: [mockWardrobeItems[0]], // Navy trousers
      footwear: [mockWardrobeItems[1]], // Black heels
    },
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

    const result = await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData);

    // Should return result with empty styling context handled
    expect(result).toBeDefined();
    expect(result.analysis).toBeDefined();
    
    // Should have called axios with the correct endpoint and undefined stylingContext for empty context
    expect(mockedAxios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/analyze-wardrobe-item-simple'),
      expect.objectContaining({
        stylingContext: undefined // Service sends undefined when no styling context items
      })
    );
  });

  describe('Styling context splitting integration', () => {
    it('should log styling context statistics', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generated styling context: 4 items') // Updated: 2 complementing + 2 layering + 0 outerwear = 4 items
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle filterStylingContext errors gracefully', async () => {
      // Suppress console.error for this test since we're intentionally causing an error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockFilterStylingContext.mockImplementation(() => {
        throw new Error('Styling context error');
      });

      const result = await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData);
      
      // Should return error response instead of throwing
      expect(result).toBeDefined();
      expect(result.error).toBe('unknown_error');
      expect(result.details).toBe('Styling context error');
      
      // Clean up console spy
      consoleErrorSpy.mockRestore();
    });

    it('should handle partial styling context results', async () => {
      mockFilterStylingContext.mockReturnValue({
        complementing: { bottoms: [mockWardrobeItems[0]] },
        layering: [], // Empty layering
        outerwear: []
      });

      const result = await wardrobeAnalysisService.analyzeWardrobeItem('mock-image-data', undefined, mockFormData);

      expect(result).toBeDefined();
      expect(result.analysis).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/analyze-wardrobe-item-simple'),
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
