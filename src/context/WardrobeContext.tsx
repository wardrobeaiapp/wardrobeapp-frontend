import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  addItem: (item: Omit<WardrobeItem, 'id' | 'dateAdded' | 'timesWorn'>, file?: File) => void;
  updateItem: (id: string, item: Partial<WardrobeItem>) => void;
  deleteItem: (id: string) => void;
  addOutfit: (outfit: Omit<Outfit, 'id' | 'dateCreated'>) => void;
  updateOutfit: (id: string, outfit: Partial<Outfit>) => void;
  deleteOutfit: (id: string) => void;
  addCapsule: (capsule: Omit<Capsule, 'id' | 'dateCreated'>) => void;
  updateCapsule: (id: string, capsule: Partial<Capsule>) => void;
  deleteCapsule: (id: string) => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [capsuleError, setCapsuleError] = useState<string | null>(null);
  
  // Use the custom hooks for items and outfits
  const { 
    items, 
    setItems,
    addItem, 
    updateItem, 
    deleteItem, 
    error: itemsError
    // Removed unused isLoading variable
  } = useWardrobeItemsDB([]);  // Always start with empty array, the hook will load from DB or localStorage as needed

  const { 
    outfits, 
    setOutfits, 
    addOutfit, 
    updateOutfit, 
    deleteOutfit, 
    error: outfitsError, 
    setError: setOutfitsError 
  } = useOutfits([]);
  
  // Only show errors if we don't have any items loaded
  // This prevents showing API errors when we've successfully loaded items from localStorage
  const error = items.length > 0 ? null : (itemsError || outfitsError || capsuleError);

  // Capsule management methods
  const addCapsule = async (capsuleData: Omit<Capsule, 'id' | 'dateCreated'>) => {
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
  };
  
  const updateCapsule = async (id: string, capsuleData: Partial<Capsule>) => {
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
  };
  
  const deleteCapsule = async (id: string) => {
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
  };

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
      setIsLoading(true);
      setOutfitsError(null);
      setCapsuleError(null);
      
      try {
        // Try to load from localStorage first (for guest users or initial load)
        const cachedItems = localStorage.getItem(`wardrobe-items-${userId}`);
        const cachedOutfits = localStorage.getItem(`outfits-${userId}`);
        const cachedCapsules = localStorage.getItem(`capsules-${userId}`);
        
        // If we have cached data, use it initially
        if (cachedItems) {
          setItems(JSON.parse(cachedItems));
        }
        if (cachedOutfits) {
          setOutfits(JSON.parse(cachedOutfits));
        }
        if (cachedCapsules) {
          setCapsules(JSON.parse(cachedCapsules));
        }
        
        if (isAuthenticated) {
          try {
            // Authenticated user: load from backend API
            // Note: Items are loaded directly by useWardrobeItemsDB hook
            // Only need to handle outfits and capsules here
            // Removed excessive logging for performance
            
            // Load capsules from API
            const loadedCapsules = await api.fetchCapsules();
            setCapsules(loadedCapsules);
            // Removed excessive logging for performance
          } catch (authError: any) {
            // Removed excessive logging for performance
          }
        } else {
          // Guest user: load from localStorage
          // Removed excessive logging for performance
          
          // Loading data as guest user from localStorage
          const guestItems = localStorage.getItem('wardrobe-items-guest');
          const guestOutfits = localStorage.getItem('outfits-guest');
          
          if (guestItems) {
            setItems(JSON.parse(guestItems));
          }
          
          if (guestOutfits) {
            setOutfits(JSON.parse(guestOutfits));
          }
        }
      } catch (error: any) {
        // Removed excessive logging for performance
        // We don't have a setItemsError function, so we'll just log the error
        // Removed excessive logging for performance
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [isAuthenticated, userId, setItems, setOutfits, setOutfitsError]);

  // Save wardrobe items and outfits to database or localStorage
  useEffect(() => {
    if (isLoading) return;
    
    // Items are saved directly to the database by the CRUD operations in useWardrobeItemsDB
    // We only need to handle outfits here
    if (isAuthenticated && userId !== 'guest') {
      // TODO: When outfit database functionality is implemented, save outfits to database here
      // For now, still save to localStorage
      localStorage.setItem(`outfits-${userId}`, JSON.stringify(outfits));
    } else {
      // Save to guest storage
      localStorage.setItem('wardrobe-items-guest', JSON.stringify(items));
      localStorage.setItem(`outfits-guest`, JSON.stringify(outfits));
    }
  }, [items, outfits, isLoading, isAuthenticated, userId]);

  return (
    <WardrobeContext.Provider
      value={{
        items,
        outfits,
        capsules,
        addItem,
        updateItem,
        deleteItem,
        addOutfit,
        updateOutfit,
        deleteOutfit,
        addCapsule,
        updateCapsule,
        deleteCapsule,
        isLoading,
        error
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};
