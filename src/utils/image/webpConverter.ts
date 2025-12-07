/**
 * WebP conversion utilities
 * Standalone functions for converting images to WebP format
 */

/**
 * Convert image to WebP format with high quality preservation
 * @param source - File or Blob to convert
 * @param quality - Quality setting (0.0 to 1.0, default 0.92)
 * @returns Promise<Blob> - WebP blob
 */
export const convertToWebP = async (source: File | Blob, quality: number = 0.92): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image to canvas
      ctx.drawImage(img, 0, 0);
      
      // Convert to WebP with specified quality (0.92 = 92% quality)
      canvas.toBlob((blob) => {
        if (blob) {
          console.log(`[webpConverter] WebP conversion successful. Original: ${(source.size / 1024 / 1024).toFixed(2)}MB → WebP: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
          resolve(blob);
        } else {
          reject(new Error('WebP conversion failed'));
        }
      }, 'image/webp', quality);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for WebP conversion'));
    };
    
    // Load the image
    img.src = URL.createObjectURL(source);
  });
};
