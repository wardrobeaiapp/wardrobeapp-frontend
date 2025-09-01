import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';

/**
 * Responsible for extracting material information from detected tags
 */
export class MaterialExtractor {
  private logger: Logger;
  
  // Common material terms that might appear in tags
  private materialTerms = [
    'cotton', 'wool', 'polyester', 'silk', 'linen', 'leather', 'denim', 'jersey',
    'cashmere', 'velvet', 'suede', 'corduroy', 'satin', 'fleece', 'nylon', 'spandex',
    'lycra', 'acrylic', 'rayon', 'viscose', 'twill', 'chiffon', 'crepe', 'mesh',
    'lace', 'canvas', 'flannel', 'chambray', 'tweed', 'sherpa', 'faux fur', 'fur',
    'modal', 'elastane', 'tencel', 'down', 'knit', 'knitted', 'crochet'
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the material from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @returns The detected material or undefined if no material could be determined
   */
  extractMaterial(tags: { fashion_tags?: string[], general_tags?: string[] }): string | null {
    this.logger.debug('[MaterialExtractor] Extracting material from tags');
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[MaterialExtractor] Checking combined tags for material information:', allTags);
    
    // Find tags that contain material terms
    const materialTags = allTags.filter(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return this.materialTerms.some(material => normalizedTag.includes(material));
    });
    
    if (materialTags.length > 0) {
      this.logger.debug('[MaterialExtractor] Found material-related tags:', materialTags);
      
      // Format the material name (capitalize first letter)
      const material = materialTags[0];
      const formattedMaterial = material.charAt(0).toUpperCase() + material.slice(1).toLowerCase();
      
      this.logger.debug(`[MaterialExtractor] Extracted material: ${formattedMaterial}`);
      return formattedMaterial;
    }
    
    this.logger.debug('[MaterialExtractor] No material found in tags');
    return null;
  }
}
