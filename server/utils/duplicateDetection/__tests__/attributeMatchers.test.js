const {
  colorsMatch,
  silhouettesMatch,
  patternMatches,
  simpleMatch
} = require('../attributeMatchers');

describe('attributeMatchers', () => {
  describe('colorsMatch', () => {
    test('should match exact colors (case insensitive)', () => {
      expect(colorsMatch('Black', 'black')).toBe(true);
      expect(colorsMatch('Navy', 'NAVY')).toBe(true);
    });

    test('should match colors within same family', () => {
      expect(colorsMatch('White', 'Cream')).toBe(true);
      expect(colorsMatch('Cream', 'Beige')).toBe(true);
      expect(colorsMatch('Navy', 'Blue')).toBe(true);
      expect(colorsMatch('Blue', 'Light Blue')).toBe(true);
      expect(colorsMatch('Red', 'Burgundy')).toBe(true);
    });

    test('should not match different color families', () => {
      expect(colorsMatch('Black', 'White')).toBe(false);
      expect(colorsMatch('Red', 'Blue')).toBe(false);
      expect(colorsMatch('Black', 'Grey')).toBe(false); // Important: Black ≠ Grey
    });

    test('should handle null/undefined values', () => {
      expect(colorsMatch(null, 'Black')).toBe(false);
      expect(colorsMatch('Black', undefined)).toBe(false);
      expect(colorsMatch('', 'Black')).toBe(false);
    });
  });

  describe('silhouettesMatch', () => {
    test('should match exact silhouettes', () => {
      expect(silhouettesMatch('Fitted', 'Fitted')).toBe(true);
      expect(silhouettesMatch('Regular', 'regular')).toBe(true);
    });

    test('should match Fitted and Regular for t-shirts', () => {
      expect(silhouettesMatch('Fitted', 'Regular', 'top', 't-shirt')).toBe(true);
      expect(silhouettesMatch('Regular', 'Fitted', 'TOP', 'T-SHIRT')).toBe(true);
    });

    test('should match Fitted and Regular for tank tops', () => {
      expect(silhouettesMatch('Fitted', 'Regular', 'top', 'tank top')).toBe(true);
    });

    test('should NOT match Fitted and Regular for other items', () => {
      expect(silhouettesMatch('Fitted', 'Regular', 'top', 'blouse')).toBe(false);
      expect(silhouettesMatch('Fitted', 'Regular', 'bottom', 'jeans')).toBe(false);
      expect(silhouettesMatch('Fitted', 'Regular', 'dress', 'midi')).toBe(false);
    });

    test('should match silhouette families', () => {
      expect(silhouettesMatch('Skinny', 'Slim Fit', 'bottom', 'jeans')).toBe(true);
      expect(silhouettesMatch('Wide Leg', 'Relaxed Fit', 'bottom', 'pants')).toBe(true);
      expect(silhouettesMatch('Straight', 'Regular Fit', 'bottom', 'pants')).toBe(true);
    });

    test('should handle null/undefined values', () => {
      expect(silhouettesMatch(null, 'Fitted')).toBe(false);
      expect(silhouettesMatch('Fitted', undefined)).toBe(false);
    });
  });

  describe('patternMatches', () => {
    test('should match exact patterns', () => {
      expect(patternMatches('Striped', 'striped')).toBe(true);
      expect(patternMatches('Floral', 'FLORAL')).toBe(true);
    });

    test('should treat empty, solid, and plain as equivalent', () => {
      expect(patternMatches('', 'solid')).toBe(true);
      expect(patternMatches('solid', 'plain')).toBe(true);
      expect(patternMatches('plain', '')).toBe(true);
      expect(patternMatches('SOLID', 'Plain')).toBe(true);
    });

    test('should not match different patterns', () => {
      expect(patternMatches('Striped', 'Floral')).toBe(false);
      expect(patternMatches('solid', 'Striped')).toBe(false);
    });

    test('should handle null/undefined values', () => {
      expect(patternMatches(null, 'Striped')).toBe(false);
      expect(patternMatches('Striped', undefined)).toBe(false);
    });
  });

  describe('simpleMatch', () => {
    test('should match case insensitive strings', () => {
      expect(simpleMatch('Casual', 'casual')).toBe(true);
      expect(simpleMatch('FORMAL', 'formal')).toBe(true);
    });

    test('should not match different strings', () => {
      expect(simpleMatch('Casual', 'Formal')).toBe(false);
    });

    test('should handle null/undefined values', () => {
      expect(simpleMatch(null, 'Casual')).toBe(false);
      expect(simpleMatch('Casual', undefined)).toBe(false);
      expect(simpleMatch('', 'Casual')).toBe(false);
    });
  });
});
