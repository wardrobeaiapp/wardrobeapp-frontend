import { ItemCategory } from '../../types';
import { WardrobeItem } from '../../types/wardrobe';
import { stylingRules } from './wardrobeContextRules';

// Constants for commonly used category combinations
const ONE_PIECE_DRESS_JUMPSUIT = ['dress', 'jumpsuit'];
const ONE_PIECE_DRESS_ONLY = ['dress'];
const ONE_PIECE_SKIRT = ['skirt'];
const TOP_FORMAL_ITEMS = ['shirt', 'blouse', 'cardigan', 'blazer', 'sweater'];

// Accessory styling context configuration
const ACCESSORY_STYLING_CONFIG: Record<string, AccessoryConfig> = {
  hat: {
    categories: [ItemCategory.BOTTOM, ItemCategory.OUTERWEAR]
  },
  scarf: {
    categories: [ItemCategory.OUTERWEAR, ItemCategory.TOP],
    onePiece: ONE_PIECE_DRESS_JUMPSUIT
  },
  belt: {
    categories: [ItemCategory.OUTERWEAR, ItemCategory.BOTTOM],
    onePiece: ONE_PIECE_DRESS_JUMPSUIT,
    tops: TOP_FORMAL_ITEMS
  },
  bag: {
    categories: [ItemCategory.OUTERWEAR]
  },
  jewelry: {
    categories: [ItemCategory.TOP],
    onePiece: ONE_PIECE_DRESS_JUMPSUIT
  },
  watch: {
    categories: [ItemCategory.TOP],
    onePiece: ONE_PIECE_DRESS_JUMPSUIT
  },
  socks: {
    categories: [ItemCategory.FOOTWEAR, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE]
  },
  tights: {
    categories: [ItemCategory.FOOTWEAR],
    onePiece: ONE_PIECE_DRESS_ONLY,
    bottoms: ONE_PIECE_SKIRT
  },
  sunglasses: {
    noContext: true
  }
};

type AccessoryConfig = {
  categories?: ItemCategory[];
  onePiece?: string[];
  tops?: string[];
  bottoms?: string[];
  noContext?: boolean;
};

// Helper functions for common matching patterns
const checkSeasonMatch = (item: WardrobeItem, seasons?: string[]): boolean => {
  return seasons?.some(season => item.season?.includes(season as any)) ?? true;
};

const checkCategoryMatch = (item: WardrobeItem, categories: ItemCategory[]): boolean => {
  return categories.includes(item.category as ItemCategory);
};

const checkSubcategoryMatch = (item: WardrobeItem, subcategories: string[]): boolean => {
  return subcategories.includes(item.subcategory?.toLowerCase() || '');
};

const checkRuleBasedMatches = (item: WardrobeItem, rules: any, mainCategories: ItemCategory[]) => {
  const matchesMainCategories = checkCategoryMatch(item, mainCategories);
  
  const matchesTops = rules.tops && 
    (item.category as string) === ItemCategory.TOP && 
    checkSubcategoryMatch(item, rules.tops);
  
  const matchesAccessories = rules.accessories && 
    (item.category as string) === ItemCategory.ACCESSORY && 
    checkSubcategoryMatch(item, rules.accessories);
  
  return { matchesMainCategories, matchesTops, matchesAccessories };
};

const handleAccessoryCategory = (item: WardrobeItem, subcategory: string, formData: any): boolean => {
  const config = ACCESSORY_STYLING_CONFIG[subcategory.toLowerCase()];
  if (!config) return false;
  
  if (config.noContext) {
    console.log(`[wardrobeContextHelpers] Debug - ${subcategory}: no styling context needed`);
    return false;
  }
  
  console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
  
  const matchesCategories = config.categories ? checkCategoryMatch(item, config.categories) : false;
  
  const matchesOnePiece = config.onePiece ? 
    (item.category as string) === ItemCategory.ONE_PIECE && 
    checkSubcategoryMatch(item, config.onePiece) : false;
  
  const matchesTops = config.tops ? 
    (item.category as string) === ItemCategory.TOP && 
    checkSubcategoryMatch(item, config.tops) : false;
  
  const matchesBottoms = config.bottoms ? 
    (item.category as string) === ItemCategory.ONE_PIECE && 
    checkSubcategoryMatch(item, config.bottoms) : false;
  
  const matchesSeason = checkSeasonMatch(item, formData.seasons);
  
  console.log(`[wardrobeContextHelpers] Debug - matchesCategories: ${matchesCategories}, matchesOnePiece: ${matchesOnePiece}, matchesTops: ${matchesTops}, matchesBottoms: ${matchesBottoms}, matchesSeason: ${matchesSeason}`);
  
  return (matchesCategories || matchesOnePiece || matchesTops || matchesBottoms) && matchesSeason;
};

/**
 * Filters wardrobe items to find styling context based on form data
 */
export const filterStylingContext = (
  wardrobeItems: WardrobeItem[], 
  formData: { category?: string; subcategory?: string; seasons?: string[] }
): WardrobeItem[] => {
  console.log(`[wardrobeContextHelpers] FILTERING STYLING CONTEXT for item: category=${formData.category}, subcategory=${formData.subcategory}, seasons=${formData.seasons?.join(',')}`);
  console.log(`[wardrobeContextHelpers] Total wardrobe items to filter: ${wardrobeItems.length}`);
  
  const filtered = wardrobeItems.filter(item => {
    // Exclude wishlist items from styling context
    if (item.wishlist === true) {
      return false;
    }
    
    const matchesSeason = checkSeasonMatch(item, formData.seasons);
    
    // Handle ACCESSORY category with configuration
    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory) {
      return handleAccessoryCategory(item, formData.subcategory, formData);
    }

    // Handle OTHER category - no styling context needed
    if (formData.category === ItemCategory.OTHER) {
      console.log(`[wardrobeContextHelpers] Debug - OTHER category: no styling context needed`);
      return false;
    }
    
    // Handle rule-based categories (TOP, BOTTOM, ONE_PIECE, OUTERWEAR, FOOTWEAR)
    if (formData.subcategory) {
      const subcategoryKey = formData.subcategory.toLowerCase();
      const rules = stylingRules[subcategoryKey];
      
      if (rules) {
        console.log(`[wardrobeContextHelpers] Debug - Found styling rules for '${subcategoryKey}':`, rules);
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // Define main categories based on form category
        const mainCategories = getMainCategoriesForRuleBased(formData.category as ItemCategory);
        console.log(`[wardrobeContextHelpers] Debug - Main categories for ${formData.category}:`, mainCategories);
        const { matchesMainCategories, matchesTops, matchesAccessories } = checkRuleBasedMatches(item, rules, mainCategories);
        
        // Special case for OUTERWEAR - include specific ONE_PIECE items
        const matchesOnePiece = formData.category === ItemCategory.OUTERWEAR ? 
          (item.category as string) === ItemCategory.ONE_PIECE && 
          checkSubcategoryMatch(item, ONE_PIECE_DRESS_JUMPSUIT) : false;
        
        // Special case for FOOTWEAR - hardcoded socks check
        const matchesFootwearAccessories = formData.category === ItemCategory.FOOTWEAR ? 
          (item.category as string) === ItemCategory.ACCESSORY && 
          checkSubcategoryMatch(item, ['socks']) : false;
        
        console.log(`[wardrobeContextHelpers] Debug - matchesMainCategories: ${matchesMainCategories}, matchesTops: ${!!matchesTops}, matchesAccessories: ${!!matchesAccessories}, matchesOnePiece: ${matchesOnePiece}, matchesFootwearAccessories: ${matchesFootwearAccessories}, matchesSeason: ${matchesSeason}`);
        
        return (matchesMainCategories || matchesTops || matchesAccessories || matchesOnePiece || matchesFootwearAccessories) && matchesSeason;
      } else {
        console.log(`[wardrobeContextHelpers] Debug - NO styling rules found for subcategory '${subcategoryKey}'`);
        return false;
      }
    }
    
    return false; // No styling rules for this category/subcategory
  });
  
  console.log(`[wardrobeContextHelpers] STYLING CONTEXT FILTERED RESULTS: ${filtered.length} items selected`);
  filtered.forEach(item => {
    console.log(`[wardrobeContextHelpers] Selected item: ${item.name} - ${item.category} (${item.subcategory}) - COLOR: ${item.color}`);
  });
  
  return filtered;
};

const getMainCategoriesForRuleBased = (category: ItemCategory): ItemCategory[] => {
  switch (category) {
    case ItemCategory.TOP:
      return [ItemCategory.BOTTOM, ItemCategory.OUTERWEAR];
    case ItemCategory.BOTTOM:
      return [ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR];
    case ItemCategory.ONE_PIECE:
      return [ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR];
    case ItemCategory.OUTERWEAR:
      return [ItemCategory.FOOTWEAR, ItemCategory.BOTTOM];
    case ItemCategory.FOOTWEAR:
      return [ItemCategory.OUTERWEAR, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE];
    default:
      return [];
  }
};

/**
 * Filters wardrobe items to find gap analysis context (same category and subcategory items for duplicate detection)
 * For basic items, also tries to match color to avoid showing different colored items as duplicates
 */
export const filterSimilarContext = (
  wardrobeItems: WardrobeItem[], 
  formData: { category?: string; subcategory?: string; seasons?: string[]; color?: string }
): WardrobeItem[] => {
  console.log(`[wardrobeContextHelpers] FILTERING SIMILAR CONTEXT for category: ${formData.category}, subcategory: ${formData.subcategory}, color: ${formData.color}, seasons: ${formData.seasons?.join(',')}`);
  console.log(`[wardrobeContextHelpers] Input: ${wardrobeItems.length} wardrobe items to filter`);
  
  if (wardrobeItems.length === 0) {
    console.log(`[wardrobeContextHelpers] WARNING: No wardrobe items provided to filter!`);
    return [];
  }
  
  const filtered = wardrobeItems.filter(item => {
    // Exclude wishlist items from similar context (duplicate detection)
    if (item.wishlist === true) {
      return false;
    }
    
    const matchesCategory = item.category === formData.category;
    
    // Special handling for footwear - include all footwear subcategories for broader duplicate detection
    let matchesSubcategory;
    if (formData.category?.toLowerCase() === 'footwear') {
      matchesSubcategory = true; // Include all footwear types
      console.log(`[wardrobeContextHelpers] FOOTWEAR: Including all footwear subcategories for broader duplicate detection`);
    } else {
      // For non-footwear, use subcategory matching for precise duplicate detection
      matchesSubcategory = formData.subcategory ? 
        item.subcategory?.toLowerCase() === formData.subcategory.toLowerCase() : true;
    }
    
    const matchesSeason = formData.seasons?.some(season => 
      item.season?.includes(season as any)
    ) ?? true; // If no seasons specified, include all
    
    console.log(`[wardrobeContextHelpers] Item: ${item.name} - Category match: ${matchesCategory} (${item.category} vs ${formData.category}), Subcategory match: ${matchesSubcategory} (${item.subcategory} vs ${formData.subcategory}), Season match: ${matchesSeason}, Item seasons: [${item.season?.join(',') || 'NONE'}], Form seasons: [${formData.seasons?.join(',') || 'NONE'}], Color: ${item.color}`);
    
    const shouldInclude = matchesCategory && matchesSubcategory && matchesSeason;
    
    return shouldInclude;
  });

  // Sort items to prioritize same-color items first for better duplicate detection
  const sortedFiltered = filtered.sort((a, b) => {
    // If we have color information for the form data, prioritize matching colors
    if (formData.color) {
      const formColorLower = formData.color.toLowerCase();
      const aColorMatch = a.color?.toLowerCase() === formColorLower;
      const bColorMatch = b.color?.toLowerCase() === formColorLower;
      
      if (aColorMatch && !bColorMatch) return -1;
      if (!aColorMatch && bColorMatch) return 1;
    }
    
    // Secondary sort by whether item has color info (items with color info first)
    const aHasColor = !!a.color;
    const bHasColor = !!b.color;
    if (aHasColor && !bHasColor) return -1;
    if (!aHasColor && bHasColor) return 1;
    
    return 0;
  });
  
  console.log(`[wardrobeContextHelpers] SIMILAR CONTEXT FILTERED RESULTS: ${sortedFiltered.length} items selected`);
  sortedFiltered.forEach(item => {
    console.log(`[wardrobeContextHelpers] Similar item: ${item.name} - ${item.category} (${item.subcategory}) - COLOR: ${item.color}`);
  });
  
  return sortedFiltered;
};

/**
 * Filters wardrobe items for additional context based on category relationships
 */
export const filterAdditionalContext = (
  wardrobeItems: WardrobeItem[], 
  formData: { category?: string; seasons?: string[] }
): WardrobeItem[] => {
  return wardrobeItems.filter(item => {
    // Exclude wishlist items from additional context
    if (item.wishlist === true) {
      return false;
    }
    
    const matchesSeason = formData.seasons?.some(season => 
      item.season?.includes(season as any)
    ) ?? true; // If no seasons specified, include all

    // For TOP or BOTTOM categories, include ONE_PIECE items
    if (formData.category === ItemCategory.TOP || formData.category === ItemCategory.BOTTOM) {
      const matchesOnePiece = (item.category as string) === ItemCategory.ONE_PIECE;
      return matchesOnePiece && matchesSeason;
    }

    // For ONE_PIECE category, include TOP and BOTTOM items
    if (formData.category === ItemCategory.ONE_PIECE) {
      const matchesTopOrBottom = [ItemCategory.TOP, ItemCategory.BOTTOM].includes(item.category as ItemCategory);
      return matchesTopOrBottom && matchesSeason;
    }

    return false; // No additional context for other categories
  });
};
