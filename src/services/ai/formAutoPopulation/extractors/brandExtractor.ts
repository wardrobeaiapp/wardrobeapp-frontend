import { Logger } from '../utils/logger';
import { ExtractionHelpers } from '../utils/extractionHelpers';

/**
 * Responsible for extracting brand information from detected tags
 */
export class BrandExtractor {
  private logger: Logger;
  
  // Common fashion brands that might appear in tags
  private brandTerms = [
    'nike', 'adidas', 'zara', 'h&m', 'gucci', 'prada', 'louis vuitton', 'chanel',
    'uniqlo', 'gap', 'banana republic', 'ralph lauren', 'levi', 'calvin klein',
    'tommy hilfiger', 'under armour', 'the north face', 'patagonia', 'burberry',
    'versace', 'dior', 'hermes', 'fendi', 'balenciaga', 'vans', 'converse',
    'new balance', 'michael kors', 'coach', 'lacoste', 'hugo boss', 'armani',
    'mango', 'forever 21', 'topshop', 'urban outfitters', 'madewell', 'asos',
    'lululemon', 'puma', 'reebok', 'champion', 'fila', 'abercrombie', 'hollister',
    'everlane', 'aritzia', 'reformation', 'brandy melville', 'athleta', 'theory',
    'anthropologie', 'aeropostale', 'american eagle', 'old navy', 'steve madden',
    'brooks brothers', 'j crew', 'j.crew', 'ann taylor', 'target', 'walmart',
    'nordstrom', 'saks fifth avenue', 'bloomingdales', 'macys', 'neiman marcus'
  ];

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extract the brand from detected tags
   * @param tags Object containing detected tags from AI analysis
   * @returns The detected brand or undefined if no brand could be determined
   */
  extractBrand(tags: { fashion_tags?: string[], general_tags?: string[] }): string | null {
    this.logger.debug('[BrandExtractor] Extracting brand from tags');
    
    const allTags = ExtractionHelpers.combineTags(tags.fashion_tags, tags.general_tags);
    this.logger.debug('[BrandExtractor] Checking combined tags for brand information:', allTags);
    
    // Find tags that contain brand terms
    const brandTags = allTags.filter(tag => {
      const normalizedTag = ExtractionHelpers.normalizeString(tag);
      return this.brandTerms.some(brand => {
        const normalizedBrand = ExtractionHelpers.normalizeString(brand);
        return normalizedTag.includes(normalizedBrand) || normalizedTag === normalizedBrand;
      });
    });
    
    if (brandTags.length > 0) {
      this.logger.debug('[BrandExtractor] Found brand-related tags:', brandTags);
      
      // Format the brand name (capitalize properly)
      const brandTag = brandTags[0];
      
      // Find the matching brand term
      const matchedBrand = this.brandTerms.find(brand => {
        const normalizedBrand = ExtractionHelpers.normalizeString(brand);
        const normalizedTag = ExtractionHelpers.normalizeString(brandTag);
        return normalizedTag.includes(normalizedBrand) || normalizedTag === normalizedBrand;
      });
      
      if (matchedBrand) {
        // Format brand name with proper capitalization
        const formattedBrand = this.formatBrandName(matchedBrand);
        this.logger.debug(`[BrandExtractor] Extracted brand: ${formattedBrand}`);
        return formattedBrand;
      }
      
      // If no match found in our terms but we found a tag, use the tag
      const formattedBrand = this.formatBrandName(brandTag);
      this.logger.debug(`[BrandExtractor] Extracted brand from tag: ${formattedBrand}`);
      return formattedBrand;
    }
    
    this.logger.debug('[BrandExtractor] No brand found in tags');
    return null;
  }

  /**
   * Format a brand name with proper capitalization
   */
  private formatBrandName(brandName: string): string {
    // Special case for brand names with specific capitalization
    const specialCases: Record<string, string> = {
      'h&m': 'H&M',
      'j.crew': 'J.Crew',
      'j crew': 'J.Crew',
    };
    
    const lowerBrand = brandName.toLowerCase();
    if (lowerBrand in specialCases) {
      return specialCases[lowerBrand];
    }
    
    // Handle brand names with spaces
    return brandName.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
