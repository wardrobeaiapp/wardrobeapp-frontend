import React from 'react';
import { ProfileData } from '../../../types';
import WardrobeGoalsSection from '../sections/WardrobeGoalsSection';
import { WardrobeGoalsData } from '../sections/types';
import { useStyleProfile } from '../context/StyleProfileContext';

interface WardrobeGoalsSectionWrapperProps {
  initialData: ProfileData;
  onSave: () => void;
  handleNestedChange: (parentField: keyof ProfileData, field: string, value: any) => void;
  handleSave?: (section?: string) => void;
  handleCheckboxChange?: (field: keyof ProfileData, value: string) => void;
}

const WardrobeGoalsSectionWrapper = React.forwardRef<
  { syncToContext: () => void },
  WardrobeGoalsSectionWrapperProps
>((props, ref) => {
  const { handleSave } = useStyleProfile();
  // Extract only the wardrobe goals data from the full ProfileData
  const extractWardrobeGoalsData = (profileData: ProfileData): WardrobeGoalsData => ({
    wardrobeGoals: profileData.wardrobeGoals || [],
    otherWardrobeGoal: profileData.otherWardrobeGoal || ''
  });

  // Local state for wardrobe goals data
  const [localData, setLocalData] = React.useState<WardrobeGoalsData>(
    extractWardrobeGoalsData(props.initialData)
  );

  // Update local state when initialData changes
  React.useEffect(() => {
    setLocalData(extractWardrobeGoalsData(props.initialData));
  }, [props.initialData]);

  // Function to sync local state back to context
  const syncToContext = () => {
    console.log('WardrobeGoalsSectionWrapper - syncToContext - localData:', localData);
    
    // Log each field as it syncs for better debugging
    console.log('WardrobeGoalsSectionWrapper - syncToContext - wardrobeGoals:', localData.wardrobeGoals);
    console.log('WardrobeGoalsSectionWrapper - syncToContext - otherWardrobeGoal:', localData.otherWardrobeGoal);
    
    // Update parent context with our local state
    if (localData.wardrobeGoals && localData.wardrobeGoals.length > 0) {
      props.handleNestedChange('wardrobeGoals', '', localData.wardrobeGoals);
    }
    if (localData.otherWardrobeGoal) {
      props.handleNestedChange('otherWardrobeGoal', '', localData.otherWardrobeGoal);
    }
  };
  
  // Handle section-specific save
  const handleSectionSave = () => {
    // First sync to context to ensure latest data
    syncToContext();
    
    // Then trigger section-specific save
    if (props.handleSave) {
      props.handleSave('wardrobeGoals');
    } else if (handleSave) {
      handleSave('wardrobeGoals');
    }
  };

  // Expose syncToContext to parent via ref
  React.useImperativeHandle(ref, () => ({
    syncToContext
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
    
    // Immediately sync to context to ensure up-to-date state
    setTimeout(() => {
      if (typedData.wardrobeGoals) {
        props.handleNestedChange('wardrobeGoals', '', typedData.wardrobeGoals);
      }
      if (typedData.otherWardrobeGoal) {
        props.handleNestedChange('otherWardrobeGoal', '', typedData.otherWardrobeGoal);
      }
    }, 0);
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
      
      // Also pass to props handler if available
      if (props.handleCheckboxChange) {
        props.handleCheckboxChange(field, value);
      }
    }
  };

  return (
    <>
      <WardrobeGoalsSection
        profileData={{
          ...props.initialData,
          wardrobeGoals: localData.wardrobeGoals,
          otherWardrobeGoal: localData.otherWardrobeGoal
        }}
        setProfileData={handleSetProfileData}
        handleNestedChange={props.handleNestedChange}
        handleCheckboxChange={adaptedHandleCheckboxChange}
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
          Save Wardrobe Goals
        </button>
      </div>
    </>
  );
});

export default WardrobeGoalsSectionWrapper;
