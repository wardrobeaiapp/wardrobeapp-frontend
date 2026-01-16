import { WardrobeItem, AICheckHistoryItem } from '../../types';
import { WardrobeItemAnalysis } from './types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
   * Get authentication headers for API requests
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['x-auth-token'] = token;
    }
    
    return headers;
  }

  /**
   * Save AI Check analysis result to history
   */
  async saveAnalysisToHistory(
    analysisData: WardrobeItemAnalysis,
    itemData: WardrobeItem
  ): Promise<{ success: boolean; historyRecord?: any; error?: string }> {
    try {
      console.log('Saving AI Check to history:', {
        itemName: itemData.name,
        itemId: itemData.id,
        score: analysisData.score
      });

      const response = await fetch(`${API_URL}/api/ai-check-history`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          analysis_data: analysisData,
          item_data: itemData
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log('AI Check saved to history successfully:', result.history_record);

      return {
        success: true,
        historyRecord: result.history_record
      };
    } catch (error) {
      console.error('Error saving AI Check to history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get AI Check history for the current user
   */
  async getHistory(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    minScore?: number;
    maxScore?: number;
  }): Promise<{ success: boolean; history?: AICheckHistoryItem[]; total?: number; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.offset) queryParams.append('offset', options.offset.toString());
      if (options?.category) queryParams.append('category', options.category);
      if (options?.minScore !== undefined) queryParams.append('min_score', options.minScore.toString());
      if (options?.maxScore !== undefined) queryParams.append('max_score', options.maxScore.toString());

      const url = `${API_URL}/api/ai-check-history${queryParams.toString() ? `?${queryParams}` : ''}`;
      
      console.log('Fetching AI Check history:', { url, options });

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log(`Fetched ${result.history?.length || 0} AI Check history records`);

      return {
        success: true,
        history: result.history,
        total: result.total
      };
    } catch (error) {
      console.error('Error fetching AI Check history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get a specific AI Check history record
   */
  async getHistoryRecord(id: string): Promise<{ success: boolean; record?: AICheckHistoryItem; error?: string }> {
    try {
      console.log('Fetching AI Check history record:', id);

      const response = await fetch(`${API_URL}/api/ai-check-history/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log('Fetched AI Check history record successfully');

      return {
        success: true,
        record: result.record
      };
    } catch (error) {
      console.error('Error fetching AI Check history record:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Update user action status for an AI Check history record
   */
  async updateRecordStatus(
    id: string, 
    status: 'saved' | 'dismissed' | 'pending' | 'applied'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('Updating AI Check history record status:', { id, status });

      const response = await fetch(`${API_URL}/api/ai-check-history/${id}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          user_action_status: status
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log('AI Check history record status updated successfully');

      return { success: true };
    } catch (error) {
      console.error('Error updating AI Check history record status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get AI Check history statistics for dashboard
   */
  async getHistoryStats(): Promise<{ 
    success: boolean; 
    stats?: {
      total: number;
      avgScore: number;
      byCategory: Record<string, number>;
      byStatus: Record<string, number>;
      recentCount: number;
    }; 
    error?: string 
  }> {
    try {
      // Get all history records for stats calculation
      const { success, history, error } = await this.getHistory({ limit: 1000 });
      
      if (!success || !history) {
        return { success: false, error: error || 'Failed to fetch history for stats' };
      }

      // Calculate statistics
      const total = history.length;
      const avgScore = total > 0 ? history.reduce((sum, item) => sum + (item.score || 0), 0) / total : 0;
      
      const byCategory: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      
      // Count recent records (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentCount = history.filter(item => new Date(item.date) > thirtyDaysAgo).length;

      // Aggregate by category and status
      history.forEach(item => {
        // Count by category
        const category = item.itemCategory || 'other';
        byCategory[category] = (byCategory[category] || 0) + 1;
        
        // Count by user action status
        const status = item.userActionStatus || 'pending';
        byStatus[status] = (byStatus[status] || 0) + 1;
      });

      const stats = {
        total,
        avgScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
        byCategory,
        byStatus,
        recentCount
      };

      console.log('AI Check history stats calculated:', stats);

      return { success: true, stats };
    } catch (error) {
      console.error('Error calculating AI Check history stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Export singleton instance
export const aiCheckHistoryService = AICheckHistoryService.getInstance();
