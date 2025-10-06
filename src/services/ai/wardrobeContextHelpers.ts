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
 * Structured complementing items grouped by category
 */
export interface ComplementingItems {
  bottoms?: WardrobeItem[];
  footwear?: WardrobeItem[];
  accessories?: WardrobeItem[];
  tops?: WardrobeItem[];
  onePieces?: WardrobeItem[];
  outerwear?: WardrobeItem[]; // For cases where outerwear complements (rare, but possible)
}

/**
 * Filters wardrobe items to find styling context based on form data
 * Returns structured complementing items grouped by category, plus layering and outerwear arrays
 */
export const filterStylingContext = (
  wardrobeItems: WardrobeItem[], 
  formData: { category?: string; subcategory?: string; seasons?: string[] }
): { complementing: ComplementingItems, layering: WardrobeItem[], outerwear: WardrobeItem[] } => {
  console.log(`[wardrobeContextHelpers] FILTERING STYLING CONTEXT for item: category=${formData.category}, subcategory=${formData.subcategory}, seasons=${formData.seasons?.join(',')}`);
  console.log(`[wardrobeContextHelpers] Total wardrobe items to filter: ${wardrobeItems.length}`);
  
  // Initialize structured complementing items
  let complementingItems: ComplementingItems = {};
  let layeringItems: WardrobeItem[] = [];
  let outerwearItems: WardrobeItem[] = [];
  
  wardrobeItems.forEach(item => {
    // Exclude wishlist items from styling context
    if (item.wishlist === true) {
      return;
    }

    // Determine if item is complementing, layering, or outerwear
    const itemCategory = item.category as ItemCategory;
    const newItemCategory = formData.category as ItemCategory;
    
    if (isOuterwearCategory(newItemCategory, itemCategory)) {
      // Outerwear items that complete outfits (separate from layering)
      if (shouldIncludeInContext(item, formData)) {
        outerwearItems.push(item);
      }
    } else if (isComplementingCategory(newItemCategory, itemCategory)) {
      // Add original category/subcategory filtering logic for complementing items
      if (shouldIncludeInContext(item, formData)) {
        // Group by category
        switch (itemCategory) {
          case ItemCategory.BOTTOM:
            if (!complementingItems.bottoms) complementingItems.bottoms = [];
            complementingItems.bottoms.push(item);
            break;
          case ItemCategory.FOOTWEAR:
            if (!complementingItems.footwear) complementingItems.footwear = [];
            complementingItems.footwear.push(item);
            break;
          case ItemCategory.ACCESSORY:
            if (!complementingItems.accessories) complementingItems.accessories = [];
            complementingItems.accessories.push(item);
            break;
          case ItemCategory.TOP:
            if (!complementingItems.tops) complementingItems.tops = [];
            complementingItems.tops.push(item);
            break;
          case ItemCategory.ONE_PIECE:
            if (!complementingItems.onePieces) complementingItems.onePieces = [];
            complementingItems.onePieces.push(item);
            break;
          case ItemCategory.OUTERWEAR:
            if (!complementingItems.outerwear) complementingItems.outerwear = [];
            complementingItems.outerwear.push(item);
            break;
        }
      }
    } else if (isLayeringCategory(newItemCategory, itemCategory, formData.subcategory)) {
      // Add to layering if it's a same-category item suitable for layering
      if (shouldIncludeInLayeringContext(item, formData)) {
        layeringItems.push(item);
      }
    }
  });
  
  // Calculate total complementing items count
  const totalComplementing = Object.values(complementingItems).reduce((total, items) => total + (items?.length || 0), 0);
  console.log(`[wardrobeContextHelpers] STYLING CONTEXT RESULTS: ${totalComplementing} complementing, ${layeringItems.length} layering, ${outerwearItems.length} outerwear`);

  console.log('[wardrobeContextHelpers] 🔗 COMPLEMENTING ITEMS (by category):');
  Object.entries(complementingItems).forEach(([category, items]) => {
    if (items && items.length > 0) {
      console.log(`  ${category.toUpperCase()}: ${items.length} items`);
      items.forEach((item: WardrobeItem, i: number) => console.log(`    ${i+1}. ${item.name} (${item.subcategory})`));
    }
  });
  console.log('[wardrobeContextHelpers] 🧥 LAYERING ITEMS:');
  layeringItems.forEach((item, i) => console.log(`  ${i+1}. ${item.name} (${item.category})`));
  console.log('[wardrobeContextHelpers] 🧥 OUTERWEAR ITEMS:');
  outerwearItems.forEach((item, i) => console.log(`  ${i+1}. ${item.name} (${item.category})`));
  
  return { complementing: complementingItems, layering: layeringItems, outerwear: outerwearItems };
};

/**
 * Helper function to flatten structured complementing items into a single array
 * Useful for backwards compatibility with existing code
 */
export const flattenComplementingItems = (complementingItems: ComplementingItems): WardrobeItem[] => {
  const result: WardrobeItem[] = [];
  
  // Iterate through all categories and combine items
  Object.values(complementingItems).forEach(items => {
    if (items) {
      result.push(...items);
    }
  });
  
  return result;
};

/**
 * Helper function to get total count of complementing items
 */
export const getComplementingItemsCount = (complementingItems: ComplementingItems): number => {
  return Object.values(complementingItems).reduce((total, items) => total + (items?.length || 0), 0);
};

// Helper function to determine if item category complements the new item
const isComplementingCategory = (newItemCategory: ItemCategory, itemCategory: ItemCategory): boolean => {
  const complementingMap: Record<ItemCategory, ItemCategory[]> = {
    [ItemCategory.TOP]: [ItemCategory.BOTTOM, ItemCategory.FOOTWEAR, ItemCategory.ACCESSORY],
    [ItemCategory.BOTTOM]: [ItemCategory.TOP, ItemCategory.FOOTWEAR, ItemCategory.ACCESSORY, ItemCategory.OUTERWEAR],
    [ItemCategory.ONE_PIECE]: [ItemCategory.FOOTWEAR, ItemCategory.ACCESSORY],
    [ItemCategory.FOOTWEAR]: [ItemCategory.TOP, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE, ItemCategory.ACCESSORY, ItemCategory.OUTERWEAR],
    [ItemCategory.OUTERWEAR]: [ItemCategory.BOTTOM, ItemCategory.FOOTWEAR, ItemCategory.ACCESSORY],
    [ItemCategory.ACCESSORY]: [ItemCategory.TOP, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE, ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR],
    [ItemCategory.OTHER]: []
  };

  return complementingMap[newItemCategory]?.includes(itemCategory) || false;
};

// Helper function to determine if item should be in outerwear category
const isOuterwearCategory = (newItemCategory: ItemCategory, itemCategory: ItemCategory): boolean => {
  // Outerwear items that complete any outfit (not just layering)
  if (itemCategory === ItemCategory.OUTERWEAR) {
    return true; // Outerwear can complete any outfit type
  }
  
  return false;
};

/**
 * Helper function to filter outerwear based on AI-detected incompatibilities
 * This works with the enhanced AI prompt that detects real physical/structural conflicts
 * @param {WardrobeItem} outerwearItem - The outerwear item to check
 * @param {WardrobeItem} targetItem - The item being analyzed (from form data)
 * @param {Object} aiAnalysisResult - Results from AI analysis with detected incompatibilities
 * @returns {boolean} - Whether this outerwear is compatible
 */
export const isOuterwearCompatible = (
  outerwearItem: WardrobeItem, 
  targetItem: { subcategory?: string; [key: string]: any }, 
  aiAnalysisResult?: { incompatibleOuterwear?: string[] }
): boolean => {
  // If AI analysis hasn't detected any incompatibilities, assume compatible
  if (!aiAnalysisResult?.incompatibleOuterwear) {
    return true;
  }
  
  // Check if this specific outerwear item was flagged as incompatible
  const incompatibleItems = aiAnalysisResult.incompatibleOuterwear;
  
  // Match by name or subcategory (AI might reference either)
  const isIncompatible = incompatibleItems.some(incompatible => {
    const incompatibleLower = incompatible.toLowerCase();
    const itemNameLower = outerwearItem.name.toLowerCase();
    const itemSubcategoryLower = outerwearItem.subcategory?.toLowerCase();
    
    return (
      // Check if incompatible term is in item name
      incompatibleLower.includes(itemNameLower) ||
      // Check if incompatible term is in item subcategory (only if subcategory exists)
      (itemSubcategoryLower && incompatibleLower.includes(itemSubcategoryLower)) ||
      // Check if item name contains incompatible term
      itemNameLower.includes(incompatibleLower) ||
      // Check if item subcategory contains incompatible term (only if subcategory exists)
      (itemSubcategoryLower && itemSubcategoryLower.includes(incompatibleLower))
    );
  });
  
  return !isIncompatible;
};

// Helper function to determine if item can be layered with new item  
const isLayeringCategory = (newItemCategory: ItemCategory, itemCategory: ItemCategory, newItemSubcategory?: string): boolean => {
  // Same category items can potentially layer
  if (newItemCategory === itemCategory) {
    // TOP + TOP: layering pieces like cardigans over basic tops
    if (newItemCategory === ItemCategory.TOP) {
      return true; // Will filter by subcategory rules later
    }
    // ONE_PIECE + ONE_PIECE: dresses can layer in some cases
    if (newItemCategory === ItemCategory.ONE_PIECE) {
      return true; // Will filter by subcategory rules later
    }
  }
  
  // Cross-category layering (excluding outerwear since it has its own category now)
  // NEW: TOP items can layer over ONE_PIECE (blazers over dresses, but NOT outerwear like coats)
  if (newItemCategory === ItemCategory.ONE_PIECE) {
    return itemCategory === ItemCategory.TOP; // Only TOP items, outerwear is separate
  }
  
  return false;
};

// Helper function to check if layering item should be included
const shouldIncludeInLayeringContext = (item: WardrobeItem, formData: { category?: string; subcategory?: string; seasons?: string[] }): boolean => {
  // For layering, we primarily need season matching and subcategory rules
  const matchesSeason = checkSeasonMatch(item, formData.seasons);
  
  if (!matchesSeason) return false;
  
  const newItemCategory = formData.category as ItemCategory;
  const itemCategory = item.category as ItemCategory;
  
  // Apply specific layering rules based on category combinations
  if (newItemCategory === ItemCategory.ONE_PIECE && itemCategory === ItemCategory.ONE_PIECE) {
    // ONE_PIECE + ONE_PIECE: Generally not suitable for layering (dress + dress doesn't work)
    return false;
  }
  
  if (newItemCategory === ItemCategory.TOP && itemCategory === ItemCategory.TOP) {
    // TOP + TOP: Only allow if both have styling rules (cardigan over tee, etc.)
    if (item.subcategory && formData.subcategory) {
      const itemSubcategoryKey = item.subcategory.toLowerCase();
      const newItemSubcategoryKey = formData.subcategory.toLowerCase();
      const itemRules = stylingRules[itemSubcategoryKey];
      const newItemRules = stylingRules[newItemSubcategoryKey];
      
      return !!itemRules && !!newItemRules;
    }
  }
  
  if (newItemCategory === ItemCategory.ONE_PIECE && itemCategory === ItemCategory.TOP) {
    // ONE_PIECE + TOP: Tops can layer over dresses
    if (item.subcategory) {
      const subcategoryKey = item.subcategory.toLowerCase();
      const rules = stylingRules[subcategoryKey];
      return !!rules;
    }
  }
  
  return false;
};

// Helper function to check if item should be included based on original logic
const shouldIncludeInContext = (item: WardrobeItem, formData: { category?: string; subcategory?: string; seasons?: string[] }): boolean => {
    // Handle ACCESSORY category with configuration
    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory) {
      return handleAccessoryCategory(item, formData.subcategory, formData);
    }

    // Handle OTHER category - no styling context needed
    if (formData.category === ItemCategory.OTHER) {
      return false;
    }
    
    // Handle rule-based categories (TOP, BOTTOM, ONE_PIECE, OUTERWEAR, FOOTWEAR)
    if (formData.subcategory) {
      const subcategoryKey = formData.subcategory.toLowerCase();
      const rules = stylingRules[subcategoryKey];
      
      if (rules) {
        // Define main categories based on form category
        const mainCategories = getMainCategoriesForRuleBased(formData.category as ItemCategory);
        const { matchesMainCategories, matchesTops, matchesAccessories } = checkRuleBasedMatches(item, rules, mainCategories);
        
        // Special case for OUTERWEAR - include specific ONE_PIECE items
        const matchesOnePiece = formData.category === ItemCategory.OUTERWEAR ? 
          (item.category as string) === ItemCategory.ONE_PIECE && 
          checkSubcategoryMatch(item, ONE_PIECE_DRESS_JUMPSUIT) : false;
        
        // Special case for FOOTWEAR - hardcoded socks check
        const matchesFootwearAccessories = formData.category === ItemCategory.FOOTWEAR ? 
          (item.category as string) === ItemCategory.ACCESSORY && 
          checkSubcategoryMatch(item, ['socks']) : false;
        
        // ⚠️ CRITICAL FIX: Add season check for all non-accessory categories
        const matchesSeason = checkSeasonMatch(item, formData.seasons);
        
        const categoriesMatch = matchesMainCategories || matchesTops || matchesAccessories || matchesOnePiece || matchesFootwearAccessories;
        
        // Item must match both category rules AND season requirements
        return categoriesMatch && matchesSeason;
      }
    }
    
    return false;
};

const getMainCategoriesForRuleBased = (category: ItemCategory): ItemCategory[] => {
  switch (category) {
    case ItemCategory.TOP:
      return [ItemCategory.BOTTOM, ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR];
    case ItemCategory.BOTTOM:
      return [ItemCategory.TOP, ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR];
    case ItemCategory.ONE_PIECE:
      return [ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR];
    case ItemCategory.OUTERWEAR:
      return [ItemCategory.TOP, ItemCategory.BOTTOM, ItemCategory.FOOTWEAR];
    case ItemCategory.FOOTWEAR:
      return [ItemCategory.TOP, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE, ItemCategory.OUTERWEAR];
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
