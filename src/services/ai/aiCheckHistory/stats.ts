import { AICheckHistoryItem } from '../../../types';

type HistoryStats = {
  total: number;
  avgScore: number;
  byCategory: { [key: string]: number };
  byStatus: { [key: string]: number };
  recentCount: number;
};

export function calculateHistoryStats(history: AICheckHistoryItem[]): HistoryStats {
  const total = history.length;
  const avgScore =
    total > 0
      ? history.reduce((sum, item) => {
          const score = item.analysisData?.score || 0;
          return sum + score;
        }, 0) / total
      : 0;

  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  let recentCount = 0;

  history.forEach(item => {
    const category = item.analysisData?.itemDetails?.category || 'other';
    byCategory[category] = (byCategory[category] || 0) + 1;

    const status = item.userActionStatus || 'pending';
    byStatus[status] = (byStatus[status] || 0) + 1;

    const itemDate = new Date(item.createdAt);
    if (itemDate > weekAgo) {
      recentCount++;
    }
  });

  return {
    total,
    avgScore: Math.round(avgScore * 10) / 10,
    byCategory,
    byStatus,
    recentCount
  };
}
