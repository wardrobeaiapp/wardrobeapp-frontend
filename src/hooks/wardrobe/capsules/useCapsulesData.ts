import { useWardrobe } from '../../../context/WardrobeContext';

/**
 * PERFORMANCE OPTIMIZATION:
 * This hook now uses WardrobeContext as single source of truth instead of
 * separate useCapsules hook. This prevents duplicate API calls that were
 * contributing to 175ms blocking operations.
 * 
 * Previous issue: useCapsules was making separate database queries even after
 * outfit optimization, causing continued performance bottleneck.
 */
export const useCapsulesData = () => {
  const { capsules, isLoading, error } = useWardrobe();

  return {
    capsules: capsules || [],
    isLoading,
    error,
    refetch: () => {
      // WardrobeContext handles refetching internally
      console.log('[useCapsulesData] Refetch requested - handled by WardrobeContext');
    },
  };
};
