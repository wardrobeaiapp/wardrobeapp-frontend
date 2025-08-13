import React, { useState } from 'react';
import Button from '../../common/Button';
import { SectionWrapper, ContentHeader } from '../../../pages/ProfilePage.styles';
import { FaTshirt, FaArrowRight, FaCloudSun, FaArrowLeft, FaBullseye, FaShoppingCart, FaDollarSign } from 'react-icons/fa';

// Import SaveConfirmationModal
import SaveConfirmationModal from './modals/SaveConfirmationModal';

// Import styled components
import {
  GridContainer,
  StylePreferencesItem,
  ClimateItem,
  WardrobeGoalsItem,
  ShoppingLimitItem,
  ClothingBudgetItem,
  IconContainer,
  ItemTitle,
  ItemDescription,
  ButtonContainer
} from './StyleProfileSection.styles';

// Import wrapper components
import StylePreferencesSectionWrapper from './wrappers/StylePreferencesSectionWrapper';
import ClimateSectionWrapper from './wrappers/ClimateSectionWrapper';
import WardrobeGoalsSectionWrapper from './wrappers/WardrobeGoalsSectionWrapper';
import ShoppingLimitSectionWrapper from './wrappers/ShoppingLimitSectionWrapper';
import ClothingBudgetSectionWrapper from './wrappers/ClothingBudgetSectionWrapper';
import SubscriptionSectionWrapper from './wrappers/SubscriptionSectionWrapper';

// Types
import { ProfileData } from '../../../types';

// Import context provider - direct imports to avoid re-export issues
import { StyleProfileProvider } from './components/StyleProfileProvider';
import { useStyleProfile } from './context/StyleProfileContext';
import { SaveResult } from './types/StyleProfileTypes';

interface StyleProfileProps {
  initialData: ProfileData;
  onSave: (data: ProfileData) => Promise<SaveResult>;
  onNavigateToScenarios?: () => void;
}

// Wrapper component that provides the StyleProfileContext
const StyleProfileSection: React.FC<StyleProfileProps> = ({ initialData, onSave, onNavigateToScenarios }) => {
  return (
    <StyleProfileProvider 
      initialData={initialData} 
      onSave={onSave}
      onNavigateToScenarios={onNavigateToScenarios}
    >
      <StyleProfileContent />
    </StyleProfileProvider>
  );
};

// Main content component that uses the context
const StyleProfileContent: React.FC = () => {
  const { 
    profileData, 
    handleSave, 
    handleNestedChange,
    isModalOpen,
    closeModal
    // setProfileData removed to fix linting warning
  } = useStyleProfile();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // Create refs for each section component
  const stylePreferencesSectionRef = React.useRef<{ saveDirectly: () => Promise<SaveResult>; isSaving: boolean }>(null);
  const climateSectionRef = React.useRef<{ saveDirectly: () => Promise<SaveResult>; isSaving: boolean }>(null);
  const wardrobeGoalsSectionRef = React.useRef<{ saveDirectly: () => Promise<SaveResult>; isSaving: boolean }>(null);
  const shoppingLimitSectionRef = React.useRef<{ saveDirectly: () => Promise<SaveResult>; isSaving: boolean } | null>(null);
  const clothingBudgetSectionRef = React.useRef<{ saveDirectly: () => Promise<{ success: boolean; error?: string }>; isSaving: boolean }>(null);
  const subscriptionSectionRef = React.useRef<{ syncToContext: () => void }>(null);

  return (
    <SectionWrapper>
      {/* Save Confirmation Modal with scenario suggestions */}
      <SaveConfirmationModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        message="Profile updated successfully!"
      />
      {/* Direct content without SectionContent wrapper to avoid double borders and padding */}
      <ContentHeader>My Style Profile</ContentHeader>
      
      {activeSection === null ? (
        // Grid layout for section blocks - styled directly without nested containers
        <GridContainer>

          {/* Style Preferences Block */}
          <StylePreferencesItem onClick={() => setActiveSection('stylePreferences')}>
            <IconContainer style={{ backgroundColor: '#f5e6ff' }}>
              <FaTshirt size={24} style={{ color: '#9C27B0' }} />
            </IconContainer>
            <ItemTitle>Style Preferences</ItemTitle>
            <ItemDescription>Share your personal style and fashion preferences</ItemDescription>
            <FaArrowRight style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </StylePreferencesItem>

          {/* Climate Block */}
          <ClimateItem onClick={() => setActiveSection('climate')}>
            <IconContainer style={{ backgroundColor: '#fff5e6' }}>
              <FaCloudSun size={24} style={{ color: '#FF9800' }} />
            </IconContainer>
            <ItemTitle>Climate</ItemTitle>
            <ItemDescription>Set your local climate for better recommendations</ItemDescription>
            <FaArrowRight style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </ClimateItem>

          {/* Wardrobe Goals Block */}
          <WardrobeGoalsItem onClick={() => setActiveSection('wardrobeGoals')}>
            <IconContainer style={{ backgroundColor: '#e6fff9' }}>
              <FaBullseye size={24} style={{ color: '#00BCD4' }} />
            </IconContainer>
            <ItemTitle>Wardrobe Goals</ItemTitle>
            <ItemDescription>Define your wardrobe objectives and priorities</ItemDescription>
            <FaArrowRight style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </WardrobeGoalsItem>

          {/* Shopping Limit Block */}
          <ShoppingLimitItem onClick={() => setActiveSection('shoppingLimit')}>
            <IconContainer style={{ backgroundColor: '#ffe6f0' }}>
              <FaShoppingCart size={24} style={{ color: '#E91E63' }} />
            </IconContainer>
            <ItemTitle>Shopping Limit</ItemTitle>
            <ItemDescription>Set your shopping frequency and preferences</ItemDescription>
            <FaArrowRight style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </ShoppingLimitItem>

          {/* Clothing Budget Block */}
          <ClothingBudgetItem onClick={() => setActiveSection('clothingBudget')}>
            <IconContainer style={{ backgroundColor: '#f1f1f1' }}>
              <FaDollarSign size={24} style={{ color: '#666666' }} />
            </IconContainer>
            <ItemTitle>Clothing Budget</ItemTitle>
            <ItemDescription>Configure your monthly clothing budget</ItemDescription>
            <FaArrowRight style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)' }} />
          </ClothingBudgetItem>
          
          {/* Subscription Block removed to avoid duplication with sidebar menu */}
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
            <>
              <StylePreferencesSectionWrapper
                initialData={profileData}
                onSave={() => console.log('Style preferences saved successfully')}
                ref={stylePreferencesSectionRef}
              />
              <ButtonContainer>
                <Button 
                  onClick={async () => {
                    // Always use direct save functionality for StylePreferencesSection
                    if (stylePreferencesSectionRef.current?.saveDirectly) {
                      console.log('Using direct save functionality');
                      const result = await stylePreferencesSectionRef.current.saveDirectly();
                      if (result.success) {
                        // Success handling is done in the wrapper via onSave callback
                        console.log('Style preferences saved successfully via direct save');
                      } else {
                        console.error('Error saving style preferences via direct save:', result.error);
                      }
                    } else {
                      // This should never happen if the component is properly set up
                      console.error('Direct save functionality not available - this is unexpected');
                      alert('An error occurred while saving. Please try again or contact support.');
                    }
                  }} 
                  disabled={stylePreferencesSectionRef.current?.isSaving}
                  success
                >
                  {stylePreferencesSectionRef.current?.isSaving ? 'Saving...' : 'Save Style Preferences'}
                </Button>
              </ButtonContainer>
            </>
          )}

          {activeSection === 'climate' && (
            <>
              <ClimateSectionWrapper
                onSave={() => handleSave('climate')}
                ref={climateSectionRef}
              />
              <ButtonContainer>
                <Button onClick={async () => {
                  // Save climate data directly via the new service
                  if (climateSectionRef.current) {
                    console.log('Saving climate data directly');
                    const result = await climateSectionRef.current.saveDirectly();
                    if (result.success) {
                      console.log('Climate data saved successfully');
                    } else {
                      console.error('Failed to save climate data:', result.error);
                    }
                  }
                }} disabled={climateSectionRef.current?.isSaving} success>Save Climate</Button>
              </ButtonContainer>
            </>
          )}

          {activeSection === 'wardrobeGoals' && (
            <>
              <WardrobeGoalsSectionWrapper
                initialData={profileData}
                onSave={() => handleSave('wardrobeGoals')}
                ref={wardrobeGoalsSectionRef}
              />
              <ButtonContainer>
                <Button onClick={async () => {
                  // Save wardrobe goals data directly
                  if (wardrobeGoalsSectionRef.current) {
                    console.log('StyleProfileSection: Saving wardrobe goals data directly');
                    await wardrobeGoalsSectionRef.current.saveDirectly();
                  } else {
                    handleSave('wardrobeGoals');
                  }
                }} success>Save Wardrobe Goals</Button>
              </ButtonContainer>
            </>
          )}

          {activeSection === 'shoppingLimit' && (
            <>
              <ShoppingLimitSectionWrapper 
                ref={shoppingLimitSectionRef}
                initialData={profileData}
                onSave={() => {
                  console.log('StyleProfileSection: ShoppingLimitSectionWrapper onSave called');
                  // Optional: refresh profile data or update context if needed
                }}
              />
              <ButtonContainer>
                <Button 
                  onClick={async () => {
                    if (shoppingLimitSectionRef.current) {
                      console.log('StyleProfileSection: Calling saveDirectly on ShoppingLimitSectionWrapper');
                      const result = await shoppingLimitSectionRef.current.saveDirectly();
                      if (!result.success && result.error) {
                        console.error('StyleProfileSection: Shopping limit save failed:', result.error);
                        // Could show an error message to user here
                      }
                    }
                  }}
                  success
                  disabled={shoppingLimitSectionRef.current?.isSaving}
                >
                  {shoppingLimitSectionRef.current?.isSaving ? 'Saving...' : 'Save Shopping Limit'}
                </Button>
              </ButtonContainer>
            </>
          )}

          {activeSection === 'clothingBudget' && (
            <>
              <ClothingBudgetSectionWrapper
                ref={clothingBudgetSectionRef}
                initialData={profileData}
                onSave={() => {
                  console.log('StyleProfileSection: ClothingBudgetSectionWrapper onSave callback');
                }}
              />
              <ButtonContainer>
                <Button 
                  onClick={async () => {
                    if (clothingBudgetSectionRef.current) {
                      try {
                        console.log('StyleProfileSection: Saving clothing budget data directly');
                        const result = await clothingBudgetSectionRef.current.saveDirectly();
                        if (result.success) {
                          console.log('StyleProfileSection: Clothing budget data saved successfully');
                        } else {
                          console.error('StyleProfileSection: Error saving clothing budget data:', result.error);
                        }
                      } catch (error) {
                        console.error('StyleProfileSection: Exception saving clothing budget data:', error);
                      }
                    }
                  }}
                  success
                  disabled={clothingBudgetSectionRef.current?.isSaving}
                >
                  {clothingBudgetSectionRef.current?.isSaving ? 'Saving...' : 'Save Clothing Budget'}
                </Button>
              </ButtonContainer>
            </>
          )}
          
          {activeSection === 'subscription' && (
            <>
              <SubscriptionSectionWrapper
                profileData={profileData}
                handleNestedChange={handleNestedChange}
                handleSave={handleSave}
                forwardedRef={subscriptionSectionRef}
              />
            </>
          )}
        </>
      )}
    </SectionWrapper>
  );
};

export default StyleProfileSection;
