import { getFieldVisibility } from '../../components/features/wardrobe/forms/WardrobeItemForm/utils/fieldVisibility';
import { ItemCategory } from '../../types';

describe('getFieldVisibility Utility', () => {
  describe('🔍 Silhouette Field Visibility', () => {
    it('should show silhouette for TOP category items', () => {
      const result = getFieldVisibility(ItemCategory.TOP, 'shirt');
      expect(result.shouldShowSilhouette).toBe(true);
    });

    it('should show silhouette for BOTTOM category items except leggings', () => {
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'jeans').shouldShowSilhouette).toBe(true);
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'skirt').shouldShowSilhouette).toBe(true);
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'leggings').shouldShowSilhouette).toBe(false);
    });

    it('should show silhouette for ONE_PIECE category items', () => {
      const result = getFieldVisibility(ItemCategory.ONE_PIECE, 'dress');
      expect(result.shouldShowSilhouette).toBe(true);
    });

    it('should NOT show silhouette for ACCESSORY, FOOTWEAR, OTHER categories', () => {
      expect(getFieldVisibility(ItemCategory.ACCESSORY, 'bag').shouldShowSilhouette).toBe(false);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'boots').shouldShowSilhouette).toBe(false);
      expect(getFieldVisibility(ItemCategory.OTHER, 'miscellaneous').shouldShowSilhouette).toBe(false);
    });

    it('should NOT show silhouette when category is empty', () => {
      const result = getFieldVisibility('', 'shirt');
      expect(result.shouldShowSilhouette).toBe(false);
    });
  });

  describe('📏 Length Field Visibility', () => {
    it('should show length for specific BOTTOM subcategories', () => {
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'jeans').shouldShowLength).toBe(true);
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'trousers').shouldShowLength).toBe(true);
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'shorts').shouldShowLength).toBe(true);
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'skirt').shouldShowLength).toBe(true);
    });

    it('should show length for dresses in ONE_PIECE category', () => {
      const result = getFieldVisibility(ItemCategory.ONE_PIECE, 'dress');
      expect(result.shouldShowLength).toBe(true);
    });

    it('should show length for OUTERWEAR category', () => {
      expect(getFieldVisibility(ItemCategory.OUTERWEAR, 'coat').shouldShowLength).toBe(true);
      expect(getFieldVisibility(ItemCategory.OUTERWEAR, 'jacket').shouldShowLength).toBe(true);
    });

    it('should NOT show length for non-matching subcategories', () => {
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'leggings').shouldShowLength).toBe(false);
      expect(getFieldVisibility(ItemCategory.ONE_PIECE, 'jumpsuit').shouldShowLength).toBe(false);
      expect(getFieldVisibility(ItemCategory.TOP, 'shirt').shouldShowLength).toBe(false);
    });
  });

  describe('👔 Sleeves Field Visibility', () => {
    it('should show sleeves for specific TOP subcategories', () => {
      expect(getFieldVisibility(ItemCategory.TOP, 't-shirt').shouldShowSleeves).toBe(true);
      expect(getFieldVisibility(ItemCategory.TOP, 'shirt').shouldShowSleeves).toBe(true);
      expect(getFieldVisibility(ItemCategory.TOP, 'blouse').shouldShowSleeves).toBe(true);
      expect(getFieldVisibility(ItemCategory.TOP, 'sweater').shouldShowSleeves).toBe(true);
      expect(getFieldVisibility(ItemCategory.TOP, 'cardigan').shouldShowSleeves).toBe(true);
    });

    it('should show sleeves for ONE_PIECE except overalls', () => {
      expect(getFieldVisibility(ItemCategory.ONE_PIECE, 'dress').shouldShowSleeves).toBe(true);
      expect(getFieldVisibility(ItemCategory.ONE_PIECE, 'jumpsuit').shouldShowSleeves).toBe(true);
      expect(getFieldVisibility(ItemCategory.ONE_PIECE, 'overall').shouldShowSleeves).toBe(false);
    });

    it('should handle case insensitive subcategory matching', () => {
      expect(getFieldVisibility(ItemCategory.TOP, 'T-SHIRT').shouldShowSleeves).toBe(true);
      expect(getFieldVisibility(ItemCategory.TOP, 'SHIRT').shouldShowSleeves).toBe(true);
    });

    it('should NOT show sleeves for non-matching categories', () => {
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'jeans').shouldShowSleeves).toBe(false);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'boots').shouldShowSleeves).toBe(false);
    });
  });

  describe('🎨 Style Field Visibility', () => {
    it('should show style for most categories', () => {
      expect(getFieldVisibility(ItemCategory.TOP, 'shirt').shouldShowStyle).toBe(true);
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'jeans').shouldShowStyle).toBe(true);
      expect(getFieldVisibility(ItemCategory.ONE_PIECE, 'dress').shouldShowStyle).toBe(true);
      expect(getFieldVisibility(ItemCategory.OUTERWEAR, 'jacket').shouldShowStyle).toBe(true);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'boots').shouldShowStyle).toBe(true);
    });

    it('should NOT show style for ACCESSORY and OTHER categories', () => {
      expect(getFieldVisibility(ItemCategory.ACCESSORY, 'bag').shouldShowStyle).toBe(false);
      expect(getFieldVisibility(ItemCategory.OTHER, 'miscellaneous').shouldShowStyle).toBe(false);
    });

    it('should NOT show style when category is empty', () => {
      const result = getFieldVisibility('', 'shirt');
      expect(result.shouldShowStyle).toBe(false);
    });
  });

  describe('👗 Neckline Field Visibility', () => {
    it('should show neckline for clothing items with necklines', () => {
      const necklineItems = [
        'dress', 't-shirt', 'shirt', 'blouse', 'top', 
        'tank top', 'sweater', 'cardigan', 'jumpsuit', 'romper'
      ];

      necklineItems.forEach(subcategory => {
        expect(getFieldVisibility(ItemCategory.TOP, subcategory).shouldShowNeckline).toBe(true);
      });
    });

    it('should handle case insensitive matching for neckline items', () => {
      expect(getFieldVisibility(ItemCategory.TOP, 'DRESS').shouldShowNeckline).toBe(true);
      expect(getFieldVisibility(ItemCategory.TOP, 'Tank Top').shouldShowNeckline).toBe(true);
    });

    it('should NOT show neckline for items without necklines', () => {
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'jeans').shouldShowNeckline).toBe(false);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'boots').shouldShowNeckline).toBe(false);
      expect(getFieldVisibility(ItemCategory.ACCESSORY, 'bag').shouldShowNeckline).toBe(false);
    });
  });

  describe('📐 Rise Field Visibility', () => {
    it('should show rise ONLY for BOTTOM category', () => {
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'jeans').shouldShowRise).toBe(true);
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'shorts').shouldShowRise).toBe(true);
      expect(getFieldVisibility(ItemCategory.BOTTOM, 'skirt').shouldShowRise).toBe(true);
    });

    it('should NOT show rise for non-BOTTOM categories', () => {
      expect(getFieldVisibility(ItemCategory.TOP, 'shirt').shouldShowRise).toBe(false);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'boots').shouldShowRise).toBe(false);
      expect(getFieldVisibility(ItemCategory.OUTERWEAR, 'jacket').shouldShowRise).toBe(false);
    });
  });

  describe('👠 Heel Height Field Visibility', () => {
    it('should show heel height for footwear with heels', () => {
      const heelFootwear = ['heels', 'boots', 'sandals', 'flats', 'formal shoes'];
      
      heelFootwear.forEach(subcategory => {
        expect(getFieldVisibility(ItemCategory.FOOTWEAR, subcategory).shouldShowHeelHeight).toBe(true);
      });
    });

    it('should NOT show heel height for non-heel footwear', () => {
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'sneakers').shouldShowHeelHeight).toBe(false);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'slippers').shouldShowHeelHeight).toBe(false);
    });

    it('should NOT show heel height for non-FOOTWEAR categories', () => {
      expect(getFieldVisibility(ItemCategory.TOP, 'shirt').shouldShowHeelHeight).toBe(false);
      expect(getFieldVisibility(ItemCategory.ACCESSORY, 'bag').shouldShowHeelHeight).toBe(false);
    });
  });

  describe('🥾 Boot Height Field Visibility', () => {
    it('should show boot height ONLY for boots subcategory', () => {
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'boots').shouldShowBootHeight).toBe(true);
    });

    it('should NOT show boot height for non-boots footwear', () => {
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'heels').shouldShowBootHeight).toBe(false);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'sneakers').shouldShowBootHeight).toBe(false);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'sandals').shouldShowBootHeight).toBe(false);
    });

    it('should handle case insensitive boot matching', () => {
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'BOOTS').shouldShowBootHeight).toBe(true);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'Boots').shouldShowBootHeight).toBe(true);
    });
  });

  describe('🏷️ Type Field Visibility', () => {
    it('should show type for specific FOOTWEAR subcategories', () => {
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'boots').shouldShowType).toBe(true);
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'formal shoes').shouldShowType).toBe(true);
    });

    it('should show type for specific ACCESSORY subcategories', () => {
      expect(getFieldVisibility(ItemCategory.ACCESSORY, 'bag').shouldShowType).toBe(true);
      expect(getFieldVisibility(ItemCategory.ACCESSORY, 'jewelry').shouldShowType).toBe(true);
    });

    it('should show type for specific OUTERWEAR subcategories', () => {
      expect(getFieldVisibility(ItemCategory.OUTERWEAR, 'jacket').shouldShowType).toBe(true);
      expect(getFieldVisibility(ItemCategory.OUTERWEAR, 'coat').shouldShowType).toBe(true);
    });

    it('should NOT show type for non-matching combinations', () => {
      expect(getFieldVisibility(ItemCategory.FOOTWEAR, 'sneakers').shouldShowType).toBe(false);
      expect(getFieldVisibility(ItemCategory.ACCESSORY, 'belt').shouldShowType).toBe(false);
      expect(getFieldVisibility(ItemCategory.OUTERWEAR, 'sweater').shouldShowType).toBe(false);
      expect(getFieldVisibility(ItemCategory.TOP, 'shirt').shouldShowType).toBe(false);
    });
  });

  describe('🧪 Edge Cases', () => {
    it('should handle empty category gracefully', () => {
      const result = getFieldVisibility('', 'any-subcategory');
      
      expect(result.shouldShowSilhouette).toBe(false);
      expect(result.shouldShowLength).toBe(false);
      expect(result.shouldShowSleeves).toBe(false);
      expect(result.shouldShowStyle).toBe(false);
      expect(result.shouldShowNeckline).toBe(false);
      expect(result.shouldShowRise).toBe(false);
      expect(result.shouldShowHeelHeight).toBe(false);
      expect(result.shouldShowBootHeight).toBe(false);
      expect(result.shouldShowType).toBe(false);
    });

    it('should handle empty subcategory gracefully', () => {
      const result = getFieldVisibility(ItemCategory.TOP, '');
      
      // Only style should show for TOP category regardless of subcategory
      expect(result.shouldShowStyle).toBe(true);
      
      // Others require specific subcategories
      expect(result.shouldShowSleeves).toBe(false);
      expect(result.shouldShowNeckline).toBe(false);
    });

    it('should handle undefined-like values gracefully', () => {
      const result = getFieldVisibility(ItemCategory.TOP, null as any);
      
      expect(result.shouldShowStyle).toBe(true);
      expect(result.shouldShowSleeves).toBe(false);
      expect(result.shouldShowNeckline).toBe(false);
    });

    it('should be case insensitive for all subcategory matching', () => {
      // Test various case combinations
      const testCases = [
        ['boots', 'BOOTS', 'Boots', 'BoOtS'],
        ['jeans', 'JEANS', 'Jeans', 'JeAnS'],
        ['dress', 'DRESS', 'Dress', 'DrEsS']
      ];

      testCases.forEach(cases => {
        const expectedBoot = getFieldVisibility(ItemCategory.FOOTWEAR, cases[0]).shouldShowBootHeight;
        const expectedJeans = getFieldVisibility(ItemCategory.BOTTOM, cases[0]).shouldShowLength;
        const expectedDress = getFieldVisibility(ItemCategory.ONE_PIECE, cases[0]).shouldShowLength;

        cases.slice(1).forEach(caseVariant => {
          expect(getFieldVisibility(ItemCategory.FOOTWEAR, caseVariant).shouldShowBootHeight).toBe(expectedBoot);
          expect(getFieldVisibility(ItemCategory.BOTTOM, caseVariant).shouldShowLength).toBe(expectedJeans);
          expect(getFieldVisibility(ItemCategory.ONE_PIECE, caseVariant).shouldShowLength).toBe(expectedDress);
        });
      });
    });
  });

  describe('📋 Complete Field Configuration Tests', () => {
    it('should return complete FieldVisibilityConfig object', () => {
      const result = getFieldVisibility(ItemCategory.TOP, 'shirt');
      
      // Verify all expected properties exist
      expect(result).toHaveProperty('shouldShowSilhouette');
      expect(result).toHaveProperty('shouldShowLength');
      expect(result).toHaveProperty('shouldShowSleeves');
      expect(result).toHaveProperty('shouldShowStyle');
      expect(result).toHaveProperty('shouldShowNeckline');
      expect(result).toHaveProperty('shouldShowRise');
      expect(result).toHaveProperty('shouldShowHeelHeight');
      expect(result).toHaveProperty('shouldShowBootHeight');
      expect(result).toHaveProperty('shouldShowType');
      
      // Verify all values are booleans
      Object.values(result).forEach(value => {
        expect(typeof value).toBe('boolean');
      });
    });

    it('should have consistent behavior across multiple calls', () => {
      const result1 = getFieldVisibility(ItemCategory.TOP, 'shirt');
      const result2 = getFieldVisibility(ItemCategory.TOP, 'shirt');
      
      expect(result1).toEqual(result2);
    });
  });
});
