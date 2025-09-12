import React, { useCallback, useEffect, useState, useImperativeHandle } from 'react';
import { ProfileData, ShoppingLimit } from '../../../../types';

import { getShoppingLimitData, saveShoppingLimitData } from '../../../../services/profile/userBudgetsService';
import { ShoppingLimitData } from '../../../../types/budget.types';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';
import ShoppingLimitSection from '../sections/ShoppingLimitSection';
import SaveConfirmationModal from '../modals/SaveConfirmationModal';

// Type conversion functions
const convertToShoppingLimit = (serviceData: ShoppingLimitData): ShoppingLimit => ({
  amount: serviceData.shoppingLimitAmount || 0,
  frequency: serviceData.shoppingLimitFrequency as 'monthly' | 'quarterly' | 'yearly'
});

const convertToShoppingLimitData = (centralData: ShoppingLimit): ShoppingLimitData => ({
  shoppingLimitAmount: centralData.amount,
  shoppingLimitFrequency: centralData.frequency as 'monthly' | 'quarterly' | 'yearly',
  shoppingLimitUsed: 0,
  periodStartDate: undefined,
  periodEndDate: undefined
});

export interface SaveResult {
  success: boolean;
  error?: string;
}

interface ShoppingLimitSectionWrapperProps {
  initialData?: ProfileData; // Made optional since we'll fetch from service
  onSave: () => void;
}

const ShoppingLimitSectionWrapper = React.forwardRef<
  { saveDirectly: () => Promise<SaveResult>; isSaving: boolean },
  ShoppingLimitSectionWrapperProps
>((props, ref) => {
  const defaultShoppingLimitData: ShoppingLimit = {
    amount: 0,
    frequency: 'monthly'
  };

  const [localData, setLocalData] = useState<ShoppingLimit>(defaultShoppingLimitData);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Removed unused error state
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useSupabaseAuth();

  // Fetch shopping limit data on component mount
  const fetchShoppingLimitData = useCallback(async () => {
    if (!user?.id) {
      console.log('🛍️ ShoppingLimitSectionWrapper - No user ID available, skipping fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Clear any previous errors
      console.log('🛍️ ShoppingLimitSectionWrapper - Fetching shopping limit data for user:', user.id);
      
      const shoppingLimitData = await getShoppingLimitData(user.id);
      console.log('🛍️ ShoppingLimitSectionWrapper - Received shopping limit data:', shoppingLimitData);
      
      setLocalData(convertToShoppingLimit(shoppingLimitData));
    } catch (error) {
      console.error('🛍️ ShoppingLimitSectionWrapper - Error fetching shopping limit data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchShoppingLimitData();
  }, [fetchShoppingLimitData]);

  const saveDirectly = useCallback(async (): Promise<SaveResult> => {
    if (!user?.id) {
      const errorMsg = 'No user ID available for saving shopping limit data';
      console.error('🛍️ ShoppingLimitSectionWrapper - ' + errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setIsSaving(true);
      console.log('🛍️ ShoppingLimitSectionWrapper - Saving shopping limit data for user:', user.id, localData);
      
      await saveShoppingLimitData(user.id, convertToShoppingLimitData(localData));
      console.log('🛍️ ShoppingLimitSectionWrapper - Successfully saved shopping limit data');
      
      setIsModalOpen(true);
      
      props.onSave();
      
      return { success: true };
    } catch (error) {
      console.error('🛍️ ShoppingLimitSectionWrapper - Error saving shopping limit data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Failed to save shopping limit data' };
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, localData, props]);

  useImperativeHandle(ref, () => ({
    saveDirectly,
    isSaving
  }), [saveDirectly, isSaving]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (isLoading) {
    return <div>Loading shopping limit data...</div>;
  }

  return (
    <>
      <ShoppingLimitSection 
        initialData={{
          shoppingLimit: {
            amount: localData.amount || 0,
            frequency: localData.frequency || 'monthly'
          }
        }}
        onSave={(data) => {
          console.log('🛍️ ShoppingLimitSectionWrapper - onSave called with:', data);
          // Update local data when section component calls onSave
          setLocalData({
            amount: data.amount,
            frequency: data.frequency as 'monthly' | 'quarterly' | 'yearly'
          });
        }}
      />
      
      <SaveConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        message="Shopping Limit Updated! Your shopping limit settings have been saved successfully."
      />
    </>
  );
});

export default ShoppingLimitSectionWrapper;
