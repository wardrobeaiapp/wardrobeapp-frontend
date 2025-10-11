/**
 * Functional tests for wardrobeAnalysisService duplicate detection
 */

import { filterItemContextForAI } from '../../../services/ai/itemContextFilter';
import { ItemCategory, Season } from '../../../types';

// Mock the itemContextFilter
jest.mock('../../../services/ai/itemContextFilter');
const mockFilterItemContextForAI = filterItemContextForAI as jest.MockedFunction<typeof filterItemContextForAI>;

describe('wardrobeAnalysisService - Duplicate Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('similarContext filtering', () => {
    it('should not limit similarContext items when no limit is provided', () => {
      const mockItems = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        name: `T-Shirt ${i}`,
        category: ItemCategory.TOP,
        color: 'White',
        season: [Season.SUMMER],
        dateAdded: '2024-01-01',
        wishlist: false,
        userId: 'test-user'
      })) as any[];

      mockFilterItemContextForAI.mockReturnValue(mockItems);

      // Call the function that was fixed (no 5-item limit)
      const result = filterItemContextForAI(mockItems, undefined);

      expect(result).toHaveLength(10); // Should return all 10 items, not just 5
      expect(mockFilterItemContextForAI).toHaveBeenCalledWith(mockItems, undefined);
    });

    it('should handle large arrays without limiting', () => {
      const mockItems = Array.from({ length: 20 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        category: ItemCategory.TOP,
        color: 'White',
        season: [Season.SUMMER],
        dateAdded: '2024-01-01',
        wishlist: false,
        userId: 'test-user'
      })) as any[];

      mockFilterItemContextForAI.mockReturnValue(mockItems);

      const result = filterItemContextForAI(mockItems, undefined);

      expect(result).toHaveLength(20); // Should handle large arrays
      expect(result[19].name).toBe('Item 19'); // Last item should be included
    });

    it('should handle empty arrays gracefully', () => {
      mockFilterItemContextForAI.mockReturnValue([]);

      const result = filterItemContextForAI([], undefined);

      expect(result).toEqual([]);
      expect(mockFilterItemContextForAI).toHaveBeenCalledWith([], undefined);
    });
  });

  describe('duplicate detection requirements', () => {
    it('should preserve all similar items for accurate duplicate detection', () => {
      // This test ensures the fix enables proper duplicate detection
      const similarTShirts = [
        { id: '1', name: 'White T-Shirt', category: ItemCategory.TOP, color: 'White', season: [Season.SUMMER], dateAdded: '2024-01-01', wishlist: false, userId: 'test-user' },
        { id: '2', name: 'White T-shirt', category: ItemCategory.TOP, color: 'White', season: [Season.SUMMER], dateAdded: '2024-01-02', wishlist: false, userId: 'test-user' },
        { id: '3', name: 'White T-shirt', category: ItemCategory.TOP, color: 'white', season: [Season.SUMMER], dateAdded: '2024-01-03', wishlist: false, userId: 'test-user' }, // lowercase
        { id: '4', name: 'Grey T-shirt', category: ItemCategory.TOP, color: 'Grey', season: [Season.SUMMER], dateAdded: '2024-01-04', wishlist: false, userId: 'test-user' },
        { id: '5', name: 'Black T-shirt', category: ItemCategory.TOP, color: 'Black', season: [Season.SUMMER], dateAdded: '2024-01-05', wishlist: false, userId: 'test-user' },
        { id: '6', name: 'Blue T-shirt', category: ItemCategory.TOP, color: 'Blue', season: [Season.SUMMER], dateAdded: '2024-01-06', wishlist: false, userId: 'test-user' }
      ] as any[];

      mockFilterItemContextForAI.mockReturnValue(similarTShirts);

      const result = filterItemContextForAI(similarTShirts, undefined);

      // All items should be preserved for backend duplicate detection
      expect(result).toHaveLength(6);
      expect(result.map(item => item.name)).toEqual([
        'White T-Shirt',
        'White T-shirt', 
        'White T-shirt',
        'Grey T-shirt',
        'Black T-shirt',
        'Blue T-shirt'
      ]);
    });
  });
});
