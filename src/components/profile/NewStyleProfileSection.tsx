import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import {
  ContentHeader,
  ButtonContainer
} from '../../pages/ProfilePage.styles';

// Import section components
import StylePreferencesSection from './sections/StylePreferencesSection';
import ClimateSection from './sections/ClimateSection';
import WardrobeGoalsSection from './sections/WardrobeGoalsSection';
import ShoppingLimitSection from './sections/ShoppingLimitSection';
import BudgetSection from './sections/BudgetSection';

// Import new preferences hook
import { usePreferencesData } from '../../hooks/usePreferencesData';
import { UserPreferences } from '../../types/userPreferences';

// Helper type for form data
type FormData = Partial<UserPreferences>;

const NewStyleProfileSection: React.FC = () => {
  const { preferences, loading, error, savePreferences } = usePreferencesData();
  const [formData, setFormData] = useState<FormData>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Initialize form data when preferences are loaded
  useEffect(() => {
    if (preferences) {
      setFormData(preferences);
    }
  }, [preferences]);

  // Handle array field changes (multi-select fields)
  const handleArrayFieldChange = (field: keyof UserPreferences, value: string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle text field changes
  const handleTextFieldChange = (field: keyof UserPreferences, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle number field changes
  const handleNumberFieldChange = (field: keyof UserPreferences, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested object field changes (for style preferences)
  const handleStylePreferenceChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');

    try {
      const success = await savePreferences(formData);
      
      if (success) {
        setSaveMessage('Profile updated successfully!');
      } else {
        setSaveMessage('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
      setSaveMessage('An error occurred while saving your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div>Loading your style profile...</div>;
  }

  if (error) {
    return <div>Error loading profile: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <ContentHeader>My Style Profile</ContentHeader>
      
      {/* Style Preferences Section */}
      <StylePreferencesSection 
        profileData={{
          preferredStyles: formData.preferredStyles || [],
          stylePreferences: formData.stylePreferences || {
            comfortVsStyle: 50,
            classicVsTrendy: 50,
            basicsVsStatements: 50,
            additionalNotes: ''
          }
        }}
        onPreferredStylesChange={(value) => handleArrayFieldChange('preferredStyles', value)}
        onComfortVsStyleChange={(value) => {
          setFormData(prev => ({
            ...prev,
            stylePreferences: {
              ...(prev.stylePreferences || {}),
              comfortVsStyle: value
            }
          }));
        }}
        onTrendinessChange={(value) => {
          setFormData(prev => ({
            ...prev,
            stylePreferences: {
              ...(prev.stylePreferences || {}),
              classicVsTrendy: value
            }
          }));
        }}
        onBasicsVsStatementsChange={(value) => {
          setFormData(prev => ({
            ...prev,
            stylePreferences: {
              ...(prev.stylePreferences || {}),
              basicsVsStatements: value
            }
          }));
        }}
        onAdditionalNotesChange={(value) => {
          setFormData(prev => ({
            ...prev,
            stylePreferences: {
              ...(prev.stylePreferences || {}),
              additionalNotes: value
            }
          }));
        }}
      />
      
      {/* Climate Section */}
      <ClimateSection 
        profileData={{
          ...formData as any,
          localClimate: formData.localClimate || ''
        }}
        setProfileData={(newData) => setFormData(prev => ({ ...prev, ...newData }))}
      />
      
      {/* Wardrobe Goals Section */}
      <WardrobeGoalsSection 
        profileData={{
          wardrobeGoals: formData.wardrobeGoals || [],
          otherWardrobeGoal: formData.otherWardrobeGoal || ''
        }}
        handleCheckboxChange={(field, value) => {
          if (field === 'wardrobeGoals') {
            const updatedGoals = formData.wardrobeGoals ? [...formData.wardrobeGoals] : [];
            if (updatedGoals.includes(value)) {
              handleArrayFieldChange('wardrobeGoals', updatedGoals.filter(item => item !== value));
            } else {
              handleArrayFieldChange('wardrobeGoals', [...updatedGoals, value]);
            }
          }
        }}
        handleNestedChange={(parentField, field, value) => {
          if (parentField === 'otherWardrobeGoal') {
            handleTextFieldChange('otherWardrobeGoal', value);
          }
        }}
      />
      
      {/* Shopping Limit Section */}
      <ShoppingLimitSection 
        initialData={{
          shoppingLimit: {
            amount: formData.shoppingLimitAmount || 0,
            frequency: 'monthly'
          },
          // Any other ShoppingData properties can go here
        }}
        onSave={(data) => {
          handleNumberFieldChange('shoppingLimitAmount', data.amount || 0);
        }}
      />
      
      {/* Budget Section */}
      <BudgetSection 
        initialData={{
            amount: formData.clothingBudgetAmount || 0,
            currency: formData.clothingBudgetCurrency || 'USD',
            frequency: formData.clothingBudgetFrequency || 'monthly'
        }}
        onSave={(data) => {
          handleNumberFieldChange('clothingBudgetAmount', data.amount);
          handleTextFieldChange('clothingBudgetCurrency', data.currency);
          handleTextFieldChange('clothingBudgetFrequency', data.frequency);
        }}
      />
      
      {/* Save Button */}
      <ButtonContainer>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
        {saveMessage && <p>{saveMessage}</p>}
      </ButtonContainer>
    </form>
  );
};

export default NewStyleProfileSection;
