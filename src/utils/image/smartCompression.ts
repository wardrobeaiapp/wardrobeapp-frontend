/**
 * Smart Image Compression Utilities
 * Provides TinyPNG-like compression without external API dependency
 */

export interface CompressionOptions {
  targetSizeKB?: number;
  maxQuality?: number;
  minQuality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'webp' | 'jpeg' | 'png';
  enableProgressiveOptimization?: boolean;
}

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  quality: number;
  dimensions: { width: number; height: number };
}

/**
 * Smart compression that finds optimal quality while maintaining visual fidelity
 * Uses multi-pass approach similar to TinyPNG's algorithm
 */
export const smartCompress = async (
  source: File | Blob, 
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const {
    targetSizeKB,
    maxQuality = 0.95,
    minQuality = 0.60,
    maxWidth = 2048,
    maxHeight = 2048,
    format = 'webp',
    enableProgressiveOptimization = true
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = async () => {
      try {
        // Calculate optimal dimensions (smart resizing)
        const { width, height } = calculateOptimalDimensions(
          img.width, 
          img.height, 
          maxWidth, 
          maxHeight
        );
        
        canvas.width = width;
        canvas.height = height;
        
        // Use high-quality scaling algorithm
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw with optimal interpolation
        ctx.drawImage(img, 0, 0, width, height);
        
        // Find optimal quality using binary search approach
        const result = await findOptimalQuality(
          canvas, 
          source.size, 
          targetSizeKB, 
          minQuality, 
          maxQuality, 
          format,
          enableProgressiveOptimization
        );
        
        const compressionRatio = ((source.size - result.blob.size) / source.size) * 100;
        
        console.log(`[smartCompress] Compression complete:`, {
          original: `${(source.size / 1024).toFixed(1)}KB`,
          compressed: `${(result.blob.size / 1024).toFixed(1)}KB`,
          ratio: `${compressionRatio.toFixed(1)}%`,
          quality: `${(result.quality * 100).toFixed(0)}%`,
          dimensions: `${width}x${height}`
        });
        
        resolve({
          blob: result.blob,
          originalSize: source.size,
          compressedSize: result.blob.size,
          compressionRatio,
          quality: result.quality,
          dimensions: { width, height }
        });
        
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };
    
    img.src = URL.createObjectURL(source);
  });
};

/**
 * Calculate optimal dimensions while maintaining aspect ratio
 */
function calculateOptimalDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if needed
  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }
  
  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }
  
  // Ensure dimensions are integers
  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

/**
 * Find optimal quality using binary search approach
 * Similar to TinyPNG's multi-pass optimization
 */
async function findOptimalQuality(
  canvas: HTMLCanvasElement,
  originalSize: number,
  targetSizeKB: number | undefined,
  minQuality: number,
  maxQuality: number,
  format: string,
  enableProgressiveOptimization: boolean
): Promise<{ blob: Blob; quality: number }> {
  
  // If no target size specified, use high quality with smart default
  if (!targetSizeKB) {
    const smartQuality = enableProgressiveOptimization ? 
      await findSmartQuality(canvas, originalSize, format) : 
      0.92;
    
    const blob = await canvasToBlob(canvas, format, smartQuality);
    return { blob, quality: smartQuality };
  }
  
  // Binary search for optimal quality
  let low = minQuality;
  let high = maxQuality;
  let bestBlob: Blob | null = null;
  let bestQuality = maxQuality;
  
  const targetBytes = targetSizeKB * 1024;
  const maxIterations = 8; // Prevent infinite loops
  
  for (let i = 0; i < maxIterations && high - low > 0.02; i++) {
    const testQuality = (low + high) / 2;
    const testBlob = await canvasToBlob(canvas, format, testQuality);
    
    if (testBlob.size <= targetBytes) {
      // This quality works, try higher
      bestBlob = testBlob;
      bestQuality = testQuality;
      low = testQuality;
    } else {
      // Too large, reduce quality
      high = testQuality;
    }
  }
  
  // Fallback if no suitable quality found
  if (!bestBlob) {
    bestBlob = await canvasToBlob(canvas, format, minQuality);
    bestQuality = minQuality;
  }
  
  return { blob: bestBlob, quality: bestQuality };
}

/**
 * Find smart quality based on image characteristics
 */
async function findSmartQuality(
  canvas: HTMLCanvasElement, 
  originalSize: number, 
  format: string
): Promise<number> {
  // Test different qualities to find sweet spot
  const testQualities = [0.95, 0.92, 0.88, 0.85, 0.80];
  const results = [];
  
  for (const quality of testQualities) {
    const blob = await canvasToBlob(canvas, format, quality);
    const compressionRatio = (originalSize - blob.size) / originalSize;
    results.push({ quality, size: blob.size, ratio: compressionRatio });
  }
  
  // Find quality where compression ratio improvement becomes minimal
  for (let i = 1; i < results.length; i++) {
    const prev = results[i - 1];
    const current = results[i];
    const ratioImprovement = current.ratio - prev.ratio;
    
    // If improvement is less than 5%, use previous quality
    if (ratioImprovement < 0.05) {
      return prev.quality;
    }
  }
  
  // Default to 0.88 for good balance
  return 0.88;
}

/**
 * Check WebP support in the current browser
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Convert canvas to blob with proper error handling and WebP validation
 */
function canvasToBlob(canvas: HTMLCanvasElement, format: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Ensure WebP is supported, fallback to JPEG if not
    const actualFormat = (format === 'webp' && supportsWebP()) ? 'webp' : 
                         (format === 'webp' && !supportsWebP()) ? 'jpeg' : format;
    
    const mimeType = actualFormat === 'webp' ? 'image/webp' : 
                     actualFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
    
    console.log(`[canvasToBlob] Converting to ${actualFormat} (requested: ${format}, MIME: ${mimeType})`);
    
    canvas.toBlob((blob) => {
      if (blob) {
        console.log(`[canvasToBlob] Successfully created ${actualFormat} blob:`, {
          size: `${(blob.size / 1024).toFixed(1)}KB`,
          type: blob.type
        });
        resolve(blob);
      } else {
        reject(new Error(`Failed to create ${actualFormat} blob from canvas`));
      }
    }, mimeType, quality);
  });
}

/**
 * Preset configurations for common use cases
 */
export const CompressionPresets = {
  // High quality for professional photos
  HIGH_QUALITY: {
    maxQuality: 0.95,
    minQuality: 0.85,
    maxWidth: 2048,
    maxHeight: 2048,
    enableProgressiveOptimization: true
  },
  
  // Balanced for general wardrobe items
  BALANCED: {
    maxQuality: 0.92,
    minQuality: 0.75,
    maxWidth: 1600,
    maxHeight: 1600,
    enableProgressiveOptimization: true
  },
  
  // Aggressive compression for thumbnails
  COMPACT: {
    targetSizeKB: 200,
    maxQuality: 0.88,
    minQuality: 0.60,
    maxWidth: 1200,
    maxHeight: 1200,
    enableProgressiveOptimization: true
  },
  
  // Ultra compression for previews
  PREVIEW: {
    targetSizeKB: 100,
    maxQuality: 0.85,
    minQuality: 0.50,
    maxWidth: 800,
    maxHeight: 800,
    enableProgressiveOptimization: false
  }
};
