import { ItemCategory } from '../../../types';

/**
 * Maps categories to their available subcategories
 */
export const categoryToSubcategoryMappings: Record<ItemCategory, string[]> = {
  [ItemCategory.TOP]: [
    't-shirt',
    'shirt',
    'blouse',
    'tank top',
    'sweater',
    'sweatshirt',
    'hoodie',
    'cardigan',
    'tunic',
    'vest',
    'crop top',
    'bralette',
    'polo',
    'other'
  ],
  [ItemCategory.BOTTOM]: [
    'jeans',
    'trousers',
    'shorts',
    'skirt',
    'leggings',
    'culottes',
    'joggers',
    'other'
  ],
  [ItemCategory.ONE_PIECE]: [
    'dress',
    'jumpsuit',
    'romper',
    'overall',
    'other'
  ],
  [ItemCategory.OUTERWEAR]: [
    'jacket',
    'coat',
    'blazer',
    'cardigan',
    'vest',
    'cape',
    'poncho',
    'parka',
    'trench coat',
    'windbreaker',
    'other'
  ],
  [ItemCategory.FOOTWEAR]: [
    'sneakers',
    'boots',
    'sandals',
    'heels',
    'flats',
    'loafers',
    'espadrilles',
    'mules',
    'slippers',
    'formal shoes',
    'other'
  ],
  [ItemCategory.ACCESSORY]: [
    'bag',
    'scarf',
    'hat',
    'gloves',
    'socks',
    'belt',
    'jewelry',
    'sunglasses',
    'watch',
    'hair accessory',
    'tie',
    'other'
  ],
  [ItemCategory.OTHER]: ['other']
};

/**
 * Gets subcategories for a specific category
 */
export function getSubcategoriesForCategory(category: ItemCategory): string[] {
  return categoryToSubcategoryMappings[category] || [];
}
