/**
 * Utility functions for image processing
 */

/**
 * Resize an image to reduce its file size for API submissions
 * @param base64Image Base64 image data (data URI)
 * @param maxWidth Maximum width to resize to
 * @param maxHeight Maximum height to resize to
 * @param quality JPEG quality (0-1)
 * @returns Promise resolving to resized base64 image
 */
export const resizeImage = (base64Image: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Create an image element to load the base64 data
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        // Create a canvas to draw the resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const resizedBase64 = canvas.toDataURL('image/jpeg', quality);
        
        // Log the size reduction
        console.log(`[imageUtils] Original size: ${base64Image.length} bytes, Resized: ${resizedBase64.length} bytes`);
        
        resolve(resizedBase64);
      };
      
      img.onerror = (e) => {
        reject(new Error('Error loading image for resizing'));
      };
      
      // Set the source to the base64 data
      img.src = base64Image;
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Compress image by reducing quality or dimensions to meet maximum size limit
 * @param base64Image Base64 image data (data URI)
 * @param maxSizeBytes Maximum size in bytes
 * @returns Promise resolving to compressed base64 image
 */
export const compressImageToMaxSize = async (base64Image: string, maxSizeBytes = 1000000): Promise<string> => {
  // If image is already small enough, return it as is
  if (base64Image.length <= maxSizeBytes) {
    return base64Image;
  }

  // Check if this is actually a base64 data URI
  if (!base64Image.startsWith('data:')) {
    console.error('[imageUtils] Not a valid data URI format');
    return base64Image; // Return original if not valid data URI
  }
  
  // Try with progressively more aggressive compression
  const qualityLevels = [0.8, 0.6, 0.4, 0.2, 0.1, 0.05];
  let compressedImage = base64Image;
  
  for (const quality of qualityLevels) {
    try {
      compressedImage = await resizeImage(base64Image, 800, 800, quality);
      if (compressedImage.length <= maxSizeBytes) {
        console.log(`[imageUtils] Successfully compressed image to ${compressedImage.length} bytes with quality ${quality}`);
        return compressedImage;
      }
    } catch (error) {
      console.error(`[imageUtils] Error compressing at quality ${quality}:`, error);
    }
  }
  
  // If quality reduction wasn't enough, try reducing dimensions more aggressively
  const dimensions = [
    { width: 600, height: 600 },
    { width: 400, height: 400 },
    { width: 300, height: 300 },
    { width: 200, height: 200 },
    { width: 150, height: 150 }
  ];
  
  for (const { width, height } of dimensions) {
    // Try progressively lower qualities at each dimension
    for (const quality of [0.5, 0.3, 0.1]) {
      try {
        compressedImage = await resizeImage(base64Image, width, height, quality);
        if (compressedImage.length <= maxSizeBytes) {
          console.log(`[imageUtils] Successfully compressed image to ${compressedImage.length} bytes with dimensions ${width}x${height} and quality ${quality}`);
          return compressedImage;
        }
      } catch (error) {
        console.error(`[imageUtils] Error compressing at dimensions ${width}x${height} with quality ${quality}:`, error);
      }
    }
  }
  
  // If we still can't get under the max size, use the smallest version we were able to create
  console.warn(`[imageUtils] Could not compress image below ${maxSizeBytes} bytes. Final size: ${compressedImage.length} bytes`);
  return compressedImage;
};
