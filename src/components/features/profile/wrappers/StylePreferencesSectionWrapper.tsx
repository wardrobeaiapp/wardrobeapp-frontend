import React, { useCallback, useEffect, useState, useImperativeHandle, useMemo } from 'react';
import { ProfileData } from '../../../../types';
import StylePreferencesSection from '../sections/StylePreferencesSection';
import { StylePreferencesData, ArrayFieldsOfProfileData } from '../sections/types';
import { getStylePreferencesData, saveStylePreferencesData } from '../../../../services/profile/stylePreferencesService';
import SaveConfirmationModal from '../modals/SaveConfirmationModal';
import { useSupabaseAuth } from '../../../../context/SupabaseAuthContext';

interface SaveResult {
  success: boolean;
  error?: any;
}

interface StylePreferencesSectionWrapperProps {
  initialData?: ProfileData; // Made optional since we'll fetch from service
  onSave: () => void;
}

const StylePreferencesSectionWrapper = React.forwardRef<
  { saveDirectly: () => Promise<SaveResult>; isSaving: boolean },
  StylePreferencesSectionWrapperProps
>((props, ref) => {
  const { onSave } = props;
  
  const defaultStylePreferencesData = useMemo<StylePreferencesData>(() => ({
    preferredStyles: [],
    stylePreferences: {
      comfortVsStyle: 50,
      classicVsTrendy: 50,
      basicsVsStatements: 50,
      additionalNotes: ''
    }
  }), []);

  const [localData, setLocalData] = useState<StylePreferencesData>(defaultStylePreferencesData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Get the current authenticated user
  const { user } = useSupabaseAuth();

  // Fetch style preferences data on mount
  useEffect(() => {
    const fetchStylePreferences = async () => {
      if (!user?.id) {
        console.log('StylePreferencesSectionWrapper - No user ID, using default data');
        return;
      }

      try {
        console.log('StylePreferencesSectionWrapper - Fetching style preferences for user:', user.id);
        const stylePrefsData = await getStylePreferencesData(user.id);
        
        if (stylePrefsData) {
          console.log('StylePreferencesSectionWrapper - Fetched data:', stylePrefsData);
          setLocalData(stylePrefsData);
        } else {
          console.log('StylePreferencesSectionWrapper - No existing data, using defaults');
          setLocalData(defaultStylePreferencesData);
        }
      } catch (error) {
        console.error('StylePreferencesSectionWrapper - Error fetching style preferences:', error);
        setLocalData(defaultStylePreferencesData);
      }
    };

    fetchStylePreferences();
  }, [user?.id, defaultStylePreferencesData]);

  const saveDirectly = useCallback(async (): Promise<SaveResult> => {
    console.log('StylePreferencesSectionWrapper - Saving directly to Supabase:', localData);

    setSaveError(null);
    setIsSaving(true);

    const userId = user?.id;
    if (!userId) {
      setSaveError('No user ID found. Please log in again.');
      setIsSaving(false);
      console.error('StylePreferencesSectionWrapper - No authenticated user found');
      return { success: false, error: 'No authenticated user found' };
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const isDevelopmentMode = process.env.NODE_ENV === 'development';

    if (!uuidRegex.test(userId)) {
      if (isDevelopmentMode) {
        console.info('%c[DEV MODE] Using mock save for non-UUID userId', 'color: green; font-weight: bold');
        console.info('%c[DEV MODE] This is expected behavior in development', 'color: green');
        console.info('%c[DEV MODE] Data that would be saved:', 'color: green', localData);

        setTimeout(() => {
          console.info('DEVELOPMENT MODE: Mock save completed successfully');
          setIsModalOpen(true);
          onSave();
          setIsSaving(false);
        }, 1000);
        return { success: true };
      } else {
        setSaveError('Invalid user ID format. Please contact support.');
        setIsSaving(false);
        return { success: false, error: 'Invalid UUID format for userId' };
      }
    }

    if (!localData.stylePreferences) {
      console.error('StylePreferencesSectionWrapper - Missing stylePreferences data');
      setSaveError('Missing style preferences data');
      setIsSaving(false);
      return { success: false, error: 'Missing stylePreferences data' };
    }

    try {
      await saveStylePreferencesData(userId, localData);
      console.log('StylePreferencesSectionWrapper - Save successful');
      
      // Show success modal and call parent onSave
      setIsModalOpen(true);
      onSave();

      setIsSaving(false);
      return { success: true };
    } catch (error) {
      console.error('StylePreferencesSectionWrapper - Error saving directly:', error);
      setSaveError(error instanceof Error ? error.message : 'Unknown error occurred while saving');
      setIsSaving(false);
      return { success: false, error };
    }
  }, [localData, onSave, user]);

  useImperativeHandle(ref, () => ({
    saveDirectly,
    isSaving
  }));

  const adaptedHandleCheckboxChange = useCallback((field: ArrayFieldsOfProfileData, value: string) => {
    console.log('StylePreferencesSectionWrapper - adaptedHandleCheckboxChange:', field, value);

    if (field === 'preferredStyles') {
      setLocalData((prevData: StylePreferencesData) => {
        const currentStyles = [...(prevData.preferredStyles || [])];
        const valueIndex = currentStyles.indexOf(value);

        if (valueIndex === -1) {
          currentStyles.push(value);
        } else {
          currentStyles.splice(valueIndex, 1);
        }

        console.log('StylePreferencesSectionWrapper - Updated preferredStyles:', currentStyles);

        return {
          ...prevData,
          preferredStyles: currentStyles
        };
      });
    }
  }, []);

  const adaptedHandleNestedChange = useCallback((parentField: keyof ProfileData, field: string, value: any) => {
    console.log('StylePreferencesSectionWrapper - adaptedHandleNestedChange:', parentField, field, value);

    if (parentField === 'stylePreferences') {
      setLocalData((prevData: StylePreferencesData) => {
        return {
          ...prevData,
          stylePreferences: {
            ...(prevData.stylePreferences || {}),
            [field]: value
          }
        };
      });
    } else if (parentField === 'preferredStyles') {
      setLocalData((prevData: StylePreferencesData) => {
        return {
          ...prevData,
          preferredStyles: value
        };
      });
    }
  }, []);

  const ErrorMessage = saveError ? (
    <div style={{
      color: 'red',
      padding: '10px',
      marginTop: '10px',
      backgroundColor: '#ffeeee',
      borderRadius: '4px',
      border: '1px solid #ffcccc'
    }}>
      <strong>Error:</strong> {saveError}
    </div>
  ) : null;

  return (
    <div>
      <StylePreferencesSection
        stylePreferencesData={localData}
        handleCheckboxChange={adaptedHandleCheckboxChange}
        handleNestedChange={adaptedHandleNestedChange}
        showSaveButton={false}
      />
      
      {ErrorMessage}

      {isSaving && (
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          Saving your preferences...
        </div>
      )}

      <SaveConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message="Style preferences saved successfully!"
      />
    </div>
  );
});

export default StylePreferencesSectionWrapper;
