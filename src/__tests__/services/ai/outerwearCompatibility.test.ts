/**
 * Tests for AI-driven outerwear compatibility detection
 * Verifies that the AI correctly identifies real physical/structural conflicts
 * while avoiding false positives on normal clothing combinations
 */

import { isOuterwearCompatible } from '../../../services/ai/wardrobeContextHelpers';
import { WardrobeItem, ItemCategory, Season } from '../../../types';

describe('Outerwear Compatibility Detection', () => {
  const createMockOuterwear = (name: string, subcategory: string): WardrobeItem => ({
    id: 'outerwear-1',
    name,
    category: ItemCategory.OUTERWEAR,
    subcategory,
    color: 'black',
    season: [Season.TRANSITIONAL],
    scenarios: ['office'],
    wishlist: false,
    userId: 'user-1',
    dateAdded: '2024-01-01'
  });

  const createMockTargetItem = (subcategory: string) => ({
    subcategory,
    category: 'top',
    seasons: ['spring/fall']
  });

  describe('No AI incompatibilities detected', () => {
    it('should return true when no AI analysis provided', () => {
      const blazer = createMockOuterwear('Navy Blazer', 'blazer');
      const targetItem = createMockTargetItem('blouse');

      const result = isOuterwearCompatible(blazer, targetItem);
      expect(result).toBe(true);
    });

    it('should return true when AI analysis has no incompatibilities', () => {
      const blazer = createMockOuterwear('Navy Blazer', 'blazer');
      const targetItem = createMockTargetItem('blouse');
      const aiResult = {}; // No incompatibleOuterwear field

      const result = isOuterwearCompatible(blazer, targetItem, aiResult);
      expect(result).toBe(true);
    });

    it('should return true when incompatibilities list is empty', () => {
      const blazer = createMockOuterwear('Navy Blazer', 'blazer');
      const targetItem = createMockTargetItem('blouse');
      const aiResult = { incompatibleOuterwear: [] };

      const result = isOuterwearCompatible(blazer, targetItem, aiResult);
      expect(result).toBe(true);
    });
  });

  describe('AI-detected incompatibilities', () => {
    it('should return false when specific outerwear name is flagged', () => {
      const blazer = createMockOuterwear('Navy Blazer', 'blazer');
      const targetItem = createMockTargetItem('puffy-sleeve-blouse');
      const aiResult = { 
        incompatibleOuterwear: ['Navy Blazer', 'fitted jackets'] 
      };

      const result = isOuterwearCompatible(blazer, targetItem, aiResult);
      expect(result).toBe(false);
    });

    it('should return false when outerwear subcategory is flagged', () => {
      const blazer = createMockOuterwear('Professional Blazer', 'blazer');
      const targetItem = createMockTargetItem('chunky-sweater');
      const aiResult = { 
        incompatibleOuterwear: ['fitted blazers', 'slim jackets'] 
      };

      const result = isOuterwearCompatible(blazer, targetItem, aiResult);
      expect(result).toBe(false);
    });

    it('should return false when partial name match found', () => {
      const jacket = createMockOuterwear('Denim Jacket', 'jacket');
      const targetItem = createMockTargetItem('balloon-sleeve-top');
      const aiResult = { 
        incompatibleOuterwear: ['denim', 'structured coats'] 
      };

      const result = isOuterwearCompatible(jacket, targetItem, aiResult);
      expect(result).toBe(false);
    });

    it('should return true when outerwear not in incompatibility list', () => {
      const cardigan = createMockOuterwear('Wool Cardigan', 'cardigan');
      const targetItem = createMockTargetItem('puffy-sleeve-blouse');
      const aiResult = { 
        incompatibleOuterwear: ['fitted blazers', 'slim jackets'] // cardigan not listed
      };

      const result = isOuterwearCompatible(cardigan, targetItem, aiResult);
      expect(result).toBe(true);
    });
  });

  describe('Edge cases and robustness', () => {
    it('should handle case-insensitive matching', () => {
      const blazer = createMockOuterwear('NAVY BLAZER', 'blazer');
      const targetItem = createMockTargetItem('thick-sweater');
      const aiResult = { 
        incompatibleOuterwear: ['navy blazer'] // lowercase
      };

      const result = isOuterwearCompatible(blazer, targetItem, aiResult);
      expect(result).toBe(false);
    });

    it('should handle missing subcategory gracefully', () => {
      const outerwear = createMockOuterwear('Mysterious Coat', '');
      outerwear.subcategory = undefined; // Remove subcategory
      const targetItem = createMockTargetItem('blouse');
      const aiResult = { 
        incompatibleOuterwear: ['fitted blazers'] 
      };

      const result = isOuterwearCompatible(outerwear, targetItem, aiResult);
      expect(result).toBe(true); // Should not crash
    });

    it('should handle empty strings in incompatibility list', () => {
      const blazer = createMockOuterwear('Navy Blazer', 'blazer');
      const targetItem = createMockTargetItem('blouse');
      const aiResult = { 
        incompatibleOuterwear: ['', 'fitted blazers', ''] 
      };

      const result = isOuterwearCompatible(blazer, targetItem, aiResult);
      expect(result).toBe(false); // Should match 'fitted blazers'
    });
  });

  describe('Real-world scenarios', () => {
    const realWorldScenarios = [
      {
        name: 'Puffy sleeve blouse + fitted blazer',
        outerwear: createMockOuterwear('Slim Blazer', 'blazer'),
        target: createMockTargetItem('puffy-sleeve-blouse'),
        aiIncompatible: ['fitted blazers', 'slim jackets'],
        shouldBeCompatible: false
      },
      {
        name: 'Regular blouse + blazer',
        outerwear: createMockOuterwear('Navy Blazer', 'blazer'),
        target: createMockTargetItem('blouse'),
        aiIncompatible: [], // AI found no issues
        shouldBeCompatible: true
      },
      {
        name: 'Chunky sweater + cardigan',
        outerwear: createMockOuterwear('Open Cardigan', 'cardigan'),
        target: createMockTargetItem('chunky-sweater'),
        aiIncompatible: ['fitted blazers'], // Only blazers flagged, cardigan OK
        shouldBeCompatible: true
      },
      {
        name: 'Turtleneck + crew blazer',
        outerwear: createMockOuterwear('Professional Blazer', 'blazer'),
        target: createMockTargetItem('turtleneck'),
        aiIncompatible: ['crew neck blazers', 'high neckline jackets'],
        shouldBeCompatible: false
      }
    ];

    realWorldScenarios.forEach(({ name, outerwear, target, aiIncompatible, shouldBeCompatible }) => {
      it(`should handle ${name}`, () => {
        const aiResult = { incompatibleOuterwear: aiIncompatible };
        const result = isOuterwearCompatible(outerwear, target, aiResult);
        expect(result).toBe(shouldBeCompatible);
      });
    });
  });
});
