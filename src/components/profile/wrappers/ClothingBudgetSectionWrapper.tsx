import React, { useCallback, useEffect, useState, useImperativeHandle } from 'react';
import { ProfileData } from '../../../types';
import BudgetSection from '../sections/BudgetSection';
import { getClothingBudgetData, saveClothingBudgetData, ClothingBudgetData } from '../../../services/userBudgetsService';
import SaveConfirmationModal from '../modals/SaveConfirmationModal';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';

export interface SaveResult {
  success: boolean;
  error?: string;
}

interface ClothingBudgetSectionWrapperProps {
  initialData?: ProfileData; // Made optional since we'll fetch from service
  onSave: () => void;
}

const ClothingBudgetSectionWrapper = React.forwardRef<
  { saveDirectly: () => Promise<SaveResult>; isSaving: boolean },
  ClothingBudgetSectionWrapperProps
>((props, ref) => {
  const defaultClothingBudgetData: ClothingBudgetData = {
    amount: 0,
    currency: 'USD',
    frequency: 'monthly',
    currentSpent: 0,
    periodStartDate: undefined,
    periodEndDate: undefined
  };

  const [localData, setLocalData] = useState<ClothingBudgetData>(defaultClothingBudgetData);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useSupabaseAuth();

  // Fetch clothing budget data on component mount
  const fetchClothingBudgetData = useCallback(async () => {
    if (!user?.id) {
      console.log('👔 ClothingBudgetSectionWrapper - No user ID available, skipping fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('👔 ClothingBudgetSectionWrapper - Fetching clothing budget data for user:', user.id);
      
      const clothingBudgetData = await getClothingBudgetData(user.id);
      console.log('👔 ClothingBudgetSectionWrapper - Received clothing budget data:', clothingBudgetData);
      
      setLocalData(clothingBudgetData);
    } catch (error) {
      console.error('👔 ClothingBudgetSectionWrapper - Error fetching clothing budget data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch clothing budget data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchClothingBudgetData();
  }, [fetchClothingBudgetData]);

  // Save clothing budget data directly to Supabase
  const saveDirectly = useCallback(async (): Promise<SaveResult> => {
    if (!user?.id) {
      const errorMsg = 'No user ID available for saving clothing budget data';
      console.error('👔 ClothingBudgetSectionWrapper - ' + errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setIsSaving(true);
      setError(null);
      console.log('👔 ClothingBudgetSectionWrapper - Saving clothing budget data for user:', user.id, localData);
      
      // Save only clothing budget data (no impact on shopping limit)
      await saveClothingBudgetData(user.id, localData);
      console.log('👔 ClothingBudgetSectionWrapper - Successfully saved clothing budget data');
      
      // CRITICAL: Refetch data from database to ensure UI shows the latest data
      console.log('👔 ClothingBudgetSectionWrapper - Refetching data to update UI...');
      await fetchClothingBudgetData();
      
      // Show success modal
      setIsModalOpen(true);
      
      // Call parent onSave callback
      props.onSave();
      
      return { success: true };
    } catch (error) {
      console.error('👔 ClothingBudgetSectionWrapper - Error saving clothing budget data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save clothing budget data';
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

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  if (isLoading) {
    return <div>Loading clothing budget data...</div>;
  }

  return (
    <>
      <BudgetSection 
        initialData={{
          amount: localData.amount || 0,
          currency: localData.currency,
          frequency: localData.frequency
        }}
        onSave={(data) => {
          console.log('👔 ClothingBudgetSectionWrapper - onSave called with:', data);
          // Update local data when section component calls onSave
          setLocalData(prev => ({
            ...prev,
            amount: data.amount,
            currency: data.currency,
            frequency: data.frequency as 'monthly' | 'quarterly' | 'yearly'
          }));
        }}
      />
      
      <SaveConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        message="Clothing Budget Updated! Your clothing budget settings have been saved successfully."
      />
    </>
  );
});

export default ClothingBudgetSectionWrapper;
