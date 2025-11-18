import { useEffect } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';

/**
 * PERFORMANCE OPTIMIZATION:
 * This hook now uses lazy loading from WardrobeContext to prevent blocking
 * the main thread on initial page load. Capsules only load when this hook
 * is actually used (i.e., when user navigates to capsules tab).
 * 
 * Previous issue: Capsules were loading immediately with items/outfits,
 * causing 157ms main thread blocking and Chrome performance warnings.
 */
export const useCapsulesData = () => {
  const { capsules, isLoading, error, loadCapsules } = useWardrobe();

  // Trigger lazy loading when this hook is used
  useEffect(() => {
    loadCapsules();
  }, [loadCapsules]);

  return {
    capsules: capsules || [],
    isLoading,
    error,
    refetch: loadCapsules,
  };
};
