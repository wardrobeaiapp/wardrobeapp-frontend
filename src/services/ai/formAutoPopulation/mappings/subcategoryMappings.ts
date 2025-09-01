import { ItemCategory } from '../../../../types';

// Define subcategories for each main category
const SUBCATEGORIES_BY_CATEGORY: Record<ItemCategory, string[]> = {
  [ItemCategory.TOP]: [
    'T-Shirt',
    'Blouse',
    'Button-Down Shirt',
    'Tank Top',
    'Sweater',
    'Cardigan',
    'Sweatshirt',
    'Hoodie',
    'Turtleneck',
    'Crop Top',
    'Polo Shirt',
    'Tunic',
    'Halter Top',
    'Vest'
  ],
  [ItemCategory.BOTTOM]: [
    'Jeans',
    'Dress Pants',
    'Skirt',
    'Shorts',
    'Leggings',
    'Joggers',
    'Chinos',
    'Culottes',
    'Cargo Pants',
    'Palazzo Pants',
    'Wide-Leg Pants',
    'Corduroy Pants',
    'Khakis'
  ],
  [ItemCategory.ONE_PIECE]: [
    'Dress',
    'Jumpsuit',
    'Romper',
    'Overalls',
    'Maxi Dress',
    'Midi Dress',
    'Mini Dress',
    'Shirt Dress',
    'Wrap Dress',
    'Cocktail Dress',
    'Formal Gown'
  ],
  [ItemCategory.OUTERWEAR]: [
    'Jacket',
    'Coat',
    'Blazer',
    'Trench Coat',
    'Parka',
    'Raincoat',
    'Windbreaker',
    'Puffer Jacket',
    'Denim Jacket',
    'Leather Jacket',
    'Peacoat',
    'Bomber Jacket',
    'Cardigan',
    'Cape',
    'Poncho'
  ],
  [ItemCategory.FOOTWEAR]: [
    'Sneakers',
    'Boots',
    'Sandals',
    'Heels',
    'Flats',
    'Loafers',
    'Oxford Shoes',
    'Mules',
    'Espadrilles',
    'Ankle Boots',
    'Chelsea Boots',
    'Combat Boots',
    'Knee-High Boots',
    'Wedges',
    'Pumps',
    'Slippers',
    'Flip-Flops'
  ],
  [ItemCategory.ACCESSORY]: [
    'Handbag',
    'Backpack',
    'Tote',
    'Clutch',
    'Wallet',
    'Belt',
    'Scarf',
    'Hat',
    'Beanie',
    'Cap',
    'Gloves',
    'Sunglasses',
    'Jewelry',
    'Watch',
    'Tie',
    'Bow Tie',
    'Socks',
    'Tights'
  ],
  [ItemCategory.OTHER]: [
    'Undergarment',
    'Sleepwear',
    'Swimwear',
    'Activewear',
    'Costume',
    'Uniform',
    'Specialty Item',
    'Pajamas',
    'Lingerie',
    'Swimsuit',
    'Workout Gear',
    'Sports Equipment',
    'Miscellaneous'
  ],
};

/**
 * Get all valid subcategories for a specific category
 * @param category The main item category
 * @returns Array of valid subcategories for the specified category
 */
export function getSubcategoriesForCategory(category: ItemCategory): string[] {
  return SUBCATEGORIES_BY_CATEGORY[category] || [];
}
