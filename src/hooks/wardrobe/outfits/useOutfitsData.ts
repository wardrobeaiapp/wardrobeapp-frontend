import { useWardrobe } from '../../../context/WardrobeContext';

/**
 * PERFORMANCE OPTIMIZATION:
 * This hook now uses WardrobeContext as single source of truth instead of
 * creating separate useOutfits instances. This prevents duplicate API calls
 * that were causing "message handler took 160ms" performance violations.
 * 
 * Previous issue: Both WardrobeContext and HomePage were calling useOutfits(),
 * causing simultaneous database queries and ~160ms blocking operations.
 */
export const useOutfitsData = () => {
  const { outfits, isLoading, error } = useWardrobe();

  return {
    outfits: outfits || [],
    isLoading,
    error,
    refetch: () => {
      // The WardrobeContext handles refetching internally
      // This is mainly for API compatibility with existing code
      console.log('[useOutfitsData] Refetch requested - handled by WardrobeContext');
    },
  };
};
