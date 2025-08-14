import { ItemCategory } from '../../../../../../types';

// Subcategory options based on category
export const getSubcategoryOptions = (category: ItemCategory | ''): string[] => {
  switch (category) {
    case ItemCategory.TOP:
      return ['T-Shirt', 'Shirt', 'Blouse', 'Tank Top', 'Sweater', 'Hoodie', 'Cardigan', 'Blazer'];
    case ItemCategory.BOTTOM:
      return ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings', 'Sweatpants'];
    case ItemCategory.ONE_PIECE:
      return ['Dress', 'Jumpsuit', 'Romper', 'Overall'];
    case ItemCategory.OUTERWEAR:
      return ['Coat', 'Jacket', 'Vest', 'Parka', 'Trench Coat', 'Windbreaker'];
    case ItemCategory.FOOTWEAR:
      return ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Loafers'];
    case ItemCategory.ACCESSORY:
      return ['Hat', 'Scarf', 'Belt', 'Bag', 'Jewelry', 'Sunglasses', 'Watch'];
    case ItemCategory.OTHER:
      return ['Underwear', 'Socks', 'Sleepwear', 'Swimwear'];
    default:
      return [];
  }
};

// Format category names for display
export const formatCategoryName = (category: ItemCategory): string => {
  switch (category) {
    case ItemCategory.TOP:
      return 'Top';
    case ItemCategory.BOTTOM:
      return 'Bottom';
    case ItemCategory.ONE_PIECE:
      return 'One Piece';
    case ItemCategory.OUTERWEAR:
      return 'Outerwear';
    case ItemCategory.FOOTWEAR:
      return 'Footwear';
    case ItemCategory.ACCESSORY:
      return 'Accessory';
    case ItemCategory.OTHER:
      return 'Other';
    default:
      return 'Other';
  }
};

// Available seasons (excluding ALL_SEASON as requested)
export const AVAILABLE_SEASONS = ['SPRING', 'SUMMER', 'FALL', 'WINTER'] as const;

// Season display names
export const getSeasonDisplayName = (season: string): string => {
  switch (season) {
    case 'SPRING':
      return 'Spring';
    case 'SUMMER':
      return 'Summer';
    case 'FALL':
      return 'Fall';
    case 'WINTER':
      return 'Winter';
    default:
      return season;
  }
};
