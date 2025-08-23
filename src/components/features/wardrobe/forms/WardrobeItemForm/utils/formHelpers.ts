import { ItemCategory, Season } from '../../../../../../types';

// Subcategory options based on category
export const getSubcategoryOptions = (category: ItemCategory | ''): string[] => {
  switch (category) {
    case ItemCategory.TOP:
      return ['T-Shirt', 'Shirt', 'Blouse', 'Top', 'Tank Top', 'Sweater', 'Hoodie', 'Sweatshirt', 'Cardigan', 'Blazer', 'Vest'];
    case ItemCategory.BOTTOM:
      return ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings', 'Sweatpants'];
    case ItemCategory.ONE_PIECE:
      return ['Dress', 'Jumpsuit', 'Romper', 'Overall'];
    case ItemCategory.OUTERWEAR:
      return ['Coat', 'Jacket', 'Parka', 'Trench Coat', 'Windbreaker'];
    case ItemCategory.FOOTWEAR:
      return ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Loafers', 'Formal Shoes', 'Slippers'];
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

// Get style options based on category and subcategory
export const getStyleOptions = (category: ItemCategory | '', subcategory?: string): string[] => {
  // For footwear, return specific styles based on subcategory
  if (category === ItemCategory.FOOTWEAR && subcategory) {
    switch (subcategory.toLowerCase()) {
      case 'sneakers':
        return ['running', 'casual', 'basketball', 'tennis'];
      case 'boots':
        return ['combat', 'chelsea', 'cowboy', 'hiking', 'dress'];
      case 'sandals':
        return ['casual', 'dressy', 'sport'];
      case 'heels':
        return ['formal', 'party', 'casual'];
      case 'flats':
        return ['casual', 'formal', 'ballet'];
      case 'loafers':
        return ['formal', 'casual'];
      case 'formal shoes':
        return ['oxford', 'derby', 'monk strap'];
      case 'slippers':
        return ['cozy', 'minimal', 'supportive'];
    }
  }
  
  // Default styles for other categories
  return ['casual', 'elegant', 'special', 'sport'];
};

// Get length options based on subcategory for BOTTOM items
export const getLengthOptions = (subcategory?: string): string[] => {
  if (!subcategory) return [];
  
  const subcategoryLower = subcategory.toLowerCase();
  
  if (subcategoryLower === 'jeans' || subcategoryLower === 'trousers') {
    return ['Long', '7/8', '3/4', 'Short'];
  }

  if (subcategoryLower === 'shorts') {
    return ['Micro', 'Mini', 'Midi', 'Bermuda', 'Knee-length'];
  }
  
  if (subcategoryLower === 'skirt' || subcategoryLower === 'dress') {
    return ['Maxi', 'Midi', 'Mini'];
  }

  if (subcategoryLower === 'coat' || subcategoryLower === 'jacket' || subcategoryLower === 'parka' || subcategoryLower === 'trench coat' || subcategoryLower === 'windbreaker') {
    return ['Short', 'Middle', 'Long'];
  }
  
  return [];
};

// Get rise options for BOTTOM items
export const getRiseOptions = (): string[] => {
  return ['High', 'Mid', 'Low'];
};

// Get neckline options for applicable items
export const getNecklineOptions = (): string[] => {
  return [
    'scoop', 'v-neck', 'crew', 'boat', 'square', 'sweetheart', 'halter',
    'one shoulder', 'off shoulder', 'turtleneck', 'mock', 'asymmetric',
    'high neck', 'scoop neck', 'deep v', 'jewel', 'plunge', 'scoop neck',
    'surplice', 'square', 'sweetheart', 'illusion', 'keyhole', 'portrait',
    'queen anne', 'sabrina', 'scoop neck', 'slash', 'square', 'straight',
    'sweetheart', 'v-neck', 'wrap'
  ];
};

// Heel height options for footwear
export const HEEL_HEIGHT_OPTIONS = ['high', 'mid', 'low', 'flat', 'kitten', 'block', 'stiletto', 'wedge', 'platform'] as const;
export type HeelHeight = typeof HEEL_HEIGHT_OPTIONS[number];

// Boot height options
export const BOOT_HEIGHT_OPTIONS = ['ankle', 'mid-calf', 'knee-high', 'thigh-high'] as const;
export type BootHeight = typeof BOOT_HEIGHT_OPTIONS[number];

/**
 * Get heel height options for footwear
 * @returns Array of heel height options with proper formatting
 */
export function getHeelHeightOptions(): string[] {
  return HEEL_HEIGHT_OPTIONS.map(option => 
    option.charAt(0).toUpperCase() + option.slice(1).toLowerCase()
  );
}

/**
 * Get boot height options for boots
 * @returns Array of boot height options with proper formatting
 */
export function getBootHeightOptions(): string[] {
  return BOOT_HEIGHT_OPTIONS.map(option => {
    // Handle hyphenated options
    return option.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('-');
  });
}

// Get silhouette options based on category or subcategory
export const getSilhouetteOptions = (category: ItemCategory | '', subcategory?: string): string[] => {
  // Handle based on category
  switch (category) {
    case ItemCategory.TOP:
      return ['Fitted', 'Loose', 'Regular'];
    case ItemCategory.BOTTOM:
      if (subcategory?.toLowerCase() === 'skirt') {
        return ['A-Line', 'Balloon', 'Mermaid', 'Pencil', 'Straight', 'Pleated', 'Tiered', 'Wrap'];
      }
      if (subcategory?.toLowerCase() === 'shorts' || subcategory?.toLowerCase() === 'sweatpants') {
        return ['Slim Fit', 'Regular Fit', 'Relaxed Fit'];
      }
      return ['Skinny', 'Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Wide Leg', 'Straight', 'Bootcut', 'Flared'];
    case ItemCategory.ONE_PIECE:
      if (subcategory?.toLowerCase() === 'dress') {
        return ['A-Line', 'Balloon', 'Mermaid', 'Pencil', 'Straight', 'Pleated', 'Tiered', 'Wrap'];
      }
      if (subcategory?.toLowerCase() === 'jumpsuit') {
        return ['Skinny', 'Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Wide Leg', 'Straight', 'Bootcut', 'Flared'];
      }
      return ['Slim Fit', 'Regular Fit', 'Relaxed Fit'];
    case ItemCategory.OUTERWEAR:
      if (subcategory?.toLowerCase() === 'jacket') {
        // These options match the mapping keywords in mapJacketSubcategoryToSilhouette
        return ['Baseball', 'Biker', 'Bomber', 'Puffer', 'Casual', 'Harrington', 'Knitted Poncho', 'Pilot', 'Racer', 'Poncho', 'Winter'];
      }
      if (subcategory?.toLowerCase() === 'coat') {
        // These options match the mapping keywords in mapCoatSubcategoryToSilhouette
        return ['Duffle', 'Kimono', 'Peacoat', 'Raincoat', 'Winter', 'Wool'];
      }
      return ['Fitted', 'Loose', 'Regular'];
    case ItemCategory.FOOTWEAR:
    case ItemCategory.ACCESSORY:
    case ItemCategory.OTHER:
      return []; // No silhouette options for these categories
    default:
      return [];
  }
};
