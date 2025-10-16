import { useEffect } from 'react';
import { Outfit } from '../../types';
import useDataLoading from '../core/useDataLoading';
import { useOutfits } from './outfits/useOutfits';

export const useOutfitsData = () => {
  const { outfits, isLoading, error } = useOutfits([]);
  const [state, actions] = useDataLoading<Outfit[]>([]);

  useEffect(() => {
    if (outfits) {
      actions.setData(outfits);
    }
  }, [outfits, actions.setData]);

  return {
    outfits: state.data,
    isLoading: isLoading || state.isLoading,
    error: error || state.error,
    refetch: () => actions.loadData(Promise.resolve(outfits || [])),
  };
};
