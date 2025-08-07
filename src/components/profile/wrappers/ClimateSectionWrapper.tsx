import React, { useCallback, useEffect, useState, useImperativeHandle } from 'react';
import { ProfileData, ClimateData } from '../../../types';
import ClimateSection from '../sections/ClimateSection';
import { getClimateData, saveClimateData } from '../../../services/climateService';
import SaveConfirmationModal from '../modals/SaveConfirmationModal';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';

export interface SaveResult {
  success: boolean;
  error?: string;
}

interface ClimateSectionWrapperProps {
  initialData?: ProfileData; // Made optional since we'll fetch from service
  onSave: () => void;
}

const ClimateSectionWrapper = React.forwardRef<
  { saveDirectly: () => Promise<SaveResult>; isSaving: boolean },
  ClimateSectionWrapperProps
>((props, ref) => {
  const defaultClimateData: ClimateData = {
    localClimate: ''
  };

  const [localData, setLocalData] = useState<ClimateData>(defaultClimateData);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get the current authenticated user
  const { user } = useSupabaseAuth();

  // Fetch climate data on mount
  useEffect(() => {
    const fetchClimateData = async () => {
      if (!user?.id) {
        console.log('ClimateSectionWrapper - No user ID, using default data');
        setIsLoading(false);
        return;
      }

      try {
        console.log('ClimateSectionWrapper - Fetching climate data for user:', user.id);
        const climateData = await getClimateData(user.id);
        
        if (climateData) {
          console.log('ClimateSectionWrapper - Fetched data:', climateData);
          setLocalData(climateData);
        } else {
          console.log('ClimateSectionWrapper - No existing data, using defaults');
          setLocalData(defaultClimateData);
        }
      } catch (error) {
        console.error('ClimateSectionWrapper - Error fetching climate data:', error);
        setLocalData(defaultClimateData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClimateData();
  }, [user?.id]);

  const saveDirectly = useCallback(async (): Promise<SaveResult> => {
    console.log('ClimateSectionWrapper - Saving directly to Supabase:', localData);

    if (!user?.id) {
      const error = 'No authenticated user found';
      console.error('ClimateSectionWrapper - Save error:', error);
      setSaveError(error);
      return { success: false, error };
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      await saveClimateData(user.id, localData);
      console.log('ClimateSectionWrapper - Save successful');
      
      // Show success modal
      setIsModalOpen(true);
      
      // Call parent onSave if provided
      props.onSave?.();
      
      return { success: true };
    } catch (error: any) {
      console.error('ClimateSectionWrapper - Save error:', error);
      const errorMessage = error?.message || 'Failed to save climate data';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  }, [localData, props.onSave, user]);

  useImperativeHandle(ref, () => ({
    saveDirectly,
    isSaving
  }));

  // Local handler for nested changes
  const handleLocalNestedChange = (parentField: string, field: string, value: any) => {
    console.log('ClimateSectionWrapper - handleLocalNestedChange:', { parentField, field, value });
    
    if (parentField === 'localClimate') {
      // Handle direct localClimate updates
      setLocalData(prev => ({
        ...prev,
        localClimate: value
      }));
    } else {
      console.warn('ClimateSectionWrapper - Unknown parentField:', parentField);
    }
  };

  // Create an adapter for handleNestedChange to match the expected signature in ClimateSection
  const adaptedHandleNestedChange = (parentField: string, field: string, value: any) => {
    console.log('ClimateSectionWrapper - adaptedHandleNestedChange:', { parentField, field, value });
    
    // Handle local state updates for climate data
    handleLocalNestedChange(parentField, field, value);
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
    return <div>Loading climate data...</div>;
  }

  return (
    <div>
      <ClimateSection
        climateData={localData}
        handleNestedChange={adaptedHandleNestedChange}
        showSaveButton={false}
      />
      
      {ErrorMessage}

      {isSaving && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          Saving your climate preferences...
        </div>
      )}

      <SaveConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message="Climate preferences saved successfully!"
      />
    </div>
  );
});

export default ClimateSectionWrapper;
