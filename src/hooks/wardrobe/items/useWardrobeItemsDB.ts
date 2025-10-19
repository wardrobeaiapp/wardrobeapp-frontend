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
  revertOptimisticUpdate,
  restoreDeletedItem
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
    const itemToDelete = items.find(item => item.id === id);
    if (!itemToDelete) {
      setIsLoading(false);
      return false;
    }
    
    // Optimistically remove the item from the UI
    setItems(prevItems => removeOptimisticItem(prevItems, id));
    
    try {
      await deleteWardrobeItem(id);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      // Revert the optimistic update on error
      if (isMountedRef.current) {
        setItems(prevItems => restoreDeletedItem(prevItems, itemToDelete));
      }
      throw error;
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
