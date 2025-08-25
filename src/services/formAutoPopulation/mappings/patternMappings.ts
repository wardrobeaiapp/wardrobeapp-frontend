/**
 * Maps pattern keywords to standardized pattern options
 */
export const patternMappings: Record<string, string> = {
  // Animal patterns
  'animal': 'Animalistic',
  'leopard': 'Animalistic',
  'zebra': 'Animalistic',
  'snake': 'Animalistic',
  'crocodile': 'Animalistic',
  'tiger': 'Animalistic',
  'giraffe': 'Animalistic',
  
  // Checked patterns
  'check': 'Checked',
  'plaid': 'Checked',
  'tartan': 'Checked',
  'gingham': 'Checked',
  'houndstooth': 'Checked',
  
  // Dots
  'dot': 'Polka Dot',
  'polka': 'Polka Dot',
  'spot': 'Polka Dot',
  
  // Floral
  'floral': 'Floral',
  'flower': 'Floral',
  'botanical': 'Floral',
  
  // Stripes
  'stripe': 'Stripe',
  'lined': 'Stripe',
  'pinstripe': 'Stripe',
  
  // Geometric
  'geometric': 'Geometric & Abstract',
  'abstract': 'Geometric & Abstract',
  'diamond': 'Geometric & Abstract',
  'triangle': 'Geometric & Abstract',
  
  // Camouflage
  'camo': 'Camouflage',
  'camouflage': 'Camouflage',
  'military': 'Camouflage',
  
  // Chevron
  'chevron': 'Chevron',
  'zigzag': 'Chevron',
  'herringbone': 'Chevron'
};

/**
 * Gets standard pattern options for dropdowns
 */
export function getPatternOptions(): string[] {
  return [
    'Solid',
    'Stripe',
    'Checked',
    'Polka Dot',
    'Floral',
    'Geometric & Abstract',
    'Animalistic',
    'Camouflage',
    'Tie-Dye',
    'Chevron',
    'Other'
  ];
}
