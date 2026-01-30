import { AICheckHistoryItem } from '../../../types';
import { getAuthHeaders } from './auth';
import { API_URL } from './config';

export async function getHistory(options: {
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
    const headers = await getAuthHeaders();

    console.log('🔍 aiCheckHistoryService.getHistory - Request details:', {
      url,
      headers,
      queryString: queryParams.toString()
    });

    const response = await fetch(url, {
      method: 'GET',
      headers
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

export async function getHistoryRecord(
  id: string
): Promise<{ success: boolean; record?: AICheckHistoryItem; error?: string }> {
  try {
    console.log('Fetching AI Check history record:', id);

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai-check-history/${id}`, {
      method: 'GET',
      headers
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

export async function getHistoryByWardrobeItemId(
  wardrobeItemId: string
): Promise<{ success: boolean; record?: AICheckHistoryItem; error?: string }> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/api/ai-check-history/by-wardrobe-item/${wardrobeItemId}`, {
      method: 'GET',
      headers
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }

    return {
      success: true,
      record: result.record
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}
