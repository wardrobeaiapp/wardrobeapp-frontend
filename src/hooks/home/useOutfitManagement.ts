import { useState, useCallback } from 'react';
import { useWardrobe, OutfitExtended } from '../../context/WardrobeContext';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { Outfit } from '../../types';

/**
 * Hook for managing outfit operations (add, update, delete)
 */
export const useOutfitManagement = (modalState?: ReturnType<typeof import('./useModalState').useModalState>) => {
  // User context for authentication
  const { user } = useSupabaseAuth();
  
  // Wardrobe context for outfit operations
  const { outfits, addOutfit, updateOutfit, deleteOutfit } = useWardrobe();
  
  // Local state for outfit management
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [currentOutfitId, setCurrentOutfitId] = useState<string | null>(null);
  
  // Current outfit based on currentOutfitId
  const currentOutfit = outfits.find(outfit => outfit.id === currentOutfitId);
  
  /**
   * View an outfit by setting it as the selected outfit
   */
  const handleViewOutfit = useCallback((outfit: Outfit) => {
    console.log('[useOutfitManagement] handleViewOutfit called:', outfit.id, outfit.name);
    setSelectedOutfit(outfit);
    
    // Open the modal directly if modalState is provided
    if (modalState?.setIsViewOutfitModalOpen) {
      console.log('[useOutfitManagement] Opening view modal via modalState');
      modalState.setIsViewOutfitModalOpen(true);
    }
  }, [modalState]);
  
  /**
   * Edit an outfit by setting the current outfit ID
   */
  const handleEditOutfit = useCallback((outfit: Outfit) => {
    setCurrentOutfitId(outfit.id);
  }, []);
  
  /**
   * Delete an outfit by ID
   */
  const handleDeleteOutfit = useCallback((id: string) => {
    deleteOutfit(id);
    setSelectedOutfit(null);
  }, [deleteOutfit]);
  
  /**
   * Add a new outfit
   */
  const handleAddOutfit = useCallback(async (outfitData: Omit<Outfit, 'id' | 'dateCreated' | 'scenarioNames' | 'scenarios' | 'items' | 'userId'> & { items: string[] }, scenarioNames?: string[]) => {
    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }
    
    try {
      // Create the new outfit with all required fields for OutfitExtended
      const newOutfit = {
        ...outfitData,
        id: '', // Will be set by the database
        userId: user.id,
        items: outfitData.items,
        season: outfitData.season || [],
        dateCreated: new Date().toISOString()
      } as Omit<OutfitExtended, 'id' | 'dateCreated'>;
      
      await addOutfit(newOutfit);
    } catch (error) {
      console.error('Failed to add outfit:', error);
      // Consider adding error state to show in UI
    }
  }, [addOutfit, user]);
  
  /**
   * Edit an existing outfit
   */
  const handleEditOutfitSubmit = useCallback(async (outfitData: Partial<Outfit> & { id?: string }) => {
    if (!currentOutfitId) {
      console.error('No outfit selected for editing');
      return;
    }
    
    try {
      // Create a safe updates object with only the fields we want to update
      const { id, dateCreated, scenarioNames, ...updates } = outfitData;
      
      // Ensure required fields are not accidentally removed
      const safeUpdates: Partial<Outfit> = {
        ...updates,
        items: updates.items || [],
        season: updates.season || [],
      };
      
      await updateOutfit(currentOutfitId, safeUpdates);
      setCurrentOutfitId(null);
    } catch (error) {
      console.error('Failed to update outfit:', error);
      // Consider adding error state to show in UI
    }
  }, [currentOutfitId, updateOutfit]);
  
  return {
    // State
    selectedOutfit,
    setSelectedOutfit,
    currentOutfit,
    currentOutfitId,
    setCurrentOutfitId,
    
    // Handlers
    handleViewOutfit,
    handleEditOutfit,
    handleDeleteOutfit,
    handleAddOutfit,
    handleEditOutfitSubmit,
  };
};
