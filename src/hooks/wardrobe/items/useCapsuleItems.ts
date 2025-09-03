import { useState, useEffect, useCallback } from 'react';
import { capsuleItemsService } from '../../../services/wardrobe/capsules';

/**
 * Custom hook to manage capsule items
 */
export const useCapsuleItems = (capsuleId: string | null) => {
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch items for the current capsule
  const fetchItems = useCallback(async () => {
    if (!capsuleId) {
      setItemIds([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await capsuleItemsService.fetchCapsuleItems(capsuleId);
      setItemIds(items);
    } catch (err) {
      console.error('Error fetching capsule items:', err);
      setError('Failed to load capsule items');
    } finally {
      setLoading(false);
    }
  }, [capsuleId]);

  // Add items to the capsule
  const addItems = useCallback(async (newItemIds: string[]) => {
    if (!capsuleId || newItemIds.length === 0) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await capsuleItemsService.addItemsToCapsule(capsuleId, newItemIds);
      if (success) {
        // Update local state
        setItemIds(prev => {
          // Create a Set to avoid duplicates
          const uniqueItems = new Set([...prev, ...newItemIds]);
          return Array.from(uniqueItems);
        });
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('capsuleItemsChanged', {
          detail: { capsuleId, action: 'add', itemIds: newItemIds }
        }));
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding items to capsule:', err);
      setError('Failed to add items to capsule');
      return false;
    } finally {
      setLoading(false);
    }
  }, [capsuleId]);

  // Remove items from the capsule
  const removeItems = useCallback(async (itemIdsToRemove: string[]) => {
    if (!capsuleId || itemIdsToRemove.length === 0) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await capsuleItemsService.removeItemsFromCapsule(capsuleId, itemIdsToRemove);
      if (success) {
        // Update local state
        setItemIds(prev => prev.filter(id => !itemIdsToRemove.includes(id)));
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('capsuleItemsChanged', {
          detail: { capsuleId, action: 'remove', itemIds: itemIdsToRemove }
        }));
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error removing items from capsule:', err);
      setError('Failed to remove items from capsule');
      return false;
    } finally {
      setLoading(false);
    }
  }, [capsuleId]);

  // Replace all items in the capsule
  const replaceAllItems = useCallback(async (newItemIds: string[]) => {
    if (!capsuleId) return false;

    setLoading(true);
    setError(null);

    try {
      const success = await capsuleItemsService.replaceAllCapsuleItems(capsuleId, newItemIds);
      if (success) {
        // Update local state
        setItemIds(newItemIds);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('capsuleItemsChanged', {
          detail: { capsuleId, action: 'replace', itemIds: newItemIds }
        }));
        
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error replacing capsule items:', err);
      setError('Failed to replace capsule items');
      return false;
    } finally {
      setLoading(false);
    }
  }, [capsuleId]);

  // Check if an item is in the capsule
  const isItemInCapsule = useCallback((itemId: string) => {
    return itemIds.includes(itemId);
  }, [itemIds]);

  // Load items when capsuleId changes
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Listen for capsule items changed events from other components
  useEffect(() => {
    const handleCapsuleItemsChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { capsuleId: changedCapsuleId } = customEvent.detail;
      
      // Only update if the event is for our capsule
      if (changedCapsuleId === capsuleId) {
        fetchItems();
      }
    };

    // Also listen for wardrobe item deletion to update our list
    const handleWardrobeItemDeleted = () => {
      fetchItems();
    };

    window.addEventListener('capsuleItemsChanged', handleCapsuleItemsChanged);
    window.addEventListener('wardrobeItemDeleted', handleWardrobeItemDeleted);

    return () => {
      window.removeEventListener('capsuleItemsChanged', handleCapsuleItemsChanged);
      window.removeEventListener('wardrobeItemDeleted', handleWardrobeItemDeleted);
    };
  }, [capsuleId, fetchItems]);

  return {
    itemIds,
    loading,
    error,
    fetchItems,
    addItems,
    removeItems,
    replaceAllItems,
    isItemInCapsule
  };
};

export default useCapsuleItems;
