/**
 * Enhanced WebP conversion utilities with smart compression
 * Combines WebP conversion with TinyPNG-like compression algorithms
 */

import { smartCompress, CompressionPresets } from './smartCompression';

export interface WebPConversionOptions {
  quality?: number;
  useSmartCompression?: boolean;
  compressionPreset?: keyof typeof CompressionPresets;
  targetSizeKB?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface WebPConversionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  quality?: number;
  method: 'basic' | 'smart' | 'tinypng';
  dimensions?: { width: number; height: number };
}

/**
 * Convert image to WebP format with enhanced compression options
 * @param source - File or Blob to convert
 * @param options - Conversion and compression options
 * @returns Promise<WebPConversionResult> - Enhanced result with compression stats
 */
export const convertToWebP = async (
  source: File | Blob, 
  options: WebPConversionOptions = {}
): Promise<WebPConversionResult> => {
  const {
    quality = 0.92,
    useSmartCompression = true,
    compressionPreset = 'BALANCED',
    targetSizeKB,
    maxWidth,
    maxHeight
  } = options;

  try {
    // Option 1: Use smart compression (recommended)
    if (useSmartCompression) {
      console.log('[webpConverter] Using smart compression...');
      
      const smartResult = await smartCompress(source, {
        ...CompressionPresets[compressionPreset],
        format: 'webp',
        targetSizeKB,
        maxWidth,
        maxHeight
      });
      
      return {
        blob: smartResult.blob,
        originalSize: smartResult.originalSize,
        compressedSize: smartResult.compressedSize,
        compressionRatio: smartResult.compressionRatio,
        quality: smartResult.quality,
        method: 'smart',
        dimensions: smartResult.dimensions
      };
    }
    
    // Option 2: Basic WebP conversion (fallback)
    console.log('[webpConverter] Using basic WebP conversion...');
    const basicBlob = await convertToWebPBasic(source, quality);
    const compressionRatio = ((source.size - basicBlob.size) / source.size) * 100;
    
    return {
      blob: basicBlob,
      originalSize: source.size,
      compressedSize: basicBlob.size,
      compressionRatio,
      quality,
      method: 'basic'
    };
    
  } catch (error) {
    console.error('[webpConverter] Conversion failed:', error);
    throw error;
  }
};

/**
 * Basic WebP conversion (original implementation)
 * @param source - File or Blob to convert
 * @param quality - Quality setting (0.0 to 1.0, default 0.92)
 * @returns Promise<Blob> - WebP blob
 */
export const convertToWebPBasic = async (source: File | Blob, quality: number = 0.92): Promise<Blob> => {
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
          console.log(`[webpConverter] Basic WebP conversion successful. Original: ${(source.size / 1024 / 1024).toFixed(2)}MB → WebP: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
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

/**
 * Preset configurations for different use cases
 */
export const WebPPresets = {
  // High quality for professional wardrobe photos
  HIGH_QUALITY: {
    useSmartCompression: true,
    compressionPreset: 'HIGH_QUALITY' as const,
    maxWidth: 2048,
    maxHeight: 2048
  },
  
  // Balanced compression for general wardrobe items (recommended)
  WARDROBE_STANDARD: {
    useSmartCompression: true,
    compressionPreset: 'BALANCED' as const,
    maxWidth: 1600,
    maxHeight: 1600
  },
  
  // Aggressive compression for storage efficiency
  COMPACT: {
    useSmartCompression: true,
    compressionPreset: 'COMPACT' as const,
    targetSizeKB: 200,
    maxWidth: 1200,
    maxHeight: 1200
  },
  
  // Ultra-compressed for previews and thumbnails
  PREVIEW: {
    useSmartCompression: true,
    compressionPreset: 'PREVIEW' as const,
    targetSizeKB: 100,
    maxWidth: 800,
    maxHeight: 800
  }
};
