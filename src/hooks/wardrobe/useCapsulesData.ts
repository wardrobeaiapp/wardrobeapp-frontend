import { useEffect } from 'react';
import { Capsule } from '../../types';
import useDataLoading from '../core/useDataLoading';
import { useCapsules } from './capsules/useCapsules';

export const useCapsulesData = () => {
  const { 
    capsules, 
    loading: isLoading, 
    error 
  } = useCapsules();
  
  const [state, actions] = useDataLoading<Capsule[]>([]);

  useEffect(() => {
    if (capsules) {
      actions.setData(capsules);
    }
  }, [capsules, actions.setData]);

  return {
    capsules: state.data,
    isLoading: isLoading || state.isLoading,
    error: error || state.error,
    refetch: () => actions.loadData(Promise.resolve(capsules || [])),
  };
};
