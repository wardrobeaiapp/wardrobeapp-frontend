import { useMemo } from 'react';
import { ItemCategory } from '../../../../../../types';
import {
  getSilhouetteOptions,
  getSleeveOptions,
  getStyleOptions,
  getLengthOptions,
  getRiseOptions,
  getNecklineOptions,
  getHeelHeightOptions,
  getBootHeightOptions,
  getTypeOptions,
  getPatternOptions
} from '../utils/formHelpers';

/**
 * Custom hook for memoizing form options based on category and subcategory
 * Prevents expensive recalculations on every render
 */
export const useFormOptions = (category: ItemCategory | '', subcategory: string) => {
  // Memoize expensive option calculations
  const silhouetteOptions = useMemo(() => 
    category ? getSilhouetteOptions(category, subcategory) : [], 
    [category, subcategory]
  );
  
  const lengthOptions = useMemo(() => 
    getLengthOptions(subcategory), 
    [subcategory]
  );
  
  const sleeveOptions = useMemo(() => 
    getSleeveOptions(), 
    []
  );
  
  const styleOptions = useMemo(() => 
    getStyleOptions(), 
    []
  );
  
  const riseOptions = useMemo(() => 
    getRiseOptions(), 
    []
  );
  
  const necklineOptions = useMemo(() => 
    getNecklineOptions(), 
    []
  );
  
  const heelHeightOptions = useMemo(() => 
    getHeelHeightOptions(), 
    []
  );
  
  const bootHeightOptions = useMemo(() => 
    getBootHeightOptions(), 
    []
  );
  
  const typeOptions = useMemo(() => 
    getTypeOptions(category, subcategory), 
    [category, subcategory]
  );
  
  const patternOptions = useMemo(() => 
    getPatternOptions(), 
    []
  );

  return {
    silhouetteOptions,
    lengthOptions,
    sleeveOptions,
    styleOptions,
    riseOptions,
    necklineOptions,
    heelHeightOptions,
    bootHeightOptions,
    typeOptions,
    patternOptions
  };
};
