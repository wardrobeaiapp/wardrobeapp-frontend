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
    
    // Handle data URI format (e.g., data:image/jpeg;base64,/9j/4AAQ...)
    if (base64Data.startsWith('data:')) {
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        base64Data = matches[2];
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

    // Additional validation could be added here:
    // - File size limits
    // - Image format validation
    // - Content validation

    return {
      isValid: true,
      base64Data: base64Data
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
}

module.exports = new ImageValidator();
