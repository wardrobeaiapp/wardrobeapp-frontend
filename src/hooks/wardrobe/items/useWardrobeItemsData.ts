import { useEffect } from 'react';
import { useWardrobe } from '../../../context/WardrobeContext';
import useDataLoading from '../../core/useDataLoading';
import { WardrobeItem } from '../../../types';

export const useWardrobeItemsData = () => {
  const { items } = useWardrobe();
  const [state, actions] = useDataLoading<WardrobeItem[]>([]);

  useEffect(() => {
    if (items) {
      actions.setData(items);
    }
  }, [items, actions.setData, actions]);

  return {
    items: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: () => actions.loadData(Promise.resolve(items || [])),
  };
};
