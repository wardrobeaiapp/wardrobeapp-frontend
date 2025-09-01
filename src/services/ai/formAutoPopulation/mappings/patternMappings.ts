/**
 * Standard pattern options for wardrobe items
 */
export const PATTERN_OPTIONS = [
  'Solid',
  'Striped',
  'Checkered',
  'Plaid',
  'Floral',
  'Polka Dot',
  'Geometric',
  'Animal Print',
  'Camouflage',
  'Tie-Dye',
  'Graphic',
  'Paisley',
  'Herringbone',
  'Houndstooth',
  'Argyle',
  'Abstract',
  'Tropical',
  'Other'
];

/**
 * Mapping of pattern keywords to standard pattern options
 */
const PATTERN_KEYWORD_MAPPING: Record<string, string> = {
  // Solid
  'solid': 'Solid',
  'plain': 'Solid',
  'block color': 'Solid',
  'single color': 'Solid',
  'monochrome': 'Solid',
  'uniform': 'Solid',
  
  // Striped
  'stripe': 'Striped',
  'striped': 'Striped',
  'stripes': 'Striped',
  'pinstripe': 'Striped',
  'vertical stripe': 'Striped',
  'horizontal stripe': 'Striped',
  'barcode': 'Striped',
  'lined': 'Striped',
  
  // Checkered
  'check': 'Checkered',
  'checked': 'Checkered',
  'checkerboard': 'Checkered',
  'gingham': 'Checkered',
  'squares': 'Checkered',
  
  // Plaid
  'plaid': 'Plaid',
  'tartan': 'Plaid',
  'flannel': 'Plaid',
  'glen plaid': 'Plaid',
  'check pattern': 'Plaid',
  'windowpane': 'Plaid',
  
  // Floral
  'floral': 'Floral',
  'flower': 'Floral',
  'flowers': 'Floral',
  'roses': 'Floral',
  'daisy': 'Floral',
  'botanical': 'Floral',
  'bloom': 'Floral',
  'garden': 'Floral',
  
  // Polka Dot
  'polka dot': 'Polka Dot',
  'dot': 'Polka Dot',
  'dots': 'Polka Dot',
  'spotted': 'Polka Dot',
  'spotty': 'Polka Dot',
  'dotted': 'Polka Dot',
  
  // Geometric
  'geometric': 'Geometric',
  'triangle': 'Geometric',
  'diamond': 'Geometric',
  'hexagon': 'Geometric',
  'circle': 'Geometric',
  'cube': 'Geometric',
  'shapes': 'Geometric',
  'pattern': 'Geometric',
  
  // Animal Print
  'animal': 'Animal Print',
  'animal print': 'Animal Print',
  'leopard': 'Animal Print',
  'zebra': 'Animal Print',
  'tiger': 'Animal Print',
  'cheetah': 'Animal Print',
  'snake': 'Animal Print',
  'snakeskin': 'Animal Print',
  'crocodile': 'Animal Print',
  'croc': 'Animal Print',
  'alligator': 'Animal Print',
  'giraffe': 'Animal Print',
  'cow': 'Animal Print',
  
  // Camouflage
  'camo': 'Camouflage',
  'camouflage': 'Camouflage',
  'army': 'Camouflage',
  'military': 'Camouflage',
  'digital camo': 'Camouflage',
  
  // Tie-Dye
  'tie dye': 'Tie-Dye',
  'tie-dye': 'Tie-Dye',
  'tiedye': 'Tie-Dye',
  'dip dye': 'Tie-Dye',
  'psychedelic': 'Tie-Dye',
  'rainbow swirl': 'Tie-Dye',
  
  // Graphic
  'graphic': 'Graphic',
  'print': 'Graphic',
  'logo': 'Graphic',
  'text': 'Graphic',
  'slogan': 'Graphic',
  'illustrated': 'Graphic',
  'cartoon': 'Graphic',
  'drawing': 'Graphic',
  'picture': 'Graphic',
  'artwork': 'Graphic',
  'photo': 'Graphic',
  'image': 'Graphic',
  
  // Paisley
  'paisley': 'Paisley',
  'teardrop': 'Paisley',
  'persian': 'Paisley',
  'bandana': 'Paisley',
  
  // Herringbone
  'herringbone': 'Herringbone',
  'chevron': 'Herringbone',
  'zigzag': 'Herringbone',
  'fishbone': 'Herringbone',
  
  // Houndstooth
  'houndstooth': 'Houndstooth',
  'dogstooth': 'Houndstooth',
  'pied-de-poule': 'Houndstooth',
  
  // Argyle
  'argyle': 'Argyle',
  'diamond pattern': 'Argyle',
  'diamond check': 'Argyle',
  'scottish': 'Argyle',
  
  // Abstract
  'abstract': 'Abstract',
  'modern': 'Abstract',
  'contemporary': 'Abstract',
  'artistic': 'Abstract',
  'random': 'Abstract',
  'splatter': 'Abstract',
  'marbled': 'Abstract',
  
  // Tropical
  'tropical': 'Tropical',
  'palm': 'Tropical',
  'hawaiian': 'Tropical',
  'palm tree': 'Tropical',
  'beach': 'Tropical',
  'exotic': 'Tropical',
  'jungle': 'Tropical',
  'island': 'Tropical',
  'flamingo': 'Tropical',
  'pineapple': 'Tropical',
};

/**
 * Get the list of all available pattern options
 * @returns Array of pattern options
 */
export function getPatternOptions(): string[] {
  return PATTERN_OPTIONS;
}

/**
 * Map a pattern keyword to a standard pattern option
 * @param keyword The pattern keyword to map
 * @returns The mapped standard pattern or the original keyword if no mapping exists
 */
export function mapPatternKeyword(keyword: string): string {
  if (!keyword) return '';
  
  const normalizedKeyword = keyword.toLowerCase().trim();
  
  // Check direct mapping
  if (normalizedKeyword in PATTERN_KEYWORD_MAPPING) {
    return PATTERN_KEYWORD_MAPPING[normalizedKeyword];
  }
  
  // Check if the keyword contains any of our mappable terms
  for (const [key, value] of Object.entries(PATTERN_KEYWORD_MAPPING)) {
    if (normalizedKeyword.includes(key)) {
      return value;
    }
  }
  
  // Return original if no mapping found
  return keyword;
}

/**
 * Check if a pattern is valid from our predefined options
 * @param pattern The pattern to check
 * @returns Whether the pattern is in our predefined options
 */
export function isValidPattern(pattern: string): boolean {
  if (!pattern) return false;
  return PATTERN_OPTIONS.some(option => option.toLowerCase() === pattern.toLowerCase());
}
