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
      return ['Sneakers', 'Boots', 'Sandals', 'Heels', 'Flats', 'Formal Shoes', 'Slippers'];
    case ItemCategory.ACCESSORY:
      return ['Hat', 'Scarf', 'Belt', 'Bag', 'Jewelry', 'Sunglasses', 'Watch', 'Socks', 'Tights'];
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

// Available seasons
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

// Get style options
export const getStyleOptions = (): string[] => {
  return ['Casual', 'Elegant', 'Special', 'Sport'];
};

// Get type options based on category and subcategory
export const getTypeOptions = (category: ItemCategory | '', subcategory?: string): string[] => {

  if (category === ItemCategory.OUTERWEAR && subcategory) {
    switch (subcategory.toLowerCase()) {
      case 'jacket':
        return ['Baseball', 'Biker', 'Bomber', 'Puffer', 'Casual', 'Harrington', 'Knitted Poncho', 'Pilot', 'Racer', 'Poncho', 'Winter'];
      case 'coat':
        return ['Duffle', 'Kimono', 'Peacoat', 'Raincoat', 'Winter', 'Wool'];
      default:
        return [];
    }
  }

  if (category === ItemCategory.FOOTWEAR && subcategory) {
    switch (subcategory.toLowerCase()) {
      case 'boots':
        return ['chelsea', 'desert', 'hiking', 'high boots', 'rubber', 'snow', 'ski'];
      case 'formal shoes':
        return ['loafers', 'oxford', 'derby', 'monk strap'];
      default:
        return [];
    }
  }
  
  if (category === ItemCategory.ACCESSORY && subcategory) {
    switch (subcategory.toLowerCase()) {
      case 'bag':
        return ['baguette', 'bucket', 'clutch', 'hobo', 'crossbody', 'tote', 'briefcase', 'satchel', 'messenger'];
      case 'jewelry':
        return ['Bracelet', 'Brooche', 'Cufflinks', 'Earrings', 'Necklace', 'Ring'];
      default:
        return [];
    }
  }
  
  return [];
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
    'collar','scoop', 'v-neck', 'crew', 'boat', 'square', 'sweetheart', 'halter',
    'one shoulder', 'off shoulder', 'turtleneck', 'mock', 'asymmetric',
    'high neck', 'scoop neck', 'deep v', 'jewel', 'plunge',
    'surplice', 'illusion', 'keyhole', 'portrait',
    'queen anne', 'sabrina', 'slash', 'straight', 'wrap',
    'shoulder straps', 'spaghetti straps'
  ];
};

// Heel height options for footwear
export const HEEL_HEIGHT_OPTIONS = ['high', 'middle', 'low', 'no-heels'] as const;
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
      if (subcategory?.toLowerCase() === 'skirt' || subcategory?.toLowerCase() === 'skirts') {
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
      return ['Fitted', 'Loose', 'Regular'];
    case ItemCategory.FOOTWEAR:
    case ItemCategory.ACCESSORY:
    case ItemCategory.OTHER:
      return []; // No silhouette options for these categories
    default:
      return [];
  }
};

// Get color options for all items
export const getColorOptions = (): string[] => {
  return [
    'Black', 'White', 'Grey', 'Navy', 'Blue', 'Light Blue', 'Turquoise', 'Teal',
    'Green', 'Olive', 'Lime', 'Yellow', 'Gold', 'Orange', 'Rust', 'Brown',
    'Tan', 'Beige', 'Cream', 'Ivory', 'Pink', 'Light Pink', 'Hot Pink', 'Red',
    'Burgundy', 'Maroon', 'Purple', 'Lavender', 'Silver', 'Multicolor', 
    'Floral', 'Patterned'
  ];
};

// Get pattern options for all items
export const getPatternOptions = (): string[] => {
  return [
    'Animalistic', 'Camouflage', 'Checked', 'Chevron', 'Floral', 
    'Geometric & Abstract', 'Other', 'Polka Dot', 'Stripe'
  ];
};
