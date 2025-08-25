import { DetectedTags, FieldExtractorFn } from '../types';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Maps material keywords to standardized material options
 */
const materialMappings: Record<string, string> = {
  // Fabrics
  'cotton': 'Cotton',
  'polyester': 'Polyester',
  'wool': 'Wool',
  'linen': 'Linen',
  'silk': 'Silk',
  'satin': 'Satin',
  'velvet': 'Velvet',
  'chiffon': 'Chiffon',
  'denim': 'Denim',
  'cashmere': 'Cashmere',
  'flannel': 'Flannel',
  'tweed': 'Tweed',
  'rayon': 'Rayon',
  'viscose': 'Viscose',
  'nylon': 'Nylon',
  'spandex': 'Spandex',
  'elastane': 'Elastane',
  'lycra': 'Lycra',
  'acrylic': 'Acrylic',
  'canvas': 'Canvas',
  'jersey': 'Jersey',
  'fleece': 'Fleece',
  'mesh': 'Mesh',
  'knit': 'Knit',
  'crochet': 'Crochet',
  'lace': 'Lace',
  'suede': 'Suede',
  'twill': 'Twill',
  'modal': 'Modal',
  'tencel': 'Tencel',
  'lyocell': 'Lyocell',
  
  // Leather
  'leather': 'Leather',
  'faux leather': 'Faux Leather',
  'vegan leather': 'Faux Leather',
  'synthetic leather': 'Faux Leather',
  'pu leather': 'Faux Leather',
  
  // Fur
  'fur': 'Fur',
  'faux fur': 'Faux Fur',
  'synthetic fur': 'Faux Fur',
  'vegan fur': 'Faux Fur',
  
  // Metals
  'gold': 'Gold',
  'silver': 'Silver',
  'brass': 'Brass',
  'stainless steel': 'Stainless Steel',
  'metal': 'Metal',
  
  // Synthetics
  'synthetic': 'Synthetic',
  'man-made': 'Synthetic',
  'plastic': 'Plastic',
  'pvc': 'PVC',
  'vinyl': 'Vinyl'
};

/**
 * Gets standard material options for dropdowns
 */
function getMaterialOptions(): string[] {
  return [
    'Cotton',
    'Polyester',
    'Wool',
    'Linen',
    'Silk',
    'Satin',
    'Velvet',
    'Chiffon',
    'Denim',
    'Cashmere',
    'Leather',
    'Faux Leather',
    'Suede',
    'Fur',
    'Faux Fur',
    'Lace',
    'Knit',
    'Fleece',
    'Nylon',
    'Spandex',
    'Viscose',
    'Rayon',
    'Canvas',
    'Jersey',
    'Mesh',
    'Metal',
    'Gold',
    'Silver',
    'Tweed',
    'Acrylic',
    'Other'
  ];
}

/**
 * Extractor class for material-related fields
 */
export class MaterialExtractor {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Extracts the item material from detected tags
   */
  extractMaterial: FieldExtractorFn<string> = (tags) => {
    this.logger.debug('Extracting material from tags');
    
    // First check for direct material tag
    const materialTag = ExtractionHelpers.extractFromTags(tags, 'material', ['fabric', 'composition', 'textile']);
    
    if (materialTag) {
      const mappedMaterial = ExtractionHelpers.mapToStandardOption(
        materialTag,
        materialMappings,
        getMaterialOptions()
      );
      
      if (mappedMaterial) {
        this.logger.debug('Found material from material tag:', mappedMaterial);
        return mappedMaterial;
      }
    }
    
    // Check for material keywords in all tags
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value !== 'string') continue;
      
      // Skip obvious non-material fields
      const keyLower = key.toLowerCase();
      if (['category', 'subcategory', 'color', 'brand', 'size'].includes(keyLower)) {
        continue;
      }
      
      // Look for material keywords in the tag value
      for (const [materialKeyword, mappedMaterial] of Object.entries(materialMappings)) {
        if (value.toLowerCase().includes(materialKeyword.toLowerCase())) {
          this.logger.debug(`Found material "${mappedMaterial}" in tag "${key}": ${value}`);
          return mappedMaterial;
        }
      }
    }
    
    // Check for generic description or title
    const description = ExtractionHelpers.extractFromTags(tags, 'description', ['title', 'name', 'item']);
    if (description) {
      for (const [materialKeyword, mappedMaterial] of Object.entries(materialMappings)) {
        if (description.toLowerCase().includes(materialKeyword.toLowerCase())) {
          this.logger.debug(`Found material "${mappedMaterial}" in description: ${description}`);
          return mappedMaterial;
        }
      }
    }
    
    // Couldn't determine material
    this.logger.debug('Could not determine material');
    return null;
  };
}
