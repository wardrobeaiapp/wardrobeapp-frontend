import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { WardrobeItem, WishlistStatus } from '../types';
import { 
  getWardrobeItems, 
  addWardrobeItem, 
  updateWardrobeItem, 
  deleteWardrobeItem,
  migrateLocalStorageItemsToSupabase
} from '../services/wardrobeItemsService';

interface UseWardrobeItemsDBReturn {
  items: WardrobeItem[];
  setItems: React.Dispatch<React.SetStateAction<WardrobeItem[]>>;
  isLoading: boolean;
  error: string | null;
  addItem: (item: Omit<WardrobeItem, 'id'>, file?: File) => Promise<WardrobeItem | null>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<WardrobeItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  refreshItems: () => Promise<void>;
}

export const useWardrobeItemsDB = (initialItems: WardrobeItem[] = []): UseWardrobeItemsDBReturn => {
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if the component is mounted
  const isMountedRef = useRef<boolean>(true);

  // Memoize the loadItems function to prevent recreation on every render
  const loadItems = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Always attempt to load from the database first
      const dbItems = await getWardrobeItems();
      
      if (!isMountedRef.current) return;
      
      if (dbItems && dbItems.length > 0) {
        setItems(dbItems);
        return;
      }
      
      // If no items in database, try to migrate from localStorage if there are any
      const localStorageItems = JSON.parse(localStorage.getItem('wardrobe-items-guest') || '[]');
      
      if (localStorageItems.length > 0) {
        const migrationSuccess = await migrateLocalStorageItemsToSupabase();
        
        if (!isMountedRef.current) return;
        
        if (migrationSuccess) {
          // If migration was successful, fetch the items again
          const migratedItems = await getWardrobeItems();
          if (isMountedRef.current) {
            setItems(migratedItems);
            // Clear localStorage after successful migration
            localStorage.removeItem('wardrobe-items-guest');
          }
        } else {
          // If migration failed, use the localStorage items
          setItems(localStorageItems);
        }
      }
    } catch (error) {
      console.error('Error loading items:', error);
      if (isMountedRef.current) {
        setError('Failed to load items');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Load items from database on component mount
  useEffect(() => {
    isMountedRef.current = true;
    loadItems();
    
    // Cleanup function to set isMounted to false when component unmounts
    return () => {
      isMountedRef.current = false;
    };
  }, [loadItems]);

  // Add a new item with optimistic updates
  const addItem = useCallback(async (item: Omit<WardrobeItem, 'id'>, file?: File): Promise<WardrobeItem | null> => {
    if (!isMountedRef.current) return null;
    
    setIsLoading(true);
    
    // Create a temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticItem: WardrobeItem = {
      ...item,
      id: tempId,
      dateAdded: new Date().toISOString(),
      timesWorn: 0,
      wishlistStatus: WishlistStatus.NOT_REVIEWED,
      lastWorn: undefined,
      silhouette: item.silhouette || '',
      length: item.length || '',
      sleeves: item.sleeves || 'SHORT',
      style: item.style || 'casual',
      season: item.season || [],
      scenarios: item.scenarios || [],
      wishlist: item.wishlist || false,
      tags: item.tags || {}
    };
    
    // Optimistically add the item to the UI
    setItems(prevItems => [...prevItems, optimisticItem]);
    
    try {
      const newItem = await addWardrobeItem(item, file);
      
      if (isMountedRef.current) {
        if (newItem) {
          // Replace the optimistic item with the actual item from the server
          setItems(prevItems => 
            prevItems.map(i => i.id === tempId ? newItem : i)
          );
          return newItem;
        }
        // If no item was returned, remove the optimistic update
        setItems(prevItems => prevItems.filter(i => i.id !== tempId));
        return null;
      }
      return null;
    } catch (error) {
      console.error('Error adding item:', error);
      // Remove the optimistic update on error
      if (isMountedRef.current) {
        setItems(prevItems => prevItems.filter(i => i.id !== tempId));
      }
      throw error;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Update an existing item with optimistic updates
  const updateItem = useCallback(async (id: string, updates: Partial<WardrobeItem>): Promise<WardrobeItem | null> => {
    if (!isMountedRef.current) return null;
    
    setIsLoading(true);
    const currentItem = items.find(item => item.id === id);
    if (!currentItem) {
      setIsLoading(false);
      throw new Error('Item not found');
    }
    
    // Optimistically update the UI
    const optimisticUpdate = { ...currentItem, ...updates };
    setItems(prevItems => 
      prevItems.map(item => item.id === id ? optimisticUpdate : item)
    );
    
    try {
      const updatedItem = await updateWardrobeItem(optimisticUpdate);
      
      if (isMountedRef.current) {
        if (updatedItem) {
          // Update with server response
          setItems(prevItems => 
            prevItems.map(item => item.id === id ? updatedItem : item)
          );
          return updatedItem;
        }
        // If no updated item from server, revert to current item
        setItems(prevItems => 
          prevItems.map(item => item.id === id ? currentItem : item)
        );
        return null;
      }
      return null;
    } catch (error) {
      console.error('Error updating item:', error);
      // Revert to original item on error
      if (isMountedRef.current) {
        setItems(prevItems => 
          prevItems.map(item => item.id === id ? currentItem : item)
        );
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
    setItems(prevItems => prevItems.filter(item => item.id !== id));
    
    try {
      await deleteWardrobeItem(id);
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      // Revert the optimistic update on error
      if (isMountedRef.current) {
        setItems(prevItems => {
          // Only add back if not already present
          const exists = prevItems.some(item => item.id === id);
          return exists ? prevItems : [...prevItems, itemToDelete];
        });
      }
      throw error; // Re-throw to allow error handling in the component
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
