import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { WardrobeItem, Capsule, Season } from '../types';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { useWardrobeItemsDB } from '../hooks/wardrobe/items';
import { useOutfits } from '../hooks/wardrobe/outfits/useOutfits';
import { createCapsule, updateCapsule as updateCapsuleService, deleteCapsule as deleteCapsuleService } from '../services/wardrobe/capsules';

// Base outfit interface with all possible fields
interface OutfitBase {
  id: string;
  userId: string;
  name: string;
  description: string;
  items: string[];
  dateCreated: string;
  lastWorn?: string;
  favorite: boolean;
  season: Season[];
  occasion?: string;
  weather?: string[];
  tags?: string[];
  imageUrl?: string;
  scenarios: string[];
  scenarioNames?: string[];
}

// Alias for backward compatibility
type OutfitType = OutfitBase;

// Input type for creating/updating outfits
type OutfitInput = {
  name: string;
  description: string;
  items: string[];
  season: Season[];
  favorite: boolean;
  scenarios: string[];
  scenarioNames?: string[];
  lastWorn?: string;
  occasion?: string;
  weather?: string[];
  tags?: string[];
  imageUrl?: string;
};

export type OutfitExtended = OutfitBase;

interface WardrobeContextState {
  items: WardrobeItem[];
  outfits: OutfitExtended[];
  capsules: Capsule[];
  addItem: (item: Omit<WardrobeItem, 'id'>, file?: File) => Promise<WardrobeItem | null>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<WardrobeItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  addOutfit: (outfit: Omit<OutfitExtended, 'id' | 'dateCreated'>) => Promise<OutfitExtended | null>;
  updateOutfit: (id: string, updates: Partial<Omit<OutfitExtended, 'id' | 'userId' | 'dateCreated'>>) => Promise<OutfitExtended | null>;
  deleteOutfit: (id: string) => Promise<boolean>;
  addCapsule: (capsule: Omit<Capsule, 'id' | 'dateCreated'>) => Promise<Capsule | null>;
  updateCapsule: (id: string, updates: Partial<Capsule>) => Promise<Capsule | null>;
  deleteCapsule: (id: string) => Promise<boolean>;
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
  const { user, isAuthenticated } = useSupabaseAuth();
  const userId = user?.id || 'guest';

  // Initialize state with empty arrays
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [capsuleError, setCapsuleError] = useState<string | null>(null);
  const [capsulesLoading, setCapsulesLoading] = useState<boolean>(false);
  
  // Use the custom hooks for items and outfits
  const { 
    items, 
    setItems: setWardrobeItems,
    addItem, 
    updateItem, 
    deleteItem, 
    error: itemsError,
    isLoading: itemsLoading
  } = useWardrobeItemsDB([]);  // Always start with empty array, the hook will load from DB or localStorage as needed

  // Use the useOutfits hook with proper type annotations and default values
  const {
    outfits = [],
    error: outfitsError,
    isLoading: isOutfitsLoading = false,
    addOutfit: addOutfitHook = async () => null,
    updateOutfit: updateOutfitHook = async () => null,
    deleteOutfit: deleteOutfitHook = async () => false,
    setError: setOutfitsError = () => {},
  } = useOutfits([]);

  // Handle outfit updates with proper type safety
  const updateOutfit = useCallback(async (
    id: string, 
    updates: Partial<Omit<OutfitExtended, 'id' | 'userId' | 'dateCreated'>>
  ): Promise<OutfitExtended | null> => {
    try {
      const currentOutfit = outfits.find((o: OutfitExtended) => o.id === id);
      if (!currentOutfit) return null;
      
      // Create a properly typed update object with all required fields
      const updateData: OutfitInput = {
        name: updates.name ?? currentOutfit.name,
        description: updates.description ?? currentOutfit.description ?? '',
        items: updates.items ?? currentOutfit.items ?? [],
        season: updates.season ?? currentOutfit.season ?? [],
        favorite: updates.favorite ?? currentOutfit.favorite ?? false,
        scenarios: updates.scenarios ?? currentOutfit.scenarios ?? [],
        // Optional fields with proper fallbacks
        lastWorn: updates.lastWorn ?? currentOutfit.lastWorn,
        occasion: updates.occasion ?? currentOutfit.occasion,
        weather: updates.weather ?? currentOutfit.weather,
        tags: updates.tags ?? currentOutfit.tags,
        imageUrl: updates.imageUrl ?? currentOutfit.imageUrl
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
  
  // Combine loading states
  const isLoading = itemsLoading || isOutfitsLoading || capsulesLoading;
  
  // Only show errors if we don't have any items loaded
  // This prevents showing API errors when we've successfully loaded items from localStorage
  const error = items.length > 0 ? null : (itemsError || outfitsError || capsuleError);

  // Capsule management methods
  const addCapsule = useCallback(async (capsuleData: Omit<Capsule, 'id' | 'dateCreated'>) => {
    try {
      let newCapsule: Capsule;
      
      if (isAuthenticated) {
        // Use API for authenticated users
        try {
          newCapsule = await createCapsule(capsuleData);
          setCapsules([...capsules, newCapsule]);
        } catch (apiError: any) {
          // Silently handle API errors and fall back to local storage
          setCapsuleError(apiError.message || 'Failed to create capsule on server');
          
          // Fallback to local storage if API fails
          newCapsule = {
            ...capsuleData,
            id: uuidv4(),
            dateCreated: new Date().toISOString()
          };
          const updatedCapsules = [...capsules, newCapsule];
          setCapsules(updatedCapsules);
          localStorage.setItem(`capsules-${userId}`, JSON.stringify(updatedCapsules));
        }
      } else {
        // Use localStorage for guest users
        newCapsule = {
          ...capsuleData,
          id: uuidv4(),
          dateCreated: new Date().toISOString()
        };
        const updatedCapsules = [...capsules, newCapsule];
        setCapsules(updatedCapsules);
        localStorage.setItem(`capsules-${userId}`, JSON.stringify(updatedCapsules));
      }
      
      return newCapsule;
    } catch (err) {
      setCapsuleError('Failed to add capsule');
      console.error('Error adding capsule:', err);
      return null;
    }
  }, [capsules, isAuthenticated, userId]);

  const updateCapsule = useCallback(async (id: string, capsuleData: Partial<Capsule>) => {
    try {
      if (isAuthenticated) {
        // Use API for authenticated users
        try {
          await updateCapsuleService(id, capsuleData);
          const updatedCapsules = capsules.map(capsule => 
            capsule.id === id ? { ...capsule, ...capsuleData } : capsule
          );
          setCapsules(updatedCapsules);
        } catch (apiError: any) {
          // Removed excessive logging for performance
          setCapsuleError(apiError.message || 'Failed to update capsule on server');
          
          // Fallback to local storage if API fails
          const updatedCapsules = capsules.map(capsule => 
            capsule.id === id ? { ...capsule, ...capsuleData } : capsule
          );
          setCapsules(updatedCapsules);
          localStorage.setItem(`capsules-${userId}`, JSON.stringify(updatedCapsules));
        }
      } else {
        // Use localStorage for guest users
        const updatedCapsules = capsules.map(capsule => 
          capsule.id === id ? { ...capsule, ...capsuleData } : capsule
        );
        setCapsules(updatedCapsules);
        localStorage.setItem(`capsules-${userId}`, JSON.stringify(updatedCapsules));
      }
      
      return capsules.find(capsule => capsule.id === id) || null;
    } catch (err) {
      setCapsuleError('Failed to update capsule');
      console.error('Error updating capsule:', err);
      return null;
    }
  }, [capsules, isAuthenticated, userId]);

  const deleteCapsule = useCallback(async (id: string) => {
    try {
      if (isAuthenticated) {
        // Use API for authenticated users
        try {
          await deleteCapsuleService(id);
          const updatedCapsules = capsules.filter(capsule => capsule.id !== id);
          setCapsules(updatedCapsules);
        } catch (apiError: any) {
          console.error('[WardrobeContext] API error deleting capsule:', apiError);
          setCapsuleError(apiError.message || 'Failed to delete capsule from server');
          
          // Fallback to local storage if API fails
          const updatedCapsules = capsules.filter(capsule => capsule.id !== id);
          setCapsules(updatedCapsules);
          localStorage.setItem(`capsules-${userId}`, JSON.stringify(updatedCapsules));
        }
      } else {
        // Use localStorage for guest users
        const updatedCapsules = capsules.filter(capsule => capsule.id !== id);
        setCapsules(updatedCapsules);
        localStorage.setItem(`capsules-${userId}`, JSON.stringify(updatedCapsules));
      }
      
      return true;
    } catch (err) {
      setCapsuleError('Failed to delete capsule');
      console.error('Error deleting capsule:', err);
      return false;
    }
  }, [capsules, isAuthenticated, userId]);

  // Listen for item deletion events to update outfits
  useEffect(() => {
    const handleItemDeleted = (event: Event) => {
      const customEvent = event as CustomEvent<{ updatedOutfits: OutfitExtended[] }>;
      if (customEvent.detail?.updatedOutfits) {
        console.log('Item deleted, outfits may need refresh');
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
          description: outfitData.description || '',
          items: Array.isArray(outfitData.items) ? outfitData.items : [],
          favorite: Boolean(outfitData.favorite),
          season: Array.isArray(outfitData.season) ? outfitData.season : [],
          scenarios: Array.isArray(outfitData.scenarios) ? outfitData.scenarios : [],
          occasion: outfitData.occasion || '',
          weather: Array.isArray(outfitData.weather) ? outfitData.weather : [],
          tags: Array.isArray(outfitData.tags) ? outfitData.tags : [],
          imageUrl: outfitData.imageUrl || '',
          lastWorn: outfitData.lastWorn || ''
        };
        
        const newOutfit = await addOutfitHook(newOutfitData);
        if (!newOutfit) return null;
        
        // Ensure all required fields are present in the returned outfit
        const completeOutfit: OutfitExtended = {
          ...newOutfit,
          id: newOutfit.id || uuidv4(),
          userId: newOutfit.userId || currentUser.id,
          dateCreated: newOutfit.dateCreated || new Date().toISOString(),
          scenarios: newOutfit.scenarios || [],
          items: newOutfit.items || [],
          favorite: newOutfit.favorite || false,
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
    isLoading,
    error: error || outfitsError || capsuleError || null
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
    isLoading,
    error,
    outfitsError,
    capsuleError,
    userId
  ]);

  return (
    <WardrobeContext.Provider value={contextValue}>
      {children}
    </WardrobeContext.Provider>
  );
};
