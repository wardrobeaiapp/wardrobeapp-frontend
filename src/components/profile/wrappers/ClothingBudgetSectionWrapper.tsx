import React, { useState, useEffect, useCallback } from 'react';
import { ProfileData, ClothingBudget } from '../../../types';
import BudgetSection from '../sections/BudgetSection';

interface ClothingBudgetSectionWrapperProps {
  profileData: ProfileData;
  handleNestedChange: (parentField: keyof ProfileData, field: string, value: any) => void;
  forwardedRef?: React.RefObject<{
    syncToContext: () => void;
  } | null>;
}

const ClothingBudgetSectionWrapper: React.FC<ClothingBudgetSectionWrapperProps> = ({ 
  profileData, 
  handleNestedChange,
  forwardedRef 
}) => {
  // Local state to track clothing budget data
  const [localClothingBudget, setLocalClothingBudget] = useState({
    amount: Number(profileData.clothingBudget?.amount || 0),
    currency: profileData.clothingBudget?.currency || 'USD',
    frequency: profileData.clothingBudget?.frequency || 'monthly'
  });

  // Function to sync local state to context
  const syncToContext = useCallback(() => {
    // Update the context with local state
    handleNestedChange('clothingBudget', 'amount', localClothingBudget.amount);
    handleNestedChange('clothingBudget', 'currency', localClothingBudget.currency);
    handleNestedChange('clothingBudget', 'frequency', localClothingBudget.frequency);
    return true; // Indicate successful sync
  }, [handleNestedChange, localClothingBudget]);

  // Expose the syncToContext method via the forwarded ref
  useEffect(() => {
    if (forwardedRef) {
      forwardedRef.current = {
        syncToContext
      };
    }
  }, [forwardedRef, syncToContext]);

  // Update local state when profileData changes
  useEffect(() => {
    setLocalClothingBudget({
      amount: Number(profileData.clothingBudget?.amount || 0),
      currency: profileData.clothingBudget?.currency || 'USD',
      frequency: profileData.clothingBudget?.frequency || 'monthly'
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.clothingBudget]);

  return (
    <BudgetSection
      key="clothing-budget"
      initialData={{
        amount: localClothingBudget.amount,
        currency: localClothingBudget.currency,
        frequency: localClothingBudget.frequency
      }}
      onSave={(data: ClothingBudget) => {
        // Ensure amount is a number and not NaN
        const amount = typeof data.amount === 'number' && !isNaN(data.amount) ? data.amount : 0;
        const currency = data.currency || 'USD';
        const frequency = data.frequency || 'monthly';
        
        // Update the local state
        setLocalClothingBudget({
          amount,
          currency,
          frequency
        });
      }}
    />
  );
};

export default ClothingBudgetSectionWrapper;
