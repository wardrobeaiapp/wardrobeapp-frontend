import { useState, useCallback, useMemo } from 'react';

interface DataLoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface DataLoadingActions<T> {
  loadData: (promise: Promise<T>) => Promise<T>;
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

/**
 * A reusable hook for handling data loading states and errors
 * @param initialData The initial data value (defaults to null)
 * @returns [state, actions] - The loading state and actions to manage it
 */
function useDataLoading<T = any>(
  initialData: T | null = null
): [DataLoadingState<T>, DataLoadingActions<T>] {
  const [state, setState] = useState<DataLoadingState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const loadData = useCallback(async (promise: Promise<T>): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await promise;
      setState({
        data: result,
        isLoading: false,
        error: null,
      });
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorObj,
      }));
      throw errorObj;
    }
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      isLoading: false,
      error: null,
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
    });
  }, [initialData]);

  const actions: DataLoadingActions<T> = useMemo(() => ({
    loadData,
    setData,
    setError,
    reset,
  }), [loadData, setData, setError, reset]);

  return [state, actions];
}

export default useDataLoading;
