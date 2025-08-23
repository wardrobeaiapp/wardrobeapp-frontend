import { useState, useEffect, useCallback, useRef } from 'react';
import { Capsule, Season } from '../types';
import { fetchCapsules, createCapsule, updateCapsule, deleteCapsule } from '../services/api';
import { replaceAllCapsuleItems } from '../services/capsuleItemsService';

// Store the last fetched capsules to prevent unnecessary state updates
let lastFetchedCapsules: Capsule[] | null = null;
let pendingRequest: Promise<Capsule[]> | null = null;

/**
 * Custom hook to manage capsules with the new capsule-items relationship
 */
export const useCapsules = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Memoize the loadCapsules function to prevent unnecessary recreations
  const loadCapsules = useCallback(async (forceRefresh = false) => {
    if (!isMounted.current) return;
    
    // If we already have a pending request, return that instead of creating a new one
    if (pendingRequest && !forceRefresh) {
      try {
        const data = await pendingRequest;
        if (isMounted.current) {
          setCapsules(data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted.current) {
          console.error('Error in pending request:', err);
          setError('Failed to load capsules');
          setLoading(false);
        }
      }
      return;
    }
    
    // If we have cached data and not forcing a refresh, use that
    if (lastFetchedCapsules && !forceRefresh) {
      setCapsules(lastFetchedCapsules);
      setLoading(false);
      return;
    }
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      // Create a new request and store it
      pendingRequest = fetchCapsules();
      const data = await pendingRequest;
      
      if (!isMounted.current) return;
      
      // Only update state if data has changed
      setCapsules(prevCapsules => {
        // Skip update if data is the same
        if (JSON.stringify(prevCapsules) === JSON.stringify(data)) {
          return prevCapsules;
        }
        
        // Store the last fetched data to prevent unnecessary updates
        lastFetchedCapsules = data;
        return data;
      });
    } catch (err) {
      if (!isMounted.current) return;
      
      // Don't show error if the request was aborted
      if (err instanceof Error && err.name !== 'AbortError') {
        console.error('Error loading capsules:', err);
        setError('Failed to load capsules');
      }
    } finally {
      pendingRequest = null;
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);
  
  // Initial load and setup
  useEffect(() => {
    isMounted.current = true;
    
    // Initial load
    loadCapsules();
    
    // Set up refresh event listener
    const handleRefreshCapsules = () => {
      loadCapsules(true); // Force refresh
    };
    
    window.addEventListener('refreshCapsules', handleRefreshCapsules);
    
    // Cleanup
    return () => {
      isMounted.current = false;
      window.removeEventListener('refreshCapsules', handleRefreshCapsules);
      
      // Abort any pending requests on unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadCapsules]);
  

  // Create a new capsule
  const addCapsule = useCallback(async (capsuleData: Omit<Capsule, 'id' | 'dateCreated'> & { selectedItems?: string[] }) => {
    if (!isMounted.current) return null;
    
    setLoading(true);
    setError(null);

    try {
      // Prepare selected items array
      const selectedItemsArray = [...(capsuleData.selectedItems || [])];
      
      // Create a copy of capsule data without selectedItems
      const { selectedItems, ...capsuleWithoutItems } = capsuleData as any;

      // Ensure mainItemId is in selected items
      if (capsuleWithoutItems.mainItemId && !selectedItemsArray.includes(capsuleWithoutItems.mainItemId)) {
        selectedItemsArray.push(capsuleWithoutItems.mainItemId);
      }

      const newCapsule = await createCapsule(capsuleWithoutItems);

      // If there are selected items, create the capsule-item relationships
      if (selectedItemsArray.length > 0 && isMounted.current) {
        await replaceAllCapsuleItems(newCapsule.id, selectedItemsArray);
        if (!isMounted.current) return null;
      }
      
      // Update local state with the new capsule
      if (isMounted.current) {
        setCapsules(prevCapsules => {
          // Check if the capsule already exists to avoid duplicates
          const exists = prevCapsules.some(c => c.id === newCapsule.id);
          return exists ? prevCapsules : [...prevCapsules, newCapsule];
        });
        
        // Dispatch event to refresh capsules in other components
        window.dispatchEvent(new Event('refreshCapsules'));
      }
      
      return newCapsule;
    } catch (err) {
      console.error('[useCapsules] Error adding capsule:', err);
      if (isMounted.current) {
        setError('Failed to add capsule');
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Update an existing capsule
  const updateCapsuleById = useCallback(async (id: string, updates: Partial<Capsule> & { selectedItems?: string[] }) => {
    if (!isMounted.current) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      // Extract selectedItems if present
      const { selectedItems, ...capsuleUpdates } = updates as any;
      
      // Update the capsule
      const updatedCapsule = await updateCapsule(id, capsuleUpdates);
      if (!isMounted.current) return null;
      
      // If selectedItems is provided, update the capsule-item relationships
      if (selectedItems && isMounted.current) {
        await replaceAllCapsuleItems(id, selectedItems);
        if (!isMounted.current) return null;
      }
      
      // Update local state
      if (isMounted.current && updatedCapsule) {
        setCapsules(prevCapsules => {
          const updatedCapsules = prevCapsules.map(capsule => 
            capsule.id === id 
              ? {
                  ...capsule, // Keep existing values as fallback
                  ...updatedCapsule, // Apply updates
                  // Ensure required fields are always present
                  id: updatedCapsule.id || capsule.id,
                  name: updatedCapsule.name ?? capsule.name,
                  description: updatedCapsule.description ?? capsule.description,
                  scenarios: updatedCapsule.scenarios ?? capsule.scenarios ?? [],
                  seasons: updatedCapsule.seasons ?? capsule.seasons ?? [],
                  style: updatedCapsule.style ?? capsule.style ?? '',
                  selectedItems: updatedCapsule.selectedItems ?? capsule.selectedItems ?? [],
                  dateCreated: updatedCapsule.dateCreated ?? updatedCapsule.date_created ?? capsule.dateCreated
                }
              : capsule
          );
          
          // Only update if something actually changed
          const hasChanges = JSON.stringify(prevCapsules) !== JSON.stringify(updatedCapsules);
          return hasChanges ? updatedCapsules : prevCapsules;
        });
        
        // Dispatch event to refresh capsules in other components
        window.dispatchEvent(new Event('refreshCapsules'));
      }
      
      return updatedCapsule;
    } catch (err) {
      console.error('[useCapsules] Error updating capsule:', err);
      if (isMounted.current) {
        setError('Failed to update capsule');
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Delete a capsule
  const deleteCapsuleById = useCallback(async (id: string) => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await deleteCapsule(id);
      
      // Update local state if still mounted
      if (isMounted.current) {
        setCapsules(prevCapsules => {
          const updatedCapsules = prevCapsules.filter(capsule => capsule.id !== id);
          // Only update if something changed
          return updatedCapsules.length !== prevCapsules.length ? updatedCapsules : prevCapsules;
        });
        
        // Dispatch event to refresh capsules in other components
        window.dispatchEvent(new Event('refreshCapsules'));
      }
    } catch (err) {
      console.error('[useCapsules] Error deleting capsule:', err);
      if (isMounted.current) {
        setError('Failed to delete capsule');
      }
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  // Load capsules on mount
  useEffect(() => {
    void loadCapsules();
  }, [loadCapsules]);

  // Memoize the callbacks
  const memoizedLoadCapsules = useCallback((): Promise<void> => {
    lastFetchedCapsules = null;
    return loadCapsules();
  }, [loadCapsules]);
  
  const memoizedAddCapsule = useCallback(async (capsuleData: Omit<Capsule, 'id' | 'dateCreated'> & { selectedItems?: string[] }) => {
    const result = await addCapsule(capsuleData);
    lastFetchedCapsules = null;
    return result;
  }, [addCapsule]);
  
  const memoizedUpdateCapsuleById = useCallback(async (id: string, updates: Partial<Capsule> & { selectedItems?: string[] }) => {
    const result = await updateCapsuleById(id, updates);
    lastFetchedCapsules = null;
    return result;
  }, [updateCapsuleById]);
  
  const memoizedDeleteCapsuleById = useCallback(async (id: string): Promise<void> => {
    await deleteCapsuleById(id);
    lastFetchedCapsules = null;
  }, [deleteCapsuleById]);
  
  const memoizedGetCapsuleById = useCallback((id: string) => {
    return capsules.find(capsule => capsule.id === id) || null;
  }, [capsules]);
  
  const memoizedFilterCapsulesBySeason = useCallback((season: string) => {
    return capsules.filter(capsule => 
      capsule.seasons.includes(season as Season)
    );
  }, [capsules]);
  
  const memoizedFilterCapsulesByScenario = useCallback((scenario: string) => {
    return capsules.filter(capsule => 
      capsule.scenarios.includes(scenario)
    );
  }, [capsules]);

  // Listen for wardrobe item deletion to refresh capsules
  useEffect(() => {
    const handleWardrobeItemDeleted = () => {
      // Invalidate cache and reload
      lastFetchedCapsules = null;
      void loadCapsules();
    };

    window.addEventListener('wardrobeItemDeleted', handleWardrobeItemDeleted);
    return () => {
      window.removeEventListener('wardrobeItemDeleted', handleWardrobeItemDeleted);
    };
  }, [loadCapsules]);

  // Return the API
  return {
    // State
    capsules,
    loading,
    error,
    
    // Actions
    loadCapsules: memoizedLoadCapsules,
    addCapsule: memoizedAddCapsule,
    updateCapsuleById: memoizedUpdateCapsuleById,
    deleteCapsuleById: memoizedDeleteCapsuleById,
    
    // Selectors
    getCapsuleById: memoizedGetCapsuleById,
    filterCapsulesBySeason: memoizedFilterCapsulesBySeason,
    filterCapsulesByScenario: memoizedFilterCapsulesByScenario,
  };
};

export default useCapsules;
