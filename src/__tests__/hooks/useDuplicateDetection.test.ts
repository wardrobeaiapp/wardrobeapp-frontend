/**
 * Custom hook tests for duplicate detection functionality
 */

import { renderHook, act } from '@testing-library/react';
import { WardrobeItem, ItemCategory, Season } from '../../types';

// Mock custom hook - replace with your actual hook
const useDuplicateDetection = (wardrobeItems: WardrobeItem[]) => {
  const [duplicates, setDuplicates] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const checkForDuplicates = React.useCallback(async (newItem: Partial<WardrobeItem>) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simple duplicate logic for testing
    const similarItems = wardrobeItems.filter(item => 
      item.category === newItem.category &&
      item.subcategory === newItem.subcategory &&
      item.color === newItem.color
    );
    
    setDuplicates(similarItems.map(item => item.name));
    setIsLoading(false);
  }, [wardrobeItems]);

  const clearDuplicates = React.useCallback(() => {
    setDuplicates([]);
  }, []);

  return {
    duplicates,
    isLoading,
    checkForDuplicates,
    clearDuplicates
  };
};

// Import React for the hook
import React from 'react';

describe('useDuplicateDetection Hook', () => {
  const mockWardrobeItems: WardrobeItem[] = [
    {
      id: 'item-1',
      name: 'White T-Shirt',
      category: ItemCategory.TOP,
      subcategory: 'T-Shirt',
      color: 'White',
      season: [Season.SUMMER],
      scenarios: ['casual'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-01'
    },
    {
      id: 'item-2',
      name: 'White T-shirt (duplicate)',
      category: ItemCategory.TOP,
      subcategory: 'T-Shirt',
      color: 'White',
      season: [Season.SUMMER],
      scenarios: ['casual'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-02'
    },
    {
      id: 'item-3',
      name: 'Black Jeans',
      category: ItemCategory.BOTTOM,
      subcategory: 'jeans',
      color: 'Black',
      season: [Season.SUMMER],
      scenarios: ['casual'],
      wishlist: false,
      userId: 'user-1',
      dateAdded: '2024-01-03'
    }
  ];

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useDuplicateDetection(mockWardrobeItems));

    expect(result.current.duplicates).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.checkForDuplicates).toBe('function');
    expect(typeof result.current.clearDuplicates).toBe('function');
  });

  it('should detect duplicates when checking similar items', async () => {
    const { result } = renderHook(() => useDuplicateDetection(mockWardrobeItems));

    const newItem = {
      name: 'Another White T-Shirt',
      category: ItemCategory.TOP,
      subcategory: 'T-Shirt',
      color: 'White'
    };

    await act(async () => {
      await result.current.checkForDuplicates(newItem);
    });

    expect(result.current.duplicates).toEqual([
      'White T-Shirt',
      'White T-shirt (duplicate)'
    ]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should show loading state during duplicate check', async () => {
    const { result } = renderHook(() => useDuplicateDetection(mockWardrobeItems));

    const newItem = {
      category: ItemCategory.TOP,
      subcategory: 'T-Shirt',
      color: 'White'
    };

    // Start the async operation
    let checkPromise: Promise<void>;
    act(() => {
      checkPromise = result.current.checkForDuplicates(newItem);
    });

    // Should be loading immediately after starting
    expect(result.current.isLoading).toBe(true);

    // Wait for completion
    await act(async () => {
      await checkPromise!;
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('should find no duplicates for unique items', async () => {
    const { result } = renderHook(() => useDuplicateDetection(mockWardrobeItems));

    const uniqueItem = {
      category: ItemCategory.FOOTWEAR,
      subcategory: 'sneakers',
      color: 'Red'
    };

    await act(async () => {
      await result.current.checkForDuplicates(uniqueItem);
    });

    expect(result.current.duplicates).toEqual([]);
  });

  it('should clear duplicates when clearDuplicates is called', async () => {
    const { result } = renderHook(() => useDuplicateDetection(mockWardrobeItems));

    // First, set some duplicates
    await act(async () => {
      await result.current.checkForDuplicates({
        category: ItemCategory.TOP,
        subcategory: 'T-Shirt',
        color: 'White'
      });
    });

    expect(result.current.duplicates.length).toBeGreaterThan(0);

    // Then clear them
    act(() => {
      result.current.clearDuplicates();
    });

    expect(result.current.duplicates).toEqual([]);
  });

  it('should update duplicates when wardrobe items change', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useDuplicateDetection(items),
      { initialProps: { items: mockWardrobeItems } }
    );

    // Add a new item to the wardrobe
    const updatedItems = [
      ...mockWardrobeItems,
      {
        id: 'item-4',
        name: 'Third White T-Shirt',
        category: ItemCategory.TOP,
        subcategory: 'T-Shirt',
        color: 'White',
        season: [Season.SUMMER],
        scenarios: ['casual'],
        wishlist: false,
        userId: 'user-1',
        dateAdded: '2024-01-04'
      }
    ];

    // Rerender with updated items
    rerender({ items: updatedItems });

    // The hook should have updated its reference
    expect(result.current.duplicates).toEqual([]);
  });
});
