// Single source of truth for wardrobe form options - Server-side version
// This mirrors the TypeScript constants but for Node.js usage

// Master color options - must match src/constants/wardrobeOptions.ts exactly
const COLOR_OPTIONS = [
  'Black', 'White', 'Grey', 'Navy', 'Blue', 'Light Blue', 'Turquoise', 'Teal',
  'Green', 'Olive', 'Lime', 'Yellow', 'Gold', 'Orange', 'Rust', 'Brown',
  'Beige', 'Cream', 'Ivory', 'Pink', 'Light Pink', 'Hot Pink', 'Red',
  'Burgundy', 'Maroon', 'Purple', 'Lavender', 'Silver', 'Multicolor', 
  'Floral', 'Patterned'
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
const COLOR_FAMILIES = {
  blacks: ['Black', 'Grey'],
  whites: ['White', 'Cream', 'Ivory', 'Beige'],
  blues: ['Navy', 'Blue', 'Light Blue', 'Turquoise', 'Teal'],
  greens: ['Green', 'Olive', 'Lime'],
  yellows: ['Yellow', 'Gold'],
  oranges: ['Orange', 'Rust'],
  browns: ['Brown'], // Note: Tan removed
  pinks: ['Pink', 'Light Pink', 'Hot Pink'],
  reds: ['Red', 'Burgundy', 'Maroon'],
  purples: ['Purple', 'Lavender']
};

// Silhouette families for duplicate detection
const SILHOUETTE_FAMILIES = {
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
