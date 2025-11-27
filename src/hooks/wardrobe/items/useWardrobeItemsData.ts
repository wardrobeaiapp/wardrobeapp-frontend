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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, actions.setData]); // Intentionally omit 'actions' to prevent infinite loops

  return {
    items: state.data,
    isLoading: state.isLoading,
    error: state.error,
    refetch: () => actions.loadData(Promise.resolve(items || [])),
  };
};
