// Single source of truth for wardrobe form options
// This should be the ONLY place where these options are defined

// Master color options - used by all services
export const COLOR_OPTIONS = [
  'Black', 'White', 'Grey', 'Navy', 'Blue', 'Light Blue', 'Turquoise',
  'Green', 'Yellow', 'Gold', 'Orange', 'Brown', 'Beige', 'Cream', 'Pink', 
  'Red', 'Burgundy', 'Purple', 'Silver', 'Multicolor', 'Patterned'
] as const;

export const STYLE_OPTIONS = ['Casual', 'Elegant', 'Special', 'Sport'] as const;

export const SILHOUETTE_OPTIONS = {
  TOP: ['Fitted', 'Loose', 'Regular'],
  BOTTOM: ['Skinny', 'Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Wide Leg', 'Straight', 'Bootcut', 'Flared'],
  ONE_PIECE: ['A-Line', 'Balloon', 'Mermaid', 'Pencil', 'Straight', 'Pleated', 'Tiered', 'Wrap', 'Slim Fit', 'Regular Fit', 'Relaxed Fit'],
  OUTERWEAR: ['Fitted', 'Loose', 'Regular'],
  FOOTWEAR: [],
  ACCESSORY: [],
  OTHER: []
} as const;

// Color families for duplicate detection - based on master COLOR_OPTIONS
export const COLOR_FAMILIES = {
  blacks: ['Black', 'Grey'],
  whites: ['White', 'Cream', 'Beige'],
  blues: ['Navy', 'Blue', 'Light Blue', 'Turquoise'],
  greens: ['Green'],
  yellows: ['Yellow', 'Gold'],
  oranges: ['Orange'],
  browns: ['Brown'],
  pinks: ['Pink'],
  reds: ['Red', 'Burgundy'],
  purples: ['Purple']
} as const;

// Silhouette families for duplicate detection
export const SILHOUETTE_FAMILIES = {
  fitted_group: ['Fitted'],
  loose_group: ['Loose'],
  regular_group: ['Regular'],
  tight_group: ['Skinny', 'Slim Fit'],
  straight_group: ['Straight', 'Regular Fit'],
  wide_group: ['Wide Leg', 'Relaxed Fit', 'Flared', 'Bootcut'],
  structured_group: ['Pencil', 'Straight'],
  flowing_group: ['A-Line', 'Pleated', 'Tiered'],
  fitted_dress_group: ['Mermaid'],
  casual_group: ['Wrap', 'Balloon']
} as const;

// Helper function to get silhouette options for a category
export function getSilhouetteOptionsForCategory(category: string): string[] {
  const categoryKey = category.toUpperCase() as keyof typeof SILHOUETTE_OPTIONS;
  return [...(SILHOUETTE_OPTIONS[categoryKey] || [])];
}

// Color terms for extraction (lowercase versions for detection)
export const COLOR_EXTRACTION_TERMS = [
  'black', 'white', 'blue', 'red', 'green', 'yellow', 'orange', 'purple', 'pink',
  'brown', 'gray', 'grey', 'beige', 'navy', 'teal', 'maroon', 'olive', 'gold',
  'silver', 'burgundy'
] as const;

export type ColorOption = typeof COLOR_OPTIONS[number];
export type StyleOption = typeof STYLE_OPTIONS[number];
export type SilhouetteOption = typeof SILHOUETTE_OPTIONS[keyof typeof SILHOUETTE_OPTIONS][number];
