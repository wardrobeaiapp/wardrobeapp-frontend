import { useState } from 'react';
import { WardrobeItem, WishlistStatus } from '../../../../../types';
import { DetectedTags } from '../../../../../services/ai/formAutoPopulation';

interface UseMockSaveProps {
  selectedWishlistItem?: WardrobeItem | null;
  onSaveMock?: (mockData: any) => void;
}

interface MockSaveState {
  isSavingMock: boolean;
  mockSaveStatus: 'idle' | 'success' | 'error';
  handleSaveMock: (mockData: MockDataInput) => Promise<void>;
}

interface MockDataInput {
  score?: number;
  suitableScenarios?: string[];
  compatibleItems?: { [category: string]: any[] };
  outfitCombinations?: any[];
  seasonScenarioCombinations?: any[];
  coverageGapsWithNoOutfits?: any[];
  itemSubcategory?: string;
  status?: WishlistStatus;
  extractedTags?: DetectedTags | null;
  recommendationAction?: string;
  recommendationText?: string;
  analysisResult?: string;
  error?: string;
  errorDetails?: string;
}

export const useMockSave = ({
  selectedWishlistItem,
  onSaveMock
}: UseMockSaveProps): MockSaveState => {
  const [isSavingMock, setIsSavingMock] = useState(false);
  const [mockSaveStatus, setMockSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSaveMock = async (mockDataInput: MockDataInput) => {
    if (!selectedWishlistItem || !onSaveMock) {
      console.error('Cannot save mock: missing wardrobe item or callback');
      return;
    }

    setIsSavingMock(true);
    setMockSaveStatus('idle');

    try {
      // Prepare the analysis data to save as mock
      const mockData = {
        compatibility: {
          score: mockDataInput.score || 0,
          reasons: mockDataInput.suitableScenarios || []
        },
        compatibleItems: mockDataInput.compatibleItems || {},
        outfitCombinations: mockDataInput.outfitCombinations || [],
        seasonScenarioCombinations: mockDataInput.seasonScenarioCombinations || [],
        coverageGapsWithNoOutfits: mockDataInput.coverageGapsWithNoOutfits || [],
        itemSubcategory: mockDataInput.itemSubcategory || '',
        status: mockDataInput.status || WishlistStatus.NOT_REVIEWED,
        extractedTags: mockDataInput.extractedTags || null,
        recommendationAction: mockDataInput.recommendationAction || '',
        recommendationText: mockDataInput.recommendationText || '',
        analysisResult: mockDataInput.analysisResult || '',
        error: mockDataInput.error || null,
        errorDetails: mockDataInput.errorDetails || null
      };

      console.log('Saving analysis as mock for item:', selectedWishlistItem.id, mockData);
      
      await onSaveMock(mockData);
      setMockSaveStatus('success');
      
      // Reset success status after 3 seconds
      setTimeout(() => setMockSaveStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Error saving mock:', error);
      setMockSaveStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => setMockSaveStatus('idle'), 5000);
    } finally {
      setIsSavingMock(false);
    }
  };

  return {
    isSavingMock,
    mockSaveStatus,
    handleSaveMock
  };
};
