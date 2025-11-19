import React, { createContext, useContext, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Capsule } from '../types';
import { 
  OutfitInput, 
  OutfitExtended, 
  WardrobeContextState 
} from '../types/wardrobe';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { useWardrobeItemsDB } from '../hooks/wardrobe/items';

// Types are now imported from '../types/wardrobe'
// Re-export types that are used by other components
export type { OutfitExtended } from '../types/wardrobe';

const WardrobeContext = createContext<WardrobeContextState | undefined>(undefined);

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};

interface WardrobeProviderProps {
  children: ReactNode;
}

export const WardrobeProvider: React.FC<WardrobeProviderProps> = ({ children }): React.ReactElement => {
  const { user } = useSupabaseAuth();

  // PERFORMANCE OPTIMIZATION: Use shared hooks to prevent duplicate queries
  // Items (most important for page functionality)
  const { 
    items, 
    addItem, 
    updateItem, 
    deleteItem, 
    error: itemsError,
    isLoading: itemsLoading
  } = useWardrobeItemsDB([]);

  // Outfits (deferred loading - only when outfits are needed)
  // This prevents blocking the main thread on initial page load
  const [outfitsLoaded, setOutfitsLoaded] = React.useState(false);
  const [outfits, setOutfits] = React.useState<OutfitExtended[]>([]);
  const [outfitsError, setOutfitsError] = React.useState<string | null>(null);
  const [isOutfitsLoading, setIsOutfitsLoading] = React.useState(false);
  
  // Lazy load outfits only when needed
  const loadOutfits = useCallback(async () => {
    if (outfitsLoaded) return;
    
    try {
      setIsOutfitsLoading(true);
      setOutfitsLoaded(true);
      // Import and use the outfits service directly to avoid hook calls
      const { fetchOutfits } = await import('../services/wardrobe/outfits');
      const outfitsData = await fetchOutfits(user?.id);
      setOutfits(outfitsData as OutfitExtended[]);
    } catch (error) {
      console.error('Error loading outfits:', error);
      setOutfitsError('Failed to load outfits');
    } finally {
      setIsOutfitsLoading(false);
    }
  }, [outfitsLoaded, user?.id]);
  
  // Outfit operations with lazy loading
  const addOutfitHook = useCallback(async (outfit: Omit<OutfitExtended, 'id' | 'dateCreated'>) => {
    try {
      // Load outfits if not loaded yet
      if (!outfitsLoaded) {
        await loadOutfits();
      }
      
      // Import and use the outfits service directly
      const { createOutfit } = await import('../services/wardrobe/outfits');
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
  
  const updateOutfitHook = useCallback(async (id: string, updates: Partial<OutfitExtended>) => {
    try {
      if (!outfitsLoaded) {
        await loadOutfits();
      }
      
      const { updateOutfit } = await import('../services/wardrobe/outfits');
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
  
  const deleteOutfitHook = useCallback(async (id: string) => {
    try {
      if (!outfitsLoaded) {
        await loadOutfits();
      }
      
      const { deleteOutfit } = await import('../services/wardrobe/outfits');
      await deleteOutfit(id);
      
      setOutfits(prev => prev.filter(outfit => outfit.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting outfit:', error);
      setOutfitsError('Failed to delete outfit');
      return false;
    }
  }, [loadOutfits, outfitsLoaded]);

  // Capsules (deferred loading - only when capsules tab is accessed)
  // This prevents blocking the main thread on initial page load
  const [capsulesLoaded, setCapsulesLoaded] = React.useState(false);
  const [capsules, setCapsules] = React.useState<Capsule[]>([]);
  const [capsulesError, setCapsulesError] = React.useState<string | null>(null);
  
  // Lazy load capsules only when needed
  const loadCapsules = useCallback(async () => {
    if (capsulesLoaded) return;
    
    try {
      setCapsulesLoaded(true);
      // Import and use the capsules service directly to avoid hook calls
      const { fetchCapsules } = await import('../services/wardrobe/capsules');
      const capsulesData = await fetchCapsules();
      setCapsules(capsulesData);
    } catch (error) {
      console.error('Error loading capsules:', error);
      setCapsulesError('Failed to load capsules');
    }
  }, [capsulesLoaded]);
  
  // Capsule operations with lazy loading
  const addCapsuleHook = useCallback(async (capsule: Omit<Capsule, 'id' | 'dateCreated'>) => {
    try {
      // Load capsules if not loaded yet (but don't reload if already loaded)
      if (!capsulesLoaded) {
        await loadCapsules();
      }
      
      // Capsule creation with proper item association
      
      // Import and use the capsules service directly
      const { createCapsule } = await import('../services/wardrobe/capsules');
      const newCapsule = await createCapsule(capsule);
      
      // Update local state to show new capsule immediately
      setCapsules(prev => [...prev, newCapsule]);
      console.log('[WardrobeContext] Capsule created successfully:', newCapsule.name);
      return newCapsule;
    } catch (error) {
      console.error('Error adding capsule:', error);
      setCapsulesError('Failed to add capsule');
      return null;
    }
  }, [loadCapsules, capsulesLoaded]);
  
  const updateCapsuleHook = useCallback(async (id: string, updates: Partial<Capsule>) => {
    try {
      await loadCapsules(); // Ensure capsules are loaded first
      
      // Import and use the capsules service directly
      const { updateCapsule } = await import('../services/wardrobe/capsules');
      const updatedCapsule = await updateCapsule(id, updates);
      
      // Update local state if update was successful
      if (updatedCapsule) {
        setCapsules(prev => prev.map(cap => cap.id === id ? updatedCapsule : cap));
      }
      return updatedCapsule;
    } catch (error) {
      console.error('Error updating capsule:', error);
      setCapsulesError('Failed to update capsule');
      return null;
    }
  }, [loadCapsules]);
  
  const deleteCapsuleHook = useCallback(async (id: string) => {
    try {
      await loadCapsules(); // Ensure capsules are loaded first
      
      // Import and use the capsules service directly
      const { deleteCapsule } = await import('../services/wardrobe/capsules');
      await deleteCapsule(id);
      
      // Update local state - if no error was thrown, deletion was successful
      setCapsules(prev => prev.filter(cap => cap.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting capsule:', error);
      setCapsulesError('Failed to delete capsule');
      return false;
    }
  }, [loadCapsules]);

  // Handle outfit updates with proper type safety
  const updateOutfit = useCallback(async (
    id: string, 
    updates: Partial<Omit<OutfitExtended, 'id' | 'userId' | 'dateCreated'>>
  ): Promise<OutfitExtended | null> => {
    try {
      const currentOutfit = outfits.find((o: OutfitExtended) => o.id === id);
      if (!currentOutfit) return null;
      
      // Create a properly typed update object with all required fields
      const updateData: Partial<OutfitInput> = {
        name: updates.name ?? currentOutfit.name,
        items: updates.items ?? currentOutfit.items ?? [],
        season: updates.season ?? currentOutfit.season ?? [],
        // Explicitly include scenarios to ensure they are passed through
        scenarios: updates.hasOwnProperty('scenarios') ? updates.scenarios : currentOutfit.scenarios,
        // Include scenarioNames if present
        ...(updates.scenarioNames && { scenarioNames: updates.scenarioNames }),
      };
      
      // Call the update function with proper types
      const updatedOutfit = await updateOutfitHook(id, updateData);
      return updatedOutfit;
    } catch (error) {
      console.error('Error updating outfit:', error);
      return null;
    }
  }, [updateOutfitHook, outfits]);

  // Wrap deleteOutfit to ensure it returns a Promise<boolean>
  const handleDeleteOutfit = useCallback(async (id: string) => {
    try {
      if (deleteOutfitHook) {
        const success = await deleteOutfitHook(id);
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error deleting outfit:', error);
      return false;
    }
  }, [deleteOutfitHook]);
  
  // Combine loading states with priority (show loading until critical data is ready)
  const isLoading = itemsLoading || isOutfitsLoading; // Don't wait for capsules for main loading state
  
  // Only show errors if we don't have any items loaded
  // This prevents showing API errors when we've successfully loaded items from localStorage
  const error = items.length > 0 ? null : (itemsError || outfitsError || capsulesError);

  // Capsule management methods - use hook functions directly for better performance
  const addCapsule = useCallback(async (capsuleData: Omit<Capsule, 'id' | 'dateCreated'>) => {
    try {
      return await addCapsuleHook(capsuleData);
    } catch (err) {
      console.error('Error adding capsule:', err);
      return null;
    }
  }, [addCapsuleHook]);

  const updateCapsule = useCallback(async (id: string, capsuleData: Partial<Capsule>) => {
    try {
      return await updateCapsuleHook(id, capsuleData);
    } catch (err) {
      console.error('Error updating capsule:', err);
      return null;
    }
  }, [updateCapsuleHook]);

  const deleteCapsule = useCallback(async (id: string) => {
    try {
      await deleteCapsuleHook(id);
      return true;
    } catch (err) {
      console.error('Error deleting capsule:', err);
      return false;
    }
  }, [deleteCapsuleHook]);

  // Listen for item deletion events to update outfits
  useEffect(() => {
    const handleItemDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ updatedOutfits: OutfitExtended[] }>;
      if (customEvent.detail?.updatedOutfits) {
        // Outfits may need refresh
      }
    };
    
    // Add event listener with proper type assertion
    window.addEventListener('wardrobeItemDeleted', handleItemDeleted as EventListener);
    
    // Cleanup function
    return () => {
      window.removeEventListener('wardrobeItemDeleted', handleItemDeleted as EventListener);
    };
  }, []);

  const contextValue = useMemo<WardrobeContextState>(() => ({
    // Include all the values and functions that should be in the context
    items,
    outfits,
    capsules,
    addItem,
    updateItem,
    deleteItem,
    addOutfit: async (outfitData) => {
      try {
        // Ensure we have the current user ID
        const currentUser = user;
        if (!currentUser?.id) {
          throw new Error('User not authenticated');
        }

        // Create a properly typed outfit object with all required fields
        const newOutfitData: OutfitExtended = {
          name: outfitData.name,
          items: Array.isArray(outfitData.items) ? outfitData.items : [],
          season: Array.isArray(outfitData.season) ? outfitData.season : [],
          userId: currentUser.id, // Ensure userId is set as string, not undefined
          id: '', // Will be set by the service
          dateCreated: '', // Will be set by the service
          scenarios: Array.isArray(outfitData.scenarios) ? outfitData.scenarios : [],
          scenarioNames: Array.isArray(outfitData.scenarioNames) ? outfitData.scenarioNames : []
        };
        
        const newOutfit = await addOutfitHook(newOutfitData);
        if (!newOutfit) return null;
        
        // Ensure all required fields are present in the returned outfit
        const completeOutfit: OutfitExtended = {
          ...newOutfit,
          id: newOutfit.id || uuidv4(),
          userId: newOutfit.userId || currentUser.id,
          dateCreated: newOutfit.dateCreated || new Date().toISOString(),
          items: newOutfit.items || [],
          season: newOutfit.season || []
        };
        
        return completeOutfit;
      } catch (error) {
        console.error('Error adding outfit:', error);
        return null;
      }
    },
    updateOutfit,
    deleteOutfit: handleDeleteOutfit,
    addCapsule,
    updateCapsule,
    deleteCapsule,
    loadCapsules,
    loadOutfits,
    isLoading,
    error: error || outfitsError || capsulesError || null
  }), [
    items,
    outfits,
    capsules,
    addItem,
    updateItem,
    deleteItem,
    addOutfitHook,
    updateOutfit,
    handleDeleteOutfit,
    addCapsule,
    updateCapsule,
    deleteCapsule,
    loadCapsules,
    loadOutfits,
    isLoading,
    error,
    outfitsError,
    capsulesError,
    user
  ]);

  return (
    <WardrobeContext.Provider value={contextValue}>
      {children}
    </WardrobeContext.Provider>
  );
};
