import { ItemCategory, Season } from '../types';
import { WardrobeItemFormData } from '../components/features/wardrobe/forms/WardrobeItemForm/hooks/useWardrobeItemForm';

interface DetectedTags {
  [key: string]: string;
}

interface FormFieldSetters {
  setCategory?: (category: ItemCategory) => void;
  setSubcategory?: (subcategory: string) => void;
  setColor?: (color: string) => void;
  setMaterial?: (material: string) => void;
  setBrand?: (brand: string) => void;
  setSize?: (size: string) => void;
  setPrice?: (price: string) => void;
  setName?: (name: string) => void;
  toggleSeason?: (season: Season) => void;
}

interface AutoPopulationOptions {
  overwriteExisting?: boolean; // Whether to overwrite fields that already have values
  skipFields?: string[]; // Fields to skip during auto-population
}

/**
 * Service for automatically populating wardrobe item form fields based on detected tags
 */
export class FormAutoPopulationService {
  // Category mapping from detected tags to ItemCategory enum
  private static categoryMappings: Record<string, ItemCategory> = {
    // Tops
    'shirt': ItemCategory.TOP,
    'blouse': ItemCategory.TOP,
    't-shirt': ItemCategory.TOP,
    'tshirt': ItemCategory.TOP,
    'tank': ItemCategory.TOP,
    'sweater': ItemCategory.TOP,
    'cardigan': ItemCategory.TOP,
    'hoodie': ItemCategory.TOP,
    'polo': ItemCategory.TOP,
    
    // Bottoms
    'pants': ItemCategory.BOTTOM,
    'jeans': ItemCategory.BOTTOM,
    'trousers': ItemCategory.BOTTOM,
    'shorts': ItemCategory.BOTTOM,
    'skirt': ItemCategory.BOTTOM,
    'leggings': ItemCategory.BOTTOM,
    
    // One-piece
    'dress': ItemCategory.ONE_PIECE,
    'jumpsuit': ItemCategory.ONE_PIECE,
    'romper': ItemCategory.ONE_PIECE,
    'overall': ItemCategory.ONE_PIECE,
    
    // Outerwear
    'jacket': ItemCategory.OUTERWEAR,
    'coat': ItemCategory.OUTERWEAR,
    'blazer': ItemCategory.OUTERWEAR,
    'vest': ItemCategory.OUTERWEAR,
    'parka': ItemCategory.OUTERWEAR,
    
    // Footwear
    'shoes': ItemCategory.FOOTWEAR,
    'boots': ItemCategory.FOOTWEAR,
    'sneakers': ItemCategory.FOOTWEAR,
    'sandals': ItemCategory.FOOTWEAR,
    'heels': ItemCategory.FOOTWEAR,
    
    // Accessories
    'hat': ItemCategory.ACCESSORY,
    'bag': ItemCategory.ACCESSORY,
    'purse': ItemCategory.ACCESSORY,
    'backpack': ItemCategory.ACCESSORY,
    'belt': ItemCategory.ACCESSORY,
    'scarf': ItemCategory.ACCESSORY,
    'jewelry': ItemCategory.ACCESSORY,
    'watch': ItemCategory.ACCESSORY,
    'sunglasses': ItemCategory.ACCESSORY,
  };

  // Subcategory mapping from detected subcategories to normalized subcategories
  private static subcategoryMappings: Record<string, string> = {
    // Tops
    'shirts': 'Shirt',
    'shirt': 'Shirt',
    'blouses': 'Blouse', 
    'blouse': 'Blouse',
    't-shirts': 'T-Shirt',
    't-shirt': 'T-Shirt',
    'tshirt': 'T-Shirt',
    'tank tops': 'Tank Top',
    'tank': 'Tank Top',
    'sweaters': 'Sweater',
    'sweater': 'Sweater',
    'cardigans': 'Cardigan',
    'cardigan': 'Cardigan',
    'hoodies': 'Hoodie',
    'hoodie': 'Hoodie',
    'polo': 'Polo Shirt',
    
    // Bottoms
    'jeans': 'Jeans',
    'pants': 'Pants',
    'trousers': 'Trousers',
    'shorts': 'Shorts',
    'skirts': 'Skirt',
    'skirt': 'Skirt',
    'leggings': 'Leggings',
    
    // One-piece
    'dresses': 'Dress',
    'dress': 'Dress',
    'jumpsuits': 'Jumpsuit',
    'jumpsuit': 'Jumpsuit',
    'rompers': 'Romper',
    'romper': 'Romper',
    
    // Outerwear
    'jackets': 'Jacket',
    'jacket': 'Jacket',
    'coats': 'Coat',
    'coat': 'Coat',
    'blazers': 'Blazer',
    'blazer': 'Blazer',
    'vests': 'Vest',
    'vest': 'Vest',
    
    // Footwear
    'shoes': 'Shoes',
    'boots': 'Boots',
    'sneakers': 'Sneakers',
    'sandals': 'Sandals',
    'heels': 'Heels',
    'flats': 'Flats',
    
    // Accessories
    'belts': 'Belt',
    'belt': 'Belt',
    'hats': 'Hat',
    'hat': 'Hat',
    'bags': 'Bag',
    'bag': 'Bag',
    'purses': 'Purse',
    'purse': 'Purse',
    'backpacks': 'Backpack',
    'backpack': 'Backpack',
    'scarves': 'Scarf',
    'scarf': 'Scarf',
    'jewelry': 'Jewelry',
    'watches': 'Watch',
    'watch': 'Watch',
    'sunglasses': 'Sunglasses',
    'glasses': 'Glasses',
  };

  // Season mapping from detected style/occasion tags
  private static seasonMappings: Record<string, Season[]> = {
    'summer': [Season.SUMMER],
    'winter': [Season.WINTER],
    'spring': [Season.SPRING],
    'fall': [Season.FALL],
    'autumn': [Season.FALL],
    'casual': [Season.SPRING, Season.SUMMER, Season.FALL],
    'formal': [Season.SPRING, Season.SUMMER, Season.FALL, Season.WINTER],
    'beach': [Season.SUMMER],
    'warm': [Season.SPRING, Season.SUMMER],
    'cold': [Season.FALL, Season.WINTER],
  };

  /**
   * Auto-populate form fields based on detected tags
   */
  static autoPopulateForm(
    detectedTags: DetectedTags,
    formSetters: FormFieldSetters,
    currentFormData?: Partial<WardrobeItemFormData>,
    options: AutoPopulationOptions = {}
  ): void {
    const { overwriteExisting = false, skipFields = [] } = options;

    console.log('[FormAutoPopulation] Starting auto-population with tags:', detectedTags);
    console.log('[FormAutoPopulation] Current form data:', currentFormData);

    // Helper to check if field should be updated
    const shouldUpdateField = (fieldName: string, currentValue: any): boolean => {
      if (skipFields.includes(fieldName)) return false;
      if (!overwriteExisting && currentValue && currentValue !== '') return false;
      return true;
    };

    // 1. Category mapping
    if (formSetters.setCategory && shouldUpdateField('category', currentFormData?.category)) {
      const category = this.extractCategory(detectedTags);
      if (category) {
        console.log('[FormAutoPopulation] Setting category:', category);
        formSetters.setCategory(category);
      }
    }

    // 2. Subcategory mapping
    if (formSetters.setSubcategory && shouldUpdateField('subcategory', currentFormData?.subcategory)) {
      const subcategory = this.extractSubcategory(detectedTags);
      if (subcategory) {
        console.log('[FormAutoPopulation] Setting subcategory:', subcategory);
        formSetters.setSubcategory(subcategory);
      }
    }

    // 3. Color mapping
    if (formSetters.setColor && shouldUpdateField('color', currentFormData?.color)) {
      const color = this.extractColor(detectedTags);
      if (color) {
        console.log('[FormAutoPopulation] Setting color:', color);
        formSetters.setColor(color);
      }
    }

    // 4. Material mapping
    if (formSetters.setMaterial && shouldUpdateField('material', currentFormData?.material)) {
      const material = this.extractMaterial(detectedTags);
      if (material) {
        console.log('[FormAutoPopulation] Setting material:', material);
        formSetters.setMaterial(material);
      }
    }

    // 5. Brand mapping
    if (formSetters.setBrand && shouldUpdateField('brand', currentFormData?.brand)) {
      const brand = this.extractBrand(detectedTags);
      if (brand) {
        console.log('[FormAutoPopulation] Setting brand:', brand);
        formSetters.setBrand(brand);
      }
    }

    // 6. Size mapping
    if (formSetters.setSize && shouldUpdateField('size', currentFormData?.size)) {
      const size = this.extractSize(detectedTags);
      if (size) {
        console.log('[FormAutoPopulation] Setting size:', size);
        formSetters.setSize(size);
      }
    }

    // 7. Season mapping
    if (formSetters.toggleSeason && shouldUpdateField('seasons', currentFormData?.seasons)) {
      const seasons = this.extractSeasons(detectedTags);
      if (seasons.length > 0) {
        console.log('[FormAutoPopulation] Setting seasons:', seasons);
        seasons.forEach(season => formSetters.toggleSeason!(season));
      }
    }

    // 8. Auto-generate name if not provided
    if (formSetters.setName && shouldUpdateField('name', currentFormData?.name)) {
      const generatedName = this.generateItemName(detectedTags);
      if (generatedName) {
        console.log('[FormAutoPopulation] Setting generated name:', generatedName);
        formSetters.setName(generatedName);
      }
    }
  }

  /**
   * Extract category from detected tags
   */
  private static extractCategory(tags: DetectedTags): ItemCategory | null {
    // First check direct Category tag with hierarchical path
    if (tags.Category) {
      const categoryPath = tags.Category.toLowerCase();
      const pathParts = categoryPath.split('/');
      
      // Check if the first part of the path maps to a known category
      if (pathParts.length > 0) {
        const mainCategory = pathParts[0];
        for (const [keyword, category] of Object.entries(this.categoryMappings)) {
          if (mainCategory.includes(keyword)) {
            return category;
          }
        }
      }
      
      // Fallback: check if the last part is a direct ItemCategory enum value
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart && Object.values(ItemCategory).includes(lastPart as ItemCategory)) {
        return lastPart as ItemCategory;
      }
    }

    // Then check subcategory for category hints
    if (tags.Subcategory) {
      const subcategory = tags.Subcategory.toLowerCase();
      for (const [keyword, category] of Object.entries(this.categoryMappings)) {
        if (subcategory.includes(keyword)) {
          return category;
        }
      }
    }

    // Check all tag values for category keywords
    for (const [, value] of Object.entries(tags)) {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const [keyword, category] of Object.entries(this.categoryMappings)) {
          if (lowerValue.includes(keyword)) {
            return category;
          }
        }
      }
    }

    return null;
  }

  /**
   * Extract subcategory from detected tags
   */
  private static extractSubcategory(tags: DetectedTags): string | null {
    let rawSubcategory: string | null = null;
    
    // First check hierarchical Category tag like "Accessories/Belts"
    if (tags.Category) {
      const categoryPath = tags.Category;
      const pathParts = categoryPath.split('/');
      
      // If there are multiple parts, the second part is usually the subcategory
      if (pathParts.length >= 2) {
        rawSubcategory = pathParts[1]; // "Belts" from "Accessories/Belts"
      }
    }
    
    // Then check direct Subcategory tag
    if (!rawSubcategory && tags.Subcategory) {
      rawSubcategory = tags.Subcategory;
    }
    
    // Look for subcategory hints in other tags
    if (!rawSubcategory && tags.Style) {
      rawSubcategory = tags.Style;
    }

    // Map the raw subcategory to our normalized format
    if (rawSubcategory) {
      const lowerSubcategory = rawSubcategory.toLowerCase();
      
      // Direct mapping check
      if (this.subcategoryMappings[lowerSubcategory]) {
        return this.subcategoryMappings[lowerSubcategory];
      }
      
      // Partial matching check
      for (const [keyword, mappedSubcategory] of Object.entries(this.subcategoryMappings)) {
        if (lowerSubcategory.includes(keyword)) {
          return mappedSubcategory;
        }
      }
      
      // If no mapping found, return the raw subcategory capitalized
      return rawSubcategory.charAt(0).toUpperCase() + rawSubcategory.slice(1).toLowerCase();
    }

    return null;
  }

  /**
   * Extract color from detected tags
   */
  private static extractColor(tags: DetectedTags): string | null {
    let rawColor: string | null = null;
    
    if (tags.Color) {
      rawColor = tags.Color;
    } else {
      // Look for color hints in other tags
      const colorKeywords = ['color', 'hue', 'shade'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && colorKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawColor = value;
          break;
        }
      }
    }

    if (rawColor) {
      // Extract actual color from phrases like "brown belt" -> "brown"
      return this.extractColorFromPhrase(rawColor);
    }

    return null;
  }

  /**
   * Extract the actual color from a phrase that might contain other words
   */
  private static extractColorFromPhrase(phrase: string): string {
    const commonColors = [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 
      'gray', 'grey', 'beige', 'navy', 'maroon', 'olive', 'lime', 'aqua', 'teal', 'silver', 
      'gold', 'tan', 'khaki', 'cream', 'ivory', 'burgundy', 'magenta', 'cyan', 'indigo', 
      'turquoise', 'coral', 'salmon', 'plum', 'lavender', 'mint', 'peach', 'rose', 'crimson'
    ];
    
    const words = phrase.toLowerCase().split(/\s+/);
    
    // Find the first word that matches a known color
    for (const word of words) {
      if (commonColors.includes(word)) {
        return word;
      }
    }
    
    // If no known color found, return the first word (likely still a color)
    return words[0] || phrase;
  }

  /**
   * Extract material from detected tags
   */
  private static extractMaterial(tags: DetectedTags): string | null {
    if (tags.Material) {
      return tags.Material;
    }

    // Look for material hints in other tags
    const materialKeywords = ['fabric', 'textile', 'material'];
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string' && materialKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract brand from detected tags
   */
  private static extractBrand(tags: DetectedTags): string | null {
    if (tags.Brand) {
      return tags.Brand;
    }

    // Look for brand hints in other tags
    const brandKeywords = ['brand', 'designer', 'label'];
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string' && brandKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract size from detected tags
   */
  private static extractSize(tags: DetectedTags): string | null {
    if (tags.Size) {
      return tags.Size;
    }

    // Look for size hints in other tags
    const sizeKeywords = ['size', 'fit'];
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string' && sizeKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract seasons from detected tags
   */
  private static extractSeasons(tags: DetectedTags): Season[] {
    const seasons: Season[] = [];
    
    // Check all tag values for season keywords
    for (const [, value] of Object.entries(tags)) {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const [keyword, mappedSeasons] of Object.entries(this.seasonMappings)) {
          if (lowerValue.includes(keyword)) {
            mappedSeasons.forEach(season => {
              if (!seasons.includes(season)) {
                seasons.push(season);
              }
            });
          }
        }
      }
    }

    // Default to versatile seasons if none detected
    if (seasons.length === 0) {
      return [Season.SPRING, Season.FALL];
    }

    return seasons;
  }

  /**
   * Generate an item name based on detected tags
   */
  private static generateItemName(tags: DetectedTags): string | null {
    const color = this.extractColor(tags);
    const subcategory = this.extractSubcategory(tags); // Only use mapped subcategory, no fallback
    const category = this.extractCategory(tags);
    
    if (color && subcategory) {
      return `${this.capitalizeFirst(color)} ${this.capitalizeFirst(subcategory)}`;
    }
    
    if (color && category) {
      return `${this.capitalizeFirst(color)} ${this.formatCategoryName(category)}`;
    }
    
    if (subcategory) {
      return this.capitalizeFirst(subcategory);
    }

    return null;
  }

  /**
   * Helper to capitalize first letter
   */
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * Helper to format category names
   */
  private static formatCategoryName(category: ItemCategory): string {
    switch (category) {
      case ItemCategory.TOP: return 'Top';
      case ItemCategory.BOTTOM: return 'Bottom';
      case ItemCategory.ONE_PIECE: return 'One Piece';
      case ItemCategory.OUTERWEAR: return 'Outerwear';
      case ItemCategory.FOOTWEAR: return 'Footwear';
      case ItemCategory.ACCESSORY: return 'Accessory';
      case ItemCategory.OTHER: return 'Other';
      default: return 'Item';
    }
  }
}
