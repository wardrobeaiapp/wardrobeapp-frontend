import React, { useState } from 'react';
import Button from '../../components/Button';
import {
  ContentHeader,
  ButtonContainer,
  SectionHeader
} from '../../pages/ProfilePage.styles';
import StyleProfileGrid from './StyleProfileGrid';

// Import section components
import StylePreferencesSection from './sections/StylePreferencesSection';
import ClimateSection from './sections/ClimateSection';
import WardrobeGoalsSection from './sections/WardrobeGoalsSection';
import ShoppingLimitSection from './sections/ShoppingLimitSection';
import BudgetSection from './sections/BudgetSection';

// Import types
import { ProfileData, ArrayFieldsOfProfileData } from '../../types';

interface StyleProfileProps {
  initialData: ProfileData;
  onSave: (data: ProfileData) => void;
}

const ModifiedStyleProfileSection: React.FC<StyleProfileProps> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await onSave(formData);
      setSaveMessage('Profile saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle checkbox changes for array fields
  const handleCheckboxChange = (field: ArrayFieldsOfProfileData, value: string) => {
    setFormData(prev => {
      // Get the current array or initialize an empty one
      const currentArray = prev[field] || [];
      
      // Toggle the value
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  // Handle text field changes
  const handleTextFieldChange = (field: keyof ProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle number field changes
  const handleNumberFieldChange = (field: keyof ProfileData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle nested object changes
  const handleNestedChange = (parentField: keyof ProfileData, field: string, value: any) => {
    setFormData(prev => {
      // Check if the parent field is an object type before spreading
      const parentValue = prev[parentField];
      const isObject = parentValue && typeof parentValue === 'object' && !Array.isArray(parentValue);
      
      // Create a new object for the parent field
      const updatedParentValue = isObject
        ? { ...parentValue as object, [field]: value }
        : { [field]: value };
      
      return {
        ...prev,
        [parentField]: updatedParentValue
      };
    });
  };
  
  // Handle section selection
  const handleSectionSelect = (section: string) => {
    setActiveSection(section);
  };
  
  // Handle back button click
  const handleBackClick = () => {
    setActiveSection(null);
  };

  // Render the appropriate section based on activeSection
  const renderSection = () => {
    switch (activeSection) {
      case 'stylePreferences':
        return (
          <>
            <Button onClick={handleBackClick}>← Back to Sections</Button>
            <SectionHeader>Style Preferences</SectionHeader>
            <StylePreferencesSection 
              profileData={formData}
              handleCheckboxChange={handleCheckboxChange}
              handleNestedChange={handleNestedChange}
            />
          </>
        );
      case 'climate':
        return (
          <>
            <Button onClick={handleBackClick}>← Back to Sections</Button>
            <SectionHeader>Climate</SectionHeader>
            <ClimateSection 
              profileData={formData}
              setProfileData={setFormData}
            />
          </>
        );
      case 'wardrobeGoals':
        return (
          <>
            <Button onClick={handleBackClick}>← Back to Sections</Button>
            <SectionHeader>Wardrobe Goals</SectionHeader>
            <WardrobeGoalsSection 
              profileData={formData}
              handleCheckboxChange={handleCheckboxChange}
              handleNestedChange={handleNestedChange}
            />
          </>
        );
      case 'shoppingLimit':
        return (
          <>
            <Button onClick={handleBackClick}>← Back to Sections</Button>
            <SectionHeader>Shopping Limit</SectionHeader>
            <ShoppingLimitSection 
              initialData={{
                shoppingLimit: {
                  frequency: formData.shoppingLimit?.frequency || 'monthly',
                  amount: formData.shoppingLimit?.amount || 0
                }
              }}
              onSave={(data) => {
                // Update the shoppingLimit object structure
                const updatedShoppingLimit = {
                  frequency: data.frequency || 'monthly',
                  amount: data.amount || 0
                };
                // The handleNestedChange function expects 3 arguments: parentField, field, value
                // Since we're updating the entire shoppingLimit object, we'll use an empty string for the field
                handleNestedChange('shoppingLimit', '', updatedShoppingLimit);
              }}
            />
          </>
        );
      case 'clothingBudget':
        return (
          <>
            <Button onClick={handleBackClick}>← Back to Sections</Button>
            <SectionHeader>Clothing Budget</SectionHeader>
            <BudgetSection 
              initialData={{
                amount: formData.clothingBudget?.amount || 0,
                currency: formData.clothingBudget?.currency || 'USD',
                frequency: formData.clothingBudget?.frequency || 'monthly'
              }}
              onSave={(data) => {
                // Update the entire clothingBudget object
                const updatedBudget = {
                  amount: data.amount,
                  currency: data.currency,
                  frequency: data.frequency
                };
                handleNestedChange('clothingBudget', '', updatedBudget);
              }}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <ContentHeader>My Style Profile</ContentHeader>
      
      {!activeSection ? (
        <>
          <p>Select a section to update your style profile information:</p>
          <StyleProfileGrid onSectionSelect={handleSectionSelect} />
        </>
      ) : (
        renderSection()
      )}
      
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

export default ModifiedStyleProfileSection;
