/**
 * Optimistic update utilities for wardrobe items
 * Handles UI state management for better user experience
 */

import { WardrobeItem, WishlistStatus } from '../../../../types';

/**
 * Creates an optimistic item for immediate UI updates
 * @param item - Item data without ID
 * @returns Complete wardrobe item with temporary ID
 */
export const createOptimisticItem = (item: Omit<WardrobeItem, 'id'>): WardrobeItem => {
  const tempId = `temp-${Date.now()}`;
  
  return {
    ...item,
    id: tempId,
    dateAdded: new Date().toISOString(),
    wishlistStatus: WishlistStatus.NOT_REVIEWED,
    silhouette: item.silhouette || '',
    length: item.length || '',
    sleeves: item.sleeves || 'SHORT',
    style: item.style || 'casual',
    rise: item.rise || undefined,
    neckline: item.neckline || undefined,
    season: item.season || [],
    scenarios: item.scenarios || [],
    wishlist: item.wishlist || false,
    tags: item.tags || {}
  };
};

/**
 * Updates items array with optimistic add
 * @param prevItems - Current items array
 * @param newItem - New item to add
 * @returns Updated items array
 */
export const addOptimisticItem = (prevItems: WardrobeItem[], newItem: WardrobeItem): WardrobeItem[] => {
  return [...prevItems, newItem];
};

/**
 * Updates items array with optimistic update
 * @param prevItems - Current items array
 * @param id - Item ID to update
 * @param updates - Updates to apply
 * @returns Updated items array
 */
export const updateOptimisticItem = (
  prevItems: WardrobeItem[], 
  id: string, 
  updates: Partial<WardrobeItem>
): WardrobeItem[] => {
  return prevItems.map(item => 
    item.id === id ? { ...item, ...updates } : item
  );
};

/**
 * Removes item from array (optimistic delete)
 * @param prevItems - Current items array
 * @param id - Item ID to remove
 * @returns Updated items array
 */
export const removeOptimisticItem = (prevItems: WardrobeItem[], id: string): WardrobeItem[] => {
  return prevItems.filter(item => item.id !== id);
};

/**
 * Replaces temporary item with actual item from server
 * @param prevItems - Current items array
 * @param tempId - Temporary ID to replace
 * @param actualItem - Actual item from server
 * @returns Updated items array
 */
export const replaceOptimisticItem = (
  prevItems: WardrobeItem[], 
  tempId: string, 
  actualItem: WardrobeItem
): WardrobeItem[] => {
  return prevItems.map(item => item.id === tempId ? actualItem : item);
};

/**
 * Reverts optimistic update on error
 * @param prevItems - Current items array
 * @param id - Item ID to revert
 * @param originalItem - Original item to restore
 * @returns Updated items array
 */
export const revertOptimisticUpdate = (
  prevItems: WardrobeItem[], 
  id: string, 
  originalItem: WardrobeItem
): WardrobeItem[] => {
  return prevItems.map(item => item.id === id ? originalItem : item);
};

/**
 * Restores deleted item on error (adds back if not already present)
 * @param prevItems - Current items array
 * @param itemToRestore - Item to restore
 * @returns Updated items array
 */
export const restoreDeletedItem = (
  prevItems: WardrobeItem[], 
  itemToRestore: WardrobeItem
): WardrobeItem[] => {
  // Only add back if not already present
  const exists = prevItems.some(item => item.id === itemToRestore.id);
  return exists ? prevItems : [...prevItems, itemToRestore];
};
