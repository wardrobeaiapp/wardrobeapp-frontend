// Single source of truth for wardrobe form options - Server-side version
// This mirrors the TypeScript constants but for Node.js usage

// Master color options - must match src/constants/wardrobeOptions.ts exactly
const COLOR_OPTIONS = [
  'Black', 'White', 'Grey', 'Navy', 'Blue', 'Light Blue', 'Turquoise',
  'Green', 'Khaki', 'Yellow', 'Gold', 'Orange', 'Brown', 'Beige', 'Cream', 'Pink', 
  'Red', 'Burgundy', 'Purple', 'Silver', 'Multicolor', 'Patterned'
];

const STYLE_OPTIONS = ['Casual', 'Elegant', 'Special', 'Sport'];

const SILHOUETTE_OPTIONS = {
  TOP: ['Fitted', 'Loose', 'Regular'],
  BOTTOM: ['Skinny', 'Slim Fit', 'Regular Fit', 'Relaxed Fit', 'Wide Leg', 'Straight', 'Bootcut', 'Flared'],
  ONE_PIECE: ['A-Line', 'Balloon', 'Mermaid', 'Pencil', 'Straight', 'Pleated', 'Tiered', 'Wrap', 'Slim Fit', 'Regular Fit', 'Relaxed Fit'],
  OUTERWEAR: ['Fitted', 'Loose', 'Regular'],
  FOOTWEAR: [],
  ACCESSORY: [],
  OTHER: []
};

// Color families for duplicate detection
// Note: Keep families narrow for duplicate detection - Black and Grey are different enough
const COLOR_FAMILIES = {
  blacks: ['Black'],
  greys: ['Grey'],
  whites: ['White', 'Cream', 'Beige'],
  blues: ['Navy', 'Blue', 'Light Blue', 'Turquoise'],
  greens: ['Green'],
  yellows: ['Yellow', 'Gold'],
  oranges: ['Orange'],
  browns: ['Brown'],
  pinks: ['Pink'],
  reds: ['Red', 'Burgundy'],
  purples: ['Purple']
};

// Silhouette families for duplicate detection
const SILHOUETTE_FAMILIES = {
  fitted_group: ['Fitted'],
  regular_group: ['Regular'],
  loose_group: ['Loose'],
  tight_group: ['Skinny', 'Slim Fit'],
  straight_group: ['Straight', 'Regular Fit'],
  wide_group: ['Wide Leg', 'Relaxed Fit', 'Flared', 'Bootcut'],
  structured_group: ['Pencil', 'Straight'],
  flowing_group: ['A-Line', 'Pleated', 'Tiered'],
  fitted_dress_group: ['Mermaid'],
  casual_group: ['Wrap', 'Balloon']
};

// Helper function
function getSilhouetteOptionsForCategory(category) {
  const categoryKey = category.toUpperCase();
  return [...(SILHOUETTE_OPTIONS[categoryKey] || [])];
}

module.exports = {
  COLOR_OPTIONS,
  STYLE_OPTIONS,
  SILHOUETTE_OPTIONS,
  COLOR_FAMILIES,
  SILHOUETTE_FAMILIES,
  getSilhouetteOptionsForCategory
};
