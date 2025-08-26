import { ItemCategory } from '../../../types';

/**
 * Maps clothing item keywords to their appropriate categories
 */
export const categoryMappings: Record<string, ItemCategory> = {
  // TOP category mappings
  'upper': ItemCategory.TOP,
  'shirt': ItemCategory.TOP,
  'shirts': ItemCategory.TOP,
  'top': ItemCategory.TOP,
  'tops': ItemCategory.TOP,
  'tshirt': ItemCategory.TOP,
  't-shirt': ItemCategory.TOP,
  'tee': ItemCategory.TOP,
  'blouse': ItemCategory.TOP,
  'tank': ItemCategory.TOP,
  'tank top': ItemCategory.TOP,
  'tanktop': ItemCategory.TOP,
  'camisole': ItemCategory.TOP,
  'polo': ItemCategory.TOP,
  'tunic': ItemCategory.TOP,
  'sweater': ItemCategory.TOP,
  'sweatshirt': ItemCategory.TOP,
  'cardigan': ItemCategory.TOP,
  'pullover': ItemCategory.TOP,
  'turtleneck': ItemCategory.TOP,
  'vest': ItemCategory.TOP,
  'hoodie': ItemCategory.TOP,
  'bra': ItemCategory.TOP,

  // BOTTOM category mappings
  'pants': ItemCategory.BOTTOM,
  'pant': ItemCategory.BOTTOM,
  'trousers': ItemCategory.BOTTOM,
  'jeans': ItemCategory.BOTTOM,
  'jean': ItemCategory.BOTTOM,
  'denim': ItemCategory.BOTTOM,
  'shorts': ItemCategory.BOTTOM,
  'skirt': ItemCategory.BOTTOM,
  'leggings': ItemCategory.BOTTOM,
  'tights': ItemCategory.BOTTOM,
  'joggers': ItemCategory.BOTTOM,
  'sweatpants': ItemCategory.BOTTOM,
  'chinos': ItemCategory.BOTTOM,
  'slacks': ItemCategory.BOTTOM,
  'capri': ItemCategory.BOTTOM,
  'capris': ItemCategory.BOTTOM,

  // ONE_PIECE category mappings
  'dress': ItemCategory.ONE_PIECE,
  'dresses': ItemCategory.ONE_PIECE,
  'jumpsuit': ItemCategory.ONE_PIECE,
  'jumpsuits': ItemCategory.ONE_PIECE,
  'romper': ItemCategory.ONE_PIECE,
  'rompers': ItemCategory.ONE_PIECE,
  'playsuit': ItemCategory.ONE_PIECE,
  'overalls': ItemCategory.ONE_PIECE,
  'dungarees': ItemCategory.ONE_PIECE,
  'onesie': ItemCategory.ONE_PIECE,

  // OUTERWEAR category mappings
  'jacket': ItemCategory.OUTERWEAR,
  'jackets': ItemCategory.OUTERWEAR,
  'coat': ItemCategory.OUTERWEAR,
  'coats': ItemCategory.OUTERWEAR,
  'blazer': ItemCategory.OUTERWEAR,
  'blazers': ItemCategory.OUTERWEAR,
  'cardigans': ItemCategory.OUTERWEAR,
  'sweaters': ItemCategory.OUTERWEAR,
  'poncho': ItemCategory.OUTERWEAR,
  'ponchos': ItemCategory.OUTERWEAR,
  'parka': ItemCategory.OUTERWEAR,
  'parkas': ItemCategory.OUTERWEAR,
  'raincoat': ItemCategory.OUTERWEAR,
  'raincoats': ItemCategory.OUTERWEAR,
  'peacoat': ItemCategory.OUTERWEAR,
  'peacoats': ItemCategory.OUTERWEAR,
  'trench': ItemCategory.OUTERWEAR,
  'trench coat': ItemCategory.OUTERWEAR,
  'trenchcoat': ItemCategory.OUTERWEAR,
  'vests': ItemCategory.OUTERWEAR,
  'windbreaker': ItemCategory.OUTERWEAR,
  'cape': ItemCategory.OUTERWEAR,
  'cloak': ItemCategory.OUTERWEAR,

  // FOOTWEAR category mappings
  'shoes': ItemCategory.FOOTWEAR,
  'shoe': ItemCategory.FOOTWEAR,
  'boots': ItemCategory.FOOTWEAR,
  'boot': ItemCategory.FOOTWEAR,
  'sneakers': ItemCategory.FOOTWEAR,
  'sneaker': ItemCategory.FOOTWEAR,
  'trainers': ItemCategory.FOOTWEAR,
  'trainer': ItemCategory.FOOTWEAR,
  'sandals': ItemCategory.FOOTWEAR,
  'sandal': ItemCategory.FOOTWEAR,
  'heels': ItemCategory.FOOTWEAR,
  'heel': ItemCategory.FOOTWEAR,
  'flats': ItemCategory.FOOTWEAR,
  'flat': ItemCategory.FOOTWEAR,
  'loafer': ItemCategory.FOOTWEAR,
  'loafers': ItemCategory.FOOTWEAR,
  'pumps': ItemCategory.FOOTWEAR,
  'pump': ItemCategory.FOOTWEAR,
  'oxfords': ItemCategory.FOOTWEAR,
  'oxford': ItemCategory.FOOTWEAR,
  'slippers': ItemCategory.FOOTWEAR,
  'slipper': ItemCategory.FOOTWEAR,
  'mules': ItemCategory.FOOTWEAR,
  'mule': ItemCategory.FOOTWEAR,
  'espadrilles': ItemCategory.FOOTWEAR,
  'espadrille': ItemCategory.FOOTWEAR,
  'clogs': ItemCategory.FOOTWEAR,
  'clog': ItemCategory.FOOTWEAR,

  // ACCESSORY category mappings
  'accessory': ItemCategory.ACCESSORY,
  'accessories': ItemCategory.ACCESSORY,
  'bag': ItemCategory.ACCESSORY,
  'bags': ItemCategory.ACCESSORY,
  'purse': ItemCategory.ACCESSORY,
  'purses': ItemCategory.ACCESSORY,
  'handbag': ItemCategory.ACCESSORY,
  'handbags': ItemCategory.ACCESSORY,
  'backpack': ItemCategory.ACCESSORY,
  'backpacks': ItemCategory.ACCESSORY,
  'tote': ItemCategory.ACCESSORY,
  'totes': ItemCategory.ACCESSORY,
  'clutch': ItemCategory.ACCESSORY,
  'clutches': ItemCategory.ACCESSORY,
  'wallet': ItemCategory.ACCESSORY,
  'wallets': ItemCategory.ACCESSORY,
  'belt': ItemCategory.ACCESSORY,
  'belts': ItemCategory.ACCESSORY,
  'scarf': ItemCategory.ACCESSORY,
  'scarves': ItemCategory.ACCESSORY,
  'gloves': ItemCategory.ACCESSORY,
  'glove': ItemCategory.ACCESSORY,
  'hat': ItemCategory.ACCESSORY,
  'hats': ItemCategory.ACCESSORY,
  'cap': ItemCategory.ACCESSORY,
  'caps': ItemCategory.ACCESSORY,
  'beanie': ItemCategory.ACCESSORY,
  'beanies': ItemCategory.ACCESSORY,
  'socks': ItemCategory.ACCESSORY,
  'sock': ItemCategory.ACCESSORY,
  'jewelry': ItemCategory.ACCESSORY,
  'jewellery': ItemCategory.ACCESSORY,
  'necklace': ItemCategory.ACCESSORY,
  'necklaces': ItemCategory.ACCESSORY,
  'bracelet': ItemCategory.ACCESSORY,
  'bracelets': ItemCategory.ACCESSORY,
  'ring': ItemCategory.ACCESSORY,
  'rings': ItemCategory.ACCESSORY,
  'earring': ItemCategory.ACCESSORY,
  'earrings': ItemCategory.ACCESSORY,
  'watch': ItemCategory.ACCESSORY,
  'watches': ItemCategory.ACCESSORY,
  'sunglasses': ItemCategory.ACCESSORY,
  'glasses': ItemCategory.ACCESSORY,
  'eyewear': ItemCategory.ACCESSORY,
};

/**
 * Gets all valid item categories
 */
export function getItemCategories(): ItemCategory[] {
  return Object.values(ItemCategory);
}

/**
 * Formats a category name for display
 */
export function formatCategoryName(category: ItemCategory): string {
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

/**
 * Gets a category from a keyword using the categoryMappings dictionary
 * @param keyword The clothing keyword to look up
 * @returns The matched ItemCategory or ItemCategory.OTHER if no match
 */
export function getCategoryFromKeyword(keyword: string): ItemCategory {
  // Convert to lowercase for case-insensitive matching
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Check if the keyword exists in our mappings
  if (normalizedKeyword in categoryMappings) {
    return categoryMappings[normalizedKeyword];
  }
  
  // Return OTHER category as fallback
  return ItemCategory.OTHER;
}
