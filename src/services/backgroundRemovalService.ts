/**
 * Removes background from image using Ximilar API
 * @param imageInput - Image URL or base64 string
 * @returns Promise<string> - URL of the processed image with removed background
 */
export const removeBackground = async (imageInput: string): Promise<string> => {
  try {
    console.log('[backgroundRemovalService] Starting background removal with Ximilar...');
    
    const apiToken = process.env.REACT_APP_XIMILAR_TOKEN;
    if (!apiToken) {
      throw new Error('XIMILAR_TOKEN not found in environment variables');
    }

    // Use precise model for high-quality results
    const response = await fetch('https://api.ximilar.com/removebg/fast/removebg', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            _base64: imageInput.startsWith('data:') ? imageInput : undefined,
            _url: !imageInput.startsWith('data:') ? imageInput : undefined,
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Ximilar API error (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    
    if (!data.records || data.records.length === 0) {
      throw new Error('No records returned from Ximilar API');
    }

    const record = data.records[0];
    if (record._status?.code !== 200) {
      throw new Error(`Processing failed: ${record._status?.text || 'Unknown error'}`);
    }

    if (!record._output_url) {
      throw new Error('No output URL returned from Ximilar API');
    }

    console.log('[backgroundRemovalService] Background removal completed successfully');
    return record._output_url;
    
  } catch (error) {
    console.error('[backgroundRemovalService] Background removal failed:', error);
    throw new Error(
      error instanceof Error 
        ? `Background removal failed: ${error.message}`
        : 'Background removal failed: Unknown error'
    );
  }
};

/**
 * Convert File to base64 string for Replicate API
 * @param file - File object
 * @returns Promise<string> - Base64 data URL
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
  });
};

/**
 * Convert base64 to File object
 * @param base64 - Base64 data URL
 * @param filename - Desired filename
 * @returns File object
 */
export const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
};
