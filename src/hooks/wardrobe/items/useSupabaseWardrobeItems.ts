import { useState } from 'react';
import { WardrobeItem, WishlistStatus } from '../../../types';
import { getWardrobeItems, addWardrobeItem, updateWardrobeItem, deleteWardrobeItem } from '../../../services/wardrobe/items';
import { supabase } from '../../../services/core';

export const useSupabaseWardrobeItems = (initialItems: WardrobeItem[] = []) => {
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load wardrobe items from Supabase
  const loadItems = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      const loadedItems = await getWardrobeItems(user.id);
      setItems(loadedItems);
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error loading items:', error);
      setError(error.message || 'Failed to load wardrobe items');
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new wardrobe item
  const addItem = async (item: Omit<WardrobeItem, 'id' | 'dateAdded'>) => {
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
      const newItem = await addWardrobeItem(itemWithStatus);
      
      if (!newItem) {
        throw new Error('Failed to create item');
      }
      
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
      await updateWardrobeItem(id, item);
      
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
      await deleteWardrobeItem(id);
      
      // Remove from local state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (error: any) {
      console.error('[useSupabaseWardrobeItems] Error deleting item:', error);
      setError(error.message || 'Failed to delete item');
      throw error;
    }
  };

  // Upload an image to Supabase Storage with WebP conversion
  const uploadImage = async (file: File): Promise<string> => {
    try {
      // Convert to WebP format with compression
      const { convertToWebP, WebPPresets } = await import('../../../utils/image/webpConverter');
      const compressionResult = await convertToWebP(file, WebPPresets.WARDROBE_STANDARD);
      
      console.log('[useSupabaseWardrobeItems] WebP conversion stats:', {
        original: `${(compressionResult.originalSize / 1024).toFixed(1)}KB`,
        compressed: `${(compressionResult.compressedSize / 1024).toFixed(1)}KB`,
        savings: `${compressionResult.compressionRatio.toFixed(1)}%`
      });
      
      // Use WebP extension for filename
      const fileName = `${Math.random().toString(36).substring(2, 15)}.webp`;
      const filePath = `wardrobe-items/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, compressionResult.blob, {
          contentType: 'image/webp'
        });
        
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

  // Download image from URL using server-side endpoint (bypasses CORS)
  const downloadAndStoreImage = async (imageUrl: string): Promise<string> => {
    try {
      console.log('[useSupabaseWardrobeItems] Downloading image via server endpoint:', imageUrl);
      
      // Get auth token for server request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Call server endpoint to download and store image
      const response = await fetch('/api/wardrobe-items/download-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          imageUrl: imageUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Server error: ${response.status} - ${errorData.error || errorData.message || 'Failed to download image'}`);
      }
      
      const result = await response.json();
      
      if (!result.success || !result.imageUrl) {
        throw new Error('Server did not return a valid image URL');
      }
      
      // Convert relative path to full URL for frontend use
      const fullImageUrl = `${window.location.origin}${result.imageUrl}`;
      
      console.log('[useSupabaseWardrobeItems] Image downloaded and stored successfully:', fullImageUrl);
      console.log('[useSupabaseWardrobeItems] Original URL:', result.originalUrl);
      
      return fullImageUrl;
      
    } catch (error) {
      console.error('[useSupabaseWardrobeItems] Error downloading/storing image:', error);
      throw error;
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
    downloadAndStoreImage,
    moveToWardrobe,
    updateWishlistStatus,
    error,
    setError,
    isLoading
  };
};
