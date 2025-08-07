import { useState } from 'react';
import { WardrobeItem, WishlistStatus } from '../types';
import * as supabaseApi from '../services/supabaseApi';
import { supabase } from '../services/supabase';

export const useSupabaseWardrobeItems = (initialItems: WardrobeItem[] = []) => {
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load wardrobe items from Supabase
  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const loadedItems = await supabaseApi.fetchWardrobeItems();
      setItems(loadedItems);
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error loading items:', error);
      setError(error.message || 'Failed to load wardrobe items');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new wardrobe item
  const addItem = async (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>) => {
    try {
      console.log('[useSupabaseWardrobeItems] Adding item with name:', item.name);
      
      if (item.imageUrl) {
        // Enhanced logging for image data
        console.log('[useSupabaseWardrobeItems] Image URL starts with:', item.imageUrl.substring(0, 30));
        console.log('[useSupabaseWardrobeItems] Image URL type:', item.imageUrl.startsWith('data:image/') ? 'BASE64' : 'URL');
        console.log('[useSupabaseWardrobeItems] Image URL length:', item.imageUrl.length);
      }
      
      // Set default wishlist status for wishlist items
      const itemWithStatus = {
        ...item,
        wishlistStatus: item.wishlist ? WishlistStatus.NOT_REVIEWED : undefined
      };
      
      // Add to Supabase
      const newItem = await supabaseApi.createWardrobeItem(itemWithStatus);
      
      // Update local state
      setItems(prevItems => [newItem, ...prevItems]);
      return newItem;
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error adding item:', error);
      setError(error.message || 'Failed to add item');
      throw error;
    }
  };

  // Update an existing wardrobe item
  const updateItem = async (id: string, item: Partial<WardrobeItem>) => {
    try {
      // Update in Supabase
      await supabaseApi.updateWardrobeItem(id, item);
      
      // Update local state
      setItems(prevItems => prevItems.map(existingItem => 
        existingItem.id === id ? { ...existingItem, ...item } : existingItem
      ));
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error updating item:', error);
      setError(error.message || 'Failed to update item');
      throw error;
    }
  };

  // Delete a wardrobe item
  const deleteItem = async (id: string) => {
    try {
      // Delete from Supabase
      await supabaseApi.deleteWardrobeItem(id);
      
      // Remove from local state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error deleting item:', error);
      setError(error.message || 'Failed to delete item');
      throw error;
    }
  };

  // Upload an image to Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `wardrobe-items/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  // Move an item from wishlist to wardrobe
  const moveToWardrobe = async (id: string) => {
    try {
      await updateItem(id, { wishlist: false, wishlistStatus: undefined });
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error moving item to wardrobe:', error);
      setError(error.message || 'Failed to move item to wardrobe');
      throw error;
    }
  };

  // Update wishlist item status
  const updateWishlistStatus = async (id: string, status: WishlistStatus) => {
    try {
      await updateItem(id, { wishlistStatus: status });
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error updating wishlist status:', error);
      setError(error.message || 'Failed to update wishlist status');
      throw error;
    }
  };

  return {
    items,
    setItems,
    loadItems,
    addItem,
    updateItem,
    deleteItem,
    uploadImage,
    moveToWardrobe,
    updateWishlistStatus,
    error,
    setError,
    isLoading
  };
};
