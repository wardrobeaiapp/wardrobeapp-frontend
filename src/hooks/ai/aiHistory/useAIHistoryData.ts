import { useEffect } from 'react';
import { aiCheckHistoryService } from '../../../services/ai/aiCheckHistoryService';
import { AIHistoryItem } from '../../../types/ai';
import { HISTORY_CREATED_EVENT } from './types';
import { transformHistoryRecord } from './transform';

export const useAIHistoryData = (
  setHistoryItems: (updater: (prev: AIHistoryItem[]) => AIHistoryItem[]) => void,
  setIsLoadingHistory: (loading: boolean) => void
) => {
  // Initial data loading
  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        setIsLoadingHistory(true);
        const result = await aiCheckHistoryService.getHistory({ limit: 20 });

        if (result.success && result.history) {
          console.log('[AIHistory] Loaded history items:', result.history.length);
          const transformedHistory: AIHistoryItem[] = result.history.map((item: any) => transformHistoryRecord(item));
          setHistoryItems(() => transformedHistory);
        } else {
          console.error('Failed to load AI Check history:', result.error);
          setHistoryItems(() => []);
        }
      } catch (error) {
        console.error('Error loading AI Check history:', error);
        setHistoryItems(() => []);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistoryData();
  }, [setHistoryItems, setIsLoadingHistory]);

  // Listen for new history items
  useEffect(() => {
    const handler = async (event: Event) => {
      const customEvent = event as CustomEvent<{ historyRecordId?: string }>;
      const historyRecordId = customEvent?.detail?.historyRecordId;
      if (!historyRecordId) return;

      const recordResult = await aiCheckHistoryService.getHistoryRecord(historyRecordId);
      if (!recordResult.success || !recordResult.record) return;

      const newItem = transformHistoryRecord(recordResult.record as any);

      setHistoryItems((prev: AIHistoryItem[]) => {
        const next = prev.some((i: AIHistoryItem) => i.id === newItem.id)
          ? prev.map((i: AIHistoryItem) => (i.id === newItem.id ? newItem : i))
          : [newItem, ...prev];

        const sorted = [...next].sort((a, b) => b.date.getTime() - a.date.getTime());
        return sorted.slice(0, 20);
      });
    };

    window.addEventListener(HISTORY_CREATED_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(HISTORY_CREATED_EVENT, handler as EventListener);
    };
  }, [setHistoryItems]);
};
