import { AICheckHistoryItem } from '../../../types';

type HistoryStats = {
  total: number;
  savedCount: number;
  dismissedCount: number;
  byCategory: { [key: string]: number };
  byStatus: { [key: string]: number };
};

export function calculateHistoryStats(history: AICheckHistoryItem[]): HistoryStats {
  const total = history.length;
  const savedCount = history.filter(item => item.userActionStatus === 'saved').length;
  const dismissedCount = history.filter(item => item.userActionStatus === 'dismissed').length;

  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  history.forEach(item => {
    const category = item.analysisData?.itemDetails?.category || 'other';
    byCategory[category] = (byCategory[category] || 0) + 1;

    const status = item.userActionStatus || 'pending';
    byStatus[status] = (byStatus[status] || 0) + 1;
  });

  return {
    total,
    savedCount,
    dismissedCount,
    byCategory,
    byStatus
  };
}
