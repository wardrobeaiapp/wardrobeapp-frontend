import React, { useState, useEffect, useCallback } from 'react';
import { ProfileData } from '../../../types';
import ShoppingLimitSection from '../sections/ShoppingLimitSection';

interface ShoppingLimitSectionWrapperProps {
  profileData: ProfileData;
  handleNestedChange: (parentField: keyof ProfileData, field: string, value: any) => void;
  forwardedRef?: React.RefObject<{
    syncToContext: () => void;
  } | null>;
}

const ShoppingLimitSectionWrapper: React.FC<ShoppingLimitSectionWrapperProps> = ({ 
  profileData, 
  handleNestedChange,
  forwardedRef 
}) => {
  // Get initial values from profile data
  const initialAmount = typeof profileData.shoppingLimit?.amount === 'number' ? profileData.shoppingLimit.amount : 0;
  const initialFrequency = profileData.shoppingLimit?.frequency || 'monthly';
  
  // Create a local state to track shopping limit changes - only initialize once
  const [localShoppingLimit, setLocalShoppingLimit] = useState({
    amount: initialAmount,
    frequency: initialFrequency
  });
  
  // Expose syncToContext method via ref for parent component to call before save
  const syncToContext = useCallback(() => {
    console.log('StyleProfileSection: Synchronizing latest shopping limit data with context before save', localShoppingLimit);
    // First update the amount
    handleNestedChange('shoppingLimit', 'amount', localShoppingLimit.amount);
    // Then update the frequency
    handleNestedChange('shoppingLimit', 'frequency', localShoppingLimit.frequency);
    // Force a direct update to the shoppingLimit object as a whole
    // Include all required fields from the ShoppingLimit interface
    handleNestedChange('shoppingLimit', '', {
      amount: localShoppingLimit.amount,
      frequency: localShoppingLimit.frequency,
      // Include optional fields with their current values or defaults
      limitAmount: profileData.shoppingLimit?.limitAmount,
      currency: profileData.shoppingLimit?.currency
    });
    return true; // Indicate successful sync
  }, [localShoppingLimit, handleNestedChange, profileData.shoppingLimit]);
  
  // Expose the syncToContext method via the forwarded ref
  useEffect(() => {
    if (forwardedRef) {
      forwardedRef.current = {
        syncToContext
      };
    }
  }, [forwardedRef, syncToContext]);
  
  // Only sync from context to local state when profileData changes externally
  useEffect(() => {
    // Only update local state if profileData.shoppingLimit has changed from external source
    // and is different from our local state
    const externalAmount = typeof profileData.shoppingLimit?.amount === 'number' ? profileData.shoppingLimit.amount : 0;
    const externalFrequency = profileData.shoppingLimit?.frequency || 'monthly';
    
    if (externalAmount !== localShoppingLimit.amount || externalFrequency !== localShoppingLimit.frequency) {
      console.log('StyleProfileSection: Updating local state from external profile data change');
      setLocalShoppingLimit({
        amount: externalAmount,
        frequency: externalFrequency
      });
    }
  // Deliberately omit localShoppingLimit from dependencies to prevent loops
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.shoppingLimit]);
  
  return (
    <ShoppingLimitSection
      key="shopping-limit"
      initialData={{
        shoppingLimit: {
          amount: localShoppingLimit.amount,
          frequency: localShoppingLimit.frequency
        }
      }}
      onSave={(data) => {
        // Log the incoming data from ShoppingLimitSection
        console.log('StyleProfileSection: Received shopping limit data', data);
        
        // Ensure amount is a number and not NaN
        const amount = typeof data.amount === 'number' && !isNaN(data.amount) ? data.amount : 0;
        const frequency = data.frequency || 'monthly';
        
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // Update the local state only
        setLocalShoppingLimit({
          amount,
          frequency
        });
      }}
    />
  );
};

export default ShoppingLimitSectionWrapper;
