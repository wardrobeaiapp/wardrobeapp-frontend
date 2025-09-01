import { ItemCategory } from '../../../../types';
import { ExtractionHelpers } from '../utils/extractionHelpers';

// Define keyword mappings to categories
const CATEGORY_KEYWORDS: Record<string, ItemCategory> = {
  // Top keywords
  'top': ItemCategory.TOP,
  'shirt': ItemCategory.TOP,
  'tshirt': ItemCategory.TOP,
  't-shirt': ItemCategory.TOP,
  'blouse': ItemCategory.TOP,
  'tank': ItemCategory.TOP,
  'tank top': ItemCategory.TOP,
  'sweater': ItemCategory.TOP,
  'sweatshirt': ItemCategory.TOP,
  'hoodie': ItemCategory.TOP,
  'cardigan': ItemCategory.TOP,
  'pullover': ItemCategory.TOP,
  'turtleneck': ItemCategory.TOP,
  'tunic': ItemCategory.TOP,
  'polo': ItemCategory.TOP,
  'crop top': ItemCategory.TOP,
  'crop': ItemCategory.TOP,
  'vest': ItemCategory.TOP,
  
  // Bottom keywords
  'bottom': ItemCategory.BOTTOM,
  'pants': ItemCategory.BOTTOM,
  'jeans': ItemCategory.BOTTOM,
  'trouser': ItemCategory.BOTTOM,
  'trousers': ItemCategory.BOTTOM,
  'skirt': ItemCategory.BOTTOM,
  'shorts': ItemCategory.BOTTOM,
  'leggings': ItemCategory.BOTTOM,
  'jeggings': ItemCategory.BOTTOM,
  'chinos': ItemCategory.BOTTOM,
  'joggers': ItemCategory.BOTTOM,
  'sweatpants': ItemCategory.BOTTOM,
  'culottes': ItemCategory.BOTTOM,
  'slacks': ItemCategory.BOTTOM,
  
  // One-piece keywords
  'one-piece': ItemCategory.ONE_PIECE,
  'dress': ItemCategory.ONE_PIECE,
  'jumpsuit': ItemCategory.ONE_PIECE,
  'romper': ItemCategory.ONE_PIECE,
  'playsuit': ItemCategory.ONE_PIECE,
  'overalls': ItemCategory.ONE_PIECE,
  'dungarees': ItemCategory.ONE_PIECE,
  'gown': ItemCategory.ONE_PIECE,
  'maxi dress': ItemCategory.ONE_PIECE,
  'midi dress': ItemCategory.ONE_PIECE,
  'mini dress': ItemCategory.ONE_PIECE,
  'sundress': ItemCategory.ONE_PIECE,
  
  // Outerwear keywords
  'outerwear': ItemCategory.OUTERWEAR,
  'jacket': ItemCategory.OUTERWEAR,
  'coat': ItemCategory.OUTERWEAR,
  'blazer': ItemCategory.OUTERWEAR,
  'parka': ItemCategory.OUTERWEAR,
  'peacoat': ItemCategory.OUTERWEAR,
  'trench': ItemCategory.OUTERWEAR,
  'trench coat': ItemCategory.OUTERWEAR,
  'windbreaker': ItemCategory.OUTERWEAR,
  'bomber': ItemCategory.OUTERWEAR,
  'bomber jacket': ItemCategory.OUTERWEAR,
  'denim jacket': ItemCategory.OUTERWEAR,
  'leather jacket': ItemCategory.OUTERWEAR,
  'puffer': ItemCategory.OUTERWEAR,
  'puffer jacket': ItemCategory.OUTERWEAR,
  'raincoat': ItemCategory.OUTERWEAR,
  'cape': ItemCategory.OUTERWEAR,
  'poncho': ItemCategory.OUTERWEAR,
  
  // Footwear keywords
  'footwear': ItemCategory.FOOTWEAR,
  'shoes': ItemCategory.FOOTWEAR,
  'shoe': ItemCategory.FOOTWEAR,
  'sneakers': ItemCategory.FOOTWEAR,
  'sneaker': ItemCategory.FOOTWEAR,
  'boots': ItemCategory.FOOTWEAR,
  'boot': ItemCategory.FOOTWEAR,
  'sandals': ItemCategory.FOOTWEAR,
  'sandal': ItemCategory.FOOTWEAR,
  'flats': ItemCategory.FOOTWEAR,
  'heels': ItemCategory.FOOTWEAR,
  'loafers': ItemCategory.FOOTWEAR,
  'oxfords': ItemCategory.FOOTWEAR,
  'mules': ItemCategory.FOOTWEAR,
  'espadrilles': ItemCategory.FOOTWEAR,
  'slippers': ItemCategory.FOOTWEAR,
  'flip-flops': ItemCategory.FOOTWEAR,
  
  // Accessory keywords
  'accessory': ItemCategory.ACCESSORY,
  'accessories': ItemCategory.ACCESSORY,
  'bag': ItemCategory.ACCESSORY,
  'handbag': ItemCategory.ACCESSORY,
  'purse': ItemCategory.ACCESSORY,
  'backpack': ItemCategory.ACCESSORY,
  'tote': ItemCategory.ACCESSORY,
  'clutch': ItemCategory.ACCESSORY,
  'wallet': ItemCategory.ACCESSORY,
  'belt': ItemCategory.ACCESSORY,
  'scarf': ItemCategory.ACCESSORY,
  'hat': ItemCategory.ACCESSORY,
  'beanie': ItemCategory.ACCESSORY,
  'cap': ItemCategory.ACCESSORY,
  'gloves': ItemCategory.ACCESSORY,
  'sunglasses': ItemCategory.ACCESSORY,
  'glasses': ItemCategory.ACCESSORY,
  'jewelry': ItemCategory.ACCESSORY,
  'necklace': ItemCategory.ACCESSORY,
  'bracelet': ItemCategory.ACCESSORY,
  'ring': ItemCategory.ACCESSORY,
  'earrings': ItemCategory.ACCESSORY,
  'watch': ItemCategory.ACCESSORY,
  'tie': ItemCategory.ACCESSORY,
  'bow tie': ItemCategory.ACCESSORY,
  'socks': ItemCategory.ACCESSORY,
  'stockings': ItemCategory.ACCESSORY,
  'tights': ItemCategory.ACCESSORY,
  
  // Undergarment keywords
  'undergarment': ItemCategory.OTHER,
  'underwear': ItemCategory.OTHER,
  'undershirt': ItemCategory.OTHER,
  'bra': ItemCategory.OTHER,
  'panties': ItemCategory.OTHER,
  'boxers': ItemCategory.OTHER,
  'briefs': ItemCategory.OTHER,
  'lingerie': ItemCategory.OTHER,
  'shapewear': ItemCategory.OTHER,
  'camisole': ItemCategory.OTHER,
  'slip': ItemCategory.OTHER,
  'thermal': ItemCategory.OTHER,
  
  // Sleepwear keywords
  'sleepwear': ItemCategory.OTHER,
  'pajamas': ItemCategory.OTHER,
  'pyjamas': ItemCategory.OTHER,
  'nightgown': ItemCategory.OTHER,
  'robe': ItemCategory.OTHER,
  'nightdress': ItemCategory.OTHER,
  'nightshirt': ItemCategory.OTHER,
  'loungewear': ItemCategory.OTHER,
  'nightwear': ItemCategory.OTHER,
  
  // Swimwear keywords
  'swimwear': ItemCategory.OTHER,
  'swimsuit': ItemCategory.OTHER,
  'bikini': ItemCategory.OTHER,
  'swim trunks': ItemCategory.OTHER,
  'one-piece swimsuit': ItemCategory.OTHER,
  'bathing suit': ItemCategory.OTHER,
  'monokini': ItemCategory.OTHER,
  'swim shorts': ItemCategory.OTHER,
  'tankini': ItemCategory.OTHER,
  'rash guard': ItemCategory.OTHER,
  'board shorts': ItemCategory.OTHER,
  
  // Activewear keywords
  'activewear': ItemCategory.OTHER,
  'sportswear': ItemCategory.OTHER,
  'athletic wear': ItemCategory.OTHER,
  'gym clothes': ItemCategory.OTHER,
  'workout': ItemCategory.OTHER,
  'yoga pants': ItemCategory.BOTTOM,
  'running shorts': ItemCategory.BOTTOM,
  'sports bra': ItemCategory.TOP,
  'track jacket': ItemCategory.OUTERWEAR,
  'track pants': ItemCategory.BOTTOM,
  'workout top': ItemCategory.TOP,
  'athletic': ItemCategory.OTHER,
};

/**
 * Get the category from a keyword using fuzzy matching
 * @param keyword The keyword to match against category keywords
 * @returns The matched category or undefined if no match
 */
export function getCategoryFromKeyword(keyword: string): ItemCategory | undefined {
  if (!keyword) return undefined;
  
  const normalizedKeyword = ExtractionHelpers.normalizeString(keyword);
  
  // Direct lookup first
  if (normalizedKeyword in CATEGORY_KEYWORDS) {
    return CATEGORY_KEYWORDS[normalizedKeyword];
  }
  
  // Fuzzy matching - check if keyword contains any of our known keywords
  for (const [categoryKeyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    if (normalizedKeyword.includes(categoryKeyword)) {
      return category;
    }
  }
  
  return undefined;
}

/**
 * Format a category name for display
 * @param category The category enum value
 * @returns A formatted display name for the category
 */
export function formatCategoryName(category: ItemCategory): string {
  switch (category) {
    case ItemCategory.TOP:
      return 'Top';
    case ItemCategory.BOTTOM:
      return 'Bottom';
    case ItemCategory.ONE_PIECE:
      return 'One-Piece';
    case ItemCategory.OUTERWEAR:
      return 'Outerwear';
    case ItemCategory.FOOTWEAR:
      return 'Footwear';
    case ItemCategory.ACCESSORY:
      return 'Accessory';
    case ItemCategory.OTHER:
      return 'Other';
    default:
      return 'Unknown';
  }
}
