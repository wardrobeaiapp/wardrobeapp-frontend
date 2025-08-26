import { ItemCategory } from '../../../types';
import { DetectedTags, FieldExtractorFn } from '../types';
import { formatCategoryName } from '../mappings/categoryMappings';
import { ExtractionHelpers } from '../utils/extractionHelpers';
import { Logger } from '../utils/logger';

/**
 * Extractor class for generating item names
 */
export class NameGenerator {
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Generates a name for the item based on its attributes
   */
  generateName: FieldExtractorFn<string> = (tags, category, subcategory) => {
    this.logger.debug('Generating name from attributes');
    
    // First check if there's a direct name/title tag
    const nameTag = ExtractionHelpers.extractFromTags(tags, 'name', ['title', 'item name']);
    if (nameTag) {
      this.logger.debug('Found direct name tag:', nameTag);
      return ExtractionHelpers.capitalize(nameTag);
    }
    
    // Build a concise name from most important attributes
    let nameComponents: string[] = [];
    
    // Priority 1: Color (all colors included)
    const color = ExtractionHelpers.extractFromTags(tags, 'color', ['hue']);
    if (color) {
      nameComponents.push(ExtractionHelpers.capitalize(color));
    }
    
    // Priority 2: Material OR Pattern (whichever is more distinctive)
    const material = ExtractionHelpers.extractFromTags(tags, 'material', ['fabric']);
    const pattern = ExtractionHelpers.extractFromTags(tags, 'pattern', ['print', 'design']);
    
    if (pattern && pattern.toLowerCase() !== 'solid' && pattern.toLowerCase() !== 'plain') {
      // Pattern is more distinctive than material
      nameComponents.push(ExtractionHelpers.capitalize(pattern));
    } else if (material && !['cotton', 'polyester'].includes(material.toLowerCase())) {
      // Use material if it's distinctive (not basic cotton/polyester)
      nameComponents.push(ExtractionHelpers.capitalize(material));
    }
    
    // Priority 3: Brand (only if it's a well-known brand)
    const brand = ExtractionHelpers.extractFromTags(tags, 'brand', ['label', 'make']);
    if (brand && nameComponents.length < 2) {
      nameComponents.push(ExtractionHelpers.capitalize(brand));
    }
    
    // Add subcategory if available, otherwise use formatted category
    if (subcategory && subcategory !== 'other') {
      nameComponents.push(this.formatSubcategory(subcategory));
    } else if (category) {
      nameComponents.push(formatCategoryName(category));
    } else {
      nameComponents.push('Item');
    }
    
    // Filter out empty or duplicate components
    nameComponents = nameComponents
      .filter(Boolean)
      .filter((component, index, self) => 
        self.findIndex(c => c.toLowerCase() === component.toLowerCase()) === index
      );
    
    const generatedName = nameComponents.join(' ');
    this.logger.debug('Generated name:', generatedName);
    
    return generatedName;
  };

  /**
   * Formats a subcategory for display
   */
  private formatSubcategory(subcategory: string): string {
    if (!subcategory) return '';
    
    // Special formatting for specific subcategories
    if (subcategory.toLowerCase() === 't-shirt') return 'T-Shirt';
    if (subcategory.toLowerCase() === 'tank top') return 'Tank Top';
    if (subcategory.toLowerCase() === 'trench coat') return 'Trench Coat';
    
    // General formatting (capitalize first letter)
    return ExtractionHelpers.capitalize(subcategory);
  }
}
