/**
 * Utilities for testing image compression functionality
 */
import { compressImageToMaxSize, resizeImage } from './imageUtils';

/**
 * Generate a sample base64 image for testing
 * @param width - Width of the test image
 * @param height - Height of the test image
 * @param color - Fill color (optional)
 * @returns Base64 encoded test image
 */
export const generateTestImage = (width: number, height: number, color = 'blue'): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Fill with specified color
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
      
      // Add some text to make it unique
      ctx.fillStyle = 'white';
      ctx.font = '20px Arial';
      ctx.fillText(`Test Image ${width}x${height}`, 20, 40);
      
      // Add current timestamp
      ctx.fillText(new Date().toISOString(), 20, 70);
    }
    
    // Convert to base64
    resolve(canvas.toDataURL('image/jpeg', 0.9));
  });
};

/**
 * Test the image compression function with various sizes
 * @param maxSizeBytes - Target maximum size in bytes
 * @returns Test results
 */
export const testCompression = async (maxSizeBytes = 800000): Promise<{ 
  original: { size: number; dimensions: string };
  compressed: { size: number; dimensions: string; ratio: number };
  success: boolean;
}[]> => {
  // Test cases with different dimensions
  const testCases = [
    { width: 800, height: 600 },   // Small
    { width: 1600, height: 1200 }, // Medium
    { width: 3200, height: 2400 }, // Large
    { width: 4800, height: 3600 }, // Very large
  ];
  
  const results = [];
  
  for (const { width, height } of testCases) {
    try {
      // Generate test image
      const originalImage = await generateTestImage(width, height);
      
      // Compress it
      const compressedImage = await compressImageToMaxSize(originalImage, maxSizeBytes);
      
      // Calculate stats
      const compressionRatio = compressedImage.length / originalImage.length;
      
      results.push({
        original: {
          size: originalImage.length,
          dimensions: `${width}x${height}`
        },
        compressed: {
          size: compressedImage.length,
          dimensions: compressedImage.length < originalImage.length ? 'Reduced' : 'Unchanged',
          ratio: Math.round(compressionRatio * 100)
        },
        success: compressedImage.length <= maxSizeBytes
      });
    } catch (error) {
      console.error(`Error testing compression for ${width}x${height}:`, error);
    }
  }
  
  return results;
};

/**
 * Log compression test results to console
 */
export const logCompressionTestResults = async (): Promise<void> => {
  console.log('=== Image Compression Test Results ===');
  const results = await testCompression();
  
  results.forEach((result, index) => {
    console.log(`\nTest Case #${index + 1} - ${result.original.dimensions}:`);
    console.log(`  Original: ${(result.original.size / 1024).toFixed(1)}KB`);
    console.log(`  Compressed: ${(result.compressed.size / 1024).toFixed(1)}KB (${result.compressed.ratio}% of original)`);
    console.log(`  Success: ${result.success ? '✅' : '❌'}`);
  });
  
  console.log('\n=== Summary ===');
  console.log(`Total tests: ${results.length}`);
  console.log(`Successful compressions: ${results.filter(r => r.success).length}`);
  console.log(`Failed compressions: ${results.filter(r => !r.success).length}`);
};
