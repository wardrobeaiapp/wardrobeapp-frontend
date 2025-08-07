import { useState, useEffect } from 'react';
import { Outfit } from '../types';
import * as api from '../services/api';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
const { v4: uuidv4 } = require('uuid');

export const useOutfits = (initialOutfits: Outfit[] = []) => {
  const [outfits, setOutfits] = useState<Outfit[]>(initialOutfits);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, isAuthenticated } = useSupabaseAuth();
  const userId = user?.id || 'guest';

  // Load outfits from API or local storage
  useEffect(() => {
    const loadOutfits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated) {
          // Load from API for authenticated users
          try {
            const apiOutfits = await api.fetchOutfits();
            setOutfits(apiOutfits);
          } catch (apiError: any) {
            // Removed excessive logging for performance
            setError(apiError.message || 'Failed to load outfits from server');
            
            // Fallback to localStorage if API fails
            const storedOutfits = localStorage.getItem(`outfits-${userId}`);
            if (storedOutfits) {
              try {
                const parsedOutfits = JSON.parse(storedOutfits);
                setOutfits(parsedOutfits);
                setError(null); // Clear error if we successfully loaded from localStorage
              } catch (parseError) {
                // Removed excessive logging for performance
              }
            }
          }
        } else {
          // Load from localStorage for guest users
          const storedOutfits = localStorage.getItem('guestOutfits');
          if (storedOutfits) {
            try {
              const parsedOutfits = JSON.parse(storedOutfits);
              setOutfits(parsedOutfits);
            } catch (parseError) {
              console.error('[useOutfits] Error parsing stored outfits:', parseError);
              setError('Failed to load saved outfits');
            }
          }
        }
      } catch (error: any) {
        // Removed excessive logging for performance
        setError(error.message || 'Failed to load outfits');
      } finally {
        setIsLoading(false);
      }
    };

    loadOutfits();
  }, [isAuthenticated, userId]);

  // Add a new outfit
  const addOutfit = async (outfit: Omit<Outfit, 'id' | 'dateCreated'>) => {
    try {
      let newOutfit: Outfit;
      
      if (isAuthenticated) {
        // Use API for authenticated users
        try {
          // Call the API which will save to Supabase
          newOutfit = await api.createOutfit(outfit);
          setOutfits(prevOutfits => [newOutfit, ...prevOutfits]);
        } catch (apiError: any) {
          // Removed excessive logging for performance
          setError(apiError.message || 'Failed to create outfit on server');
          
          // Fallback to local storage if API fails
          newOutfit = {
            ...outfit,
            id: uuidv4(),
            dateCreated: new Date().toISOString()
          };
          const updatedOutfits = [newOutfit, ...outfits];
          setOutfits(updatedOutfits);
          localStorage.setItem(`outfits-${userId}`, JSON.stringify(updatedOutfits));
        }
      } else {
        // Use localStorage for guest users
        newOutfit = {
          ...outfit,
          id: `outfit-${Date.now()}`,
          dateCreated: new Date().toISOString(),
        };
        
        // Update state
        setOutfits(prevOutfits => [newOutfit, ...prevOutfits]);
        
        // Save to local storage
        const updatedOutfits = [newOutfit, ...outfits];
        localStorage.setItem('guestOutfits', JSON.stringify(updatedOutfits));
      }
      
      return newOutfit;
    } catch (error: any) {
      // Removed excessive logging for performance
      setError(error.message || 'Failed to add outfit');
      throw error;
    }
  };

  // Update an existing outfit
  const updateOutfit = async (id: string, outfit: Partial<Outfit>) => {
    try {
      // Find the current outfit
      const currentOutfit = outfits.find(item => item.id === id);
      if (!currentOutfit) {
        throw new Error(`Outfit with ID ${id} not found`);
      }
      
      if (isAuthenticated) {
        // Use API for authenticated users
        try {
          await api.updateOutfit(id, outfit);
          
          // Update local state after successful API call
          const updatedOutfits = outfits.map(existingOutfit => 
            existingOutfit.id === id ? { ...existingOutfit, ...outfit } : existingOutfit
          );
          setOutfits(updatedOutfits);
        } catch (apiError: any) {
          // Removed excessive logging for performance
          setError(apiError.message || 'Failed to update outfit on server');
          
          // Update local state and storage anyway as fallback
          const updatedOutfits = outfits.map(existingOutfit => 
            existingOutfit.id === id ? { ...existingOutfit, ...outfit } : existingOutfit
          );
          setOutfits(updatedOutfits);
          localStorage.setItem(`outfits-${userId}`, JSON.stringify(updatedOutfits));
        }
      } else {
        // Update local state for guest users
        const updatedOutfits = outfits.map(existingOutfit => 
          existingOutfit.id === id ? { ...existingOutfit, ...outfit } : existingOutfit
        );
        setOutfits(updatedOutfits);
        
        // Update local storage
        localStorage.setItem('guestOutfits', JSON.stringify(updatedOutfits));
      }
    } catch (error: any) {
      // Removed excessive logging for performance
      setError(error.message || 'Failed to update outfit');
      throw error;
    }
  };

  // Delete an outfit
  const deleteOutfit = async (id: string) => {
    try {
      if (isAuthenticated) {
        // Use API for authenticated users
        try {
          await api.deleteOutfit(id);
          
          // Update local state after successful API call
          const updatedOutfits = outfits.filter(outfit => outfit.id !== id);
          setOutfits(updatedOutfits);
        } catch (apiError: any) {
          // Removed excessive logging for performance
          setError(apiError.message || 'Failed to delete outfit on server');
          
          // Update local state and storage anyway as fallback
          const updatedOutfits = outfits.filter(outfit => outfit.id !== id);
          setOutfits(updatedOutfits);
          localStorage.setItem(`outfits-${userId}`, JSON.stringify(updatedOutfits));
        }
      } else {
        // Update local state for guest users
        const updatedOutfits = outfits.filter(outfit => outfit.id !== id);
        setOutfits(updatedOutfits);
        
        // Update local storage
        localStorage.setItem('guestOutfits', JSON.stringify(updatedOutfits));
      }
    } catch (error: any) {
      // Removed excessive logging for performance
      setError(error.message || 'Failed to delete outfit');
      throw error;
    }
  };

  return {
    outfits,
    setOutfits,
    addOutfit,
    updateOutfit,
    deleteOutfit,
    error,
    setError,
    isLoading
  };
};
