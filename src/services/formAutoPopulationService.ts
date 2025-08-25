import { ItemCategory, Season } from '../types';
import { getSilhouetteOptions, getSleeveOptions, getStyleOptions, getRiseOptions, getNecklineOptions, getHeelHeightOptions, getBootHeightOptions, getColorOptions, getPatternOptions } from '../components/features/wardrobe/forms/WardrobeItemForm/utils/formHelpers';
import { WardrobeItemFormData } from '../components/features/wardrobe/forms/WardrobeItemForm/hooks/useWardrobeItemForm';

type DetectedTags = Record<string, string>;

interface FormFieldSetters {
  setCategory?: (category: ItemCategory) => void;
  setSubcategory?: (subcategory: string) => void;
  setColor?: (color: string) => void;
  setPattern?: (pattern: string) => void;
  setMaterial?: (material: string) => void;
  setBrand?: (brand: string) => void;
  setSize?: (size: string) => void;
  setPrice?: (price: string) => void;
  setSilhouette?: (silhouette: string) => void;
  setLength?: (length: string) => void;
  setSleeves?: (sleeves: string) => void;
  setStyle?: (style: string) => void;
  setRise?: (rise: string) => void;
  setNeckline?: (neckline: string) => void;
  setHeelHeight?: (heelHeight: string) => void;
  setBootHeight?: (bootHeight: string) => void;
  setType?: (type: string) => void;
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
    'jewellery': ItemCategory.ACCESSORY,
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
    'overall': 'Overall',
    'overalls': 'Overall',
    'casual overalls': 'Overall',
    'elegant overalls': 'Overall',
    'winter overalls': 'Overall',
    'work overalls': 'Overall',
    
    // Outerwear
    'jackets': 'Jacket',
    'jacket': 'Jacket',
    'baseball jacket': 'Jacket',
    'biker jacket': 'Jacket',
    'bomber jacket': 'Jacket',
    'puffer jackets': 'Jacket',
    'casual jackets': 'Jacket',
    'harrington jacket': 'Jacket',
    'knitted ponchos': 'Jacket',
    'pilot jacket': 'Jacket',
    'racer jacket': 'Jacket',
    'ponchos': 'Jacket',
    'winter jackets': 'Jacket',
    'coats': 'Coat',
    'coat': 'Coat',
    'duffle coat': 'Coat',
    'kimono coat': 'Coat',
    'parka coat': 'Coat',
    'peacoat': 'Coat',
    'raincoats and ponchos': 'Coat',
    'winter coats': 'Coat',
    'wool coats': 'Coat',
    'trench coats': 'Trench Coat',
    'windbreakers': 'Windbreaker',
    'windstoppers & softshells': 'Windbreaker',
    
    // Footwear
    'shoes': 'Shoes',
    'boots': 'Boots',
    'sneakers': 'Sneakers',
    'free time shoes': 'Sneakers',
    'trainers': 'Sneakers',
    'sandals': 'Sandals',
    'espadrilles': 'Sandals',
    'heels': 'Heels',
    'pumps': 'Heels',
    'flats': 'Flats',
    'mary jane shoes': 'Flats',
    'mules': 'Flats',
    'ballerinas': 'Flats',
    'crocs': 'Flats',
    'formal shoes': 'Formal Shoes',
    'slippers': 'Slippers',
    'flip-flops': 'Slippers',
    'chelsea and ankle boots': 'Boots',
    'desert boots': 'Boots',
    'hiking boots': 'Boots',
    'high boots': 'Boots',
    'rubber boots': 'Boots',
    'snow boots': 'Boots',
    'ski boots': 'Boots',
    
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
    'jewellery': 'Jewelry',
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

  // Cache for extracted values to avoid repeated computation
  private static extractionCache: {
    category?: string | null;
    subcategory?: string | null;
    tags?: DetectedTags;
  } = {};

  /**
   * Clear the extraction cache (call when processing new image)
   */
  static clearCache(): void {
    this.extractionCache = {};
  }

  /**
   * Get cached subcategory or extract and cache it
   */
  private static getCachedSubcategory(tags: DetectedTags): string | null {
    if (this.extractionCache.tags !== tags || this.extractionCache.subcategory === undefined) {
      this.extractionCache.subcategory = this.extractSubcategory(tags);
      this.extractionCache.tags = tags;
    }
    return this.extractionCache.subcategory;
  }

  /**
   * Auto-populate form fields based on detected tags
   */
  public static async autoPopulateFromTags(
    detectedTags: DetectedTags,
    formSetters: FormFieldSetters,
    currentFormData?: Partial<WardrobeItemFormData>,
    options: AutoPopulationOptions = {}
  ): Promise<void> {
    // Clear cache for new processing
    this.clearCache();

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
      const subcategory = this.getCachedSubcategory(detectedTags);
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

    // 3.5 Pattern mapping
    if (formSetters.setPattern && shouldUpdateField('pattern', currentFormData?.pattern)) {
      const pattern = this.extractPattern(detectedTags);
      if (pattern) {
        console.log('[FormAutoPopulation] Setting pattern:', pattern);
        formSetters.setPattern(pattern);
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
      const subcategory = this.getCachedSubcategory(detectedTags) || (currentFormData?.subcategory || undefined);
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
      // Get category and subcategory for sleeves validation (prioritize extracted values, fall back to current form data)
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const subcategory = this.getCachedSubcategory(detectedTags) || (currentFormData?.subcategory || undefined);
      console.log('[DEBUG] Category for sleeves extraction:', category);
      console.log('[DEBUG] Subcategory for sleeves extraction:', subcategory);
      const sleeves = this.extractSleeves(detectedTags, category, subcategory);
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
      // Get category and subcategory for style validation (prioritize extracted values, fall back to current form data)
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const subcategory = this.getCachedSubcategory(detectedTags) || (currentFormData?.subcategory || undefined);
      console.log('[DEBUG] Style extraction - category:', category, 'subcategory:', subcategory);
      const style = this.extractStyle(detectedTags, category, subcategory);
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

    // 10.6. Neckline mapping
    if (formSetters.setNeckline && shouldUpdateField('neckline', currentFormData?.neckline)) {
      // Get subcategory for neckline validation (prioritize extracted subcategory, fall back to current form data)
      const subcategory = this.getCachedSubcategory(detectedTags) || (currentFormData?.subcategory || undefined);
      const neckline = this.extractNeckline(detectedTags, subcategory);
      if (neckline) {
        console.log('[FormAutoPopulation] Setting neckline:', neckline);
        formSetters.setNeckline(neckline);
      }
    }

    // 10.7. Heel height mapping
    if (formSetters.setHeelHeight && shouldUpdateField('heelHeight', currentFormData?.heelHeight)) {
      // Get category for heel height validation (prioritize extracted category, fall back to current form data)
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const heelHeight = this.extractHeelHeight(detectedTags, category);
      if (heelHeight) {
        console.log('[FormAutoPopulation] Setting heel height:', heelHeight);
        formSetters.setHeelHeight(heelHeight);
      }
    }

    // 10.8. Boot height mapping
    if (formSetters.setBootHeight && shouldUpdateField('bootHeight', currentFormData?.bootHeight)) {
      // Get category for boot height validation (prioritize extracted category, fall back to current form data)
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const bootHeight = this.extractBootHeight(detectedTags, category);
      if (bootHeight) {
        console.log('[FormAutoPopulation] Setting boot height:', bootHeight);
        formSetters.setBootHeight(bootHeight);
      }
    }

    // 10.9. Type mapping
    console.log('[DEBUG] Type field check:', {
      hasSetType: !!formSetters.setType,
      currentType: currentFormData?.type,
      shouldUpdate: shouldUpdateField('type', currentFormData?.type),
      overwriteExisting,
      skipFields
    });
    
    if (formSetters.setType && shouldUpdateField('type', currentFormData?.type)) {
      // Get category and subcategory for type validation
      const category = this.extractCategory(detectedTags) || (currentFormData?.category || undefined);
      const subcategory = this.getCachedSubcategory(detectedTags) || (currentFormData?.subcategory || undefined);
      console.log('[DEBUG] Type extraction - category:', category, 'subcategory:', subcategory);
      const type = this.extractType(detectedTags, category, subcategory);
      console.log('[DEBUG] Extracted type result:', type);
      if (type) {
        console.log('[FormAutoPopulation] Setting type:', type);
        formSetters.setType(type);
      } else {
        console.log('[DEBUG] No type extracted from tags');
      }
    } else {
      console.log('[DEBUG] Type mapping skipped - setter missing or field should not update');
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
      const subcategory = this.getCachedSubcategory(detectedTags) || (currentFormData?.subcategory || undefined);
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
    
    // Debug logging (reduced to avoid spam)
    console.log('[FormAutoPopulation] extractSubcategory - Processing tags for subcategory extraction');
    
    // PRIORITY 1: Direct Subcategory tag (highest priority)
    if (tags.Subcategory) {
      rawSubcategory = tags.Subcategory;
      console.log('[FormAutoPopulation] extractSubcategory - Using direct Subcategory tag:', rawSubcategory);
    }
    
    // PRIORITY 2: Check hierarchical Category tag like "Accessories/Belts" or "Clothing/Upper"  
    if (!rawSubcategory && tags.Category) {
      const categoryPath = tags.Category;
      const pathParts = categoryPath.split('/');
      
      // Special handling for footwear: "Footwear/Ladies High Boots" -> map to appropriate subcategory
      if (pathParts.length >= 2 && pathParts[0].toLowerCase() === 'footwear') {
        const footwearType = pathParts[1].toLowerCase(); // "ladies high boots"
        console.log('[FormAutoPopulation] extractSubcategory - Found footwear type:', footwearType);
        
        // Map footwear type to subcategory
        if (footwearType.includes('boot') || footwearType.includes('boots')) {
          rawSubcategory = 'boots';
        } else if (footwearType.includes('sneaker') || footwearType.includes('sneakers') || footwearType.includes('trainer')) {
          rawSubcategory = 'sneakers';
        } else if (footwearType.includes('sandal') || footwearType.includes('sandals')) {
          rawSubcategory = 'sandals';
        } else if (footwearType.includes('heel') || footwearType.includes('heels') || footwearType.includes('pump')) {
          rawSubcategory = 'heels';
        } else if (footwearType.includes('flat') || footwearType.includes('flats') || footwearType.includes('ballet')) {
          rawSubcategory = 'flats';
        } else if (footwearType.includes('loafer') || footwearType.includes('loafers')) {
          rawSubcategory = 'formal shoes';
        } else if (footwearType.includes('slipper') || footwearType.includes('slippers')) {
          rawSubcategory = 'slippers';
        } else if (footwearType.includes('formal shoes') || footwearType.includes('oxford') || footwearType.includes('derby') || footwearType.includes('formal') || footwearType.includes('dress shoe')) {
          rawSubcategory = 'formal shoes';
        } else {
          // Default to using the raw footwear type if no specific mapping
          rawSubcategory = pathParts[1];
        }
        console.log('[FormAutoPopulation] extractSubcategory - Mapped footwear to subcategory:', rawSubcategory);
      }
      // Special handling for jewellery: "Jewellery/Bracelets" -> always maps to "Jewelry" subcategory
      else if (pathParts.length >= 2 && pathParts[0].toLowerCase() === 'jewellery') {
        rawSubcategory = 'Jewelry';
        console.log('[FormAutoPopulation] extractSubcategory - Found jewellery path, mapping to Jewelry subcategory');
      }
      // General hierarchical handling for non-footwear categories
      else if (pathParts.length >= 2) {
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
      console.log('[FormAutoPopulation] Found raw color in tags:', rawColor);
      // Extract basic color from phrases like "brown belt" -> "brown"
      const extractedColor = this.extractColorFromPhrase(rawColor);
      console.log('[FormAutoPopulation] Extracted color phrase:', extractedColor);
      
      // Map the extracted color to one of our standard dropdown options
      return this.mapColorToStandardOption(extractedColor);
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
   * Map an extracted color to one of the standardized dropdown options
   */
  private static mapColorToStandardOption(extractedColor: string): string | null {
    console.log('[FormAutoPopulation] Mapping color:', extractedColor);
    const colorOptions = getColorOptions();
    const lowerExtractedColor = extractedColor.toLowerCase();
    
    // Try exact match first (case insensitive)
    const exactMatch = colorOptions.find(option => option.toLowerCase() === lowerExtractedColor);
    if (exactMatch) {
      console.log('[FormAutoPopulation] Found exact color match:', exactMatch);
      return exactMatch;
    }
    
    // Try partial match next
    const colorMappings: Record<string, string> = {
      // Blues
      'aqua': 'Light Blue',
      'azure': 'Light Blue',
      'sky': 'Light Blue',
      'denim': 'Blue',
      'indigo': 'Navy',
      'royal': 'Blue',
      'cyan': 'Turquoise',
      // Reds
      'crimson': 'Red',
      'scarlet': 'Red',
      'wine': 'Burgundy',
      'cherry': 'Red',
      'ruby': 'Red',
      'salmon': 'Pink',
      'coral': 'Pink',
      'peach': 'Light Pink',
      'rose': 'Pink',
      'fuchsia': 'Hot Pink',
      'magenta': 'Hot Pink',
      // Greens
      'mint': 'Green',
      'emerald': 'Green',
      'sage': 'Olive',
      'khaki': 'Olive',
      // Browns
      'chocolate': 'Brown',
      'caramel': 'Brown',
      'coffee': 'Brown',
      'bronze': 'Brown',
      'chestnut': 'Brown',
      'copper': 'Rust',
      // Neutrals
      'charcoal': 'Grey',
      'ash': 'Grey',
      'off-white': 'Cream',
      'eggshell': 'Ivory',
      'platinum': 'Silver',
      // Patterns
      'checkered': 'Patterned',
      'striped': 'Patterned',
      'dotted': 'Patterned',
      'leopard': 'Patterned',
      'animal': 'Patterned',
      'print': 'Patterned',
      'polka': 'Patterned',
      'flower': 'Floral',
      'floral': 'Floral',
      'botanical': 'Floral',
      'rainbow': 'Multicolor',
      'colorful': 'Multicolor',
      'multi': 'Multicolor'
    };
    
    // Check for specific color keywords in mapping
    for (const [keyword, mappedColor] of Object.entries(colorMappings)) {
      if (lowerExtractedColor.includes(keyword)) {
        console.log(`[FormAutoPopulation] Mapped color ${extractedColor} to ${mappedColor} via keyword ${keyword}`);
        return mappedColor;
      }
    }
    
    // Try partial match with dropdown options
    for (const option of colorOptions) {
      if (lowerExtractedColor.includes(option.toLowerCase()) || option.toLowerCase().includes(lowerExtractedColor)) {
        console.log('[FormAutoPopulation] Found partial color match:', option);
        return option;
      }
    }
    
    // Capitalize first letter as fallback
    const capitalized = extractedColor.charAt(0).toUpperCase() + extractedColor.slice(1).toLowerCase();
    console.log('[FormAutoPopulation] No match found, using capitalized color:', capitalized);
    return capitalized;
  }

  /**
   * Extract pattern from detected tags
   */
  private static extractPattern(tags: DetectedTags): string | null {
    let rawPattern: string | null = null;
    
    // First check for direct Pattern tag
    if (tags.Pattern) {
      rawPattern = tags.Pattern;
    } else {
      // Look for pattern hints in other tags
      const patternKeywords = ['pattern', 'print', 'design'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && patternKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawPattern = value;
          break;
        }
      }
      
      // Also check in tag values for common pattern descriptors
      if (!rawPattern) {
        for (const [, value] of Object.entries(tags)) {
          if (typeof value === 'string') {
            const lowerValue = value.toLowerCase();
            const patternTerms = ['stripe', 'check', 'floral', 'dot', 'polka', 'plaid', 'animal', 'leopard', 'zebra', 'geometric', 'abstract'];
            if (patternTerms.some(term => lowerValue.includes(term))) {
              rawPattern = value;
              break;
            }
          }
        }
      }
    }
    
    if (rawPattern) {
      return this.mapPatternToStandardOption(rawPattern);
    }
    
    return null;
  }
  
  /**
   * Map a raw pattern string to one of the standardized pattern options
   */
  private static mapPatternToStandardOption(rawPattern: string): string | null {
    console.log('[FormAutoPopulation] Mapping pattern:', rawPattern);
    const patternOptions = getPatternOptions();
    const lowerRawPattern = rawPattern.toLowerCase();
    
    // Try exact match first (case insensitive)
    const exactMatch = patternOptions.find(option => option.toLowerCase() === lowerRawPattern);
    if (exactMatch) {
      console.log('[FormAutoPopulation] Found exact pattern match:', exactMatch);
      return exactMatch;
    }
    
    // Try semantic matching for common pattern terms
    const patternMappings: Record<string, string> = {
      // Animal patterns
      'animal': 'Animalistic',
      'leopard': 'Animalistic',
      'zebra': 'Animalistic',
      'snake': 'Animalistic',
      'crocodile': 'Animalistic',
      'tiger': 'Animalistic',
      'giraffe': 'Animalistic',
      
      // Checked patterns
      'check': 'Checked',
      'plaid': 'Checked',
      'tartan': 'Checked',
      'gingham': 'Checked',
      'houndstooth': 'Checked',
      
      // Dots
      'dot': 'Polka Dot',
      'polka': 'Polka Dot',
      'spot': 'Polka Dot',
      
      // Floral
      'floral': 'Floral',
      'flower': 'Floral',
      'botanical': 'Floral',
      
      // Stripes
      'stripe': 'Stripe',
      'lined': 'Stripe',
      'pinstripe': 'Stripe',
      
      // Geometric
      'geometric': 'Geometric & Abstract',
      'abstract': 'Geometric & Abstract',
      'diamond': 'Geometric & Abstract',
      'triangle': 'Geometric & Abstract',
      
      // Camouflage
      'camo': 'Camouflage',
      'camouflage': 'Camouflage',
      'military': 'Camouflage',
      
      // Chevron
      'chevron': 'Chevron',
      'zigzag': 'Chevron',
      'herringbone': 'Chevron'
    };
    
    // Check for specific pattern keywords in mapping
    for (const [keyword, mappedPattern] of Object.entries(patternMappings)) {
      if (lowerRawPattern.includes(keyword)) {
        console.log(`[FormAutoPopulation] Mapped pattern ${rawPattern} to ${mappedPattern} via keyword ${keyword}`);
        return mappedPattern;
      }
    }
    
    // Try partial match with dropdown options
    for (const option of patternOptions) {
      if (lowerRawPattern.includes(option.toLowerCase()) || option.toLowerCase().includes(lowerRawPattern)) {
        console.log('[FormAutoPopulation] Found partial pattern match:', option);
        return option;
      }
    }
    
    // If no standard option matches, use 'Other' if it's clearly a pattern
    if (lowerRawPattern.includes('pattern') || lowerRawPattern.includes('print') || lowerRawPattern.includes('design')) {
      console.log('[FormAutoPopulation] No specific match found, using Other pattern category');
      return 'Other';
    }
    
    return null;
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
    if ((category === ItemCategory.BOTTOM && subcategory?.toLowerCase() === 'skirt') ||
        (category === ItemCategory.ONE_PIECE && subcategory?.toLowerCase() === 'dress' && tags.Skirt)) {
      console.log('[DEBUG] Detected skirt subcategory or dress with skirt tag, checking for silhouette mapping');
      // For skirts, use subcategory; for dresses, use the actual skirt tag value
      const skirtValue = category === ItemCategory.BOTTOM ? subcategory : tags.Skirt;
      rawSilhouette = this.mapSkirtSubcategoryToSilhouette(skirtValue || 'skirt', tags);
      if (rawSilhouette) {
        console.log('[DEBUG] Mapped skirt/dress silhouette:', rawSilhouette);
      }
    }

    // Special handling for outerwear subcategories - detect from subcategory tags
    if (!rawSilhouette && category === ItemCategory.OUTERWEAR && subcategory) {
      console.log('[DEBUG] Checking outerwear silhouette detection:', {
        category,
        subcategory,
        availableTags: Object.keys(tags),
        subcategoryTag: tags.Subcategory
      });
      
      const subcategoryLower = subcategory.toLowerCase();
      if (subcategoryLower === 'jacket') {
        console.log('[DEBUG] Detected jacket subcategory, using subcategory tag for mapping:', tags.Subcategory);
        rawSilhouette = this.mapJacketSubcategoryToSilhouette(tags.Subcategory || '', tags);
        if (rawSilhouette) {
          console.log('[DEBUG] Mapped jacket silhouette:', rawSilhouette);
        }
      } else if (subcategoryLower === 'coat') {
        console.log('[DEBUG] Detected coat subcategory, using subcategory tag for mapping:', tags.Subcategory);
        rawSilhouette = this.mapCoatSubcategoryToSilhouette(tags.Subcategory || '', tags);
        if (rawSilhouette) {
          console.log('[DEBUG] Mapped coat silhouette:', rawSilhouette);
        }
      }
    }

    // If no skirt-specific mapping, try direct silhouette tag
    if (!rawSilhouette && tags.Silhouette) {
      rawSilhouette = tags.Silhouette;
      console.log('[DEBUG] Found direct Silhouette tag:', rawSilhouette);
    } 
    // Special handling for Fit tag (commonly used for tops silhouette)
    if (!rawSilhouette && tags.Fit && category === ItemCategory.TOP) {
      console.log('[DEBUG] Using Fit tag for TOP category:', tags.Fit);
      rawSilhouette = this.mapFitToSilhouette(tags.Fit);
      console.log('[DEBUG] Mapped Fit to silhouette:', rawSilhouette);
    }
    // Look for silhouette hints in other tags only if no result yet
    if (!rawSilhouette) {
      console.log('[DEBUG] Searching for silhouette in other tags...');
      const silhouetteKeywords = ['silhouette', 'fit', 'shape'];
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
   * Extract length from detected tags for BOTTOM, ONE_PIECE, and OUTERWEAR category items
   */
  private static async extractLength(tags: DetectedTags, category?: ItemCategory, subcategory?: string): Promise<string | null> {
    // Length field applies to BOTTOM category with specific subcategories, ONE_PIECE dresses, and OUTERWEAR items
    if (!category || !subcategory) {
      return null;
    }

    console.log('[DEBUG] extractLength called with:', { tags, category, subcategory });

    const subcategoryLower = subcategory.toLowerCase();
    const isValidBottom = category === ItemCategory.BOTTOM && ['jeans', 'trousers', 'shorts', 'skirt'].includes(subcategoryLower);
    const isValidOnePiece = category === ItemCategory.ONE_PIECE && subcategoryLower === 'dress';
    const isValidOuterwear = category === ItemCategory.OUTERWEAR && ['coat', 'jacket', 'parka', 'trench coat', 'windbreaker'].includes(subcategoryLower);
    
    console.log('[DEBUG] Length validation check:', {
      isValidBottom,
      isValidOnePiece, 
      isValidOuterwear,
      categoryValue: category,
      subcategoryLower
    });
    
    if (!isValidBottom && !isValidOnePiece && !isValidOuterwear) {
      console.log('[DEBUG] Category/subcategory not valid for length extraction');
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
        // Outerwear-specific mappings
        (lowerOption === 'long' && (lowerRaw.includes('full') || lowerRaw.includes('ankle') || lowerRaw.includes('regular') || lowerRaw.includes('longline'))) ||
        (lowerOption === 'short' && (lowerRaw.includes('cropped') || lowerRaw.includes('capri') || lowerRaw.includes('crop'))) ||
        (lowerOption === 'middle' && (lowerRaw.includes('mid') || lowerRaw.includes('medium') || lowerRaw.includes('regular'))) ||
        // Bottom/dress-specific mappings
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
  private static extractSleeves(tags: DetectedTags, category?: ItemCategory, subcategory?: string): string | null {
    // TOP category and ONE_PIECE dresses support sleeves
    const isValidTop = category === ItemCategory.TOP;
    const isValidDress = category === ItemCategory.ONE_PIECE && subcategory?.toLowerCase() === 'dress';
    
    if (!isValidTop && !isValidDress) {
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
  private static extractStyle(tags: DetectedTags, category?: ItemCategory, subcategory?: string): string | null {
    // Style field applies to all categories except ACCESSORY and OTHER
    if (category === ItemCategory.ACCESSORY || category === ItemCategory.OTHER) {
      return null;
    }

    let rawStyle: string | null = null;

    console.log('[DEBUG] extractStyle called with category:', category, 'subcategory:', subcategory, 'tags:', Object.keys(tags));

    // Get valid style options for validation
    const validOptions = getStyleOptions();
    console.log('[DEBUG] extractStyle - Valid style options:', validOptions);

    // PRIORITY 1: Check hierarchical Category tag for footwear like "Footwear/Ladies High Boots"
    if (category === ItemCategory.FOOTWEAR && tags.Category) {
      const categoryPath = tags.Category;
      const pathParts = categoryPath.split('/');
      
      // If there are multiple parts and first part is "Footwear", second part is the style
      if (pathParts.length >= 2 && pathParts[0].toLowerCase() === 'footwear') {
        const footwearStyle = pathParts[1]; // "Ladies High Boots" from "Footwear/Ladies High Boots"
        console.log('[DEBUG] extractStyle - Found Footwear Category path style:', footwearStyle);
        
        // Check if this footwear style matches any valid option
        const lowerFootwearStyle = footwearStyle.toLowerCase();
        const exactMatch = validOptions.find(option => option.toLowerCase() === lowerFootwearStyle);
        if (exactMatch) {
          console.log('[DEBUG] extractStyle - Footwear style matches valid option:', exactMatch);
          return exactMatch;
        }
        
        // Try semantic matching for the footwear style
        for (const option of validOptions) {
          const lowerOption = option.toLowerCase();
          if (lowerFootwearStyle.includes(lowerOption) || lowerOption.includes(lowerFootwearStyle)) {
            console.log('[DEBUG] extractStyle - Footwear style semantic match:', option);
            return option;
          }
        }
        
        console.log('[DEBUG] extractStyle - Footwear style did not match valid options, trying fallback');
      }
    }

    // PRIORITY 2: Direct Style tag (fallback for footwear or primary for other categories)
    if (tags.Style) {
      rawStyle = tags.Style;
      console.log('[DEBUG] extractStyle - Using direct Style tag:', rawStyle);
    } 
    
    // PRIORITY 3: Look for style hints in other tags
    if (!rawStyle) {
      const styleKeywords = ['style', 'occasion', 'wear', 'look'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && styleKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawStyle = value;
          console.log('[DEBUG] extractStyle - Using style keyword hint from', key, ':', rawStyle);
          break;
        }
      }
    }

    // If no raw style found, return null
    if (!rawStyle) {
      console.log('[DEBUG] extractStyle - No raw style found');
      return null;
    }

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
    const brand = tags.Brand;
    let name = tags.Name || '';
    
    if (brand && name) {
      name = this.capitalize(name) + ' ' + this.capitalize(brand);
    } else if (name) {
      name = this.capitalize(name);
    } else if (brand) {
      name = this.capitalize(brand);
    } else {
      return null;
    }

    return name;
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
   * Map jacket subcategory and tags to silhouette
   */
  private static mapJacketSubcategoryToSilhouette(jacketTag: string, tags: DetectedTags): string | null {
    console.log(`[DEBUG] Jacket tag: "${jacketTag}"`);
    // Define jacket silhouette keywords that might appear in tags
    const jacketSilhouetteKeywords: { [key: string]: string } = {
      'baseball': 'Baseball',
      'baseball jacket': 'Baseball',
      'biker': 'Biker',
      'biker jacket': 'Biker',
      'bomber': 'Bomber',
      'bomber jacket': 'Bomber',
      'puffer': 'Puffer',
      'puffer jacket': 'Puffer',
      'puffer jackets': 'Puffer',
      'casual': 'Casual',
      'casual jacket': 'Casual',
      'casual jackets': 'Casual',
      'harrington': 'Harrington',
      'harrington jacket': 'Harrington',
      'knitted poncho': 'Knitted Poncho',
      'knitted ponchos': 'Knitted Poncho',
      'pilot': 'Pilot',
      'pilot jacket': 'Pilot',
      'racer': 'Racer',
      'racer jacket': 'Racer',
      'poncho': 'Poncho',
      'ponchos': 'Poncho',
      'winter': 'Winter',
      'winter jacket': 'Winter',
      'winter jackets': 'Winter'
    };

    // First check if the jacketTag itself contains a keyword
    if (jacketTag && jacketTag.trim()) {
      const lowerJacketTag = jacketTag.toLowerCase();
      for (const [keyword, silhouette] of Object.entries(jacketSilhouetteKeywords)) {
        if (lowerJacketTag.includes(keyword)) {
          console.log(`[DEBUG] Found jacket silhouette "${silhouette}" from direct jacket tag: ${jacketTag}`);
          return silhouette;
        }
      }
    }

    // Then check all tag values for jacket silhouette keywords
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const [keyword, silhouette] of Object.entries(jacketSilhouetteKeywords)) {
          if (lowerValue.includes(keyword)) {
            console.log(`[DEBUG] Found jacket silhouette "${silhouette}" from tag ${key}: ${value}`);
            return silhouette;
          }
        }
      }
    }

    console.log(`[DEBUG] No jacket silhouette mapping found for jacketTag: "${jacketTag}"`);
    return null;
  }

  /**
   * Map coat subcategory and tags to silhouette
   */
  private static mapCoatSubcategoryToSilhouette(coatTag: string, tags: DetectedTags): string | null {
    console.log(`[DEBUG] Coat tag: "${coatTag}"`);
    // Define coat silhouette keywords that might appear in tags
    const coatSilhouetteKeywords: { [key: string]: string } = {
      'duffle': 'Duffle',
      'duffle coat': 'Duffle',
      'kimono': 'Kimono',
      'kimono coat': 'Kimono',
      'peacoat': 'Peacoat',
      'pea coat': 'Peacoat',
      'raincoat': 'Raincoat',
      'rain coat': 'Raincoat',
      'raincoats and ponchos': 'Raincoat',
      'winter': 'Winter',
      'winter coat': 'Winter',
      'winter coats': 'Winter',
      'wool': 'Wool',
      'wool coat': 'Wool',
      'wool coats': 'Wool'
    };

    // First check if the coatTag itself contains a keyword
    if (coatTag && coatTag.trim()) {
      const lowerCoatTag = coatTag.toLowerCase();
      for (const [keyword, silhouette] of Object.entries(coatSilhouetteKeywords)) {
        if (lowerCoatTag.includes(keyword)) {
          console.log(`[DEBUG] Found coat silhouette "${silhouette}" from direct coat tag: ${coatTag}`);
          return silhouette;
        }
      }
    }

    // Then check all tag values for coat silhouette keywords
    for (const [key, value] of Object.entries(tags)) {
      if (typeof value === 'string') {
        const lowerValue = value.toLowerCase();
        for (const [keyword, silhouette] of Object.entries(coatSilhouetteKeywords)) {
          if (lowerValue.includes(keyword)) {
            console.log(`[DEBUG] Found coat silhouette "${silhouette}" from tag ${key}: ${value}`);
            return silhouette;
          }
        }
      }
    }

    console.log(`[DEBUG] No coat silhouette mapping found for coatTag: "${coatTag}"`);
    return null;
  }

  /**
   * Extract neckline from detected tags, validating against valid neckline options
   */
  private static extractNeckline(tags: DetectedTags, subcategory?: string): string | null {
    // Only certain subcategories support neckline
    if (!subcategory || !['dress', 't-shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'blazer'].includes(subcategory.toLowerCase())) {
      return null;
    }

    let rawNeckline: string | null = null;

    // First try direct Neckline tag
    if (tags.Neckline) {
      rawNeckline = tags.Neckline;
    } else {
      // Look for neckline hints in other tags
      const necklineKeywords = ['neckline', 'neck', 'collar'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && necklineKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawNeckline = value;
          break;
        }
      }
    }

    // If no raw neckline found, return null
    if (!rawNeckline) {
      return null;
    }

    // Get valid neckline options
    const validOptions = getNecklineOptions();

    // Check if raw neckline matches any valid option (case-insensitive)
    const lowerRaw = rawNeckline.toLowerCase();
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

    // Try semantic matching for common neckline terms
    const semanticMappings: { [key: string]: string } = {
      'v-neck': 'v-neck',
      'vneck': 'v-neck',
      'v neck': 'v-neck',
      'scoop': 'round',
      'round neck': 'round',
      'crew neck': 'crew',
      'turtleneck': 'turtleneck',
      'turtle neck': 'turtleneck',
      'boat neck': 'boatneck',
      'boatneck': 'boatneck',
      'off shoulder': 'off shoulder',
      'off-shoulder': 'off shoulder',
      'one shoulder': 'one shoulder',
      'halter': 'halter',
      'cowl': 'cowl',
      'square': 'square',
      'heart': 'heart',
      'keyhole': 'keyhole',
      'wrap': 'wrap'
    };

    for (const [keyword, neckline] of Object.entries(semanticMappings)) {
      if (lowerRaw.includes(keyword)) {
        return neckline;
      }
    }

    return null;
  }

  /**
   * Extract heel height from detected tags, validating against footwear categories
   */
  private static extractHeelHeight(tags: DetectedTags, category?: ItemCategory): string | null {
    let rawHeelHeight: string | null = null;

    console.log('[DEBUG] extractHeelHeight called with:', { tags, category });

    // Only apply to footwear category
    if (category !== ItemCategory.FOOTWEAR) {
      console.log('[DEBUG] Not footwear category, skipping heel height extraction');
      return null;
    }

    // Check for direct "Heel height" tag (case insensitive)
    const heelHeightKeys = ['Heel height', 'heel height', 'HeelHeight', 'heelHeight', 'Heel Height'];
    for (const key of heelHeightKeys) {
      if (tags[key]) {
        rawHeelHeight = tags[key];
        console.log('[DEBUG] Found heel height tag:', key, '=', rawHeelHeight);
        break;
      }
    }

    // Look for heel height hints in other tags
    if (!rawHeelHeight) {
      const heelKeywords = ['heel', 'height'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && 
            heelKeywords.every(keyword => key.toLowerCase().includes(keyword))) {
          rawHeelHeight = value;
          console.log('[DEBUG] Found heel height hint in', key, ':', value);
          break;
        }
      }
    }

    // If no raw heel height found, return null
    if (!rawHeelHeight) {
      console.log('[DEBUG] No heel height found in tags');
      return null;
    }

    // Get valid heel height options from form helpers
    const validOptions = getHeelHeightOptions(); // ['High', 'Middle', 'Low', 'Ho-heels']
    console.log('[DEBUG] Valid heel height options:', validOptions);

    // Check if raw heel height matches any valid option (case-insensitive)
    const lowerRaw = rawHeelHeight.toLowerCase();
    const exactMatch = validOptions.find(option => option.toLowerCase() === lowerRaw);
    if (exactMatch) {
      console.log('[DEBUG] Found exact heel height match:', exactMatch);
      return exactMatch;
    }

    // Try semantic matching for common heel height terms
    const semanticMappings: { [key: string]: string } = {
      'high': 'High',
      'tall': 'High',
      'stiletto': 'High',
      'platform': 'High',
      'middle': 'Middle',
      'mid': 'Middle',
      'medium': 'Middle',
      'moderate': 'Middle',
      'low': 'Low',
      'short': 'Low',
      'small': 'Low',
      'flat': 'Low',
      'no heel': 'Ho-heels',
      'no-heel': 'Ho-heels',
      'no heels': 'Ho-heels',
      'ho-heels': 'Ho-heels',
      'heelless': 'Ho-heels'
    };

    for (const [keyword, heelHeight] of Object.entries(semanticMappings)) {
      if (lowerRaw.includes(keyword)) {
        console.log('[DEBUG] Found semantic heel height match:', keyword, '->', heelHeight);
        return heelHeight;
      }
    }

    console.log('[DEBUG] No valid heel height match found for:', rawHeelHeight);
    return null;
  }

  /**
   * Extract boot height from detected tags, validating against footwear categories
   */
  private static extractBootHeight(tags: DetectedTags, category?: ItemCategory): string | null {
    let rawBootHeight: string | null = null;

    console.log('[DEBUG] extractBootHeight called with:', { tags, category });

    // Only apply to footwear category
    if (category !== ItemCategory.FOOTWEAR) {
      console.log('[DEBUG] Not footwear category, skipping boot height extraction');
      return null;
    }

    // Check for direct "Height" tag (case insensitive)
    const heightKeys = ['Height', 'height', 'Boot height', 'boot height', 'BootHeight', 'bootHeight'];
    for (const key of heightKeys) {
      if (tags[key]) {
        rawBootHeight = tags[key];
        console.log('[DEBUG] Found boot height tag:', key, '=', rawBootHeight);
        break;
      }
    }

    // Look for height hints in other tags
    if (!rawBootHeight) {
      const heightKeywords = ['height'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && 
            heightKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          rawBootHeight = value;
          console.log('[DEBUG] Found boot height hint in', key, ':', value);
          break;
        }
      }
    }

    // If no raw boot height found, return null
    if (!rawBootHeight) {
      console.log('[DEBUG] No boot height found in tags');
      return null;
    }

    // Get valid boot height options from form helpers
    const validOptions = getBootHeightOptions(); // ['Ankle', 'Mid-Calf', 'Knee-High', 'Thigh-High']
    console.log('[DEBUG] Valid boot height options:', validOptions);

    // Check if raw boot height matches any valid option (case-insensitive)
    const lowerRaw = rawBootHeight.toLowerCase();
    const exactMatch = validOptions.find(option => option.toLowerCase() === lowerRaw);
    if (exactMatch) {
      console.log('[DEBUG] Found exact boot height match:', exactMatch);
      return exactMatch;
    }

    // Try semantic matching for common boot height terms
    const semanticMappings: { [key: string]: string } = {
      'ankle': 'Ankle',
      'ankle boot': 'Ankle',
      'ankle boots': 'Ankle',
      'low': 'Ankle',
      'short': 'Ankle',
      'mid': 'Mid-Calf',
      'mid calf': 'Mid-Calf',
      'mid-calf': 'Mid-Calf',
      'midcalf': 'Mid-Calf',
      'mid calves': 'Mid-Calf',
      'calf': 'Mid-Calf',
      'high': 'Knee-High',
      'knee': 'Knee-High',
      'knee high': 'Knee-High',
      'knee-high': 'Knee-High',
      'kneehigh': 'Knee-High',
      'tall': 'Knee-High',
      'riding': 'Knee-High',
      'thigh': 'Thigh-High',
      'thigh high': 'Thigh-High',
      'thigh-high': 'Thigh-High',
      'thighhigh': 'Thigh-High',
      'over knee': 'Thigh-High',
      'over the knee': 'Thigh-High',
      'otk': 'Thigh-High'
    };

    for (const [keyword, bootHeight] of Object.entries(semanticMappings)) {
      if (lowerRaw.includes(keyword)) {
        console.log('[DEBUG] Found semantic boot height match:', keyword, '->', bootHeight);
        return bootHeight;
      }
    }

    console.log('[DEBUG] No valid boot height match found for:', rawBootHeight);
    return null;
  }

  /**
   * Extract type from detected tags using category path parsing logic
   */
  private static extractType(tags: DetectedTags, category?: ItemCategory, subcategory?: string): string | null {
    console.log('[DEBUG] extractType called with:', { tags, category, subcategory });
    
    // Type field only applies to specific subcategories
    const validSubcategories = ['boots', 'formal shoes', 'bag', 'jewelry'];
    if (!category || !subcategory || !validSubcategories.includes(subcategory.toLowerCase())) {
      console.log('[DEBUG] Type field not applicable for category/subcategory:', category, subcategory);
      return null;
    }

    let extractedType: string | null = null;

    // PRIORITY 1: Check hierarchical Category tag like "Footwear/Ladies High Boots" or "Accessories/Leather Tote"
    if (tags.Category) {
      console.log('[DEBUG] extractType - Found Category tag:', tags.Category);
      const categoryPath = tags.Category;
      const pathParts = categoryPath.split('/');
      console.log('[DEBUG] extractType - Category path parts:', pathParts);
      
      // If there are multiple parts, second part is the type
      if (pathParts.length >= 2) {
        const firstPart = pathParts[0];
        const secondPart = pathParts[1]; // "Ladies High Boots" from "Footwear/Ladies High Boots"
        console.log('[DEBUG] extractType - Found Category path second part:', secondPart);
        
        // Special handling for Jewellery/* paths - use the word after / but still apply jewelry type mapping
        if (firstPart.toLowerCase() === 'jewellery') {
          console.log('[DEBUG] extractType - Jewellery path detected, applying jewelry type mapping to:', secondPart);
          const mappedType = this.extractTypeKeywordsFromText(secondPart, 'jewelry');
          extractedType = mappedType || secondPart;
        } else {
          // Extract meaningful type keywords from the second part for other categories
          console.log('[DEBUG] extractType - About to call extractTypeKeywordsFromText with:', secondPart, subcategory);
          const typeKeywords = this.extractTypeKeywordsFromText(secondPart, subcategory);
          console.log('[DEBUG] extractType - Result from extractTypeKeywordsFromText:', typeKeywords);
          if (typeKeywords) {
            console.log('[DEBUG] extractType - Extracted type from category path:', typeKeywords);
            extractedType = typeKeywords;
          }
        }
      } else {
        console.log('[DEBUG] extractType - Category path has only one part, skipping');
      }
    } else {
      console.log('[DEBUG] extractType - No Category tag found in tags');
    }

    // PRIORITY 2: Direct Type or Style tag (fallback)
    if (!extractedType && tags.Type) {
      extractedType = tags.Type;
      console.log('[DEBUG] extractType - Using direct Type tag:', extractedType);
    } else if (!extractedType && tags.Style) {
      extractedType = tags.Style;
      console.log('[DEBUG] extractType - Using Style tag as type fallback:', extractedType);
    }
    
    // PRIORITY 3: Look for type hints in other tags
    if (!extractedType) {
      const typeKeywords = ['type', 'subtype', 'kind', 'variant'];
      for (const [key, value] of Object.entries(tags)) {
        if (typeof value === 'string' && typeKeywords.some(keyword => key.toLowerCase().includes(keyword))) {
          extractedType = value;
          console.log('[DEBUG] extractType - Using type keyword hint from', key, ':', extractedType);
          break;
        }
      }
    }

    // PRIORITY 4: Extract from item name
    if (!extractedType && tags.Name) {
      const typeFromName = this.extractTypeKeywordsFromText(tags.Name, subcategory);
      if (typeFromName) {
        extractedType = typeFromName;
        console.log('[DEBUG] extractType - Extracted type from name:', typeFromName);
      }
    }

    // If no type found, return null
    if (!extractedType) {
      console.log('[DEBUG] extractType - No type found in tags');
      return null;
    }

    // Clean and format the extracted type
    const cleanedType = this.formatTypeForSubcategory(extractedType, subcategory);
    console.log('[DEBUG] extractType - Final cleaned type:', cleanedType);
    
    return cleanedType;
  }

  /**
   * Extract type keywords from text based on subcategory
   */
  private static extractTypeKeywordsFromText(text: string, subcategory: string): string | null {
    const lowerText = text.toLowerCase();
    const lowerSubcat = subcategory.toLowerCase();

    console.log('[DEBUG] extractTypeKeywordsFromText called with:', { text, subcategory });
    
    // Define type mappings for each subcategory
    const typeKeywordMappings: { [subcategory: string]: { [keyword: string]: string } } = {
      'boots': {
        'ankle': 'Ankle',
        'chelsea': 'Chelsea', 
        'combat': 'Combat',
        'riding': 'Riding',
        'cowboy': 'Cowboy',
        'work': 'Work',
        'desert': 'Desert',
        'hiking': 'Hiking',
        'snow': 'Snow',
        'rain': 'Rain',
        'wellington': 'Wellington',
        'high': 'High Boots'
      },
      'formal shoes': {
        'oxford': 'Oxford',
        'derby': 'Derby', 
        'loafer': 'Loafer',
        'monk': 'Monk Strap',
        'pump': 'Pump',
        'brogue': 'Brogue'
      },
      'bag': {
        'tote': 'Tote',
        'clutch': 'Clutch',
        'crossbody': 'Crossbody',
        'backpack': 'Backpack',
        'shoulder': 'Shoulder',
        'messenger': 'Messenger',
        'satchel': 'Satchel',
        'hobo': 'Hobo',
        'bucket': 'Bucket',
        'baguette': 'Baguette'
      },
      'jewelry': {
        'ring': 'Ring',
        'necklace': 'Necklace',
        'necklaces, pendants and chains': 'Necklace',
        'bracelet': 'Bracelet',
        'earring': 'Earrings',
        'earrings and earcuffs': 'Earrings',
        'watch': 'Watch',
        'brooch': 'Brooch',
        'brooches, badges and pins': 'Brooch',
        'pendant': 'Pendant',
        'chain': 'Chain'
      }
    };

    const mappings = typeKeywordMappings[lowerSubcat];
    if (!mappings) return null;

    // Look for keyword matches in the text
    for (const [keyword, mappedType] of Object.entries(mappings)) {
      if (lowerText.includes(keyword)) {
        return mappedType;
      }
    }

    return null;
  }

  /**
   * Format and clean the type string for a specific subcategory
   */
  private static formatTypeForSubcategory(rawType: string, subcategory: string): string {
    // Clean the raw type
    let cleaned = rawType.trim();
    
    // Remove common prefixes
    cleaned = cleaned.replace(/^(ladies|mens|women|men|womens|mens)\s+/i, '');
    
    // For boots subcategory, keep "Boots" suffix for clarity (e.g., "High Boots", "Chelsea Boots")
    // For other subcategories, remove redundant suffixes
    if (subcategory.toLowerCase() !== 'boots') {
      cleaned = cleaned.replace(/\s+(boot|boots|shoe|shoes|bag|bags)$/i, '');
    }
    
    // Format to match dropdown options exactly
    if (subcategory.toLowerCase() === 'boots') {
      // Boots dropdown uses lowercase format (e.g., "high boots", "chelsea", "desert")
      return cleaned.toLowerCase();
    } else if (subcategory.toLowerCase() === 'formal shoes') {
      // Formal shoes dropdown uses lowercase format (e.g., "oxford", "derby")
      return cleaned.toLowerCase();
    } else {
      // For bags and jewelry, capitalize properly
      return cleaned.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
  }

  /**
   * Helper to capitalize first letter
   */
  private static capitalize(str: string): string {
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
