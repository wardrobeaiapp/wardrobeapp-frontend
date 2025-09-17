import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { mapColorKeyword } from '../mappings/colorMappings';
import { COLOR_EXTRACTION_TERMS } from '../../../../constants/wardrobeOptions';

/**
 * Responsible for extracting color information from detected tags
 */
export class ColorExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the main color from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @returns The detected color or undefined if no color could be determined
   */
  extractColor(tags: { color_tags?: string[], dominant_colors?: string[], fashion_tags?: string[], general_tags?: string[] }): string | null {
    this.logger.debug('[ColorExtractor] Extracting color from tags');
    
    // First check specific color tags if available
    if (tags.color_tags && tags.color_tags.length > 0) {
      this.logger.debug('[ColorExtractor] Checking color_tags:', tags.color_tags);
      
      // Take the first color tag as the primary color
      const colorTag = tags.color_tags[0];
      const mappedColor = mapColorKeyword(colorTag);
      
      this.logger.debug(`[ColorExtractor] Mapped color tag "${colorTag}" to "${mappedColor}"`);
      return mappedColor;
    }
    
    // Then check dominant colors if available
    if (tags.dominant_colors && tags.dominant_colors.length > 0) {
      this.logger.debug('[ColorExtractor] Checking dominant_colors:', tags.dominant_colors);
      
      // Take the first dominant color
      const dominantColor = tags.dominant_colors[0];
      const mappedColor = mapColorKeyword(dominantColor);
      
      this.logger.debug(`[ColorExtractor] Mapped dominant color "${dominantColor}" to "${mappedColor}"`);
      return mappedColor;
    }
    
    // If no specific color tags, try to extract from fashion or general tags
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[ColorExtractor] Checking combined tags for color information:', allTags);
    
    // Use shared color terms for consistency
    const colorTerms = [...COLOR_EXTRACTION_TERMS];
    
    // Find tags that contain color terms
    const colorTags = allTags.filter((tag: string) => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return colorTerms.some(color => normalizedTag.includes(color));
    });
    
    if (colorTags.length > 0) {
      this.logger.debug('[ColorExtractor] Found color-related tags:', colorTags);
      
      // Map the first color tag to a standard color
      const mappedColor = mapColorKeyword(colorTags[0]);
      this.logger.debug(`[ColorExtractor] Mapped tag "${colorTags[0]}" to color "${mappedColor}"`);
      return mappedColor;
    }
    
    this.logger.debug('[ColorExtractor] No color found in tags');
    return null;
  }
}
