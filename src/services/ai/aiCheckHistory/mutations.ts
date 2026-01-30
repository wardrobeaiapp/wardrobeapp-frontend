import { WardrobeItem } from '../../../types';
import { WardrobeItemAnalysis } from '../types';
import { getAuthHeaders } from './auth';
import { API_URL } from './config';

export async function saveAnalysisToHistory(
  analysisData: WardrobeItemAnalysis,
  itemData: WardrobeItem
): Promise<{ success: boolean; historyRecord?: any; error?: string }> {
  try {
    console.log('Saving AI Check to history:', {
      itemName: itemData.name,
      itemId: itemData.id,
      score: analysisData.score
    });

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai-check-history`, {
      method: 'POST',
      headers,
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

export async function detachHistoryRecord(recordId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai-check-history/${recordId}/detach`, {
      method: 'PUT',
      headers
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export async function updateRecordStatus(
  id: string,
  status: 'saved' | 'dismissed' | 'pending' | 'applied' | 'obtained'
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Updating AI Check history record status:', { id, status });

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai-check-history/${id}/status`, {
      method: 'PUT',
      headers,
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

export async function cleanupRichData(recordId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    if (!apiUrl) {
      throw new Error('API URL not configured');
    }

    const headers = await getAuthHeaders();

    const response = await fetch(`${apiUrl}/api/ai-check-history/${recordId}/cleanup`, {
      method: 'PUT',
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Cleanup API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
    }

    await response.json();

    console.log('AI Check history rich data cleaned up successfully');
    return { success: true };
  } catch (error) {
    console.error('Error cleaning up AI Check history rich data:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
