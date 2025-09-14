// Styling context configuration for different subcategories
export const stylingRules: Record<string, {
  accessories?: string[];
  tops?: string[];
}> = {
  't-shirt': {
    tops: ['cardigan', 'blazer', 'vest']
  },
  'shirt': {
    accessories: ['scarf', 'belt', 'bag', 'jewelry', 'watch'],
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
    tops: ['t-shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt', 'cardigan']
  },
  'sweatpants': {
    accessories: ['bag'],
    tops: ['t-shirt', 'shirt', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt']
  },
  'dress': {
    accessories: ['bag', 'ties', 'belt', 'jewelry', 'watch'],
    tops: ['sweater', 'blazer', 'vest', 'cardigan']
  },
  'jumpsuit': {
    accessories: ['bag', 'belt', 'jewelry', 'watch'],
    tops: ['sweater', 'blazer', 'cardigan']
  },
  'romper': {
    accessories: ['bag', 'jewelry', 'hat', 'sunglasses'],
    tops: ['sweater', 'blazer', 'cardigan']
  },
  'overall': {
    accessories: ['bag', 'jewelry', 'hat', 'sunglasses'],
    tops: ['t-shirt', 'shirt', 'top', 'tank top', 'sweater']
  },
  'coat': { 
    accessories: ['bag', 'hat','scarf'],
    tops: ['sweater', 'blazer', 'cardigan', 'hoodie', 'sweatshirt', 'vest', 'shirt', 'blouse']
  },
  'jacket': { 
    accessories: ['bag', 'scarf'],
    tops: ['t-shirt', 'shirt', 'blouse', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'vest']
  },
  'parka': { 
    accessories: ['bag', 'scarf', 'hat',],
    tops: ['sweater', 'cardigan', 'hoodie', 'sweatshirt', 'vest', 'shirt', 'blouse']
  },
  'trench coat': { 
    accessories: ['bag'],
    tops: ['sweater', 'cardigan', 'hoodie', 'sweatshirt', 'vest', 'shirt', 'blouse']
  },
  'windbreaker': { 
    accessories: ['bag'],
    tops: ['t-shirt', 'top', 'tank top', 'sweater', 'hoodie', 'sweatshirt',]
  },
};
