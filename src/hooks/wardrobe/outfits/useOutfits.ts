import { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';
import { OutfitExtended, OutfitInput, Season } from '../../../types/outfit';
import { 
  createOutfit as addOutfitToService,
  updateOutfit as updateOutfitInService,
  deleteOutfit as deleteOutfitInService,
  fetchOutfits as fetchOutfitsFromService
} from '../../../services/wardrobe/outfits';

// Re-export Season type for consistency
export type { Season };

interface UseOutfitsReturn {
  outfits: OutfitExtended[];
  isLoading: boolean;
  error: string | null;
  addOutfit: (outfit: Omit<OutfitInput, 'userId'>) => Promise<OutfitExtended>;
  updateOutfit: (outfitId: string, updates: Partial<Omit<OutfitInput, 'id' | 'userId'>>) => Promise<OutfitExtended | null>;
  deleteOutfit: (outfitId: string) => Promise<boolean>;
  setError: (error: string | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useOutfits = (initialOutfits: OutfitExtended[] = []): UseOutfitsReturn => {
  // Get auth state safely
  const { user, isAuthenticated } = useSupabaseAuth();
  const userId = user?.id || 'guest';
  
  // State management
  const [outfits, setOutfits] = useState<OutfitExtended[]>(() => 
    initialOutfits.map(outfit => toOutfit(outfit, outfit.userId || 'guest'))
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize auth state to prevent unnecessary re-renders
  const authState = useMemo(() => ({
    userId,
    isAuthenticated: !!isAuthenticated && !!user
  }), [user, isAuthenticated, userId]);
  
  // Ensure we have a valid user ID
  const getValidUserId = useCallback((): string => {
    if (!user?.id && isAuthenticated) {
      throw new Error('User is authenticated but missing ID');
    }
    return user?.id || 'guest';
  }, [user, isAuthenticated]);
  
  // Helper function to convert any object to OutfitExtended type with all required fields
  const toOutfit = useCallback((data: any, defaultUserId: string): OutfitExtended => {
    if (!data) {
      throw new Error('Cannot convert undefined or null to OutfitExtended');
    }
    
    // Ensure season is properly typed as Season[]
    const seasonArray = Array.isArray(data.season) ? data.season : [];
    const season: Season[] = seasonArray.every((s: any): s is Season => 
      typeof s === 'string' && Object.values(Season).includes(s as Season)
    ) ? seasonArray : [];

    return {
      id: data.id || uuidv4(),
      name: data.name || 'Untitled Outfit',
      description: data.description || '',
      items: Array.isArray(data.items) ? data.items : [],
      season,
      dateCreated: data.dateCreated || new Date().toISOString(),
      userId: data.userId || defaultUserId,
      scenarios: Array.isArray(data.scenarios) ? data.scenarios : [],
      scenarioNames: Array.isArray(data.scenarioNames) ? data.scenarioNames : [],
      // Optional fields
      tags: data.tags,
      imageUrl: data.imageUrl
    };
  }, []);

  // Load outfits from API or local storage
  useEffect(() => {
    const loadOutfits = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (isAuthenticated && user?.id) {
          try {
            // Load from the new outfits service
            const apiResponse = await (async () => {
              if (authState.isAuthenticated && authState.userId) {
                // Fetch outfits without any parameters
                const data = await fetchOutfitsFromService();
                return data.map(outfit => toOutfit(outfit, authState.userId));
              } else {
                const storedOutfits = localStorage.getItem('outfits');
                const parsedOutfits = storedOutfits ? JSON.parse(storedOutfits) : [];
                return Array.isArray(parsedOutfits) ? 
                  parsedOutfits.map((outfit: any) => toOutfit(outfit, 'guest')) : [];
              }
            })();
            setOutfits(apiResponse);
          } catch (apiError) {
            console.error('[useOutfits] Error loading from API:', apiError);
            // Fallback to localStorage if API fails
            const storedOutfits = localStorage.getItem(`outfits-${user.id}`);
            if (storedOutfits) {
              try {
                const parsedOutfits = JSON.parse(storedOutfits);
                const formattedOutfits = Array.isArray(parsedOutfits)
                  ? parsedOutfits.map((outfit: any) => toOutfit(outfit, user.id))
                  : [];
                setOutfits(formattedOutfits);
              } catch (parseError) {
                console.error('[useOutfits] Error parsing stored outfits:', parseError);
                throw new Error('Failed to load outfits from backup');
              }
            } else {
              throw apiError;
            }
          }
        } else {
          // Load from localStorage for guest users
          const storedOutfits = localStorage.getItem('guestOutfits');
          if (storedOutfits) {
            try {
              const parsedOutfits = JSON.parse(storedOutfits);
              const formattedOutfits = Array.isArray(parsedOutfits) 
                ? parsedOutfits.map((outfit: any) => toOutfit(outfit, 'guest'))
                : [];
              setOutfits(formattedOutfits);
            } catch (parseError) {
              console.error('[useOutfits] Error parsing stored outfits:', parseError);
              setError('Failed to load saved outfits');
            }
          }
        }
      } catch (error) {
        console.error('Error loading outfits:', error);
        setError('Failed to load outfits');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOutfits();
  }, [authState.isAuthenticated, authState.userId, isAuthenticated, user?.id, toOutfit]);

  // Note: Removed unused getOutfitsInternal and getOutfits functions as they're not being used in the component

  // Add a new outfit
  const addOutfit = useCallback(async (outfitData: Omit<OutfitInput, 'userId'>): Promise<OutfitExtended> => {
    setIsLoading(true);
    try {
      const currentUserId = getValidUserId();
      
      // Construct new outfit with all required fields
      const newOutfit: OutfitInput = {
        ...outfitData,
        userId: currentUserId,
        dateCreated: new Date().toISOString(),
        scenarios: outfitData.scenarios || [],
        scenarioNames: outfitData.scenarioNames || [],
        items: outfitData.items || [],
        season: outfitData.season || [],
        tags: outfitData.tags || [],
      };
      
      let savedOutfit: OutfitExtended;
      
      if (authState.isAuthenticated) {
        // Save to service
        const result = await addOutfitToService(newOutfit);
        savedOutfit = toOutfit(result, currentUserId);
      } else {
        // Save to local storage
        const outfitId = uuidv4();
        savedOutfit = {
          ...newOutfit,
          id: outfitId,
          userId: 'guest',
          dateCreated: new Date().toISOString() // Ensure dateCreated is always set
        } as OutfitExtended;
        
        // Save to local storage
        const storedOutfits = JSON.parse(localStorage.getItem('outfits') || '[]');
        localStorage.setItem('outfits', JSON.stringify([...storedOutfits, savedOutfit]));
      }
      
      setOutfits(prev => [...prev, savedOutfit]);
      return savedOutfit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add outfit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, getValidUserId, setIsLoading, setError, setOutfits, toOutfit]);

  // Update an existing outfit
  const updateOutfit = useCallback(async (outfitId: string, updates: Partial<Omit<OutfitInput, 'id' | 'userId'>>): Promise<OutfitExtended | null> => {
    setIsLoading(true);
    try {
      const currentUserId = getValidUserId();
      const existingOutfit = outfits.find(o => o.id === outfitId);
      
      if (!existingOutfit) {
        throw new Error('Outfit not found');
      }
      
      // Merge updates with existing outfit
      const updatedOutfit: OutfitExtended = {
        ...existingOutfit,
        ...updates,
        id: outfitId, // Ensure ID doesn't get overridden
        userId: currentUserId, // Ensure user ID is set correctly
        // Ensure required fields are always set
        items: updates.items || existingOutfit.items,
        scenarios: updates.scenarios || existingOutfit.scenarios || [],
        scenarioNames: updates.scenarioNames || existingOutfit.scenarioNames || [],
        season: updates.season || existingOutfit.season || [],
        dateCreated: existingOutfit.dateCreated || new Date().toISOString()
      };
      
      if (authState.isAuthenticated) {
        // Update in service
        await updateOutfitInService(outfitId, updatedOutfit);
      } else {
        // Update in local storage
        const storedOutfits = JSON.parse(localStorage.getItem('outfits') || '[]');
        const updatedOutfits = storedOutfits.map((o: OutfitExtended) => 
          o.id === outfitId ? updatedOutfit : o
        );
        localStorage.setItem('outfits', JSON.stringify(updatedOutfits));
      }
      
      setOutfits(prev => prev.map(o => o.id === outfitId ? updatedOutfit : o));
      return updatedOutfit;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update outfit';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated, getValidUserId, outfits, setIsLoading, setError, setOutfits]);

  // Delete an outfit
  const deleteOutfit = useCallback(async (outfitId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (authState.isAuthenticated) {
        // Delete from the service for authenticated users
        await deleteOutfitInService(outfitId);
      }
      
      // Update local state
      const updatedOutfits = outfits.filter(outfit => outfit.id !== outfitId);
      setOutfits(updatedOutfits);
      
      // Update local storage for both guest and authenticated users
      if (authState.isAuthenticated && authState.userId) {
        localStorage.setItem(`outfits-${authState.userId}`, JSON.stringify(updatedOutfits));
      } else {
        localStorage.setItem('outfits', JSON.stringify(updatedOutfits));
      }
      
      return true;
    } catch (error: any) {
      console.error('[useOutfits] Error deleting outfit:', error);
      setError(error.message || 'Failed to delete outfit');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [outfits, authState.isAuthenticated, authState.userId]);

  // Return the public API with proper typing
  const api: UseOutfitsReturn = {
    outfits,
    isLoading,
    error,
    addOutfit,
    updateOutfit,
    deleteOutfit,
    setError: (error: string | null) => setError(error),
    setIsLoading: (loading: boolean) => setIsLoading(loading)
  };

  return api;
};
