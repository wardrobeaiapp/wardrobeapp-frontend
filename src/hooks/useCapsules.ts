import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Capsule, Season } from '../types';
import { fetchCapsules, createCapsule, updateCapsule, deleteCapsule } from '../services/api';
import { replaceAllCapsuleItems } from '../services/capsuleItemsService';

// Store the last fetched capsules to prevent unnecessary state updates
let lastFetchedCapsules: Capsule[] | null = null;

/**
 * Custom hook to manage capsules with the new capsule-items relationship
 */
export const useCapsules = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  // Fetch all capsules
  const loadCapsules = useCallback(async () => {
    if (!isMounted.current) return;
    
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCapsules();
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
      console.error('Error loading capsules:', err);
      setError('Failed to load capsules');
      setCapsules([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);
  
  // Initial load and setup
  useEffect(() => {
    isMounted.current = true;
    
    // Initial load only if we don't have cached data
    if (!lastFetchedCapsules) {
      loadCapsules();
    } else {
      // Use cached data if available
      setCapsules(lastFetchedCapsules);
      setLoading(false);
    }
    
    // Set up refresh event listener
    const handleRefreshCapsules = () => {
      loadCapsules();
    };
    
    window.addEventListener('refreshCapsules', handleRefreshCapsules);
    
    // Cleanup
    return () => {
      isMounted.current = false;
      window.removeEventListener('refreshCapsules', handleRefreshCapsules);
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

  // Get a capsule by ID
  const getCapsuleById = useCallback((id: string) => {
    return capsules.find(capsule => capsule.id === id) || null;
  }, [capsules]);

  // Filter capsules by season
  const filterCapsulesBySeason = useCallback((season: string) => {
    if (season === 'all') return capsules;
    return capsules.filter(capsule => 
      capsule.seasons && Array.isArray(capsule.seasons) && 
      capsule.seasons.includes(season as any)
    );
  }, [capsules]);

  // Filter capsules by scenario
  const filterCapsulesByScenario = useCallback((scenario: string) => {
    if (scenario === 'all') return capsules;
    return capsules.filter(capsule => 
      capsule.scenarios && 
      Array.isArray(capsule.scenarios) && 
      capsule.scenarios.includes(scenario)
    );
  }, [capsules]);

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
