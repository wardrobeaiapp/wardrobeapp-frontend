import { WardrobeItem, AICheckHistoryItem } from '../../types';
import { WardrobeItemAnalysis } from './types';
import { supabase } from '../core/supabase';

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
  private async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    try {
      // Use shared Supabase client to prevent multiple GoTrueClient instances
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (sessionData?.session?.access_token) {
        headers['x-auth-token'] = sessionData.session.access_token;
        console.log('🔑 Using Supabase session token for ai-check-history');
        return headers;
      }
    } catch (error) {
      console.warn('🔑 Supabase session not available, falling back to localStorage token');
    }
    
    // Fallback to localStorage token
    const token = localStorage.getItem('token');
    if (token) {
      headers['x-auth-token'] = token;
      console.log('🔑 Using localStorage token for ai-check-history');
    } else {
      console.warn('🔑 No authentication token available');
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

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/api/ai-check-history`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ analysis_data: analysisData, item_data: itemData })
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
  async getHistory(options: {
    limit?: number;
    offset?: number;
    filters?: any;
  } = {}): Promise<{ success: boolean; history?: AICheckHistoryItem[]; total?: number; error?: string }> {
    try {
      console.log('🔍 aiCheckHistoryService.getHistory - Starting with options:', options);

      const queryParams = new URLSearchParams();
      
      if (options.limit) queryParams.append('limit', options.limit.toString());
      if (options.offset) queryParams.append('offset', options.offset.toString());
      if (options.filters) queryParams.append('filters', JSON.stringify(options.filters));

      const url = `${API_URL}/api/ai-check-history?${queryParams}`;
      const headers = await this.getAuthHeaders();
      
      console.log('🔍 aiCheckHistoryService.getHistory - Request details:', { 
        url, 
        headers, 
        queryString: queryParams.toString() 
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: headers
      });

      console.log('🔍 aiCheckHistoryService.getHistory - Response status:', response.status);
      console.log('🔍 aiCheckHistoryService.getHistory - Response headers:', response.headers);

      const result = await response.json();
      console.log('🔍 aiCheckHistoryService.getHistory - Raw response:', result);

      if (!response.ok) {
        console.error('🔍 aiCheckHistoryService.getHistory - HTTP error:', response.status, result);
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log('🔍 aiCheckHistoryService.getHistory - Success! Records:', result.history?.length || 0);
      console.log('🔍 aiCheckHistoryService.getHistory - First record sample:', result.history?.[0]);

      return {
        success: true,
        history: result.history,
        total: result.total
      };
    } catch (error) {
      console.error('🔍 aiCheckHistoryService.getHistory - Error occurred:', error);
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

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/api/ai-check-history/${id}`, {
        method: 'GET',
        headers: headers
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

      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_URL}/api/ai-check-history/${id}/status`, {
        method: 'PUT',
        headers: headers,
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
        return {
          success: false,
          error: error || 'Failed to fetch history for statistics'
        };
      }

      // Calculate statistics using simplified structure
      const total = history.length;
      const avgScore = total > 0 ? history.reduce((sum, item) => {
        const score = item.analysisData?.score || 0;
        return sum + score;
      }, 0) / total : 0;
      
      const byCategory: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      const byScore: Record<string, number> = {
        'high': 0, // 8-10
        'medium': 0, // 5-7
        'low': 0 // 0-4
      };
      
      // Calculate recent count (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      let recentCount = 0;
      
      history.forEach(item => {
        // Count by category - access from analysisData.itemDetails
        const category = item.analysisData?.itemDetails?.category || 'other';
        byCategory[category] = (byCategory[category] || 0) + 1;
        
        // Count by user action status
        const status = item.userActionStatus || 'pending';
        byStatus[status] = (byStatus[status] || 0) + 1;
        
        // Count by score range - access from analysisData
        const score = item.analysisData?.score || 0;
        if (score >= 8) {
          byScore['high']++;
        } else if (score >= 5) {
          byScore['medium']++;
        } else {
          byScore['low']++;
        }

        // Count recent items
        const itemDate = new Date(item.createdAt);
        if (itemDate > weekAgo) {
          recentCount++;
        }
      });

      return {
        success: true,
        stats: {
          total,
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
