import { useState, useEffect, useRef } from 'react';
import { WardrobeItem, WishlistStatus } from '../types';
import { 
  getWardrobeItems, 
  addWardrobeItem, 
  updateWardrobeItem, 
  deleteWardrobeItem,
  migrateLocalStorageItemsToSupabase
} from '../services/wardrobeItemsService';
import { fetchOutfits } from '../services/outfitService';

export const useWardrobeItemsDB = (initialItems: WardrobeItem[] = []) => {
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track if the component is mounted
  const isMountedRef = useRef<boolean>(true);

  // Load items from database on component mount
  useEffect(() => {
    // Set mounted flag to true when component mounts
    isMountedRef.current = true;
    
    const loadItems = async () => {
      // Set loading state to true immediately and ensure it's visible
      setIsLoading(true);
      
      // Removed artificial delay that may cause blinking
      
      // Removed unused startTime variable that was previously used for minimum loading duration
      try {
        // Always attempt to load from the database first
        const dbItems = await getWardrobeItems();
        
        if (dbItems && dbItems.length > 0) {
          setItems(dbItems);
        } else {
          // If no items in database, try to migrate from localStorage if there are any
          const localStorageItems = JSON.parse(localStorage.getItem('wardrobe-items-guest') || '[]');
          
          if (localStorageItems.length > 0) {
            // Removed excessive logging for performance
            const migrationSuccess = await migrateLocalStorageItemsToSupabase();
            if (migrationSuccess) {
              // If migration was successful, fetch the items again
              const migratedItems = await getWardrobeItems();
              setItems(migratedItems);
              // Clear localStorage after successful migration
              localStorage.removeItem('wardrobe-items-guest');
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load wardrobe items');
      } finally {
        // Set loading state to false immediately when data is ready
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    loadItems();
    
    // Cleanup function to run when component unmounts
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Add a new wardrobe item
  const addItem = async (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>) => {
    try {
      setIsLoading(true);
      // Removed excessive logging for performance
      
      // Set default wishlist status for wishlist items
      const wishlistStatus = item.wishlist ? WishlistStatus.NOT_REVIEWED : undefined;
      
      const newItemData = {
        ...item,
        dateAdded: new Date().toISOString(),
        timesWorn: 0,
        wishlistStatus,
      };
      
      const newItem = await addWardrobeItem(newItemData);
      
      if (newItem) {
        // Removed excessive logging for performance
        setItems(prevItems => [newItem, ...prevItems]);
        return newItem;
      } else {
        throw new Error('Failed to add item to database');
      }
    } catch (err: any) {
      // Removed excessive logging for performance
      setError(err.message || 'Failed to add item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing wardrobe item
  const updateItem = async (id: string, updatedFields: Partial<WardrobeItem>) => {
    try {
      setIsLoading(true);
      // Removed excessive logging for performance
      
      // Find the current item
      const currentItem = items.find(item => item.id === id);
      if (!currentItem) {
        throw new Error(`Item with ID ${id} not found`);
      }
      
      // Merge current item with updated fields
      const updatedItem = {
        ...currentItem,
        ...updatedFields
      };
      
      const result = await updateWardrobeItem(updatedItem);
      
      if (result) {
        console.log('[useWardrobeItemsDB] Item updated successfully:', result);
        
        // Update local state
        setItems(prevItems => 
          prevItems.map(item => item.id === id ? result : item)
        );
        
        return result;
      } else {
        throw new Error('Failed to update item in database');
      }
    } catch (err: any) {
      console.error('[useWardrobeItemsDB] Error updating item:', err);
      setError(err.message || 'Failed to update item');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a wardrobe item
  const deleteItem = async (id: string) => {
    try {
      setIsLoading(true);
      // Removed excessive logging for performance
      
      const success = await deleteWardrobeItem(id);
      
      if (success) {
        // Removed excessive logging for performance
        
        // Update local state
        setItems(prevItems => prevItems.filter(item => item.id !== id));
        
        // Refresh outfits to reflect the changes in the join table
        try {
          // Removed excessive logging for performance
          // This will trigger a re-fetch of outfits from the database
          // which will reflect the cascaded deletions in the join table
          const updatedOutfits = await fetchOutfits();
          
          // We need to dispatch this update to the WardrobeContext
          // This is handled by the custom event below
          window.dispatchEvent(new CustomEvent('wardrobeItemDeleted', { 
            detail: { updatedOutfits } 
          }));
          
          // Removed excessive logging for performance
        } catch (outfitError) {
          // Removed excessive logging for performance
          // Continue with the deletion process even if outfit refresh fails
        }
        
        return true;
      } else {
        throw new Error('Failed to delete item from database');
      }
    } catch (err: any) {
      // Removed excessive logging for performance
      setError(err.message || 'Failed to delete item');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    setItems,
    addItem,
    updateItem,
    deleteItem,
    isLoading,
    error
  };
};
