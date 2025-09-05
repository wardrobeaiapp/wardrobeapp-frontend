import { useItemManagement } from './useItemManagement';
import { useOutfitManagement } from './useOutfitManagement';
import { useCapsuleManagement } from './useCapsuleManagement';

/**
 * Main hook for HomePage data and operations.
 * This hook now serves as a facade that combines multiple specialized hooks
 * to provide a unified interface for the HomePage component.
 */
import { useWardrobe } from '../../context/WardrobeContext';
import { useMemo } from 'react';

export const useHomePageData = () => {
  // Get the wardrobe context for accessing items data
  const { items } = useWardrobe();

  // Use the specialized item management hook - provides all item-related functionality
  const itemManagement = useItemManagement({
    addItem: () => Promise.resolve(null),
    updateItem: () => Promise.resolve(null),
    deleteItem: () => Promise.resolve(false),
  });
  
  // Use the specialized outfit management hook
  const outfitManagement = useOutfitManagement();
  
  // Use the specialized capsule management hook
  const capsuleManagement = useCapsuleManagement();

  // Derive currentItem from currentItemId and items array
  const currentItem = useMemo(() => 
    itemManagement.currentItemId ? items.find(item => item.id === itemManagement.currentItemId) : undefined
  , [items, itemManagement.currentItemId]);

  return {
    // Item management properties
    ...itemManagement,
    
    // Outfit management properties
    ...outfitManagement,
    
    // Capsule management properties
    ...capsuleManagement,
    
    // Additional derived properties
    currentItem,
    // Make items available for use in other hooks
    items,
  };
};
