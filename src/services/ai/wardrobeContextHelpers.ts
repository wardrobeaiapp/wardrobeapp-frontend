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
  return wardrobeItems.filter(item => {
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
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
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
        
        console.log(`[wardrobeContextHelpers] Debug - matchesMainCategories: ${matchesMainCategories}, matchesTops: ${!!matchesTops}, matchesAccessories: ${!!matchesAccessories}, matchesOnePiece: ${matchesOnePiece}, matchesFootwearAccessories: ${matchesFootwearAccessories}, matchesSeason: ${matchesSeason}`);
        
        return (matchesMainCategories || matchesTops || matchesAccessories || matchesOnePiece || matchesFootwearAccessories) && matchesSeason;
      }
    }
    
    return false; // No styling rules for this category/subcategory
  });
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
 * Filters wardrobe items to find gap analysis context (same category items)
 */
export const filterGapAnalysisContext = (
  wardrobeItems: WardrobeItem[], 
  formData: { category?: string; seasons?: string[] }
): WardrobeItem[] => {
  return wardrobeItems.filter(item => {
    const matchesCategory = item.category === formData.category;
    const matchesSeason = formData.seasons?.some(season => 
      item.season?.includes(season as any)
    ) ?? true; // If no seasons specified, include all
    
    return matchesCategory && matchesSeason;
  });
};

/**
 * Filters wardrobe items for additional context based on category relationships
 */
export const filterAdditionalContext = (
  wardrobeItems: WardrobeItem[], 
  formData: { category?: string; seasons?: string[] }
): WardrobeItem[] => {
  return wardrobeItems.filter(item => {
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
