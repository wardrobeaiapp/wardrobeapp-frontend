import { useEffect } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';

/**
 * PERFORMANCE OPTIMIZATION:
 * This hook now uses lazy loading from WardrobeContext to prevent blocking
 * the main thread on initial page load. Outfits only load when explicitly
 * requested via triggerLoad parameter.
 * 
 * Previous issue: Auto-loading on hook mount caused 161ms performance warnings.
 */
export const useOutfitsData = (triggerLoad: boolean = false) => {
  const { outfits, isLoading, error, loadOutfits } = useWardrobe();

  // Only trigger lazy loading when explicitly requested
  useEffect(() => {
    if (triggerLoad && loadOutfits) {
      loadOutfits();
    }
  }, [triggerLoad, loadOutfits]);

  return {
    outfits: outfits || [],
    isLoading,
    error,
    refetch: loadOutfits || (() => {}),
  };
};
