/**
 * Standard color options for wardrobe items
 */
export const COLOR_OPTIONS = [
  'Black',
  'White',
  'Gray',
  'Beige',
  'Brown',
  'Navy',
  'Blue',
  'Light Blue',
  'Teal',
  'Green',
  'Olive',
  'Yellow',
  'Gold',
  'Orange',
  'Rust',
  'Red',
  'Burgundy',
  'Pink',
  'Purple',
  'Lavender',
  'Silver',
  'Multicolor',
  'Print',
  'Other'
];

/**
 * Mapping of color keywords to standard color options
 */
const COLOR_KEYWORD_MAPPING: Record<string, string> = {
  // Black
  'black': 'Black',
  'jet black': 'Black',
  'coal': 'Black',
  'ebony': 'Black',
  'onyx': 'Black',
  'midnight': 'Black',
  
  // White
  'white': 'White',
  'snow': 'White',
  'ivory': 'White',
  'cream': 'White',
  'off-white': 'White',
  'eggshell': 'White',
  'pearl': 'White',
  
  // Gray
  'gray': 'Gray',
  'grey': 'Gray',
  'slate': 'Gray',
  'charcoal': 'Gray',
  'silver gray': 'Gray',
  'ash': 'Gray',
  'pewter': 'Gray',
  'stone': 'Gray',
  'smoke': 'Gray',
  
  // Beige
  'beige': 'Beige',
  'tan': 'Beige',
  'khaki': 'Beige',
  'sand': 'Beige',
  'nude': 'Beige',
  'oatmeal': 'Beige',
  'taupe': 'Beige',
  'ecru': 'Beige',
  'fawn': 'Beige',
  'buff': 'Beige',
  
  // Brown
  'brown': 'Brown',
  'chocolate': 'Brown',
  'coffee': 'Brown',
  'mocha': 'Brown',
  'espresso': 'Brown',
  'brunette': 'Brown',
  'umber': 'Brown',
  'caramel': 'Brown',
  'cognac': 'Brown',
  'sienna': 'Brown',
  'chestnut': 'Brown',
  'mahogany': 'Brown',
  'copper': 'Brown',
  'bronze': 'Brown',
  
  // Navy
  'navy': 'Navy',
  'navy blue': 'Navy',
  'midnight blue': 'Navy',
  'dark blue': 'Navy',
  'nautical': 'Navy',
  'marine': 'Navy',
  
  // Blue
  'blue': 'Blue',
  'sky blue': 'Light Blue',
  'sky': 'Light Blue',
  'azure': 'Light Blue',
  'cobalt': 'Blue',
  'royal blue': 'Blue',
  'denim': 'Blue',
  'baby blue': 'Light Blue',
  'cornflower': 'Light Blue',
  'cerulean': 'Blue',
  'powder blue': 'Light Blue',
  'turquoise': 'Teal',
  'aqua': 'Teal',
  'cyan': 'Teal',
  'light blue': 'Light Blue',
  'periwinkle blue': 'Light Blue',
  'pastel blue': 'Light Blue',
  
  // Teal
  'teal': 'Teal',
  'aquamarine': 'Teal',
  'seafoam': 'Teal',
  'mint': 'Teal',
  
  // Green
  'green': 'Green',
  'emerald': 'Green',
  'jade': 'Green',
  'forest green': 'Green',
  'lime': 'Green',
  'sage': 'Green',
  'olive green': 'Olive',
  'army green': 'Olive',
  'moss': 'Green',
  'kelly green': 'Green',
  'hunter green': 'Green',
  'olive': 'Olive',
  'chartreuse': 'Green',
  'avocado': 'Olive',
  'khaki green': 'Olive',
  
  // Yellow
  'yellow': 'Yellow',
  'lemon': 'Yellow',
  'mustard': 'Yellow',
  'canary': 'Yellow',
  'gold': 'Gold',
  'golden': 'Gold',
  'amber': 'Yellow',
  'honey': 'Gold',
  'dijon': 'Yellow',
  
  // Orange
  'orange': 'Orange',
  'tangerine': 'Orange',
  'peach': 'Orange',
  'coral': 'Orange',
  'apricot': 'Orange',
  'rust': 'Rust',
  'terracotta': 'Rust',
  'ginger': 'Orange',
  'cinnamon': 'Rust',
  'burnt orange': 'Rust',
  'pumpkin': 'Orange',
  
  // Red
  'red': 'Red',
  'ruby': 'Red',
  'crimson': 'Red',
  'scarlet': 'Red',
  'cherry': 'Red',
  'wine': 'Burgundy',
  'maroon': 'Burgundy',
  'burgundy': 'Burgundy',
  'garnet': 'Burgundy',
  'brick': 'Red',
  'tomato': 'Red',
  'cardinal': 'Red',
  'vermilion': 'Red',
  'berry': 'Burgundy',
  'blood red': 'Red',
  'merlot': 'Burgundy',
  
  // Pink
  'pink': 'Pink',
  'rose': 'Pink',
  'blush': 'Pink',
  'salmon': 'Pink',
  'fuchsia': 'Pink',
  'magenta': 'Pink',
  'flamingo': 'Pink',
  'bubblegum': 'Pink',
  'watermelon': 'Pink',
  'hot pink': 'Pink',
  'pastel pink': 'Pink',
  
  // Purple
  'purple': 'Purple',
  'violet': 'Purple',
  'lavender': 'Lavender',
  'lilac': 'Lavender',
  'mauve': 'Lavender',
  'amethyst': 'Purple',
  'plum': 'Purple',
  'grape': 'Purple',
  'periwinkle': 'Lavender',
  'indigo': 'Purple',
  'orchid': 'Purple',
  
  // Silver
  'silver': 'Silver',
  'metallic': 'Silver',
  'chrome': 'Silver',
  'platinum': 'Silver',
  
  // Special cases
  'multicolor': 'Multicolor',
  'multi-color': 'Multicolor',
  'multicolored': 'Multicolor',
  'multi-colored': 'Multicolor',
  'colorful': 'Multicolor',
  'rainbow': 'Multicolor',
  'tie-dye': 'Multicolor',
  'print': 'Print',
  'patterned': 'Print',
  'floral': 'Print',
  'graphic': 'Print',
  'striped': 'Print',
  'checked': 'Print',
};

/**
 * Get the list of all available color options
 * @returns Array of color options
 */
export function getColorOptions(): string[] {
  return COLOR_OPTIONS;
}

/**
 * Map a color keyword to a standard color option
 * @param keyword The color keyword to map
 * @returns The mapped standard color or the original keyword if no mapping exists
 */
export function mapColorKeyword(keyword: string): string {
  if (!keyword) return '';
  
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Check direct mapping
  if (normalizedKeyword in COLOR_KEYWORD_MAPPING) {
    return COLOR_KEYWORD_MAPPING[normalizedKeyword];
  }
  
  // Check if the keyword contains any of our mappable terms
  for (const [key, value] of Object.entries(COLOR_KEYWORD_MAPPING)) {
    if (normalizedKeyword.includes(key)) {
      return value;
    }
  }
  
  // Return original if no mapping found
  return keyword;
}

/**
 * Check if a color is valid from our predefined options
 * @param color The color to check
 * @returns Whether the color is in our predefined options
 */
export function isValidColor(color: string): boolean {
  if (!color) return false;
  return COLOR_OPTIONS.some(option => option.toLowerCase() === color.toLowerCase());
}
