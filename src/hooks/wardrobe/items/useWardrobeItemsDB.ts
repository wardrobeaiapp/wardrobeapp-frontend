/**
 * Refactored useWardrobeItemsDB hook
 * Focused on state management with extracted utilities for better maintainability
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { WardrobeItem } from '../../../types';
import { addWardrobeItem, updateWardrobeItem, deleteWardrobeItem } from '../../../services/wardrobe/items';

// Import extracted utilities
import { loadWardrobeItems } from './utils/dataLoader';
import { handleImageUpload } from './utils/imageUploadUtils';
import { 
  createOptimisticItem,
  addOptimisticItem,
  updateOptimisticItem,
  removeOptimisticItem,
  replaceOptimisticItem,
  revertOptimisticUpdate
} from './utils/optimisticUpdates';

interface UseWardrobeItemsDBReturn {
  items: WardrobeItem[];
  setItems: React.Dispatch<React.SetStateAction<WardrobeItem[]>>;
  isLoading: boolean;
  error: string | null;
  addItem: (item: Omit<WardrobeItem, 'id'>, file?: File) => Promise<WardrobeItem | null>;
  updateItem: (id: string, updates: Partial<WardrobeItem>, file?: File) => Promise<WardrobeItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  refreshItems: () => Promise<void>;
}

export const useWardrobeItemsDB = (initialItems: WardrobeItem[] = []): UseWardrobeItemsDBReturn => {
  // State management
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if the component is mounted
  const isMountedRef = useRef<boolean>(true);

  // Load items from database with localStorage fallback and migration
  const loadItems = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    const { items: loadedItems, error: loadError } = await loadWardrobeItems(isMountedRef);
    
    if (isMountedRef.current) {
      setItems(loadedItems);
      setError(loadError);
      setIsLoading(false);
    }
  }, []);

  // Load items on component mount
  useEffect(() => {
    isMountedRef.current = true;
    loadItems();
    
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMountedRef.current = false;
    };
  }, [loadItems]);

  useEffect(() => {
    const handler = () => {
      loadItems();
    };

    window.addEventListener('wardrobe:changed', handler as EventListener);
    return () => {
      window.removeEventListener('wardrobe:changed', handler as EventListener);
    };
  }, [loadItems]);

  // Add a new item with optimistic updates and image upload
  const addItem = useCallback(async (item: Omit<WardrobeItem, 'id'>, file?: File): Promise<WardrobeItem | null> => {
    if (!isMountedRef.current) return null;
    
    setIsLoading(true);
    
    // Create optimistic item and add to UI immediately
    const optimisticItem = createOptimisticItem(item);
    setItems(prevItems => addOptimisticItem(prevItems, optimisticItem));
    
    try {
      // Handle image upload if needed
      const { imageUrl: finalImageUrl } = await handleImageUpload(file, item.imageUrl);
      
      // Prepare item for database with uploaded image URL
      const itemWithFinalImage = {
        ...item,
        imageUrl: finalImageUrl,
        scenarios: item.scenarios || []
      };
      
      console.log('HOOK: About to add wardrobe item with scenarios:', itemWithFinalImage.scenarios);
      console.log('HOOK: Final imageUrl:', finalImageUrl);
      
      const newItem = await addWardrobeItem(itemWithFinalImage);
      
      if (isMountedRef.current) {
        if (newItem) {
          // Replace optimistic item with actual item from server
          setItems(prevItems => replaceOptimisticItem(prevItems, optimisticItem.id, newItem));
          return newItem;
        }
        // If no item was returned, remove the optimistic update
        setItems(prevItems => removeOptimisticItem(prevItems, optimisticItem.id));
        return null;
      }
      return null;
    } catch (error) {
      console.error('Error adding item:', error);
      // Remove the optimistic update on error
      if (isMountedRef.current) {
        setItems(prevItems => removeOptimisticItem(prevItems, optimisticItem.id));
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Update an existing item with optimistic updates and image upload
  const updateItem = useCallback(async (id: string, updates: Partial<WardrobeItem>, file?: File): Promise<WardrobeItem | null> => {
    if (!isMountedRef.current) return null;
    
    setIsLoading(true);
    const currentItem = items.find(item => item.id === id);
    if (!currentItem) {
      setIsLoading(false);
      throw new Error('Item not found');
    }
    
    // Apply optimistic update to UI immediately
    setItems(prevItems => updateOptimisticItem(prevItems, id, updates));
    
    try {
      // Handle image upload if needed
      const { imageUrl: finalImageUrl } = await handleImageUpload(file, updates.imageUrl);
      
      // Prepare final updates with uploaded image URL
      const finalUpdates = { 
        ...updates,
        ...(finalImageUrl !== updates.imageUrl && { imageUrl: finalImageUrl })
      };
      
      console.log('HOOK: Final updates:', finalUpdates);
      const updatedItem = await updateWardrobeItem(id, finalUpdates);
      
      // Debug: Check cleanup conditions
      console.log('HOOK: Cleanup conditions check:', {
        updatedItem: !!updatedItem,
        file: !!file,
        currentImageUrl: currentItem.imageUrl,
        finalImageUrl: finalImageUrl,
        urlsDifferent: currentItem.imageUrl !== finalImageUrl
      });
      
      // Clean up old image after successful update (if image was replaced)
      if (updatedItem && currentItem.imageUrl && finalImageUrl && currentItem.imageUrl !== finalImageUrl) {
        console.log('HOOK: Cleaning up old image after successful update:', currentItem.imageUrl);
        // Import and call cleanup function (don't await to avoid blocking)
        import('../../../services/core/imageService').then(({ deleteImageFromStorage }) => {
          deleteImageFromStorage(currentItem.imageUrl!);
        }).catch(error => {
          console.error('HOOK: Error cleaning up old image:', error);
        });
      } else {
        console.log('HOOK: Skipping image cleanup - conditions not met');
      }
      
      if (isMountedRef.current) {
        if (updatedItem) {
          // Update with server response
          setItems(prevItems => updateOptimisticItem(prevItems, id, updatedItem));
          return updatedItem;
        }
        // If no updated item from server, revert to current item
        setItems(prevItems => revertOptimisticUpdate(prevItems, id, currentItem));
        return null;
      }
      return null;
    } catch (error) {
      console.error('Error updating item:', error);
      // Revert to original item on error
      if (isMountedRef.current) {
        setItems(prevItems => revertOptimisticUpdate(prevItems, id, currentItem));
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [items]);

  // Delete an item with optimistic updates
  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    if (!isMountedRef.current) return false;
    
    setIsLoading(true);
    const currentItem = items.find(item => item.id === id);
    if (!currentItem) {
      setIsLoading(false);
      return false;
    }
    
    // Apply optimistic update to UI immediately
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    
    try {
      await deleteWardrobeItem(id);
      
      // Clean up image after successful deletion
      if (currentItem.imageUrl) {
        console.log('HOOK: Cleaning up image after successful deletion:', currentItem.imageUrl);
        // Import and call cleanup function (don't await to avoid blocking)
        import('../../../services/core/imageService').then(({ deleteImageFromStorage }) => {
          deleteImageFromStorage(currentItem.imageUrl!);
        }).catch(error => {
          console.error('HOOK: Error cleaning up image after deletion:', error);
        });
      }
      
      // If we reach here, the deletion was successful
      return true;
    } catch (error) {
      // If deletion failed, revert the optimistic update
      if (isMountedRef.current) {
        setItems(prevItems => addOptimisticItem(prevItems, currentItem));
      }
      console.error('HOOK: Error deleting item:', error);
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [items]);

  // Memoize the returned object to prevent unnecessary re-renders
  return useMemo(() => ({
    items,
    setItems,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: loadItems
  }), [items, isLoading, error, addItem, updateItem, deleteItem, loadItems]);
};
