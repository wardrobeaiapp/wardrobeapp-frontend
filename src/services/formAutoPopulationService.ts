import { ItemCategory, Season } from '../types';
import { getSilhouetteOptions, getSleeveOptions, getStyleOptions, getRiseOptions } from '../components/features/wardrobe/forms/WardrobeItemForm/utils/formHelpers';
import { WardrobeItemFormData } from '../components/features/wardrobe/forms/WardrobeItemForm/hooks/useWardrobeItemForm';

type DetectedTags = Record<string, string>;

interface FormFieldSetters {
  setCategory?: (category: ItemCategory) => void;
  setSubcategory?: (subcategory: string) => void;
  setColor?: (color: string) => void;
  setMaterial?: (material: string) => void;
  setBrand?: (brand: string) => void;
  setSize?: (size: string) => void;
  setPrice?: (price: string) => void;
  setSilhouette?: (silhouette: string) => void;
  setLength?: (length: string) => void;
  setSleeves?: (sleeves: string) => void;
  setStyle?: (style: string) => void;
  setRise?: (rise: string) => void;
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
    'top': ItemCategory.TOP,
    'sweater': ItemCategory.TOP,
    'cardigan': ItemCategory.TOP,
    'hoodie': ItemCategory.TOP,
    'polo': ItemCategory.TOP,
    'blazer': ItemCategory.TOP,
    'suit jackets': ItemCategory.TOP,
    'vest': ItemCategory.TOP,
    
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
    'scarves': ItemCategory.ACCESSORY,
    'jewelry': ItemCategory.ACCESSORY,
    'watch': ItemCategory.ACCESSORY,
    'sunglasses': ItemCategory.ACCESSORY,
    'socks': ItemCategory.ACCESSORY,
    'ties': ItemCategory.ACCESSORY,
  };

  // Subcategory mapping from detected subcategories to normalized subcategories
  private static subcategoryMappings: Record<string, string> = {
    // Tops
    'shirts': 'Shirt',
    'shirt': 'Shirt',
    'denim shirt': 'Shirt',
    'blouses': 'Blouse', 
    'blouse': 'Blouse',
    'cropped blouse': 'Blouse',
    't-shirts': 'T-Shirt',
    't-shirt': 'T-Shirt',
    'tshirt': 'T-Shirt',
    'polo-shirts': 'T-Shirt',
    'top': 'Top',
    'tops': 'Top',
    'crop tops': 'Top',
    'bardot tops': 'Top',
    'knitted tops': 'Top',
    'shell tops': 'Top',
    'tunics': 'Top',
    'transparent tops': 'Top',
    'wrap tops': 'Top',
    'tank tops': 'Tank Top',
    'tank': 'Tank Top',
    'sweaters': 'Sweater',
    'sweater': 'Sweater',
    'cardigans': 'Cardigan',
    'cardigan': 'Cardigan',
    'hoodies': 'Hoodie',
    'hoodie': 'Hoodie',
    'polo': 'Polo Shirt',
    'sweatshirts': 'Sweatshirt',
    'sweatshirt': 'Sweatshirt',
    'blazers': 'Blazer',
    'blazer': 'Blazer',
    'suit': 'Blazer',
    'vest': 'Vest',
    'vests':  'Vest',
    'knitted vests': 'Vest',
    
    // Bottoms
    'jeans': 'Jeans',
    'pants': 'Trousers',
    'trousers': 'Trousers',
    'beach pants': 'Trousers',
    'cargo': 'Trousers',
    'casual trousers': 'Trousers',
    'leather trousers': 'Trousers',
    'culottes': 'Trousers',
    'formal trousers': 'Trousers',
    'suit trousers': 'Trousers',
    'shorts': 'Shorts',
    'casual shorts': 'Shorts',
    'denim shorts': 'Shorts',
    'sportswear shorts':  'Shorts',
    'hotpants': 'Shorts',
    'leather shorts': 'Shorts',
    'skirts': 'Skirt',
    'skirt': 'Skirt',
    'leggings': 'Leggings',
    'casual leggings': 'Leggings',
    'leather leggings': 'Leggings',
    'sportswear leggings': 'Leggings',
    'sweat pants': 'Sweatpants',
    'sweatpants': 'Sweatpants',
    
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
    'eyewear': 'Sunglasses',
    'glasses': 'Glasses',
    'ties': 'Ties',
    'socks': 'Socks',
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
  public static async autoPopulateFromTags(
    detectedTags: DetectedTags,
    formSetters: FormFieldSetters,
    currentFormData?: Partial<WardrobeItemFormData>,
    options: AutoPopulationOptions = {}
  ): Promise<void> {
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

    // 7. Silhouette mapping
    console.log('[DEBUG] Silhouette check:', {
      hasSetter: !!formSetters.setSilhouette,
      shouldUpdate: shouldUpdateField('silhouette', currentFormData?.silhouette),
      currentSilhouette: currentFormData?.silhouette
    });
    
    if (formSetters.setSilhouette && shouldUpdateField('silhouette', currentFormData?.silhouette)) {
      // Get category and subcategory for silhouette validation
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const subcategory = this.extractSubcategory(detectedTags) || (currentFormData?.subcategory || undefined);
      console.log('[DEBUG] Category for silhouette:', category, 'Subcategory:', subcategory);
      const silhouette = this.extractSilhouette(detectedTags, category, subcategory);
      console.log('[DEBUG] Extracted silhouette result:', silhouette);
      if (silhouette) {
        console.log('[FormAutoPopulation] Setting silhouette:', silhouette);
        formSetters.setSilhouette(silhouette);
      }
    }


    // 9. Sleeves mapping
    console.log('[DEBUG] Sleeves field check:', {
      hasSetter: !!formSetters.setSleeves,
      currentSleeves: currentFormData?.sleeves,
      shouldUpdate: shouldUpdateField('sleeves', currentFormData?.sleeves)
    });
    
    if (formSetters.setSleeves && shouldUpdateField('sleeves', currentFormData?.sleeves)) {
      // Get category for sleeves validation (prioritize extracted category, fall back to current form data)
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      console.log('[DEBUG] Category for sleeves extraction:', category);
      const sleeves = this.extractSleeves(detectedTags, category);
      console.log('[DEBUG] Extracted sleeves value:', sleeves);
      if (sleeves) {
        console.log('[FormAutoPopulation] Setting sleeves:', sleeves);
        formSetters.setSleeves(sleeves);
      } else {
        console.log('[DEBUG] No sleeves extracted from tags');
      }
    }

    // 10. Style mapping
    if (formSetters.setStyle && shouldUpdateField('style', currentFormData?.style)) {
      // Get category for style validation (prioritize extracted category, fall back to current form data)
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const style = this.extractStyle(detectedTags, category);
      if (style) {
        console.log('[FormAutoPopulation] Setting style:', style);
        formSetters.setStyle(style);
      }
    }

    // 10.5. Rise mapping
    if (formSetters.setRise && shouldUpdateField('rise', currentFormData?.rise)) {
      // Get category for rise validation (prioritize extracted category, fall back to current form data)
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const rise = this.extractRise(detectedTags, category);
      if (rise) {
        console.log('[FormAutoPopulation] Setting rise:', rise);
        formSetters.setRise(rise);
      }
    }

    // 11. Length mapping
    console.log('[DEBUG] Length field check:', {
      hasSetLength: !!formSetters.setLength,
      currentLength: currentFormData?.length,
      shouldUpdate: shouldUpdateField('length', currentFormData?.length),
      overwriteExisting,
      skipFields
    });
    
    if (formSetters.setLength && shouldUpdateField('length', currentFormData?.length)) {
      // Get category and subcategory for length validation
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const subcategory = this.extractSubcategory(detectedTags) || (currentFormData?.subcategory || undefined);
      const length = await this.extractLength(detectedTags, category, subcategory);
      if (length) {
        console.log('[FormAutoPopulation] Setting length:', length);
        console.log('[DEBUG] setLength function available:', !!formSetters.setLength);
        if (formSetters.setLength) {
          formSetters.setLength(length);
          console.log('[DEBUG] setLength called with value:', length);
        }
      } else {
        console.log('[DEBUG] No length extracted from tags');
      }
    }

    // 11. Season mapping
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
    
    // Debug logging
    console.log('[FormAutoPopulation] extractSubcategory - Available tags:', Object.keys(tags));
    console.log('[FormAutoPopulation] extractSubcategory - Tag values:', tags);
    
    // PRIORITY 1: Direct Subcategory tag (highest priority)
    if (tags.Subcategory) {
      rawSubcategory = tags.Subcategory;
      console.log('[FormAutoPopulation] extractSubcategory - Using direct Subcategory tag:', rawSubcategory);
    }
    
    // PRIORITY 2: Check hierarchical Category tag like "Accessories/Belts" or "Clothing/Upper"  
    if (!rawSubcategory && tags.Category) {
      const categoryPath = tags.Category;
      const pathParts = categoryPath.split('/');
      
      // If there are multiple parts, the second part is usually the subcategory
      if (pathParts.length >= 2) {
        rawSubcategory = pathParts[1]; // "Belts" from "Accessories/Belts" or "Upper" from "Clothing/Upper"
        console.log('[FormAutoPopulation] extractSubcategory - Using Category path subcategory:', rawSubcategory);
      }
    }
    
    // Check for other subcategory-related tag names, prioritizing direct subcategory fields
    if (!rawSubcategory) {
      // First priority: direct subcategory fields
      const directSubcategoryTags = ['Subcategory', 'SubCategory', 'Sub_Category', 'subcategory'];
      for (const tagName of directSubcategoryTags) {
        if (tags[tagName] && typeof tags[tagName] === 'string') {
          rawSubcategory = tags[tagName] as string;
          break;
        }
      }
      
      // Second priority: other type-related fields
      if (!rawSubcategory) {
        const otherTypeTags = ['Type', 'ItemType', 'Garment', 'Style'];
        for (const tagName of otherTypeTags) {
          if (tags[tagName] && typeof tags[tagName] === 'string') {
            rawSubcategory = tags[tagName] as string;
            break;
          }
        }
      }
    }
    
    // Special handling for "Clothing/" prefixed categories - look for more specific subcategory info
    // But only if we haven't already found a mappable subcategory
    if (tags.Category && tags.Category.startsWith('Clothing/') && (!rawSubcategory || !this.subcategoryMappings[rawSubcategory.toLowerCase()])) {
      console.log('[FormAutoPopulation] extractSubcategory - Checking Clothing/ special handling. Current rawSubcategory:', rawSubcategory);
      console.log('[FormAutoPopulation] extractSubcategory - Is current mappable?', rawSubcategory ? this.subcategoryMappings[rawSubcategory.toLowerCase()] : 'no rawSubcategory');
      
      // Check if there's a more specific subcategory in other tags (excluding Subcategory since we already checked it)
      const specificTags = ['Type', 'ItemType', 'Garment', 'Product'];
      for (const tagName of specificTags) {
        if (tags[tagName] && typeof tags[tagName] === 'string') {
          const tagValue = tags[tagName] as string;
          console.log('[FormAutoPopulation] extractSubcategory - Checking specificTag:', tagName, 'value:', tagValue);
          // If we find a more specific subcategory that's actually mappable, use it instead
          if (tagValue.toLowerCase() !== 'upper' && tagValue.toLowerCase() !== 'lower' && tagValue.toLowerCase() !== 'clothing') {
            // Only override if this new value is mappable or if we don't have a mappable value yet
            const isNewValueMappable = this.subcategoryMappings[tagValue.toLowerCase()];
            const isCurrentMappable = this.subcategoryMappings[rawSubcategory?.toLowerCase() || ''];
            console.log('[FormAutoPopulation] extractSubcategory - isNewValueMappable:', isNewValueMappable, 'isCurrentMappable:', isCurrentMappable);
            
            if (isNewValueMappable || !isCurrentMappable) {
              console.log('[FormAutoPopulation] extractSubcategory - Overriding with:', tagValue);
              rawSubcategory = tagValue;
              break;
            }
          }
        }
      }
    }

    // Map the raw subcategory to our normalized format
    if (rawSubcategory) {
      console.log('[FormAutoPopulation] extractSubcategory - Raw subcategory found:', rawSubcategory);
      const lowerSubcategory = rawSubcategory.toLowerCase();
      console.log('[FormAutoPopulation] extractSubcategory - Lowercase subcategory:', lowerSubcategory);
      
      // Skip generic terms that don't provide specific subcategory info
      const genericTerms = ['upper', 'lower', 'clothing', 'apparel', 'garment'];
      if (genericTerms.includes(lowerSubcategory)) {
        console.log('[FormAutoPopulation] extractSubcategory - Skipping generic term:', lowerSubcategory);
        return null; // Let category extraction handle these cases
      }
      
      // Direct mapping check
      if (this.subcategoryMappings[lowerSubcategory]) {
        console.log('[FormAutoPopulation] extractSubcategory - Direct mapping found:', this.subcategoryMappings[lowerSubcategory]);
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

    // Look for size hints in other tags (excluding 'fit' to avoid conflict with silhouette)
    const sizeKeywords = ['size'];
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string' && sizeKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
        return value;
      }
    }

    return null;
  }

  /**
   * Extract silhouette from detected tags, validating against category-specific options
   */
  private static extractSilhouette(tags: DetectedTags, category?: ItemCategory, subcategory?: string): string | null {
    let rawSilhouette: string | null = null;

    console.log('[DEBUG] extractSilhouette called with:', { tags, category, subcategory });

    // Special handling for skirt subcategory - detect from subcategory name
    if (category === ItemCategory.BOTTOM && subcategory?.toLowerCase() === 'skirt') {
      console.log('[DEBUG] Detected skirt subcategory, checking for silhouette mapping');
      rawSilhouette = this.mapSkirtSubcategoryToSilhouette(subcategory, tags);
      if (rawSilhouette) {
        console.log('[DEBUG] Mapped skirt subcategory to silhouette:', rawSilhouette);
      }
    }

    // If no skirt-specific mapping, try direct silhouette tag
    if (!rawSilhouette && tags.Silhouette) {
      rawSilhouette = tags.Silhouette;
      console.log('[DEBUG] Found direct Silhouette tag:', rawSilhouette);
    } 
    // Special handling for Fit tag (commonly used for tops silhouette)
    else if (!rawSilhouette && tags.Fit && category === ItemCategory.TOP) {
      console.log('[DEBUG] Using Fit tag for TOP category:', tags.Fit);
      rawSilhouette = this.mapFitToSilhouette(tags.Fit);
      console.log('[DEBUG] Mapped Fit to silhouette:', rawSilhouette);
    }
    else {
      console.log('[DEBUG] Searching for silhouette in other tags...');
      // Look for silhouette hints in other tags
      const silhouetteKeywords = ['silhouette', 'fit', 'shape', 'cut'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && silhouetteKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawSilhouette = value;
          console.log('[DEBUG] Found silhouette hint in', key, ':', value);
          break;
        }
      }
    }

    // If no raw silhouette found, return null
    if (!rawSilhouette || !category) {
      return null;
    }

    // Get valid options for this category and subcategory
    const validOptions = getSilhouetteOptions(category, subcategory);
    if (validOptions.length === 0) {
      return null; // Category doesn't support silhouettes
    }

    // Check if raw silhouette matches any valid option (case-insensitive)
    const lowerRaw = rawSilhouette.toLowerCase();
    const exactMatch = validOptions.find(option => option.toLowerCase() === lowerRaw);
    if (exactMatch) {
      return exactMatch;
    }

    // Try partial matching with common mappings
    const partialMatch = validOptions.find(option => {
      const lowerOption = option.toLowerCase();
      return lowerRaw.includes(lowerOption) || lowerOption.includes(lowerRaw);
    });
    if (partialMatch) {
      return partialMatch;
    }

    // Try semantic matching for common silhouette terms
    for (const option of validOptions) {
      const lowerOption = option.toLowerCase();
      if (
        ((lowerRaw.includes('slim') || lowerRaw.includes('fitted')) && lowerOption.includes('fitted')) ||
        ((lowerRaw.includes('regular') || lowerRaw.includes('standard')) && lowerOption.includes('regular')) ||
        ((lowerRaw.includes('loose') || lowerRaw.includes('relaxed')) && lowerOption.includes('loose')) ||
        ((lowerRaw.includes('oversized') || lowerRaw.includes('baggy')) && lowerOption.includes('oversized'))
      ) {
        return option;
      }
    }

    return null; // No valid match found
  }

  /**
   * Map Fit tag values to silhouette options for tops
   */
  private static mapFitToSilhouette(fitValue: string): string | null {
    if (!fitValue) return null;

    console.log('[DEBUG] mapFitToSilhouette input:', fitValue);
    const lowerFit = fitValue.toLowerCase();
    console.log('[DEBUG] lowerFit:', lowerFit);
    
    // Map common fit values to TOP silhouette options: ['Fitted', 'Loose', 'Regular']
    if (lowerFit.includes('tight') || lowerFit.includes('slim') || lowerFit.includes('fitted') || lowerFit.includes('snug')) {
      console.log('[DEBUG] Mapped to Fitted');
      return 'Fitted';
    }
    if (lowerFit.includes('loose') || lowerFit.includes('baggy') || lowerFit.includes('oversized') || lowerFit.includes('relaxed')) {
      console.log('[DEBUG] Mapped to Loose');
      return 'Loose';
    }
    if (lowerFit.includes('regular') || lowerFit.includes('standard') || lowerFit.includes('normal') || lowerFit.includes('classic')) {
      console.log('[DEBUG] Mapped to Regular');
      return 'Regular';
    }

    // If no mapping found, return the original value and let validation handle it
    console.log('[DEBUG] No mapping found, returning original:', fitValue);
    return fitValue;
  }

  /**
   * Extract length from detected tags for BOTTOM category items
   */
  private static async extractLength(tags: DetectedTags, category?: ItemCategory, subcategory?: string): Promise<string | null> {
    // Length field only applies to BOTTOM category with specific subcategories
    if (category !== ItemCategory.BOTTOM || !subcategory) {
      return null;
    }

    console.log('[DEBUG] extractLength called with:', { tags, category, subcategory });

    const subcategoryLower = subcategory.toLowerCase();
    const validSubcategories = ['jeans', 'trousers', 'skirt'];
    if (!validSubcategories.includes(subcategoryLower)) {
      return null;
    }

    let rawLength: string | null = null;

    // First try direct Length tag (case insensitive)
    for (const [key, value] of Object.entries(tags)) {
      if (key.toLowerCase() === 'length' && typeof value === 'string') {
        rawLength = value;
        break;
      }
    }

    // If no direct Length tag, look for length hints in tag keys and values
    if (!rawLength) {
      const lengthKeywords = ['length', 'size', 'fit', 'inseam', 'hem'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string') {
          const keyLower = key.toLowerCase();
          const valueLower = value.toLowerCase();
          
          // Check if key contains length keywords
          if (lengthKeywords.some(keyword => keyLower.includes(keyword))) {
            rawLength = value;
            break;
          }
          
          // Check if value contains length terms
          const lengthTerms = ['long', 'short', 'cropped', 'ankle', 'full', 'capri', 'maxi', 'midi', 'mini', '7/8', '3/4', 'floor', 'above knee'];
          if (lengthTerms.some(term => valueLower.includes(term))) {
            rawLength = value;
            break;
          }
        }
      }
    }

    // If no raw length found, return null
    if (!rawLength) {
      return null;
    }

    const lowerRaw = rawLength.toLowerCase();

    // Get valid length options based on subcategory (use actual options from formHelpers)
    const { getLengthOptions } = await import('../components/features/wardrobe/forms/WardrobeItemForm/utils/formHelpers');
    const validOptions = getLengthOptions(subcategory);

    // Check for exact matches first
    const exactMatch = validOptions.find(option => option.toLowerCase() === lowerRaw);
    if (exactMatch) {
      return exactMatch;
    }

    // Try semantic matching for common length terms (case insensitive)
    for (const option of validOptions) {
      const lowerOption = option.toLowerCase();
      if (
        (lowerRaw.includes(lowerOption)) ||
        (lowerOption === 'long' && (lowerRaw.includes('full') || lowerRaw.includes('ankle') || lowerRaw.includes('regular'))) ||
        (lowerOption === 'short' && (lowerRaw.includes('cropped') || lowerRaw.includes('capri') || lowerRaw.includes('crop'))) ||
        (lowerOption === '7/8' && (lowerRaw.includes('seven eighth') || lowerRaw.includes('7-8') || lowerRaw.includes('seven-eighth'))) ||
        (lowerOption === '3/4' && (lowerRaw.includes('three quarter') || lowerRaw.includes('3-4') || lowerRaw.includes('three-quarter'))) ||
        (lowerOption === 'maxi' && (lowerRaw.includes('floor') || lowerRaw.includes('long') || lowerRaw.includes('ankle'))) ||
        (lowerOption === 'midi' && (lowerRaw.includes('mid') || lowerRaw.includes('calf') || lowerRaw.includes('knee'))) ||
        (lowerOption === 'mini' && (lowerRaw.includes('above knee') || lowerRaw.includes('short') || lowerRaw.includes('thigh')))
      ) {
        return option;
      }
    }

    return null; // No valid match found
  }

  /**
   * Extract sleeves from detected tags, validating against category-specific options
   */
  private static extractSleeves(tags: DetectedTags, category?: ItemCategory): string | null {
    // Only TOP category supports sleeves
    if (category !== ItemCategory.TOP) {
      return null;
    }

    let rawSleeves: string | null = null;

    // First try direct Sleeves tag
    if (tags.Sleeves) {
      rawSleeves = tags.Sleeves;
    } else {
      // Look for sleeve hints in other tags
      const sleeveKeywords = ['sleeve', 'sleeves'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && sleeveKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawSleeves = value;
          break;
        }
      }
    }

    // If no raw sleeves found, return null
    if (!rawSleeves) {
      return null;
    }

    // Get valid sleeve options
    const validOptions = getSleeveOptions();

    // Check if raw sleeves matches any valid option (case-insensitive)
    const lowerRaw = rawSleeves.toLowerCase();
    const exactMatch = validOptions.find(option => option.toLowerCase() === lowerRaw);
    if (exactMatch) {
      return exactMatch;
    }

    // Try partial matching
    const partialMatch = validOptions.find(option => {
      const lowerOption = option.toLowerCase();
      return lowerRaw.includes(lowerOption) || lowerOption.includes(lowerRaw);
    });
    if (partialMatch) {
      return partialMatch;
    }

    // Try semantic matching for common sleeve terms
    for (const option of validOptions) {
      const lowerOption = option.toLowerCase();
      if (
        (lowerRaw.includes('short') && lowerOption.includes('short')) ||
        (lowerRaw.includes('long') && lowerOption.includes('long')) ||
        ((lowerRaw.includes('3/4') || lowerRaw.includes('three quarter')) && lowerOption.includes('3/4')) ||
        ((lowerRaw.includes('one') || lowerRaw.includes('single')) && lowerOption.includes('one')) ||
        ((lowerRaw.includes('sleeveless') || lowerRaw.includes('no sleeve')) && lowerOption.includes('sleeveless'))
      ) {
        return option;
      }
    }

    return null; // No valid match found
  }

  /**
   * Extract style from detected tags, validating against available options
   */
  private static extractStyle(tags: DetectedTags, category?: ItemCategory): string | null {
    // Style field applies to all categories except ACCESSORY and OTHER
    if (category === ItemCategory.ACCESSORY || category === ItemCategory.OTHER) {
      return null;
    }

    let rawStyle: string | null = null;

    // First try direct Style tag
    if (tags.Style) {
      rawStyle = tags.Style;
    } else {
      // Look for style hints in other tags
      const styleKeywords = ['style', 'occasion', 'wear', 'look'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && styleKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawStyle = value;
          break;
        }
      }
    }

    // If no raw style found, return null
    if (!rawStyle) {
      return null;
    }

    // Get valid style options
    const validOptions = getStyleOptions();

    // Check if raw style matches any valid option (case-insensitive)
    const lowerRaw = rawStyle.toLowerCase();
    const exactMatch = validOptions.find(option => option.toLowerCase() === lowerRaw);
    if (exactMatch) {
      return exactMatch;
    }

    // Try semantic matching for common style terms
    for (const option of validOptions) {
      const lowerOption = option.toLowerCase();
      if (
        (lowerRaw.includes('casual') && lowerOption === 'casual') ||
        ((lowerRaw.includes('elegant') || lowerRaw.includes('formal') || lowerRaw.includes('dressy')) && lowerOption === 'elegant') ||
        ((lowerRaw.includes('special') || lowerRaw.includes('party') || lowerRaw.includes('evening')) && lowerOption === 'special') ||
        ((lowerRaw.includes('sport') || lowerRaw.includes('athletic') || lowerRaw.includes('gym') || lowerRaw.includes('workout')) && lowerOption === 'sport')
      ) {
        return option;
      }
    }

    return null; // No valid match found
  }

  /**
   * Extract rise from detected tags, validating against available options
   */
  private static extractRise(tags: DetectedTags, category?: ItemCategory): string | null {
    // Rise field only applies to BOTTOM category
    if (category !== ItemCategory.BOTTOM) {
      return null;
    }

    let rawRise: string | null = null;

    // First try direct Rise tag
    if (tags.Rise) {
      rawRise = tags.Rise;
    } else {
      // Look for rise hints in other tags
      const riseKeywords = ['rise', 'waist', 'fit'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && riseKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawRise = value;
          break;
        }
      }
    }

    // If no raw rise found, return null
    if (!rawRise) {
      return null;
    }

    // Get valid rise options
    const validOptions = getRiseOptions();

    // Check if raw rise matches any valid option (case-insensitive)
    const lowerRaw = rawRise.toLowerCase();
    const exactMatch = validOptions.find(option => option.toLowerCase() === lowerRaw);
    if (exactMatch) {
      return exactMatch;
    }

    // Try semantic matching for common rise terms
    for (const option of validOptions) {
      const lowerOption = option.toLowerCase();
      if (
        ((lowerRaw.includes('high') || lowerRaw.includes('tall')) && lowerOption === 'high') ||
        ((lowerRaw.includes('mid') || lowerRaw.includes('medium') || lowerRaw.includes('regular')) && lowerOption === 'mid') ||
        ((lowerRaw.includes('low') || lowerRaw.includes('short')) && lowerOption === 'low')
      ) {
        return option;
      }
    }

    return null; // No valid match found
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
   * Map skirt subcategory and tags to silhouette
   */
  private static mapSkirtSubcategoryToSilhouette(subcategory: string, tags: DetectedTags): string | null {
    console.log(`[DEBUG] Subcategory: ${subcategory}`);
    // Define skirt silhouette keywords that might appear in tags
    const skirtSilhouetteKeywords: { [key: string]: string } = {
      'a-line': 'A-Line',
      'aline': 'A-Line', 
      'balloon': 'Balloon',
      'mermaid': 'Mermaid',
      'pencil': 'Pencil',
      'straight': 'Straight',
      'pencil and straight': 'Straight',
      'pleated': 'Pleated',
      'tiered ': 'Tiered',
      'wrap': 'Wrap'
    };

    // Check all tag values for skirt silhouette keywords
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const [keyword, silhouette] of Object.entries(skirtSilhouetteKeywords)) {
          if (lowerValue.includes(keyword)) {
            console.log(`[DEBUG] Found skirt silhouette "${silhouette}" from tag ${key}: ${value}`);
            return silhouette;
          }
        }
      }
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
