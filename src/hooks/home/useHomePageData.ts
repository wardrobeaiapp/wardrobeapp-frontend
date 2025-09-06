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

export const useHomePageData = (modalState?: ReturnType<typeof import('./useModalState').useModalState>) => {
  // Get the wardrobe context for accessing items data and operations
  const { items, addItem, updateItem, deleteItem } = useWardrobe();

  // Use the specialized item management hook - provides all item-related functionality
  const itemManagement = useItemManagement({
    addItem, // Use the real addItem function from WardrobeContext
    updateItem, // Use the real updateItem function from WardrobeContext
    deleteItem, // Use the real deleteItem function from WardrobeContext
    modalState, // Forward shared modalState to ensure sync
  });
  
  // Use the specialized outfit management hook - pass modalState to ensure modals can be opened
  const outfitManagement = useOutfitManagement(modalState);
  
  // Use the specialized capsule management hook - pass modalState to ensure modals can be opened
  const capsuleManagement = useCapsuleManagement(modalState);

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
