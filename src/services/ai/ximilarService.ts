export interface XimilarTag {
  name: string;
  prob: number; // Probability score 0-1
  id?: string;
}

export interface XimilarTagResponse {
  records: Array<{
    _id: string;
    _width?: number;
    _height?: number;
    _status?: {
      code: number;
      text: string;
      request_id: string;
    };
    _tags?: {
      [key: string]: Array<{
        id: string;
        name: string;
        prob: number;
      }>;
    };
    _tags_simple?: string[];
    _tags_map?: {
      [key: string]: string;
    };
    [key: string]: any; // For dynamic properties like "Top Category"
  }>;
  version?: string;
  model_format?: string;
  calls?: any[];
  statistics?: {
    [key: string]: number;
  };
  status: {
    code: number;
    text: string;
    request_id?: string;
    proc_id?: string;
  };
}

/**
 * Detects tags in an image using Ximilar API
 * @param imageInput - Image URL or base64 string
 * @param minConfidence - Minimum confidence threshold (0-1)
 * @returns Promise<XimilarTagResponse> - Tags detected in the image
 */
export const detectImageTags = async (
  imageInput: string,
  minConfidence: number = 0.7
): Promise<XimilarTagResponse> => {
  const apiToken = process.env.REACT_APP_XIMILAR_TOKEN;
  if (!apiToken) {
    throw new Error('XIMILAR_TOKEN not found in environment variables');
  }

  console.log('[Ximilar] Sending request to Ximilar API...');
  console.log('[Ximilar] Image input type:', imageInput.startsWith('data:') ? 'base64' : 'url');
  
  try {
    const response = await fetch('https://api.ximilar.com/tagging/fashion/v2/tags', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            _base64: imageInput.startsWith('data:') ? imageInput.split(',')[1] : undefined,
            _url: !imageInput.startsWith('data:') ? imageInput : undefined,
          },
        ],
        settings: {
          min_score: minConfidence,
        },
      }),
    });

    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      console.error('[Ximilar] API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        response: responseData
      });
      throw new Error(responseData.message || `API request failed with status ${response.status}`);
    }

    console.log('[Ximilar] API Response:', JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error) {
    console.error('[Ximilar] Request failed:', error);
    throw error;
  }
};

/**
 * Extracts all tags from the Ximilar response
 * @param response - The Ximilar tag response
 * @returns Object with tags as key-value pairs
 */
export const extractTopTags = (
  response: XimilarTagResponse
): Record<string, string> => {
  const record = response.records?.[0];
  if (!record) return {};

  // Get all tags from _tags_map if available
  if (record._tags_map) {
    return { ...record._tags_map };
  }

  // Fallback to _tags if available
  if (record._tags) {
    const tags: Record<string, string> = {};
    Object.entries(record._tags).forEach(([category, tagList]) => {
      if (Array.isArray(tagList)) {
        const topTag = tagList
          .filter(tag => tag && tag.name && tag.prob >= 0.5)
          .sort((a, b) => b.prob - a.prob)[0];
        if (topTag) {
          tags[category] = topTag.name;
        }
      }
    });
    return tags;
  }

  return {};
};
