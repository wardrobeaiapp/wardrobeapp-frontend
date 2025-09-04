import { useEffect, useState } from 'react';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';

export const useInitialDataLoading = (
  isLoadingItems: boolean,
  isLoadingOutfits: boolean,
  isLoadingCapsules: boolean,
  itemsError: string | null,
  outfitsError: string | null,
  capsulesError: string | null
) => {
  const { user } = useSupabaseAuth();
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Combine loading states
  useEffect(() => {
    const loading = isLoadingItems || isLoadingOutfits || isLoadingCapsules;
    setIsLoading(loading);

    // Set initial load complete once all data is loaded
    if (!loading && user?.id && !initialLoadComplete) {
      const timer = setTimeout(() => {
        setInitialLoadComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoadingItems, isLoadingOutfits, isLoadingCapsules, user?.id, initialLoadComplete]);

  // Combine errors - convert first non-null error to string
  useEffect(() => {
    const error = itemsError || outfitsError || capsulesError;
    setError(error ? String(error) : null);
  }, [itemsError, outfitsError, capsulesError]);

  return {
    isLoading,
    error,
    initialLoadComplete,
    isAuthenticated: !!user?.id,
  };
};
