import { useState, useEffect, useCallback } from 'react';
import { Capsule } from '../types'; // Removed unused WardrobeItem import
import { fetchCapsules, createCapsule, updateCapsule, deleteCapsule } from '../services/api';
import { replaceAllCapsuleItems } from '../services/capsuleItemsService';

/**
 * Custom hook to manage capsules with the new capsule-items relationship
 */
export const useCapsules = () => {
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all capsules
  const loadCapsules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchCapsules();
      setCapsules(data);
    } catch (err) {
      // Removed excessive logging for performance
      setError('Failed to load capsules');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new capsule
  const addCapsule = useCallback(async (capsuleData: Omit<Capsule, 'id' | 'dateCreated'> & { selectedItems?: string[] }) => {
    setLoading(true);
    setError(null);

    try {
      // Extract selectedItems before creating the capsule
      let selectedItemsArray = [...(capsuleData.selectedItems || [])];
      const capsuleWithoutItems = { ...capsuleData };
      delete (capsuleWithoutItems as any).selectedItems;
      
      // Removed excessive logging for performance
      
      // IMPORTANT: Add main item to selectedItems array if it exists and isn't already included
      // Do this BEFORE creating the capsule to ensure it's included in the join table
      if (capsuleWithoutItems.mainItemId && !selectedItemsArray.includes(capsuleWithoutItems.mainItemId)) {
        // Removed excessive logging for performance
        selectedItemsArray.push(capsuleWithoutItems.mainItemId);
      }
      
      // Create the capsule in Supabase
      const newCapsule = await createCapsule(capsuleWithoutItems as Omit<Capsule, 'id' | 'dateCreated'>);
      // Removed excessive logging for performance
      
      // Double-check that main item is in selectedItems after capsule creation
      if (newCapsule?.mainItemId && !selectedItemsArray.includes(newCapsule.mainItemId)) {
        // Removed excessive logging for performance
        selectedItemsArray.push(newCapsule.mainItemId);
      }
      
      // If we have a capsule ID and any items to add, update the capsule-items relationship
      if (newCapsule?.id && selectedItemsArray.length > 0) {
        // Removed excessive logging for performance
        
        void replaceAllCapsuleItems(newCapsule.id, selectedItemsArray).then(() => {
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('capsuleItemsChanged', {
            detail: { capsuleId: newCapsule.id, action: 'replace', itemIds: selectedItemsArray }
          }));
          // Removed excessive logging for performance
        }).catch(err => {
          // Removed excessive logging for performance
        });
      } else if (newCapsule?.id && newCapsule.mainItemId) {
        // Fallback: If no items but we have a main item, add just the main item
        // Removed excessive logging for performance
        void replaceAllCapsuleItems(newCapsule.id, [newCapsule.mainItemId]).then(() => {
          window.dispatchEvent(new CustomEvent('capsuleItemsChanged', {
            detail: { capsuleId: newCapsule.id, action: 'replace', itemIds: [newCapsule.mainItemId] }
          }));
          // Removed excessive logging for performance
        }).catch(err => {
          // Removed excessive logging for performance
        });
      } else {
        // Removed excessive logging for performance
      }
      
      // Update local state
      setCapsules(prev => [newCapsule, ...prev]);
      
      // Return the created capsule
      return newCapsule;
    } catch (err) {
      // Removed excessive logging for performance
      setError('Failed to create capsule');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing capsule
  const updateCapsuleById = useCallback(async (id: string, capsuleData: Partial<Omit<Capsule, 'selectedItems'>> & { selectedItems?: string[] }) => {
    setLoading(true);
    setError(null);

    try {
      // Extract selectedItems before updating the capsule
      let selectedItemsArray = [...(capsuleData.selectedItems || [])];
      const capsuleWithoutItems = { ...capsuleData };
      delete (capsuleWithoutItems as any).selectedItems;
      
      // Removed excessive logging for performance
      
      // IMPORTANT: Add main item to selectedItems array if it exists and isn't already included
      if (capsuleWithoutItems.mainItemId && !selectedItemsArray.includes(capsuleWithoutItems.mainItemId)) {
        // Removed excessive logging for performance
        selectedItemsArray.push(capsuleWithoutItems.mainItemId);
      }
      
      // Update the capsule in Supabase
      const updatedCapsule = await updateCapsule(id, capsuleWithoutItems) as Capsule | null;
      // Removed excessive logging for performance
      
      // Double-check that main item is in selectedItems after capsule update
      if (updatedCapsule && updatedCapsule.mainItemId && !selectedItemsArray.includes(updatedCapsule.mainItemId)) {
        // Removed excessive logging for performance
        selectedItemsArray.push(updatedCapsule.mainItemId);
      }
      
      // If we have a capsule ID and any items to add, update the capsule-items relationship
      if (updatedCapsule && updatedCapsule.id && selectedItemsArray.length > 0) {
        // Removed excessive logging for performance
        
        void replaceAllCapsuleItems(updatedCapsule.id, selectedItemsArray).then(() => {
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('capsuleItemsChanged', {
            detail: { capsuleId: updatedCapsule.id, action: 'replace', itemIds: selectedItemsArray }
          }));
          // Removed excessive logging for performance
        }).catch(err => {
          // Removed excessive logging for performance
        });
      } else if (updatedCapsule && updatedCapsule.id && updatedCapsule.mainItemId) {
        // Fallback: If no selected items but we have a main item, add just the main item
        // Removed excessive logging for performance
        void replaceAllCapsuleItems(updatedCapsule.id, [updatedCapsule.mainItemId]).then(() => {
          window.dispatchEvent(new CustomEvent('capsuleItemsChanged', {
            detail: { capsuleId: updatedCapsule.id, action: 'replace', itemIds: [updatedCapsule.mainItemId] }
          }));
          // Removed excessive logging for performance
        }).catch(err => {
          // Removed excessive logging for performance
        });
      } else {
        // Removed excessive logging for performance
      }
      
      // Update local state
      setCapsules(prev => 
        prev.map(capsule => 
          capsule.id === id ? { ...capsule, ...capsuleWithoutItems } : capsule
        )
      );
      
      return true;
    } catch (err) {
      // Removed excessive logging for performance
      setError('Failed to update capsule');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a capsule
  const deleteCapsuleById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await deleteCapsule(id);
      
      // Update local state
      setCapsules(prev => prev.filter(capsule => capsule.id !== id));
      return true;
    } catch (err) {
      // Removed excessive logging for performance
      setError('Failed to delete capsule');
      return false;
    } finally {
      setLoading(false);
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
    return capsules.filter(capsule => capsule.scenario === scenario);
  }, [capsules]);

  // Load capsules on mount
  useEffect(() => {
    void loadCapsules();
  }, [loadCapsules]);

  // Listen for wardrobe item deletion to refresh capsules
  useEffect(() => {
    const handleWardrobeItemDeleted = () => {
      void loadCapsules();
    };

    window.addEventListener('wardrobeItemDeleted', handleWardrobeItemDeleted);

    return () => {
      window.removeEventListener('wardrobeItemDeleted', handleWardrobeItemDeleted);
    };
  }, [loadCapsules]);

  return {
    capsules,
    loading,
    error,
    loadCapsules,
    addCapsule,
    updateCapsuleById,
    deleteCapsuleById,
    getCapsuleById,
    filterCapsulesBySeason,
    filterCapsulesByScenario
  };
};

export default useCapsules;
