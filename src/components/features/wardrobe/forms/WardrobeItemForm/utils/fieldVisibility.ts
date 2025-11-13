import { ItemCategory } from '../../../../../../types';
import { FieldVisibilityConfig } from '../types/DetailsFieldsTypes';

/**
 * Determines which form fields should be displayed based on category and subcategory
 * @param category - The item category
 * @param subcategory - The item subcategory
 * @returns Configuration object indicating which fields to show
 */
export const getFieldVisibility = (
  category: ItemCategory | '', 
  subcategory: string
): FieldVisibilityConfig => {
  const subcategoryLower = subcategory ? subcategory.toLowerCase() : '';
  
  return {
    // Show silhouette field based on category and subcategory
    shouldShowSilhouette: !!(category && 
      ![ItemCategory.ACCESSORY, ItemCategory.FOOTWEAR, ItemCategory.OTHER].includes(category as ItemCategory) &&
      // For BOTTOM category, only show for specific subcategories
      (category !== ItemCategory.BOTTOM || 
       (subcategory && !['leggings'].includes(subcategoryLower)))),
    
    // Show length field for specific combinations
    shouldShowLength: !!(
      (category === ItemCategory.BOTTOM && 
        subcategory && 
        ['jeans', 'trousers', 'shorts', 'skirt'].includes(subcategoryLower)) ||
      (category === ItemCategory.ONE_PIECE && 
       subcategory && 
       subcategoryLower === 'dress') ||
      category === ItemCategory.OUTERWEAR
    ),
    
    // Show sleeves field based on category and subcategory
    shouldShowSleeves: !!(
      (category === ItemCategory.ONE_PIECE && 
        subcategory && 
        !['overall'].includes(subcategoryLower)) || 
      (category === ItemCategory.TOP && 
       subcategory && 
       ['t-shirt', 'shirt', 'blouse', 'sweater', 'cardigan'].includes(subcategoryLower))
    ),
    
    // Show style field for most categories
    shouldShowStyle: !!(category && 
      ![ItemCategory.ACCESSORY, ItemCategory.OTHER].includes(category as ItemCategory)),
    
    // Show neckline field for specific subcategories
    shouldShowNeckline: !!(subcategory && 
      ['dress', 't-shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'cardigan', 'jumpsuit', 'romper'].includes(subcategoryLower)),
    
    // Show rise field only for BOTTOM category
    shouldShowRise: category === ItemCategory.BOTTOM,
    
    // Show heel height field for footwear
    shouldShowHeelHeight: !!(category === ItemCategory.FOOTWEAR && 
      subcategory && 
      ['heels', 'boots', 'sandals', 'flats', 'formal shoes'].includes(subcategoryLower)),
    
    // Show boot height field for boots subcategory
    shouldShowBootHeight: !!(category === ItemCategory.FOOTWEAR && 
      subcategory && 
      subcategoryLower === 'boots'),
    
    // Show type field for specific subcategories
    shouldShowType: !!(
      (category === ItemCategory.FOOTWEAR && 
        subcategory && 
        ['boots', 'formal shoes'].includes(subcategoryLower)) ||
      (category === ItemCategory.ACCESSORY && 
        subcategory && 
        ['bag', 'jewelry'].includes(subcategoryLower)) ||
      (category === ItemCategory.OUTERWEAR && 
        subcategory && 
        ['jacket', 'coat'].includes(subcategoryLower))
    ),
    
    // Show closure field for cardigans and blazers
    shouldShowClosure: !!(category === ItemCategory.TOP && 
      subcategory && 
      ['cardigan', 'blazer'].includes(subcategoryLower))
  };
};
