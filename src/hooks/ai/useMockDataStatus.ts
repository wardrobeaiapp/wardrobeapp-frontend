import { useState, useEffect } from 'react';
import { aiAnalysisMocksService } from '../../services/ai/aiAnalysisMocksService';
import { WardrobeItem } from '../../types';

interface MockDataStatus {
  [itemId: string]: boolean;
}

/**
 * Hook to check which items have saved AI analysis mock data
 * Efficiently batches requests to avoid overwhelming the database
 */
export const useMockDataStatus = (items: WardrobeItem[], disabled = false) => {
  const [mockStatus, setMockStatus] = useState<MockDataStatus>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip all processing when disabled
    if (disabled) {
      return;
    }

    const checkMockData = async () => {
      if (!items || items.length === 0) {
        setMockStatus({});
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const statusPromises = items.map(async (item) => {
          try {
            const mockData = await aiAnalysisMocksService.getMockAnalysis(item.id);
            return { itemId: item.id, hasMockData: mockData !== null };
          } catch (error) {
            console.warn(`Failed to check mock data for item ${item.id}:`, error);
            return { itemId: item.id, hasMockData: false };
          }
        });

        const results = await Promise.allSettled(statusPromises);
        
        const newStatus: MockDataStatus = {};
        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            const { itemId, hasMockData } = result.value;
            newStatus[itemId] = hasMockData;
          }
        });

        setMockStatus(newStatus);
      } catch (error) {
        console.error('Error checking mock data status:', error);
        setError(error instanceof Error ? error.message : 'Failed to check mock data status');
        setMockStatus({});
      } finally {
        setIsLoading(false);
      }
    };

    checkMockData();
  }, [items, disabled]);

  return {
    mockStatus,
    isLoading,
    error,
    hasMockData: (itemId: string) => mockStatus[itemId] || false
  };
};
