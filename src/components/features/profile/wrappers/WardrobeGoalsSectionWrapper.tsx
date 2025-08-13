import React, { useCallback, useEffect, useState, useImperativeHandle, useMemo } from 'react';
import { ProfileData, WardrobeGoalsData } from '../../../../types';
import WardrobeGoalsSection from '../sections/WardrobeGoalsSection';
import { getWardrobeGoalsData, saveWardrobeGoalsData } from '../../../../services/wardrobeGoalsService';
import SaveConfirmationModal from '../modals/SaveConfirmationModal';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';

export interface SaveResult {
  success: boolean;
  error?: string;
}

interface WardrobeGoalsSectionWrapperProps {
  initialData?: ProfileData; // Made optional since we'll fetch from service
  onSave: () => void;
}

const WardrobeGoalsSectionWrapper = React.forwardRef<
  { saveDirectly: () => Promise<SaveResult>; isSaving: boolean },
  WardrobeGoalsSectionWrapperProps
>((props, ref) => {
  const { onSave } = props;
  
  const defaultWardrobeGoalsData = useMemo<WardrobeGoalsData>(() => ({
    wardrobeGoals: [],
    otherWardrobeGoal: undefined
  }), []);

  const [localData, setLocalData] = useState<WardrobeGoalsData>(defaultWardrobeGoalsData);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get the current authenticated user
  const { user } = useSupabaseAuth();

  // Fetch wardrobe goals data on mount
  useEffect(() => {
    const fetchWardrobeGoalsData = async () => {
      if (!user?.id) {
        console.log('WardrobeGoalsSectionWrapper - No user ID, using default data');
        setIsLoading(false);
        return;
      }

      try {
        console.log('WardrobeGoalsSectionWrapper - Fetching wardrobe goals data for user:', user.id);
        const wardrobeGoalsData = await getWardrobeGoalsData(user.id);
        
        if (wardrobeGoalsData) {
          console.log('WardrobeGoalsSectionWrapper - Fetched data:', wardrobeGoalsData);
          setLocalData(wardrobeGoalsData);
        } else {
          console.log('WardrobeGoalsSectionWrapper - No existing data, using defaults');
          setLocalData(defaultWardrobeGoalsData);
        }
      } catch (error) {
        console.error('WardrobeGoalsSectionWrapper - Error fetching wardrobe goals data:', error);
        setLocalData(defaultWardrobeGoalsData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWardrobeGoalsData();
  }, [user?.id, defaultWardrobeGoalsData]);

  const saveDirectly = useCallback(async (): Promise<SaveResult> => {
    console.log('WardrobeGoalsSectionWrapper - Saving directly to Supabase:', localData);

    if (!user?.id) {
      const error = 'No authenticated user found';
      console.error('WardrobeGoalsSectionWrapper - Save error:', error);
      setSaveError(error);
      return { success: false, error };
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveWardrobeGoalsData(user.id, localData);
      console.log('WardrobeGoalsSectionWrapper - Save successful');
      
      // Show success modal
      setIsModalOpen(true);
      
      // Call parent onSave if provided
      onSave?.();
      
      return { success: true };
    } catch (error: any) {
      console.error('WardrobeGoalsSectionWrapper - Save error:', error);
      const errorMessage = error?.message || 'Failed to save wardrobe goals data';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [localData, onSave, user]);
  useImperativeHandle(ref, () => ({
    saveDirectly,
    isSaving
  }));

  // Handle setProfileData calls from the WardrobeGoalsSection
  const handleSetProfileData = (newData: any) => {
    console.log('WardrobeGoalsSectionWrapper - handleSetProfileData:', newData);
    const typedData = newData as ProfileData;
    
    // Update local state
    setLocalData(prev => ({
      ...prev,
      wardrobeGoals: typedData.wardrobeGoals || prev.wardrobeGoals,
      otherWardrobeGoal: typedData.otherWardrobeGoal || prev.otherWardrobeGoal
    }));
  };
  
  // Create an adapter for handleCheckboxChange to match the expected signature in WardrobeGoalsSection
  const adaptedHandleCheckboxChange = (field: keyof ProfileData, value: string) => {
    // Only pass through fields that are valid for WardrobeGoalsData
    if (field === 'wardrobeGoals') {
      // Update local state
      setLocalData(prev => {
        const currentGoals = Array.isArray(prev.wardrobeGoals) ? [...prev.wardrobeGoals] : [];
        const valueIndex = currentGoals.indexOf(value);
        
        if (valueIndex === -1) {
          // Add the value if it doesn't exist
          currentGoals.push(value);
        } else {
          // Remove the value if it exists
          currentGoals.splice(valueIndex, 1);
        }
        
        return {
          ...prev,
          wardrobeGoals: currentGoals
        };
      });
    }
  };

  // Error message display
  const ErrorMessage = saveError ? (
    <div style={{
      padding: '10px',
      marginTop: '10px',
      backgroundColor: '#ffeeee',
      borderRadius: '4px',
      border: '1px solid #ffcccc'
    }}>
      <strong>Error:</strong> {saveError}
    </div>
  ) : null;

  if (isLoading) {
    return <div>Loading wardrobe goals data...</div>;
  }

  return (
    <div>
      <WardrobeGoalsSection
        wardrobeGoalsData={localData}
        setProfileData={handleSetProfileData}
        handleCheckboxChange={adaptedHandleCheckboxChange}
        showSaveButton={false}
      />
      
      {ErrorMessage}

      {isSaving && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          Saving your wardrobe goals...
        </div>
      )}

      <SaveConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message="Wardrobe goals saved successfully!"
      />
    </div>
  );
});

export default WardrobeGoalsSectionWrapper;
