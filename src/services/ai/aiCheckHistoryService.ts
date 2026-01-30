import { WardrobeItem, AICheckHistoryItem } from '../../types';
import { WardrobeItemAnalysis } from './types';
import {
  cleanupRichData,
  detachHistoryRecord,
  getHistory,
  getHistoryByWardrobeItemId,
  getHistoryRecord,
  saveAnalysisToHistory,
  updateRecordStatus,
  calculateHistoryStats
} from './aiCheckHistory';

/**
 * Service for managing AI Check history
 */
export class AICheckHistoryService {
  private static instance: AICheckHistoryService;
  
  public static getInstance(): AICheckHistoryService {
    if (!AICheckHistoryService.instance) {
      AICheckHistoryService.instance = new AICheckHistoryService();
    }
    return AICheckHistoryService.instance;
  }

  /**
   * Save AI Check analysis result to history
   */
  async saveAnalysisToHistory(
    analysisData: WardrobeItemAnalysis,
    itemData: WardrobeItem
  ): Promise<{ success: boolean; historyRecord?: any; error?: string }> {
    return saveAnalysisToHistory(analysisData, itemData);
  }

  /**
   * Detach history record from wardrobe item (set wardrobe_item_id to null)
   */
  async detachHistoryRecord(recordId: string): Promise<{ success: boolean; error?: string }> {
    return detachHistoryRecord(recordId);
  }

  /**
   * Get the most recent AI Check history record for a wardrobe item
   */
  async getHistoryByWardrobeItemId(
    wardrobeItemId: string
  ): Promise<{ success: boolean; record?: AICheckHistoryItem; error?: string }> {
    return getHistoryByWardrobeItemId(wardrobeItemId);
  }

  /**
   * Get AI Check history for the current user
   */
  async getHistory(options: {
    limit?: number;
    offset?: number;
    filters?: any;
  } = {}): Promise<{ success: boolean; history?: AICheckHistoryItem[]; total?: number; error?: string }> {
    return getHistory(options);
  }

  /**
   * Get a specific AI Check history record
   */
  async getHistoryRecord(id: string): Promise<{ success: boolean; record?: AICheckHistoryItem; error?: string }> {
    return getHistoryRecord(id);
  }

  /**
   * Update user action status for an AI Check history record
   */
  async updateRecordStatus(
    id: string, 
    status: 'saved' | 'dismissed' | 'pending' | 'applied' | 'obtained'
  ): Promise<{ success: boolean; error?: string }> {
    return updateRecordStatus(id, status);
  }

  /**
   * Clean up rich data from AI history record (remove images, combinations, keep essentials)
   */
  async cleanupRichData(recordId: string): Promise<{ success: boolean; error?: string }> {
    return cleanupRichData(recordId);
  }

  /**
   * Get AI Check history statistics for dashboard
   */
  async getHistoryStats(): Promise<{ 
    success: boolean; 
    stats?: {
      total: number;
      avgScore: number;
      byCategory: { [key: string]: number };
      byStatus: { [key: string]: number };
      recentCount: number;
    };
    error?: string;
  }> {
    try {
      // Get all history records for stats calculation
      const { success, history, error } = await this.getHistory({ limit: 1000 });
      
      if (!success || !history) {
        return {
          success: false,
          error: error || 'Failed to fetch history for statistics'
        };
      }

      const { total, avgScore, byCategory, byStatus, recentCount } = calculateHistoryStats(history);
      
      return {
        success: true,
        stats: {
          total: total,
          avgScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
          byCategory,
          byStatus,
          recentCount
        }
      };

    } catch (error) {
      console.error('Error calculating AI Check history statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export singleton instance
export const aiCheckHistoryService = AICheckHistoryService.getInstance();
