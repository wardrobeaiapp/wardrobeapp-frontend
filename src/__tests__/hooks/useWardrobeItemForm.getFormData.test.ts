import { renderHook, act } from '@testing-library/react';
import { useWardrobeItemForm } from '../../components/features/wardrobe/forms/WardrobeItemForm/hooks/useWardrobeItemForm';
import { ItemCategory, Season } from '../../types';

/**
 * REGRESSION TEST FOR TYPE FIELD BUG
 * 
 * This test file specifically tests the actual getFormData() conditional logic
 * without mocking, to catch bugs like the outerwear type field not being saved.
 * 
 * The bug was: type field was displayed for outerwear jackets but not included
 * in getFormData() because outerwear wasn't in the conditional logic.
 */

describe('useWardrobeItemForm.getFormData() - Conditional Field Logic', () => {
  
  describe('TYPE FIELD - The Original Bug', () => {
    it('should include type field for outerwear jackets (REGRESSION TEST)', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.OUTERWEAR);
        result.current.setSubcategory('jacket');
        result.current.setType('blazer');
        result.current.setColor('navy');
        result.current.toggleSeason(Season.WINTER);
      });

      const formData = result.current.getFormData();

      // THE BUG: This was returning undefined because outerwear wasn't 
      // in the type field conditional logic in getFormData()
      expect(formData.type).toBe('blazer');
    });

    it('should include type field for outerwear coats', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.OUTERWEAR);
        result.current.setSubcategory('coat');
        result.current.setType('trench coat');
        result.current.setColor('beige');
        result.current.toggleSeason(Season.TRANSITIONAL);
      });

      const formData = result.current.getFormData();

      expect(formData.type).toBe('trench coat');
    });

    it('should include type for all qualifying category/subcategory combinations', () => {
      const testCases = [
        // Outerwear - the ones that were broken
        { category: ItemCategory.OUTERWEAR, subcategory: 'jacket', type: 'blazer' },
        { category: ItemCategory.OUTERWEAR, subcategory: 'coat', type: 'wool coat' },
        
        // Footwear - these were working
        { category: ItemCategory.FOOTWEAR, subcategory: 'boots', type: 'ankle boots' },
        { category: ItemCategory.FOOTWEAR, subcategory: 'formal shoes', type: 'oxford' },
        
        // Accessories - these were working
        { category: ItemCategory.ACCESSORY, subcategory: 'bag', type: 'tote bag' },
        { category: ItemCategory.ACCESSORY, subcategory: 'jewelry', type: 'necklace' },
      ];

      testCases.forEach(({ category, subcategory, type }) => {
        const { result } = renderHook(() => useWardrobeItemForm());

        act(() => {
          result.current.setCategory(category);
          result.current.setSubcategory(subcategory);
          result.current.setType(type);
          result.current.setColor('test');
          result.current.toggleSeason(Season.SUMMER);
        });

        const formData = result.current.getFormData();

        expect(formData.type).toBe(type);
      });
    });

    it('should NOT include type for non-qualifying categories', () => {
      const nonQualifyingCases = [
        { category: ItemCategory.TOP, subcategory: 't-shirt' },
        { category: ItemCategory.BOTTOM, subcategory: 'jeans' },
        { category: ItemCategory.ONE_PIECE, subcategory: 'dress' },
        { category: ItemCategory.OTHER, subcategory: 'misc' },
      ];

      nonQualifyingCases.forEach(({ category, subcategory }) => {
        const { result } = renderHook(() => useWardrobeItemForm());

        act(() => {
          result.current.setCategory(category);
          result.current.setSubcategory(subcategory);
          result.current.setType('should be ignored');
          result.current.setColor('test');
          result.current.toggleSeason(Season.SUMMER);
        });

        const formData = result.current.getFormData();

        expect(formData.type).toBeUndefined();
      });
    });

    it('should NOT include type for outerwear non-qualifying subcategories', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.OUTERWEAR);
        result.current.setSubcategory('sweater'); // Not jacket or coat
        result.current.setType('cardigan');
        result.current.setColor('gray');
        result.current.toggleSeason(Season.WINTER);
      });

      const formData = result.current.getFormData();

      expect(formData.type).toBeUndefined();
    });
  });

  describe('Other Conditional Fields - Comprehensive Coverage', () => {
    it('should include sleeves for qualifying categories only', () => {
      // Should include sleeves
      const { result: topResult } = renderHook(() => useWardrobeItemForm());
      
      act(() => {
        topResult.current.setCategory(ItemCategory.TOP);
        topResult.current.setSubcategory('t-shirt');
        topResult.current.setSleeves('short sleeves');
        topResult.current.setColor('blue');
        topResult.current.toggleSeason(Season.SUMMER);
      });

      expect(topResult.current.getFormData().sleeves).toBe('short sleeves');

      // Should NOT include sleeves
      const { result: bottomResult } = renderHook(() => useWardrobeItemForm());
      
      act(() => {
        bottomResult.current.setCategory(ItemCategory.BOTTOM);
        bottomResult.current.setSubcategory('jeans');
        bottomResult.current.setSleeves('should be ignored');
        bottomResult.current.setColor('blue');
        bottomResult.current.toggleSeason(Season.TRANSITIONAL);
      });

      expect(bottomResult.current.getFormData().sleeves).toBeUndefined();
    });

    it('should include length for qualifying categories', () => {
      const qualifyingCategories = [
        ItemCategory.BOTTOM,
        ItemCategory.ONE_PIECE, 
        ItemCategory.OUTERWEAR
      ];

      qualifyingCategories.forEach(category => {
        const { result } = renderHook(() => useWardrobeItemForm());

        act(() => {
          result.current.setCategory(category);
          result.current.setSubcategory('general');
          result.current.setLength('regular');
          result.current.setColor('test');
          result.current.toggleSeason(Season.SUMMER);
        });

        const formData = result.current.getFormData();
        expect(formData.length).toBe('regular');
      });
    });

    it('should include rise only for BOTTOM category', () => {
      // Should include
      const { result: bottomResult } = renderHook(() => useWardrobeItemForm());
      
      act(() => {
        bottomResult.current.setCategory(ItemCategory.BOTTOM);
        bottomResult.current.setSubcategory('jeans');
        bottomResult.current.setRise('high rise');
        bottomResult.current.setColor('blue');
        bottomResult.current.toggleSeason(Season.TRANSITIONAL);
      });

      expect(bottomResult.current.getFormData().rise).toBe('high rise');

      // Should NOT include
      const { result: topResult } = renderHook(() => useWardrobeItemForm());
      
      act(() => {
        topResult.current.setCategory(ItemCategory.TOP);
        topResult.current.setSubcategory('shirt');
        topResult.current.setRise('should be ignored');
        topResult.current.setColor('white');
        topResult.current.toggleSeason(Season.SUMMER);
      });

      expect(topResult.current.getFormData().rise).toBeUndefined();
    });

    it('should include heelHeight for qualifying footwear', () => {
      const qualifyingFootwear = ['heels', 'boots', 'sandals', 'flats', 'formal shoes'];

      qualifyingFootwear.forEach(subcategory => {
        const { result } = renderHook(() => useWardrobeItemForm());

        act(() => {
          result.current.setCategory(ItemCategory.FOOTWEAR);
          result.current.setSubcategory(subcategory);
          result.current.setHeelHeight('medium');
          result.current.setColor('black');
          result.current.toggleSeason(Season.SUMMER);
        });

        const formData = result.current.getFormData();
        expect(formData.heelHeight).toBe('medium');
      });
    });

    it('should include bootHeight only for boots', () => {
      // Should include
      const { result: bootsResult } = renderHook(() => useWardrobeItemForm());
      
      act(() => {
        bootsResult.current.setCategory(ItemCategory.FOOTWEAR);
        bootsResult.current.setSubcategory('boots');
        bootsResult.current.setBootHeight('knee-high');
        bootsResult.current.setColor('brown');
        bootsResult.current.toggleSeason(Season.WINTER);
      });

      expect(bootsResult.current.getFormData().bootHeight).toBe('knee-high');

      // Should NOT include
      const { result: heelsResult } = renderHook(() => useWardrobeItemForm());
      
      act(() => {
        heelsResult.current.setCategory(ItemCategory.FOOTWEAR);
        heelsResult.current.setSubcategory('heels');
        heelsResult.current.setBootHeight('should be ignored');
        heelsResult.current.setColor('red');
        heelsResult.current.toggleSeason(Season.SUMMER);
      });

      expect(heelsResult.current.getFormData().bootHeight).toBeUndefined();
    });

    it('should exclude style for ACCESSORY and OTHER categories', () => {
      const excludedCategories = [ItemCategory.ACCESSORY, ItemCategory.OTHER];

      excludedCategories.forEach(category => {
        const { result } = renderHook(() => useWardrobeItemForm());

        act(() => {
          result.current.setCategory(category);
          result.current.setSubcategory('general');
          result.current.setStyle('should be ignored');
          result.current.setColor('test');
          result.current.toggleSeason(Season.SUMMER);
        });

        const formData = result.current.getFormData();
        expect(formData.style).toBeUndefined();
      });
    });
  });

  describe('Edge Cases and Data Types', () => {
    it('should handle empty string values as undefined', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.OUTERWEAR);
        result.current.setSubcategory('jacket');
        result.current.setType(''); // Empty string
        result.current.setColor('blue');
        result.current.toggleSeason(Season.WINTER);
      });

      const formData = result.current.getFormData();

      // Empty string should become undefined for conditional fields
      expect(formData.type).toBeUndefined();
    });

    it('should handle case insensitive subcategory matching', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.OUTERWEAR);
        result.current.setSubcategory('JACKET'); // Uppercase
        result.current.setType('bomber');
        result.current.setColor('green');
        result.current.toggleSeason(Season.TRANSITIONAL);
      });

      const formData = result.current.getFormData();

      // Should still work with case insensitive matching
      expect(formData.type).toBe('bomber');
    });

    it('should preserve arrays and objects', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.TOP);
        result.current.setSubcategory('t-shirt');
        result.current.setColor('blue');
        result.current.toggleSeason(Season.SUMMER);
        result.current.toggleSeason(Season.TRANSITIONAL);
        result.current.toggleScenario('casual');
        result.current.toggleScenario('home');
      });

      const formData = result.current.getFormData();

      expect(Array.isArray(formData.seasons)).toBe(true);
      expect(formData.seasons).toContain(Season.SUMMER);
      expect(formData.seasons).toContain(Season.TRANSITIONAL);
      
      expect(Array.isArray(formData.scenarios)).toBe(true);
      expect(formData.scenarios).toContain('casual');
      expect(formData.scenarios).toContain('home');
    });
  });

  describe('DETAILS FIELD - New Feature', () => {
    it('should include details field when provided', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.TOP);
        result.current.setSubcategory('blouse');
        result.current.setColor('white');
        result.current.setDetails('puffed sleeves with bow details');
        result.current.toggleSeason(Season.SUMMER);
      });

      const formData = result.current.getFormData();

      expect(formData.details).toBe('puffed sleeves with bow details');
    });

    it('should include empty details field', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.ONE_PIECE);
        result.current.setSubcategory('dress');
        result.current.setColor('black');
        result.current.setDetails('');
        result.current.toggleSeason(Season.SUMMER);
      });

      const formData = result.current.getFormData();

      expect(formData.details).toBe(undefined); // Empty strings convert to undefined for consistency
    });

    it('should include details field for all item categories', () => {
      const testCases = [
        { category: ItemCategory.TOP, subcategory: 'blouse', details: 'wrap style with belt' },
        { category: ItemCategory.BOTTOM, subcategory: 'pants', details: 'high-waisted with elastic band' },
        { category: ItemCategory.ONE_PIECE, subcategory: 'dress', details: 'maxi length with side slit' },
        { category: ItemCategory.OUTERWEAR, subcategory: 'jacket', details: 'cropped with metallic buttons' },
        { category: ItemCategory.FOOTWEAR, subcategory: 'boots', details: 'pointed toe with block heel' },
        { category: ItemCategory.ACCESSORY, subcategory: 'bag', details: 'structured with chain strap' },
      ];

      testCases.forEach(({ category, subcategory, details }) => {
        const { result } = renderHook(() => useWardrobeItemForm());

        act(() => {
          result.current.setCategory(category);
          result.current.setSubcategory(subcategory);
          result.current.setColor('test');
          result.current.setDetails(details);
          result.current.toggleSeason(Season.SUMMER);
        });

        const formData = result.current.getFormData();

        expect(formData.details).toBe(details);
      });
    });

    it('should handle undefined details field (default state)', () => {
      const { result } = renderHook(() => useWardrobeItemForm());

      act(() => {
        result.current.setCategory(ItemCategory.TOP);
        result.current.setSubcategory('t-shirt');
        result.current.setColor('blue');
        result.current.toggleSeason(Season.SUMMER);
        // Don't set details - should be undefined
      });

      const formData = result.current.getFormData();

      expect(formData.details).toBe(undefined);
    });
  });
});
