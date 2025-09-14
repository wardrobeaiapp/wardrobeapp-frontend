import { ItemCategory } from '../../types';
import { WardrobeItem } from '../../types/wardrobe';
import { stylingRules } from './wardrobeContextRules';

/**
 * Filters wardrobe items to find styling context based on form data
 */
export const filterStylingContext = (
  wardrobeItems: WardrobeItem[], 
  formData: { category?: string; subcategory?: string; seasons?: string[] }
): WardrobeItem[] => {
  return wardrobeItems.filter(item => {
    // Common season matching logic
    const matchesSeason = formData.seasons?.some(season => 
      item.season?.includes(season as any)
    ) ?? true; // If no seasons specified, include all
    
    // Only process TOP category items with styling rules
    if (formData.category === ItemCategory.TOP && formData.subcategory) {
      const subcategoryKey = formData.subcategory.toLowerCase();
      const rules = stylingRules[subcategoryKey];
      
      if (rules) {
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // Always include main categories (bottoms, footwear, outerwear)
        const matchesMainCategories = [ItemCategory.BOTTOM, ItemCategory.OUTERWEAR].includes(item.category as ItemCategory);
        
        // Check for matching accessories
        const matchesAccessories = rules.accessories && 
          (item.category as string) === ItemCategory.ACCESSORY && 
          rules.accessories.includes(item.subcategory?.toLowerCase() || '');
        
        // Check for matching tops
        const matchesTops = rules.tops && 
          (item.category as string) === ItemCategory.TOP && 
          rules.tops.includes(item.subcategory?.toLowerCase() || '');
        
        console.log(`[wardrobeContextHelpers] Debug - matchesMainCategories: ${matchesMainCategories}, matchesAccessories: ${!!matchesAccessories}, matchesTops: ${!!matchesTops}, matchesSeason: ${matchesSeason}`);
        
        return (matchesMainCategories || matchesAccessories || matchesTops) && matchesSeason;
      }
    }

    if (formData.category === ItemCategory.BOTTOM && formData.subcategory) {
        const subcategoryKey = formData.subcategory.toLowerCase();
        const rules = stylingRules[subcategoryKey];

        if (rules) {
            console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
            
            // Always include main categories (bottoms, footwear, outerwear)
            const matchesMainCategories = [ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR].includes(item.category as ItemCategory);

            const matchesTops = rules.tops && 
              (item.category as string) === ItemCategory.TOP && 
              rules.tops.includes(item.subcategory?.toLowerCase() || '');
            
            // Check for matching accessories
            const matchesAccessories = rules.accessories && 
              (item.category as string) === ItemCategory.ACCESSORY && 
              rules.accessories.includes(item.subcategory?.toLowerCase() || '');
            
            console.log(`[wardrobeContextHelpers] Debug - matchesMainCategories: ${matchesMainCategories}, matchesAccessories: ${!!matchesAccessories}, matchesSeason: ${matchesSeason}`);
            
            return (matchesMainCategories || matchesTops || matchesAccessories) && matchesSeason;
        }
        
    }

    if (formData.category === ItemCategory.ONE_PIECE && formData.subcategory) {
        const subcategoryKey = formData.subcategory.toLowerCase();
        const rules = stylingRules[subcategoryKey];

        if (rules) {
            console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
            
            // Always include main categories (bottoms, footwear, outerwear)
            const matchesMainCategories = [ItemCategory.FOOTWEAR, ItemCategory.OUTERWEAR].includes(item.category as ItemCategory);

            const matchesTops = rules.tops && 
              (item.category as string) === ItemCategory.TOP && 
              rules.tops.includes(item.subcategory?.toLowerCase() || '');
            
            // Check for matching accessories
            const matchesAccessories = rules.accessories && 
              (item.category as string) === ItemCategory.ACCESSORY && 
              rules.accessories.includes(item.subcategory?.toLowerCase() || '');
            
            console.log(`[wardrobeContextHelpers] Debug - matchesMainCategories: ${matchesMainCategories}, matchesAccessories: ${!!matchesAccessories}, matchesSeason: ${matchesSeason}`);
            
            return (matchesMainCategories || matchesTops || matchesAccessories) && matchesSeason;
        }
        
    }

    if (formData.category === ItemCategory.OUTERWEAR && formData.subcategory) {
        const subcategoryKey = formData.subcategory.toLowerCase();
        const rules = stylingRules[subcategoryKey];

        if (rules) {
            console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
            
            // Always include main categories (bottoms, footwear)
            const matchesMainCategories = [ItemCategory.FOOTWEAR, ItemCategory.BOTTOM].includes(item.category as ItemCategory);

            // Only include specific ONE_PIECE items (dress and jumpsuit)
            const matchesOnePiece = (item.category as string) === ItemCategory.ONE_PIECE && 
              ['dress', 'jumpsuit'].includes(item.subcategory?.toLowerCase() || '');

            const matchesTops = rules.tops && 
              (item.category as string) === ItemCategory.TOP && 
              rules.tops.includes(item.subcategory?.toLowerCase() || '');
            
            // Check for matching accessories
            const matchesAccessories = rules.accessories && 
              (item.category as string) === ItemCategory.ACCESSORY && 
              rules.accessories.includes(item.subcategory?.toLowerCase() || '');
            
            console.log(`[wardrobeContextHelpers] Debug - matchesMainCategories: ${matchesMainCategories}, matchesOnePiece: ${matchesOnePiece}, matchesAccessories: ${!!matchesAccessories}, matchesSeason: ${matchesSeason}`);
            
            return (matchesMainCategories || matchesOnePiece || matchesTops || matchesAccessories) && matchesSeason;
        }
        
    }

    if (formData.category === ItemCategory.FOOTWEAR && formData.subcategory) {
        const subcategoryKey = formData.subcategory.toLowerCase();
        const rules = stylingRules[subcategoryKey];

        if (rules) {
            console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
            
            // Always include main categories (bottoms, footwear)
            const matchesMainCategories = [ItemCategory.OUTERWEAR, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE].includes(item.category as ItemCategory);
            
            // Check for matching accessories
            const matchesAccessories = (item.category as string) === ItemCategory.ACCESSORY && 
            ['socks'].includes(item.subcategory?.toLowerCase() || '');
            
            console.log(`[wardrobeContextHelpers] Debug - matchesMainCategories: ${matchesMainCategories}, matchesAccessories: ${!!matchesAccessories}, matchesSeason: ${matchesSeason}`);
            
            return (matchesMainCategories || matchesAccessories) && matchesSeason;
        }
        
    }

    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory?.toLowerCase() === 'hat') {
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // For hat accessories, include bottoms and outerwear
        const matchesCategories = [ItemCategory.BOTTOM, ItemCategory.OUTERWEAR].includes(item.category as ItemCategory);
        
        console.log(`[wardrobeContextHelpers] Debug - matchesCategories: ${matchesCategories}, matchesSeason: ${matchesSeason}`);
        
        return matchesCategories && matchesSeason;
    }


    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory?.toLowerCase() === 'scarf') {
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // For hat accessories, include bottoms and outerwear
        const matchesCategories = [ItemCategory.OUTERWEAR, ItemCategory.TOP].includes(item.category as ItemCategory);

        const matchesOnePiece = (item.category as string) === ItemCategory.ONE_PIECE && 
              ['dress', 'jumpsuit'].includes(item.subcategory?.toLowerCase() || '');
        
        console.log(`[wardrobeContextHelpers] Debug - matchesCategories: ${matchesCategories}, matchesSeason: ${matchesSeason}`);
        
        return (matchesCategories || matchesOnePiece) && matchesSeason;
    }

    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory?.toLowerCase() === 'belt') {
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // For hat accessories, include bottoms and outerwear
        const matchesCategories = [ItemCategory.OUTERWEAR, ItemCategory.BOTTOM].includes(item.category as ItemCategory);

        const matchesOnePiece = (item.category as string) === ItemCategory.ONE_PIECE && 
              ['dress', 'jumpsuit'].includes(item.subcategory?.toLowerCase() || '');

        const matchesTops = (item.category as string) === ItemCategory.TOP && 
        ['shirt', 'blouse', 'cardigan', 'blazer', 'sweater'].includes(item.subcategory?.toLowerCase() || '');
        
        console.log(`[wardrobeContextHelpers] Debug - matchesCategories: ${matchesCategories}, matchesSeason: ${matchesSeason}`);
        
        return (matchesCategories || matchesOnePiece || matchesTops) && matchesSeason;
    }

    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory?.toLowerCase() === 'bag') {
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // For hat accessories, include bottoms and outerwear
        const matchesCategories = [ItemCategory.OUTERWEAR].includes(item.category as ItemCategory);
        
        console.log(`[wardrobeContextHelpers] Debug - matchesCategories: ${matchesCategories}, matchesSeason: ${matchesSeason}`);
        
        return matchesCategories && matchesSeason;
    }

    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory?.toLowerCase() === 'jewelry') {
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // For hat accessories, include bottoms and outerwear
        const matchesCategories = [ItemCategory.TOP].includes(item.category as ItemCategory);

        const matchesOnePiece = (item.category as string) === ItemCategory.ONE_PIECE && 
              ['dress', 'jumpsuit'].includes(item.subcategory?.toLowerCase() || '');
        
        console.log(`[wardrobeContextHelpers] Debug - matchesCategories: ${matchesCategories}, matchesSeason: ${matchesSeason}`);
        
        return (matchesCategories || matchesOnePiece) && matchesSeason;
    }

    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory?.toLowerCase() === 'watch') {
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // For hat accessories, include bottoms and outerwear
        const matchesCategories = [ItemCategory.TOP].includes(item.category as ItemCategory);

        const matchesOnePiece = (item.category as string) === ItemCategory.ONE_PIECE && 
              ['dress', 'jumpsuit'].includes(item.subcategory?.toLowerCase() || '');
        
        console.log(`[wardrobeContextHelpers] Debug - matchesCategories: ${matchesCategories}, matchesSeason: ${matchesSeason}`);
        
        return (matchesCategories || matchesOnePiece) && matchesSeason;
    }

    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory?.toLowerCase() === 'socks') {
        console.log(`[wardrobeContextHelpers] Debug - checking item: ${item.name}, category: ${item.category}, subcategory: ${item.subcategory}, season: ${item.season}`);
        
        // For hat accessories, include bottoms and outerwear
        const matchesCategories = [ItemCategory.FOOTWEAR, ItemCategory.BOTTOM, ItemCategory.ONE_PIECE].includes(item.category as ItemCategory);

        console.log(`[wardrobeContextHelpers] Debug - matchesCategories: ${matchesCategories}, matchesSeason: ${matchesSeason}`);
        
        return matchesCategories && matchesSeason;
    }

    if (formData.category === ItemCategory.ACCESSORY && formData.subcategory?.toLowerCase() === 'sunglasses') {
        console.log(`[wardrobeContextHelpers] Debug - Sunglasses: no styling context needed`);
        return false; // No styling context for sunglasses
    }
    
    return false; // No styling rules for this category/subcategory
  });
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
