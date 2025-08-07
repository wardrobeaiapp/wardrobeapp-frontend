import { useState } from 'react';
import { WardrobeItem, WishlistStatus } from '../types';
import * as api from '../services/api';

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
      
      // Try to add to backend if authenticated, otherwise add locally
      try {
        // Check if we're in an authenticated context by checking for token
        const token = localStorage.getItem('token');
        
        if (token) {
          // Add to backend API
          const newItem = await api.createWardrobeItem(item);
          setItems(prevItems => [newItem, ...prevItems]);
          return newItem;
        } else {
          // Add to local storage for guest users
          return addItemAsGuest(item);
        }
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
  const updateItem = async (id: string, item: Partial<WardrobeItem>) => {
    try {
      // Check if we're in an authenticated context
      const token = localStorage.getItem('token');
      
      if (token) {
        // Update in backend API
        await api.updateWardrobeItem(id, item);
      }
      
      // Update local state
      setItems(prevItems => prevItems.map(existingItem => 
        existingItem.id === id ? { ...existingItem, ...item } : existingItem
      ));
    } catch (error: any) {
      console.error('[useWardrobeItems] Error updating item:', error);
      setError(error.message || 'Failed to update item');
      throw error;
    }
  };

  // Delete a wardrobe item
  const deleteItem = async (id: string) => {
    try {
      // Check if we're in an authenticated context
      const token = localStorage.getItem('token');
      
      if (token) {
        // Delete from backend API
        await api.deleteWardrobeItem(id);
      }
      
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
