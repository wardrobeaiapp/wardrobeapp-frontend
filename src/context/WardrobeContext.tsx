import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { WardrobeItem, Outfit, Capsule } from '../types';
import { useSupabaseAuth } from './SupabaseAuthContext';
import { useWardrobeItemsDB } from '../hooks/useWardrobeItemsDB';
import { useOutfits } from '../hooks/useOutfits';
import * as api from '../services/api';
// Fix UUID import
const { v4: uuidv4 } = require('uuid');

interface WardrobeContextState {
  items: WardrobeItem[];
  outfits: Outfit[];
  capsules: Capsule[];
  addItem: (item: Omit<WardrobeItem, 'id'>, file?: File) => Promise<WardrobeItem | null>;
  updateItem: (id: string, updates: Partial<WardrobeItem>) => Promise<WardrobeItem | null>;
  deleteItem: (id: string) => Promise<boolean>;
  addOutfit: (outfit: Omit<Outfit, 'id' | 'dateCreated'>) => Promise<Outfit | null>;
  updateOutfit: (id: string, updates: Partial<Outfit>) => Promise<Outfit | null>;
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

export const WardrobeProvider: React.FC<WardrobeProviderProps> = ({ children }) => {
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

  const { 
    outfits, 
    setOutfits, 
    addOutfit, 
    updateOutfit: updateOutfitInState, 
    deleteOutfit, 
    error: outfitsError, 
    setError: setOutfitsError,
    isLoading: outfitsLoading
  } = useOutfits([]);

  // Wrap updateOutfit to ensure it returns a Promise<Outfit | null>
  const updateOutfit = useCallback(async (id: string, updates: Partial<Outfit>): Promise<Outfit | null> => {
    try {
      await updateOutfitInState(id, updates);
      const updatedOutfit = outfits.find(o => o.id === id);
      return updatedOutfit || null;
    } catch (error) {
      console.error('Error updating outfit:', error);
      return null;
    }
  }, [updateOutfitInState, outfits]);

  // Wrap deleteOutfit to ensure it returns a Promise<boolean>
  const handleDeleteOutfit = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteOutfit(id);
      return true;
    } catch (error) {
      console.error('Error deleting outfit:', error);
      return false;
    }
  }, [deleteOutfit]);
  
  // Combine loading states
  const isLoading = itemsLoading || outfitsLoading || capsulesLoading;
  
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
          newCapsule = await api.createCapsule(capsuleData);
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
          await api.updateCapsule(id, capsuleData);
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
          await api.deleteCapsule(id);
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
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.updatedOutfits) {
        // Removed excessive logging for performance
        setOutfits(customEvent.detail.updatedOutfits);
      }
    };
    
    // Add event listener
    window.addEventListener('wardrobeItemDeleted', handleItemDeleted);
    
    // Cleanup function
    return () => {
      window.removeEventListener('wardrobeItemDeleted', handleItemDeleted);
    };
  }, [setOutfits]); // Added missing dependency

  // Load data when component mounts or when user changes
  useEffect(() => {
    // Skip loading if auth state is still being determined
    // This prevents premature loading with incorrect auth state
    if (isAuthenticated === undefined) return;
    
    const loadData = async () => {
      setCapsulesLoading(true);
      setOutfitsError(null);
      setCapsuleError(null);
      
      try {
        // Try to load from localStorage first (for guest users or initial load)
        const cachedOutfits = localStorage.getItem(`outfits-${userId}`);
        const cachedCapsules = localStorage.getItem(`capsules-${userId}`);
        
        // If we have cached data, use it initially
        if (cachedOutfits) {
          setOutfits(JSON.parse(cachedOutfits));
        }
        if (cachedCapsules) {
          setCapsules(JSON.parse(cachedCapsules));
        }
        
        if (isAuthenticated) {
          try {
            // Load capsules from API
            const loadedCapsules = await api.fetchCapsules();
            setCapsules(loadedCapsules);
          } catch (authError) {
            console.error('Error loading capsules:', authError);
          }
        } else {
          // Guest user: load from localStorage
          const guestOutfits = localStorage.getItem('outfits-guest');
          if (guestOutfits) {
            setOutfits(JSON.parse(guestOutfits));
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setCapsulesLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, userId, setOutfits, setOutfitsError]);

  // Save outfits to localStorage when they change
  useEffect(() => {
    if (isLoading) return;
    
    if (isAuthenticated && userId !== 'guest') {
      localStorage.setItem(`outfits-${userId}`, JSON.stringify(outfits));
    } else {
      localStorage.setItem('outfits-guest', JSON.stringify(outfits));
    }
  }, [outfits, isLoading, isAuthenticated, userId]);

  // Handle item deletions from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `wardrobe-items-${userId}` || 
          (userId === 'guest' && e.key === 'wardrobe-items-guest')) {
        try {
          const updatedItems = e.newValue ? JSON.parse(e.newValue) : [];
          setWardrobeItems(updatedItems);
        } catch (error) {
          console.error('Error parsing updated items from storage:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userId, setWardrobeItems]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<WardrobeContextState>(() => ({
    items,
    outfits,
    capsules,
    addItem,
    updateItem,
    deleteItem,
    addOutfit,
    updateOutfit,
    deleteOutfit: handleDeleteOutfit, // Use the wrapped version that returns Promise<boolean>
    addCapsule,
    updateCapsule,
    deleteCapsule,
    isLoading,
    error: error || capsuleError
  }), [
    items,
    outfits,
    capsules,
    addItem,
    updateItem,
    deleteItem,
    addOutfit,
    updateOutfit,
    handleDeleteOutfit,
    addCapsule,
    updateCapsule,
    deleteCapsule,
    isLoading,
    error,
    capsuleError
  ]);

  return (
    <WardrobeContext.Provider value={contextValue}>
      {children}
    </WardrobeContext.Provider>
  );
};
