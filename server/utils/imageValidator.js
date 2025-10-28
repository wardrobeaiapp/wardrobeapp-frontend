/**
 * Utility functions for validating and processing image data
 */
class ImageValidator {

  /**
   * Validate and process base64 image data
   * @param {string} imageBase64 - Raw image base64 data (may include data URI prefix)
   * @returns {Object} Validation result with processed data or error
   */
  validateAndProcess(imageBase64) {
    if (!imageBase64) {
      return {
        isValid: false,
        error: 'Image data is required',
        statusCode: 400,
        errorResponse: {
          error: 'Image data is required'
        }
      };
    }

    // Extract base64 data without prefix if present and ensure it's properly formatted
    let base64Data = imageBase64;
    let mediaType = 'image/jpeg'; // Default fallback
    
    // Handle data URI format (e.g., data:image/jpeg;base64,/9j/4AAQ...)
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mediaType = matches[1]; // Extract the actual media type
        base64Data = matches[2];
        console.log('✅ Detected media type from data URI:', mediaType);
      } else {
        return {
          isValid: false,
          error: 'Invalid image data format',
          statusCode: 400,
          errorResponse: {
            error: 'Invalid image data format', 
            details: 'The provided image data is not in a valid base64 format',
            analysis: 'Error analyzing image. Please try again later.',
            score: 5.0,
            feedback: 'Could not process the image analysis.'
          }
        };
      }
    } else {
      // If no data URI prefix, try to detect media type from base64 header
      mediaType = this.detectMediaTypeFromBase64(base64Data);
      console.log('✅ Detected media type from base64 header:', mediaType);
    }

    // Simple validation of base64 data - ensuring it's non-empty and reasonable size
    if (!base64Data || base64Data.length < 100) {
      return {
        isValid: false,
        error: 'Insufficient image data',
        statusCode: 400,
        errorResponse: {
          error: 'Insufficient image data', 
          details: 'The provided image data is too small to be a valid image',
          analysis: 'Error analyzing image. The image data appears to be incomplete.',
          score: 5.0,
          feedback: 'Please provide a complete image.'
        }
      };
    }

    // Try to repair and validate base64 data
    const repairedBase64 = this.attemptBase64Repair(base64Data);
    if (!this.isValidBase64(repairedBase64.data)) {
      console.log('❌ Base64 validation failed after repair attempts:', repairedBase64.attempts);
      return {
        isValid: false,
        error: 'Invalid base64 format',
        statusCode: 400,
        errorResponse: {
          error: 'Invalid image format', 
          details: `The provided image data is not valid base64 format. Tried: ${repairedBase64.attempts.join(', ')}`,
          analysis: 'Error analyzing image. The image data appears to be corrupted or incomplete.',
          score: 5.0,
          feedback: 'Please try uploading the image again or use a different image format.'
        }
      };
    }

    // Use the repaired base64 data
    base64Data = repairedBase64.data;
    if (repairedBase64.wasRepaired) {
      console.log('✅ Base64 data was successfully repaired using:', repairedBase64.successfulMethod);
    }

    // Additional validation could be added here:
    // - File size limits
    // - Image format validation
    // - Content validation

    return {
      isValid: true,
      base64Data: base64Data,
      mediaType: mediaType
    };
  }

  /**
   * Validate base64 format more thoroughly (optional enhanced validation)
   * @param {string} base64String - Base64 string to validate
   * @returns {boolean} Whether the base64 string is valid
   */
  isValidBase64(base64String) {
    try {
      // Check if it's a valid base64 string
      const decoded = Buffer.from(base64String, 'base64').toString('base64');
      return decoded === base64String;
    } catch (error) {
      return false;
    }
  }

  /**
   * Attempt to repair common base64 formatting issues
   * @param {string} base64String - Base64 string to repair
   * @returns {Object} Repair result with data, wasRepaired flag, and attempt details
   */
  attemptBase64Repair(base64String) {
    const attempts = [];
    let data = base64String;
    let wasRepaired = false;
    let successfulMethod = null;

    // Strategy 1: Use original data (no repair needed)
    if (this.isValidBase64(data)) {
      attempts.push('original');
      return { data, wasRepaired: false, successfulMethod: 'original', attempts };
    }
    attempts.push('original');

    // Strategy 2: Remove all whitespace and newlines
    try {
      const cleaned = data.replace(/\s+/g, '');
      if (this.isValidBase64(cleaned)) {
        attempts.push('whitespace-removal');
        return { data: cleaned, wasRepaired: true, successfulMethod: 'whitespace-removal', attempts };
      }
      attempts.push('whitespace-removal');
    } catch (e) {
      attempts.push('whitespace-removal (failed)');
    }

    // Strategy 3: Fix padding (add missing = or ==)
    try {
      let padded = data.replace(/\s+/g, '');
      const missingPadding = padded.length % 4;
      if (missingPadding > 0) {
        padded += '='.repeat(4 - missingPadding);
      }
      if (this.isValidBase64(padded)) {
        attempts.push('padding-fix');
        return { data: padded, wasRepaired: true, successfulMethod: 'padding-fix', attempts };
      }
      attempts.push('padding-fix');
    } catch (e) {
      attempts.push('padding-fix (failed)');
    }

    // Strategy 4: Convert URL-safe base64 to standard base64
    try {
      const standardBase64 = data
        .replace(/\s+/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      // Fix padding after URL-safe conversion
      const missingPadding = standardBase64.length % 4;
      const finalBase64 = missingPadding > 0 
        ? standardBase64 + '='.repeat(4 - missingPadding)
        : standardBase64;
        
      if (this.isValidBase64(finalBase64)) {
        attempts.push('url-safe-conversion');
        return { data: finalBase64, wasRepaired: true, successfulMethod: 'url-safe-conversion', attempts };
      }
      attempts.push('url-safe-conversion');
    } catch (e) {
      attempts.push('url-safe-conversion (failed)');
    }

    // Strategy 5: Remove invalid characters and try again
    try {
      const validCharsOnly = data.replace(/[^A-Za-z0-9+/=]/g, '');
      const missingPadding = validCharsOnly.length % 4;
      const cleanedBase64 = missingPadding > 0 
        ? validCharsOnly + '='.repeat(4 - missingPadding)
        : validCharsOnly;
        
      if (this.isValidBase64(cleanedBase64)) {
        attempts.push('invalid-char-removal');
        return { data: cleanedBase64, wasRepaired: true, successfulMethod: 'invalid-char-removal', attempts };
      }
      attempts.push('invalid-char-removal');
    } catch (e) {
      attempts.push('invalid-char-removal (failed)');
    }

    // All repair attempts failed
    return { data: base64String, wasRepaired: false, successfulMethod: null, attempts };
  }

  /**
   * Get estimated file size from base64 data
   * @param {string} base64Data - Base64 encoded data
   * @returns {number} Estimated file size in bytes
   */
  getEstimatedFileSize(base64Data) {
    // Base64 encoding increases size by ~33%
    // Each base64 character represents 6 bits, so 4 chars = 3 bytes
    return (base64Data.length * 3) / 4;
  }

  /**
   * Check if file size is within acceptable limits
   * @param {string} base64Data - Base64 encoded data
   * @param {number} maxSizeMB - Maximum size in MB (default: 10MB)
   * @returns {Object} Size validation result
   */
  validateFileSize(base64Data, maxSizeMB = 10) {
    const estimatedSize = this.getEstimatedFileSize(base64Data);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    
    return {
      isValid: estimatedSize <= maxSizeBytes,
      estimatedSizeMB: estimatedSize / (1024 * 1024),
      maxSizeMB: maxSizeMB
    };
  }

  /**
   * Extract media type from data URI
   * @param {string} dataUri - Data URI string
   * @returns {string|null} Media type or null if not found
   */
  extractMediaType(dataUri) {
    if (!dataUri.startsWith('data:')) {
      return null;
    }
    
    const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,/);
    return matches ? matches[1] : null;
  }

  /**
   * Detect media type from base64 data by examining magic bytes
   * @param {string} base64Data - Base64 encoded image data
   * @returns {string} Detected media type or default 'image/jpeg'
   */
  detectMediaTypeFromBase64(base64Data) {
    try {
      // Decode first few bytes to check magic bytes/headers
      const buffer = Buffer.from(base64Data.substring(0, 20), 'base64');
      
      // Check for common image format magic bytes
      if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
        return 'image/jpeg';
      }
      
      if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
        return 'image/png';
      }
      
      if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
        return 'image/gif';
      }
      
      if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
        // Could be WebP, check further
        const webpCheck = Buffer.from(base64Data.substring(0, 32), 'base64');
        if (webpCheck[8] === 0x57 && webpCheck[9] === 0x45 && webpCheck[10] === 0x42 && webpCheck[11] === 0x50) {
          return 'image/webp';
        }
      }
      
      if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
        return 'image/bmp';
      }
      
      // Default fallback
      console.log('⚠️ Could not detect image type from magic bytes, defaulting to image/jpeg');
      return 'image/jpeg';
      
    } catch (error) {
      console.log('⚠️ Error detecting media type from base64:', error.message, 'defaulting to image/jpeg');
      return 'image/jpeg';
    }
  }
}

module.exports = new ImageValidator();
