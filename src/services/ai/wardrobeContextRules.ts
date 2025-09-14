// Styling context configuration for different subcategories
export const stylingRules: Record<string, {
  accessories?: string[];
  tops?: string[];
}> = {
  't-shirt': {
    tops: ['cardigan', 'blazer', 'vest']
  },
  'shirt': {
    accessories: ['scarf', 'belt', 'bag', 'jewelry', 'watch', 'ties'],
    tops: ['cardigan', 'blazer', 'vest']
  },
  'blouse': {
    accessories: ['scarf', 'belt', 'bag', 'jewelry', 'watch'],
    tops: ['cardigan', 'blazer']
  },
  'top': {
    accessories: ['hat', 'bag', 'jewelry', 'sunglasses'],
    tops: ['cardigan', 'blazer']
  },
  'tank top': {
    accessories: ['hat', 'bag', 'jewelry', 'sunglasses'],
    tops: ['cardigan', 'blazer']
  },
  'sweater': {
    accessories: ['scarf', 'belt', 'bag', 'jewelry', 'watch']
  },
  'hoodie': {
    accessories: ['bag', 'hat', 'sunglasses']
  },
  'sweatshirt': {
    accessories: ['bag', 'hat', 'sunglasses']
  },
  'cardigan': {
    accessories: ['belt', 'bag', 'jewelry', 'watch'],
    tops: ['t-shirt', 'shirt', 'blouse', 'top', 'tank top']
  },
  'blazer': {
    accessories: ['belt', 'bag', 'jewelry', 'watch'],
    tops: ['t-shirt', 'shirt', 'blouse', 'top', 'tank top']
  },
  'vest': {
    accessories: ['belt', 'bag', 'jewelry', 'watch'],
    tops: ['t-shirt', 'shirt', 'blouse', 'top', 'tank top']
  },
  'jeans': {
    accessories: ['belt', 'bag'],
  },
  'trousers': {
    accessories: ['belt', 'bag'],
  },
  'shorts': {
    accessories: ['belt', 'bag'],
  },
  'skirt': {
    accessories: ['belt', 'bag', 'ties'],
  },
  'leggings': {
    accessories: ['bag'],
    tops: ['t-Shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt', 'cardigan']
  },
  'sweatpants': {
    accessories: ['bag'],
    tops: ['t-Shirt', 'shirt', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt']
  },
};
