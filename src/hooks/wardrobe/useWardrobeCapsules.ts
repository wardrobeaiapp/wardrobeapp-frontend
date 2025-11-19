import { useState, useCallback } from 'react';
import { Capsule } from '../../types';

/**
 * Custom hook for managing capsule operations with lazy loading
 * Extracted from WardrobeContext to improve maintainability
 */
export const useWardrobeCapsules = () => {
  // Capsule state management
  const [capsulesLoaded, setCapsulesLoaded] = useState(false);
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [capsulesError, setCapsulesError] = useState<string | null>(null);
  
  // Lazy load capsules only when needed
  const loadCapsules = useCallback(async () => {
    if (capsulesLoaded) return;

    try {
      setCapsulesLoaded(true);
      // Import and use the capsules service directly to avoid hook calls
      const { fetchCapsules } = await import('../../services/wardrobe/capsules');
      const capsulesData = await fetchCapsules();
      setCapsules(capsulesData);
    } catch (error) {
      console.error('Error loading capsules:', error);
      setCapsulesError('Failed to load capsules');
    }
  }, [capsulesLoaded]);
  
  // Add capsule with lazy loading
  const addCapsule = useCallback(async (capsule: Omit<Capsule, 'id' | 'dateCreated'>) => {
    try {
      // Load capsules if not loaded yet (but don't reload if already loaded)
      if (!capsulesLoaded) {
        await loadCapsules();
      }
      
      // Import and use the capsules service directly
      const { createCapsule } = await import('../../services/wardrobe/capsules');
      const newCapsule = await createCapsule(capsule);
      
      // Update local state to show new capsule immediately
      setCapsules(prev => [...prev, newCapsule]);
      console.log('[useWardrobeCapsules] Capsule created successfully:', newCapsule.name);
      return newCapsule;
    } catch (error) {
      console.error('Error adding capsule:', error);
      setCapsulesError('Failed to add capsule');
      return null;
    }
  }, [loadCapsules, capsulesLoaded]);
  
  // Update capsule with lazy loading
  const updateCapsule = useCallback(async (id: string, updates: Partial<Capsule>) => {
    try {
      if (!capsulesLoaded) {
        await loadCapsules();
      }
      
      const { updateCapsule } = await import('../../services/wardrobe/capsules');
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
  }, [loadCapsules, capsulesLoaded]);
  
  // Delete capsule with lazy loading
  const deleteCapsule = useCallback(async (id: string) => {
    try {
      if (!capsulesLoaded) {
        await loadCapsules();
      }
      
      const { deleteCapsule } = await import('../../services/wardrobe/capsules');
      await deleteCapsule(id);
      
      // Update local state - if no error was thrown, deletion was successful
      setCapsules(prev => prev.filter(cap => cap.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting capsule:', error);
      setCapsulesError('Failed to delete capsule');
      return false;
    }
  }, [loadCapsules, capsulesLoaded]);

  return {
    // State
    capsules,
    capsulesError,
    capsulesLoaded,
    
    // Operations
    loadCapsules,
    addCapsule,
    updateCapsule,
    deleteCapsule,
  };
};
