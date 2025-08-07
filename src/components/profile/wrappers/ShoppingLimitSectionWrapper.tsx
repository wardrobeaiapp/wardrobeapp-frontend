import React, { useCallback, useEffect, useState, useImperativeHandle } from 'react';
import { ProfileData } from '../../../types';
import ShoppingLimitSection from '../sections/ShoppingLimitSection';
import { getShoppingLimitData, saveShoppingLimitData, ShoppingLimitData } from '../../../services/shoppingLimitService';
import SaveConfirmationModal from '../modals/SaveConfirmationModal';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';

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
  const defaultShoppingLimitData: ShoppingLimitData = {
    shoppingLimitAmount: undefined,
    shoppingLimitFrequency: 'monthly',
    currentSpent: 0,
    periodStartDate: undefined,
    periodEndDate: undefined
  };

  const [localData, setLocalData] = useState<ShoppingLimitData>(defaultShoppingLimitData);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      console.log('🛍️ ShoppingLimitSectionWrapper - Fetching shopping limit data for user:', user.id);
      
      const data = await getShoppingLimitData(user.id);
      console.log('🛍️ ShoppingLimitSectionWrapper - Received shopping limit data:', data);
      
      setLocalData(data);
    } catch (error) {
      console.error('🛍️ ShoppingLimitSectionWrapper - Error fetching shopping limit data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch shopping limit data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchShoppingLimitData();
  }, [fetchShoppingLimitData]);

  // Save shopping limit data directly to Supabase
  const saveDirectly = useCallback(async (): Promise<SaveResult> => {
    if (!user?.id) {
      const errorMsg = 'No user ID available for saving shopping limit data';
      console.error('🛍️ ShoppingLimitSectionWrapper - ' + errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setIsSaving(true);
      setError(null);
      console.log('🛍️ ShoppingLimitSectionWrapper - Saving shopping limit data for user:', user.id, localData);
      
      await saveShoppingLimitData(user.id, localData);
      console.log('🛍️ ShoppingLimitSectionWrapper - Successfully saved shopping limit data');
      
      // Show success modal
      setIsModalOpen(true);
      
      // Call parent onSave callback
      props.onSave();
      
      return { success: true };
    } catch (error) {
      console.error('🛍️ ShoppingLimitSectionWrapper - Error saving shopping limit data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save shopping limit data';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [user?.id, localData, props]);

  // Expose saveDirectly and isSaving methods via ref
  useImperativeHandle(ref, () => ({
    saveDirectly,
    isSaving
  }), [saveDirectly, isSaving]);

  // Handle changes to shopping limit data
  const handleDataChange = useCallback((field: keyof ShoppingLimitData, value: any) => {
    console.log('🛍️ ShoppingLimitSectionWrapper - Data changed:', field, value);
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Create a compatibility setProfileData function for the section component
  const setProfileData = useCallback((updatedData: Partial<ProfileData>) => {
    console.log('🛍️ ShoppingLimitSectionWrapper - Profile data updated (compatibility layer):', updatedData);
    
    // Extract shopping limit data from the updated profile data
    if (updatedData.shoppingLimit) {
      const { amount, frequency } = updatedData.shoppingLimit;
      setLocalData(prev => ({
        ...prev,
        shoppingLimitAmount: amount,
        shoppingLimitFrequency: frequency as 'monthly' | 'quarterly' | 'yearly'
      }));
    }
  }, []);

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
            amount: localData.shoppingLimitAmount || 0,
            frequency: localData.shoppingLimitFrequency || 'monthly'
          }
        }}
        onSave={(data) => {
          console.log('🛍️ ShoppingLimitSectionWrapper - onSave called with:', data);
          // Update local data when section component calls onSave
          setLocalData(prev => ({
            ...prev,
            shoppingLimitAmount: data.amount,
            shoppingLimitFrequency: data.frequency as 'monthly' | 'quarterly' | 'yearly'
          }));
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
