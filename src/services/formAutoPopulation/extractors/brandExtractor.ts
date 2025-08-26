import { FieldExtractorFn } from '../types';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Common clothing brands for mapping
 */
const commonBrands = [
  'Nike', 'Adidas', 'Zara', 'H&M', 'Gucci', 'Louis Vuitton', 'Chanel',
  'Prada', 'Hermès', 'Balenciaga', 'Dior', 'Fendi', 'Versace', 'Burberry',
  'Calvin Klein', 'Ralph Lauren', 'Tommy Hilfiger', 'Levi\'s', 'Gap',
  'Uniqlo', 'Topshop', 'Forever 21', 'Mango', 'Bershka', 'Pull & Bear',
  'Urban Outfitters', 'North Face', 'Patagonia', 'Columbia', 'Under Armour',
  'New Balance', 'Puma', 'Reebok', 'Converse', 'Vans', 'Dr. Martens',
  'Timberland', 'Birkenstock', 'UGG', 'Crocs', 'Ray-Ban', 'Oakley',
  'Rolex', 'Cartier', 'Tiffany & Co.', 'Pandora', 'Swarovski', 'Coach',
  'Michael Kors', 'Kate Spade', 'Fossil', 'Guess', 'Diesel'
];

/**
 * Extractor class for brand-related fields
 */
export class BrandExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the brand from detected tags
   */
  extractBrand: FieldExtractorFn<string> = (tags) => {
    this.logger.debug('Extracting brand from tags');
    
    // First check for direct brand tag
    const brandTag = ExtractionHelpers.extractFromTags(tags, 'brand', ['label', 'make', 'designer', 'manufacturer']);
    
    if (brandTag) {
      this.logger.debug('Found brand from brand tag:', brandTag);
      return this.standardizeBrandName(brandTag);
    }
    
    // Look for brand names in text descriptions
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      const brandFromDesc = this.extractBrandFromText(description);
      if (brandFromDesc) {
        this.logger.debug('Found brand in description:', brandFromDesc);
        return brandFromDesc;
      }
    }
    
    // Check all tag values for brand names
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip fields that are unlikely to contain brand information
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'pattern', 'size', 'material'].includes(keyLower)) {
        continue;
      }
      
      const brandFromText = this.extractBrandFromText(value);
      if (brandFromText) {
        this.logger.debug(`Found brand "${brandFromText}" in tag "${key}": ${value}`);
        return brandFromText;
      }
    }
    
    // Check if logo is detected in tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      const keyLower = key.toLowerCase();
      const valueLower = value.toLowerCase();
      
      if ((keyLower.includes('logo') || valueLower.includes('logo')) && 
          !['no logo', 'without logo'].includes(valueLower)) {
        // If logo is mentioned, look for brand name nearby
        const logoDescription = value;
        const brandFromLogo = this.extractBrandFromText(logoDescription);
        if (brandFromLogo) {
          this.logger.debug(`Found brand "${brandFromLogo}" from logo detection: ${logoDescription}`);
          return brandFromLogo;
        }
      }
    }
    
    // Couldn't determine brand
    this.logger.debug('Could not determine brand');
    return null;
  };

  /**
   * Extracts a brand name from text by comparing against common brands
   */
  private extractBrandFromText(text: string): string | null {
    if (!text) return null;
    
    const lowerText = text.toLowerCase();
    
    // Check for exact matches first (case insensitive)
    for (const brand of commonBrands) {
      if (lowerText === brand.toLowerCase()) {
        return brand;
      }
    }
    
    // Then check for brand names within the text
    for (const brand of commonBrands) {
      const lowerBrand = brand.toLowerCase();
      
      // Skip very short brand names (< 3 chars) to avoid false positives
      if (lowerBrand.length < 3) continue;
      
      // Check if brand name is in the text
      if (lowerText.includes(lowerBrand)) {
        // Make sure it's a word boundary (not part of another word)
        const regex = new RegExp(`\\b${this.escapeRegExp(lowerBrand)}\\b`, 'i');
        if (regex.test(text)) {
          return brand;
        }
      }
    }
    
    return null;
  }

  /**
   * Standardizes brand name capitalization
   */
  private standardizeBrandName(brandName: string): string {
    if (!brandName) return brandName;
    
    // Check for exact match in common brands list
    const exactMatch = commonBrands.find(
      brand => brand.toLowerCase() === brandName.toLowerCase()
    );
    
    if (exactMatch) return exactMatch;
    
    // Apply standard capitalization rules
    return brandName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Escapes special characters in a string for use in a regular expression
   */
  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
