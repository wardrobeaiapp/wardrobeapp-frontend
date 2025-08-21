import { ItemCategory, Season } from '../../../../../../types';

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
      return ['Hat', 'Scarf', 'Belt', 'Bag', 'Jewelry', 'Sunglasses', 'Watch', 'Socks', 'Ties'];
    case ItemCategory.OTHER:
      return ['Underwear', 'Sleepwear', 'Swimwear'];
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
export const AVAILABLE_SEASONS = [
  Season.SPRING, 
  Season.SUMMER, 
  Season.FALL, 
  Season.WINTER
] as const;

// Get season display name
export const getSeasonDisplayName = (season: Season): string => {
  switch (season) {
    case Season.SPRING:
      return 'Spring';
    case Season.SUMMER:
      return 'Summer';
    case Season.FALL:
      return 'Fall';
    case Season.WINTER:
      return 'Winter';
    default:
      return season;
  }
};

// Get sleeve options for TOP category
export const getSleeveOptions = (): string[] => {
  return ['3/4 sleeves', 'long sleeves', 'one sleeve', 'short sleeves', 'sleeveless'];
};

// Get style options for most categories (except ACCESSORY and OTHER)
export const getStyleOptions = (): string[] => {
  return ['casual', 'elegant', 'special', 'sport'];
};

// Get silhouette options based on category or subcategory
export const getSilhouetteOptions = (category: ItemCategory | '', subcategory?: string): string[] => {
  // Handle based on category first
  switch (category) {
    case ItemCategory.TOP:
      return ['Fitted', 'Loose', 'Regular'];
    case ItemCategory.BOTTOM:
      return ['Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Wide Leg', 'Straight', 'Bootcut'];
    case ItemCategory.ONE_PIECE:
      return ['Body-Fitting', 'A-Line', 'Straight', 'Fit & Flare', 'Shift', 'Wrap'];
    case ItemCategory.OUTERWEAR:
      return ['Fitted', 'Regular Fit', 'Oversized', 'Cropped', 'Longline'];
    case ItemCategory.FOOTWEAR:
    case ItemCategory.ACCESSORY:
    case ItemCategory.OTHER:
      return []; // No silhouette options for these categories
    default:
      return [];
  }
};
