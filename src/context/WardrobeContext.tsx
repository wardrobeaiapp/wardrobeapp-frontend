import React, { createContext, useContext, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WardrobeItem, Capsule, Season } from '../types';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { useWardrobeItemsDB } from '../hooks/wardrobe/items';
import { useOutfits } from '../hooks/wardrobe/outfits/useOutfits';

// Base outfit interface with all possible fields
interface OutfitBase {
  id: string;
  userId: string;
  name: string;
  items: string[];
  dateCreated: string;
  season: Season[];
  scenarios?: string[];
  scenarioNames?: string[];
}

// Input type for creating/updating outfits
type OutfitInput = {
  name: string;
  items: string[];
  season: Season[];
  userId?: string;
  scenarios?: string[];
  scenarioNames?: string[];
};

export type OutfitExtended = OutfitBase;

interface WardrobeContextState {
  items: WardrobeItem[];
  outfits: OutfitExtended[];
  capsules: Capsule[];
  addItem: (item: Omit<WardrobeItem, 'id'>, file?: File) => Promise<WardrobeItem | null>;
  updateItem: (id: string, updates: Partial<WardrobeItem>, file?: File) => Promise<WardrobeItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  addOutfit: (outfit: Omit<OutfitExtended, 'id' | 'dateCreated'>) => Promise<OutfitExtended | null>;
  updateOutfit: (id: string, updates: Partial<Omit<OutfitExtended, 'id' | 'userId' | 'dateCreated'>>) => Promise<OutfitExtended | null>;
  deleteOutfit: (id: string) => Promise<boolean>;
  addCapsule: (capsule: Omit<Capsule, 'id' | 'dateCreated'>) => Promise<Capsule | null>;
  updateCapsule: (id: string, updates: Partial<Capsule>) => Promise<Capsule | null>;
  deleteCapsule: (id: string) => Promise<boolean>;
  loadCapsules: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

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

  // Outfits (optimized with JOIN query to eliminate N+1 problem)
  const {
    outfits = [],
    error: outfitsError,
    isLoading: isOutfitsLoading = false,
    addOutfit: addOutfitHook = async () => null,
    updateOutfit: updateOutfitHook = async () => null,
    deleteOutfit: deleteOutfitHook = async () => false,
  } = useOutfits([]);

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
  
  // Placeholder functions for capsules (to be implemented with lazy loading)
  const addCapsuleHook = useCallback(async (capsule: Omit<Capsule, 'id' | 'dateCreated'>) => {
    await loadCapsules(); // Ensure capsules are loaded first
    return null;
  }, [loadCapsules]);
  
  const updateCapsuleHook = useCallback(async (id: string, updates: Partial<Capsule>) => {
    await loadCapsules(); // Ensure capsules are loaded first
    return null;
  }, [loadCapsules]);
  
  const deleteCapsuleHook = useCallback(async (id: string) => {
    await loadCapsules(); // Ensure capsules are loaded first
    return false;
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
        const newOutfitData: OutfitInput = {
          name: outfitData.name,
          items: Array.isArray(outfitData.items) ? outfitData.items : [],
          season: Array.isArray(outfitData.season) ? outfitData.season : [],
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
