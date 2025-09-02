import { useState, useCallback } from 'react';
import { WardrobeItem, WishlistStatus } from '../types';
import { addWardrobeItem, updateWardrobeItem, deleteWardrobeItem } from '../services/wardrobe/items';

export const useWardrobeItems = (initialItems: WardrobeItem[] = []) => {
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [error, setError] = useState<string | null>(null);

  // Add a new wardrobe item
  const addItem = async (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>) => {
    try {
      console.log('[useWardrobeItems] Adding item with name:', item.name);
      
      if (item.imageUrl) {
        // Enhanced logging for image data
        console.log('[useWardrobeItems] Image URL starts with:', item.imageUrl.substring(0, 30));
        console.log('[useWardrobeItems] Image URL type:', item.imageUrl.startsWith('data:image/') ? 'BASE64' : 'URL');
        console.log('[useWardrobeItems] Image URL length:', item.imageUrl.length);
      }
      
      // Helper function to add item as guest user
      const addItemAsGuest = (itemData: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>) => {
        // Set default wishlist status for wishlist items
        const wishlistStatus = itemData.wishlist ? WishlistStatus.NOT_REVIEWED : undefined;
        
        const newItem: WardrobeItem = {
          ...itemData,
          id: `item-${Date.now()}`,
          dateAdded: new Date().toISOString(),
          timesWorn: 0,
          wishlistStatus,
        };
        
        console.log('[useWardrobeItems] Created new item for guest user with ID:', newItem.id);
        if (newItem.imageUrl) {
          console.log('[useWardrobeItems] New item image URL type:', newItem.imageUrl.startsWith('data:image/') ? 'BASE64' : 'URL');
        }
        
        // Update state with the new item
        setItems(prevItems => [newItem, ...prevItems]);
        return newItem;
      };
      
      // Use the imported service functions which handle both authenticated and unauthenticated states
      try {
        const newItem = await addWardrobeItem(item);
        if (newItem) {
          setItems(prevItems => [newItem, ...prevItems]);
        }
        return newItem;
      } catch (error) {
        console.error('[useWardrobeItems] Error in addItem, falling back to guest mode:', error);
        // Final fallback - try to add as guest
        return addItemAsGuest(item);
      }
    } catch (error: any) {
      console.error('[useWardrobeItems] Error adding item:', error);
      setError(error.message || 'Failed to add item');
      throw error;
    }
  };

  // Update an existing wardrobe item
  const updateItem = async (id: string, updates: Partial<WardrobeItem>) => {
    try {
      // Use the item service which handles both authenticated and unauthenticated states
      const updatedItem = await updateWardrobeItem(id, updates);
      
      // Update local state
      if (updatedItem) {
        setItems(prevItems => prevItems.map(existingItem => 
          existingItem.id === id ? { ...existingItem, ...updatedItem } : existingItem
        ));
      }
      
      return updatedItem;
    } catch (error: any) {
      console.error('[useWardrobeItems] Error updating item:', error);
      setError(error.message || 'Failed to update item');
      throw error;
    }
  };

  // Delete a wardrobe item
  const deleteItem = async (id: string) => {
    try {
      // Use the item service which handles both authenticated and unauthenticated states
      await deleteWardrobeItem(id);
      
      // Remove from local state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('[useWardrobeItems] Error deleting item:', error);
      setError(error.message || 'Failed to delete item');
      throw error;
    }
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    error,
    setError
  };
};
