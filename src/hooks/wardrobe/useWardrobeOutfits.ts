import { useState, useCallback } from 'react';
import { OutfitExtended } from '../../types/wardrobe';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';

/**
 * Custom hook for managing outfit operations with lazy loading
 * Extracted from WardrobeContext to improve maintainability
 */
export const useWardrobeOutfits = () => {
  const { user } = useSupabaseAuth();
  
  // Outfit state management
  const [outfitsLoaded, setOutfitsLoaded] = useState(false);
  const [outfits, setOutfits] = useState<OutfitExtended[]>([]);
  const [outfitsError, setOutfitsError] = useState<string | null>(null);
  const [isOutfitsLoading, setIsOutfitsLoading] = useState(false);
  
  // Lazy load outfits only when needed
  const loadOutfits = useCallback(async () => {
    if (outfitsLoaded) return;
    
    try {
      setIsOutfitsLoading(true);
      setOutfitsLoaded(true);
      // Import and use the outfits service directly to avoid hook calls
      const { fetchOutfits } = await import('../../services/wardrobe/outfits');
      const outfitsData = await fetchOutfits(user?.id);
      setOutfits(outfitsData as OutfitExtended[]);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setOutfitsError('Failed to load outfits');
    } finally {
      setIsOutfitsLoading(false);
    }
  }, [outfitsLoaded, user?.id]);
  
  // Add outfit with lazy loading
  const addOutfit = useCallback(async (outfit: Omit<OutfitExtended, 'id' | 'dateCreated'>) => {
    try {
      // Load outfits if not loaded yet
      if (!outfitsLoaded) {
        await loadOutfits();
      }
      
      // Import and use the outfits service directly
      const { createOutfit } = await import('../../services/wardrobe/outfits');
      const newOutfit = await createOutfit(outfit);
      
      // Update local state
      setOutfits(prev => [...prev, newOutfit as OutfitExtended]);
      return newOutfit as OutfitExtended;
    } catch (error) {
      console.error('Error adding outfit:', error);
      setOutfitsError('Failed to add outfit');
      return null;
    }
  }, [loadOutfits, outfitsLoaded]);
  
  // Update outfit with lazy loading
  const updateOutfit = useCallback(async (id: string, updates: Partial<OutfitExtended>) => {
    try {
      if (!outfitsLoaded) {
        await loadOutfits();
      }
      
      const { updateOutfit } = await import('../../services/wardrobe/outfits');
      await updateOutfit(id, updates);
      
      // Update local state with the changes
      setOutfits(prev => prev.map(outfit => 
        outfit.id === id ? { ...outfit, ...updates } : outfit
      ));
      
      // Return the updated outfit
      const updatedOutfit = outfits.find(o => o.id === id);
      return updatedOutfit ? { ...updatedOutfit, ...updates } : null;
    } catch (error) {
      console.error('Error updating outfit:', error);
      setOutfitsError('Failed to update outfit');
      return null;
    }
  }, [loadOutfits, outfitsLoaded, outfits]);
  
  // Delete outfit with lazy loading
  const deleteOutfit = useCallback(async (id: string) => {
    try {
      if (!outfitsLoaded) {
        await loadOutfits();
      }
      
      const { deleteOutfit } = await import('../../services/wardrobe/outfits');
      await deleteOutfit(id);
      
      setOutfits(prev => prev.filter(outfit => outfit.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting outfit:', error);
      setOutfitsError('Failed to delete outfit');
      return false;
    }
  }, [loadOutfits, outfitsLoaded]);

  return {
    // State
    outfits,
    outfitsError,
    isOutfitsLoading,
    outfitsLoaded,
    
    // Operations
    loadOutfits,
    addOutfit,
    updateOutfit,
    deleteOutfit,
  };
};
