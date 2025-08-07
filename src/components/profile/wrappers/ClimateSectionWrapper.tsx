import React from 'react';
import { ProfileData } from '../../../types';
import ClimateSection from '../sections/ClimateSection';
import { ClimateData } from '../sections/types';
import { useStyleProfile } from '../context/StyleProfileContext';

interface ClimateSectionWrapperProps {
  // Extract only the climate data from ProfileData
  initialData: ProfileData;
  onSave: () => void;
  // Keep the original handler signatures to match context
  handleNestedChange: (parentField: keyof ProfileData, field: string, value: any) => void;
  handleSave?: (section?: string) => void;
}

const ClimateSectionWrapper = React.forwardRef<
  { syncToContext: () => void },
  ClimateSectionWrapperProps
>((props, ref) => {
  const { handleSave } = useStyleProfile();

  // Extract only the climate data from the full ProfileData
  const extractClimateData = (profileData: ProfileData): ClimateData => ({
    localClimate: profileData.localClimate || ''
  });

  // Local state for climate data
  const [localData, setLocalData] = React.useState<ClimateData>(
    extractClimateData(props.initialData)
  );

  // Update local state when initialData changes
  React.useEffect(() => {
    setLocalData(extractClimateData(props.initialData));
  }, [props.initialData]);

  // Function to sync local state back to context
  const syncToContext = () => {
    console.log('ClimateSectionWrapper - syncToContext - localData:', localData);
    
    // Log each field as it syncs for better debugging
    console.log('ClimateSectionWrapper - syncToContext - localClimate:', localData.localClimate);
    
    // Update parent context with our local state
    if (localData.localClimate) {
      props.handleNestedChange('localClimate', '', localData.localClimate);
    }
  };

  // Expose syncToContext to parent via ref
  React.useImperativeHandle(ref, () => ({
    syncToContext
  }));

  // Local handler for nested changes
  const handleLocalNestedChange = (parentField: string, field: string, value: any) => {
    console.log('ClimateSectionWrapper - handleLocalNestedChange:', parentField, field, value);
    
    // Update local state
    if (parentField === 'localClimate') {
      setLocalData(prev => ({
        ...prev,
        localClimate: value
      }));
      
      // Immediately sync to context to ensure up-to-date state
      setTimeout(() => {
        props.handleNestedChange('localClimate', '', value);
      }, 0);
    }
  };

  // Create an adapter for handleNestedChange to match the expected signature in ClimateSection
  const adaptedHandleNestedChange = (parentField: string, field: string, value: any) => {
    // Only pass through fields that are valid for ClimateData
    if (parentField === 'localClimate') {
      // This field exists in both interfaces, so we can pass it directly
      handleLocalNestedChange(parentField, field, value);
    }
    // Ignore other fields that might be in ProfileData but not in ClimateData
  };
  
  // Handle section-specific save
  const handleSectionSave = () => {
    // First sync to context to ensure latest data
    syncToContext();
    
    // Then trigger section-specific save
    if (props.handleSave) {
      props.handleSave('climate');
    } else if (handleSave) {
      handleSave('climate');
    }
  };

  return (
    <>
      <ClimateSection
        // Pass only the climate data to the section component
        profileData={localData}
        handleNestedChange={adaptedHandleNestedChange}
      />
      {/* Section-specific save button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          onClick={handleSectionSave}
          className="btn btn-primary"
          style={{ 
            padding: '0.5rem 1rem',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 500
          }}
        >
          Save Climate Preferences
        </button>
      </div>
    </>
  );
});

export default ClimateSectionWrapper;
