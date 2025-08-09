import React, { useState, useEffect } from 'react';
import { ShoppingLimit } from '../../types';
import Button from '../../components/Button';
import {
  ContentHeader,
  ButtonContainer,
} from '../../pages/ProfilePage.styles';
import { FaBriefcase, FaUmbrellaBeach, FaTshirt, FaCloudSun, FaBullseye, FaShoppingCart, FaDollarSign, FaArrowLeft } from 'react-icons/fa';

// Import section components
import StylePreferencesSection from './sections/StylePreferencesSection';
import ClimateSection from './sections/ClimateSection';
import WardrobeGoalsSection from './sections/WardrobeGoalsSection';
import ShoppingLimitSection from './sections/ShoppingLimitSection';
import BudgetSection from './sections/BudgetSection';

// Import types
import { ProfileData, ArrayFieldsOfProfileData } from '../../types';
import { ClothingBudgetData } from '../../types/profile';
import styled from 'styled-components';

// Styled Components for Grid Layout
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
`;

const GridItem = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
`;

const DailyActivitiesItem = styled(GridItem)`
  background-color: #f0f4ff;
`;

const LeisureActivitiesItem = styled(GridItem)`
  background-color: #f0fff4;
`;

const StylePreferencesItem = styled(GridItem)`
  background-color: #f8f0ff;
`;

const ClimateItem = styled(GridItem)`
  background-color: #fff8f0;
`;

const WardrobeGoalsItem = styled(GridItem)`
  background-color: #f0fffc;
`;

const ShoppingLimitItem = styled(GridItem)`
  background-color: #fff0f8;
`;

const ClothingBudgetItem = styled(GridItem)`
  background-color: #f8fff0;
`;

const ItemTitle = styled.h3`
  font-size: 18px;
  margin-bottom: 8px;
  font-weight: 600;
`;

const ItemDescription = styled.p`
  font-size: 14px;
  color: #555;
  margin-bottom: 0;
`;

const IconContainer = styled.div`
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
`;

const ChevronRight = styled.div`
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  font-size: 20px;
  color: #999;
`;

const BackButton = styled(Button)`
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface StyleProfileProps {
  initialData: ProfileData;
  onSave: (data: ProfileData) => void;
}

const StyleProfileSection: React.FC<StyleProfileProps> = ({ initialData, onSave }) => {
  const [profileData, setProfileData] = useState<ProfileData>(initialData);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Debug log to check profileData
  useEffect(() => {
    console.log('FixedStyleProfileSection profileData:', profileData);
    
    // Log specific budget and shopping limit fields
    console.log('Clothing budget data:', {
      amount: profileData.clothingBudget?.amount,
      currency: profileData.clothingBudget?.currency,
      frequency: profileData.clothingBudget?.frequency
    });
    
    console.log('Shopping limit data:', {
      amount: profileData.shoppingLimit?.amount,
      currency: profileData.shoppingLimit?.currency,
      frequency: profileData.shoppingLimit?.frequency
    });
  }, [profileData]);


  // Handle checkbox changes for array fields
  const handleCheckboxChange = (field: ArrayFieldsOfProfileData, value: string) => {
    setProfileData(prev => {
      // Create a copy of the previous state
      const newProfileData = { ...prev };
      
      // Get the current array or initialize an empty one
      const currentArray = prev[field] || [];
      
      // Toggle the value
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
        
      // Update the field with the new array
      newProfileData[field] = newArray;
      
      // Return the updated state
      return newProfileData;
    });
  };
  
  // Handle changes for nested objects in the profile data
  const handleNestedChange = <K extends keyof ProfileData>(parentField: K, field: string, value: any) => {
    setProfileData(prev => {
      const newProfileData = { ...prev };
      // Type guard to ensure we're only working with object fields
      if (typeof prev[parentField] === 'object' && prev[parentField] !== null && !Array.isArray(prev[parentField])) {
        // Safe to cast because we've verified it's an object
        const parentValue = prev[parentField] as Record<string, any>;
        
        // Create an updated parent object with the new field value
        const updatedParent = {
          ...parentValue,
          [field]: value
        };
        
        // Update the parent field with the new object
        // TypeScript now knows this is a valid assignment
        newProfileData[parentField] = updatedParent as ProfileData[K];
      } else if (prev[parentField] === undefined) {
        // Handle the case where the parent field doesn't exist yet
        newProfileData[parentField] = { [field]: value } as ProfileData[K];
      }
      
      return newProfileData;
    });
  };
  
  // Handle saving the profile data
  const handleSave = () => {
    setIsSaving(true);
    
    // Call the onSave callback with the current profile data
    onSave(profileData);
    
    // Show a success message
    setSaveMessage('Profile saved successfully!');
    
    // Clear the message after 3 seconds
    setTimeout(() => {
      setSaveMessage('');
      setIsSaving(false);
    }, 3000);
  };

  return (
    <>
      <ContentHeader>My Style Profile</ContentHeader>
      
      {activeSection === null ? (
        // Grid layout for section blocks
        <GridContainer>
          {/* Daily Activities Block */}
          <DailyActivitiesItem onClick={() => setActiveSection('dailyActivities')}>
            <FaBriefcase size={24} style={{ color: '#4285F4', marginBottom: '12px' }} />
            <ItemTitle>Daily Activities</ItemTitle>
            <ItemDescription>Define your work environment and daily routine</ItemDescription>
            <FaArrowLeft style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </DailyActivitiesItem>

          {/* Leisure Activities Block */}
          <LeisureActivitiesItem onClick={() => setActiveSection('leisureActivities')}>
            <FaUmbrellaBeach size={24} style={{ color: '#34A853', marginBottom: '12px' }} />
            <ItemTitle>Leisure Activities</ItemTitle>
            <ItemDescription>Tell us about your free time and social events</ItemDescription>
            <FaArrowLeft style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </LeisureActivitiesItem>

          {/* Style Preferences Block */}
          <StylePreferencesItem onClick={() => setActiveSection('stylePreferences')}>
            <FaTshirt size={24} style={{ color: '#9C27B0', marginBottom: '12px' }} />
            <ItemTitle>Style Preferences</ItemTitle>
            <ItemDescription>Share your personal style and fashion preferences</ItemDescription>
            <FaArrowLeft style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </StylePreferencesItem>

          {/* Climate Block */}
          <ClimateItem onClick={() => setActiveSection('climate')}>
            <FaCloudSun size={24} style={{ color: '#FF9800', marginBottom: '12px' }} />
            <ItemTitle>Climate</ItemTitle>
            <ItemDescription>Set your local climate for better recommendations</ItemDescription>
            <FaArrowLeft style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </ClimateItem>

          {/* Wardrobe Goals Block */}
          <WardrobeGoalsItem onClick={() => setActiveSection('wardrobeGoals')}>
            <FaBullseye size={24} style={{ color: '#00BCD4', marginBottom: '12px' }} />
            <ItemTitle>Wardrobe Goals</ItemTitle>
            <ItemDescription>Define your wardrobe objectives and priorities</ItemDescription>
            <FaArrowLeft style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </WardrobeGoalsItem>

          {/* Shopping Limit Block */}
          <ShoppingLimitItem onClick={() => setActiveSection('shoppingLimit')}>
            <FaShoppingCart size={24} style={{ color: '#E91E63', marginBottom: '12px' }} />
            <ItemTitle>Shopping Limit</ItemTitle>
            <ItemDescription>Set your shopping frequency and preferences</ItemDescription>
            <FaArrowLeft style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </ShoppingLimitItem>

          {/* Clothing Budget Block */}
          <ClothingBudgetItem onClick={() => setActiveSection('clothingBudget')}>
            <FaDollarSign size={24} style={{ color: '#8BC34A', marginBottom: '12px' }} />
            <ItemTitle>Clothing Budget</ItemTitle>
            <ItemDescription>Configure your monthly clothing budget</ItemDescription>
            <FaArrowLeft style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </ClothingBudgetItem>
        </GridContainer>
      ) : (
        // Show the selected section
        <>
          <Button 
            outlined={true} 
            onClick={() => setActiveSection(null)} 
            style={{ marginBottom: '20px' }}
          >
            <FaArrowLeft style={{ marginRight: '8px' }} /> Back to Profile
          </Button>

          {activeSection === 'stylePreferences' && (
            <StylePreferencesSection
              profileData={profileData}
              setProfileData={setProfileData}
              handleCheckboxChange={(field, value) => handleCheckboxChange(field, value)}
              handleNestedChange={handleNestedChange}
            />
          )}

          {activeSection === 'climate' && (
            <ClimateSection
              profileData={profileData}
              setProfileData={setProfileData}
              handleCheckboxChange={(field, value) => handleCheckboxChange(field, value)}
              handleNestedChange={handleNestedChange}
            />
          )}

          {activeSection === 'wardrobeGoals' && (
            <WardrobeGoalsSection
              profileData={profileData}
              setProfileData={setProfileData}
              handleCheckboxChange={(field, value) => handleCheckboxChange(field, value)}
              handleNestedChange={handleNestedChange}
            />
          )}

          {activeSection === 'shoppingLimit' && (
            <ShoppingLimitSection
              initialData={{
                shoppingLimit: {
                  amount: profileData.shoppingLimit?.amount || 0,
                  frequency: profileData.shoppingLimit?.frequency || 'monthly'
                }
              }}
              onSave={(data: ShoppingLimit) => {
                console.log('ShoppingLimitSection onSave:', data);
                setProfileData((prevData) => {
                  const updatedData = {
                    ...prevData,
                    shoppingLimit: {
                      amount: data.amount || 0,
                      frequency: data.frequency || 'monthly'
                    }
                  };
                  console.log('Updated profile data:', updatedData);
                  return updatedData;
                });
              }}
            />
          )}

          {activeSection === 'clothingBudget' && (
            <BudgetSection
              initialData={{
                amount: profileData.clothingBudget?.amount || 0,
                currency: profileData.clothingBudget?.currency || 'USD',
                frequency: profileData.clothingBudget?.frequency || 'monthly'
              }}
              onSave={(data: ClothingBudgetData) => {
                console.log('BudgetSection onSave:', data);
                setProfileData((prevData) => {
                  const updatedData = {
                    ...prevData,
                    clothingBudget: {
                      amount: data.amount,
                      currency: data.currency,
                      frequency: data.frequency
                    }
                  };
                  console.log('Updated profile data with budget:', updatedData);
                  return updatedData;
                });
              }}
            />
          )}
        </>
      )}
      
      <ButtonContainer>
        <Button onClick={handleSave}>Save Profile</Button>
      </ButtonContainer>
    </>
  );
};

export default StyleProfileSection;
