import { renderHook } from '@testing-library/react';
import { useFormOptions } from '../../components/features/wardrobe/forms/WardrobeItemForm/utils/formOptions';
import { ItemCategory } from '../../types';
import * as formHelpers from '../../components/features/wardrobe/forms/WardrobeItemForm/utils/formHelpers';

// Mock the form helpers
jest.mock('../../components/features/wardrobe/forms/WardrobeItemForm/utils/formHelpers');

const mockFormHelpers = formHelpers as jest.Mocked<typeof formHelpers>;

describe('useFormOptions Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up default mock returns
    mockFormHelpers.getSilhouetteOptions.mockReturnValue(['Fitted', 'Relaxed', 'Oversized']);
    mockFormHelpers.getLengthOptions.mockReturnValue(['Mini', 'Midi', 'Maxi']);
    mockFormHelpers.getSleeveOptions.mockReturnValue(['Short', 'Long', 'Sleeveless']);
    mockFormHelpers.getStyleOptions.mockReturnValue(['Casual', 'Formal', 'Business']);
    mockFormHelpers.getRiseOptions.mockReturnValue(['High', 'Mid', 'Low']);
    mockFormHelpers.getNecklineOptions.mockReturnValue(['V-neck', 'Round', 'Scoop']);
    mockFormHelpers.getHeelHeightOptions.mockReturnValue(['Flat', 'Low', 'High']);
    mockFormHelpers.getBootHeightOptions.mockReturnValue(['Ankle', 'Mid-calf', 'Knee-high']);
    mockFormHelpers.getTypeOptions.mockReturnValue(['Casual', 'Formal', 'Athletic']);
    mockFormHelpers.getPatternOptions.mockReturnValue(['Solid', 'Striped', 'Floral']);
  });

  describe('🔄 Memoization Tests', () => {
    it('should memoize options when category and subcategory remain the same', () => {
      const { result, rerender } = renderHook(
        ({ category, subcategory }) => useFormOptions(category, subcategory),
        {
          initialProps: { 
            category: ItemCategory.TOP as ItemCategory | '', 
            subcategory: 'shirt' 
          }
        }
      );

      const firstResult = result.current;

      // Rerender with same props
      rerender({ category: ItemCategory.TOP, subcategory: 'shirt' });

      const secondResult = result.current;

      // Should return the same object references (memoized)
      expect(firstResult.silhouetteOptions).toBe(secondResult.silhouetteOptions);
      expect(firstResult.lengthOptions).toBe(secondResult.lengthOptions);
      expect(firstResult.sleeveOptions).toBe(secondResult.sleeveOptions);
      expect(firstResult.styleOptions).toBe(secondResult.styleOptions);
      expect(firstResult.riseOptions).toBe(secondResult.riseOptions);
      expect(firstResult.necklineOptions).toBe(secondResult.necklineOptions);
      expect(firstResult.heelHeightOptions).toBe(secondResult.heelHeightOptions);
      expect(firstResult.bootHeightOptions).toBe(secondResult.bootHeightOptions);
      expect(firstResult.typeOptions).toBe(secondResult.typeOptions);
      expect(firstResult.patternOptions).toBe(secondResult.patternOptions);

      // Should not call helpers again
      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getLengthOptions).toHaveBeenCalledTimes(1);
    });

    it('should recalculate when category changes', () => {
      const { result, rerender } = renderHook(
        ({ category, subcategory }) => useFormOptions(category, subcategory),
        {
          initialProps: { 
            category: ItemCategory.TOP as ItemCategory | '', 
            subcategory: 'shirt' 
          }
        }
      );

      const firstResult = result.current;

      // Change category
      mockFormHelpers.getSilhouetteOptions.mockReturnValue(['New', 'Silhouette', 'Options']);
      mockFormHelpers.getTypeOptions.mockReturnValue(['New', 'Type', 'Options']);

      rerender({ category: ItemCategory.BOTTOM, subcategory: 'shirt' });

      const secondResult = result.current;

      // Should get new object references
      expect(firstResult.silhouetteOptions).not.toBe(secondResult.silhouetteOptions);
      expect(firstResult.typeOptions).not.toBe(secondResult.typeOptions);

      // Should call helpers again with new category
      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledTimes(2);
      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenLastCalledWith(ItemCategory.BOTTOM, 'shirt');
    });

    it('should recalculate when subcategory changes', () => {
      const { result, rerender } = renderHook(
        ({ category, subcategory }) => useFormOptions(category, subcategory),
        {
          initialProps: { 
            category: ItemCategory.TOP as ItemCategory | '', 
            subcategory: 'shirt' 
          }
        }
      );

      const firstResult = result.current;

      // Change subcategory
      mockFormHelpers.getLengthOptions.mockReturnValue(['New', 'Length', 'Options']);

      rerender({ category: ItemCategory.TOP, subcategory: 'dress' });

      const secondResult = result.current;

      // Should get new object references for subcategory-dependent options
      expect(firstResult.lengthOptions).not.toBe(secondResult.lengthOptions);

      // Should call helpers again with new subcategory
      expect(mockFormHelpers.getLengthOptions).toHaveBeenCalledTimes(2);
      expect(mockFormHelpers.getLengthOptions).toHaveBeenLastCalledWith('dress');
    });

    it('should NOT recalculate static options when only category/subcategory changes', () => {
      const { result, rerender } = renderHook(
        ({ category, subcategory }) => useFormOptions(category, subcategory),
        {
          initialProps: { 
            category: ItemCategory.TOP as ItemCategory | '', 
            subcategory: 'shirt' 
          }
        }
      );

      const firstResult = result.current;

      // Change category and subcategory
      rerender({ category: ItemCategory.BOTTOM, subcategory: 'jeans' });

      const secondResult = result.current;

      // Static options should remain the same object reference
      expect(firstResult.sleeveOptions).toBe(secondResult.sleeveOptions);
      expect(firstResult.styleOptions).toBe(secondResult.styleOptions);
      expect(firstResult.riseOptions).toBe(secondResult.riseOptions);
      expect(firstResult.necklineOptions).toBe(secondResult.necklineOptions);
      expect(firstResult.heelHeightOptions).toBe(secondResult.heelHeightOptions);
      expect(firstResult.bootHeightOptions).toBe(secondResult.bootHeightOptions);
      expect(firstResult.patternOptions).toBe(secondResult.patternOptions);

      // Static options should only be called once
      expect(mockFormHelpers.getSleeveOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getStyleOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getRiseOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getNecklineOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getHeelHeightOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getBootHeightOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getPatternOptions).toHaveBeenCalledTimes(1);
    });
  });

  describe('📊 Options Generation Tests', () => {
    it('should call form helpers with correct parameters', () => {
      renderHook(() => useFormOptions(ItemCategory.TOP, 'shirt'));

      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledWith(ItemCategory.TOP, 'shirt');
      expect(mockFormHelpers.getLengthOptions).toHaveBeenCalledWith('shirt');
      expect(mockFormHelpers.getTypeOptions).toHaveBeenCalledWith(ItemCategory.TOP, 'shirt');
      
      // Static options called with no parameters
      expect(mockFormHelpers.getSleeveOptions).toHaveBeenCalledWith();
      expect(mockFormHelpers.getStyleOptions).toHaveBeenCalledWith();
      expect(mockFormHelpers.getRiseOptions).toHaveBeenCalledWith();
      expect(mockFormHelpers.getNecklineOptions).toHaveBeenCalledWith();
      expect(mockFormHelpers.getHeelHeightOptions).toHaveBeenCalledWith();
      expect(mockFormHelpers.getBootHeightOptions).toHaveBeenCalledWith();
      expect(mockFormHelpers.getPatternOptions).toHaveBeenCalledWith();
    });

    it('should return all expected option properties', () => {
      const { result } = renderHook(() => useFormOptions(ItemCategory.TOP, 'shirt'));

      expect(result.current).toHaveProperty('silhouetteOptions');
      expect(result.current).toHaveProperty('lengthOptions');
      expect(result.current).toHaveProperty('sleeveOptions');
      expect(result.current).toHaveProperty('styleOptions');
      expect(result.current).toHaveProperty('riseOptions');
      expect(result.current).toHaveProperty('necklineOptions');
      expect(result.current).toHaveProperty('heelHeightOptions');
      expect(result.current).toHaveProperty('bootHeightOptions');
      expect(result.current).toHaveProperty('typeOptions');
      expect(result.current).toHaveProperty('patternOptions');
    });

    it('should return the correct options from form helpers', () => {
      const { result } = renderHook(() => useFormOptions(ItemCategory.TOP, 'shirt'));

      expect(result.current.silhouetteOptions).toEqual(['Fitted', 'Relaxed', 'Oversized']);
      expect(result.current.lengthOptions).toEqual(['Mini', 'Midi', 'Maxi']);
      expect(result.current.sleeveOptions).toEqual(['Short', 'Long', 'Sleeveless']);
      expect(result.current.styleOptions).toEqual(['Casual', 'Formal', 'Business']);
      expect(result.current.riseOptions).toEqual(['High', 'Mid', 'Low']);
      expect(result.current.necklineOptions).toEqual(['V-neck', 'Round', 'Scoop']);
      expect(result.current.heelHeightOptions).toEqual(['Flat', 'Low', 'High']);
      expect(result.current.bootHeightOptions).toEqual(['Ankle', 'Mid-calf', 'Knee-high']);
      expect(result.current.typeOptions).toEqual(['Casual', 'Formal', 'Athletic']);
      expect(result.current.patternOptions).toEqual(['Solid', 'Striped', 'Floral']);
    });
  });

  describe('🏷️ Edge Cases', () => {
    it('should handle empty category gracefully', () => {
      const { result } = renderHook(() => useFormOptions('', 'shirt'));

      // When category is empty, getSilhouetteOptions should NOT be called (returns empty array)
      expect(mockFormHelpers.getSilhouetteOptions).not.toHaveBeenCalled();
      // But getTypeOptions should still be called
      expect(mockFormHelpers.getTypeOptions).toHaveBeenCalledWith('', 'shirt');
      // Silhouette should return empty array when no category
      expect(result.current.silhouetteOptions).toEqual([]);
    });

    it('should handle empty subcategory gracefully', () => {
      const { result } = renderHook(() => useFormOptions(ItemCategory.TOP, ''));

      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledWith(ItemCategory.TOP, '');
      expect(mockFormHelpers.getLengthOptions).toHaveBeenCalledWith('');
      expect(result.current.lengthOptions).toEqual(['Mini', 'Midi', 'Maxi']);
    });

    it('should handle both empty category and subcategory', () => {
      const { result } = renderHook(() => useFormOptions('', ''));

      // When category is empty, getSilhouetteOptions should NOT be called
      expect(mockFormHelpers.getSilhouetteOptions).not.toHaveBeenCalled();
      expect(mockFormHelpers.getLengthOptions).toHaveBeenCalledWith('');
      expect(mockFormHelpers.getTypeOptions).toHaveBeenCalledWith('', '');
      
      // Should still return valid options structure
      expect(result.current).toHaveProperty('silhouetteOptions');
      expect(result.current).toHaveProperty('lengthOptions');
      expect(result.current).toHaveProperty('typeOptions');
      // Silhouette should be empty when no category
      expect(result.current.silhouetteOptions).toEqual([]);
    });
  });

  describe('🔧 Performance Tests', () => {
    it('should only call form helpers once per dependency change', () => {
      const { rerender } = renderHook(
        ({ category, subcategory }) => useFormOptions(category, subcategory),
        {
          initialProps: { 
            category: ItemCategory.TOP as ItemCategory | '', 
            subcategory: 'shirt' 
          }
        }
      );

      // Initial render calls
      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getLengthOptions).toHaveBeenCalledTimes(1);

      // Multiple rerenders with same props should not call helpers again
      rerender({ category: ItemCategory.TOP, subcategory: 'shirt' });
      rerender({ category: ItemCategory.TOP, subcategory: 'shirt' });
      rerender({ category: ItemCategory.TOP, subcategory: 'shirt' });

      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getLengthOptions).toHaveBeenCalledTimes(1);

      // Change subcategory should trigger recalculation for dependent options
      rerender({ category: ItemCategory.TOP, subcategory: 'blouse' });

      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledTimes(2); // Category + subcategory dependent
      expect(mockFormHelpers.getLengthOptions).toHaveBeenCalledTimes(2); // Subcategory dependent
      expect(mockFormHelpers.getSleeveOptions).toHaveBeenCalledTimes(1); // Static, no change

      // Change category should trigger recalculation for category-dependent options
      rerender({ category: ItemCategory.BOTTOM, subcategory: 'blouse' });

      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledTimes(3); // Category + subcategory dependent
      expect(mockFormHelpers.getTypeOptions).toHaveBeenCalledTimes(3); // Category + subcategory dependent
      expect(mockFormHelpers.getSleeveOptions).toHaveBeenCalledTimes(1); // Static, still no change
    });

    it('should handle rapid successive changes efficiently', () => {
      const { rerender } = renderHook(
        ({ category, subcategory }) => useFormOptions(category, subcategory),
        {
          initialProps: { 
            category: ItemCategory.TOP as ItemCategory | '', 
            subcategory: 'shirt' 
          }
        }
      );

      // Rapid changes
      const categories = [ItemCategory.TOP, ItemCategory.BOTTOM, ItemCategory.OUTERWEAR, ItemCategory.FOOTWEAR];
      const subcategories = ['shirt', 'jeans', 'jacket', 'boots'];

      categories.forEach((category, index) => {
        rerender({ category, subcategory: subcategories[index] });
      });

      // Should have called: initial + 3 unique changes = 4 times (first change is same as initial, so memoized)
      expect(mockFormHelpers.getSilhouetteOptions).toHaveBeenCalledTimes(4);
      expect(mockFormHelpers.getTypeOptions).toHaveBeenCalledTimes(4);
      
      // Static options should still only be called once
      expect(mockFormHelpers.getSleeveOptions).toHaveBeenCalledTimes(1);
      expect(mockFormHelpers.getStyleOptions).toHaveBeenCalledTimes(1);
    });
  });
});
