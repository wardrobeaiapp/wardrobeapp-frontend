import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import styled from 'styled-components';
import Header from '../components/layout/Header/Header';
import { useProfileSections } from '../components/features/profile/ProfileSections';
import { useProfileData } from '../hooks/useProfileData';
import { ProfileCategory, CATEGORIES } from '../types/profile';
import { FaPalette, FaCrown, FaChartLine, FaBell, FaCog } from 'react-icons/fa';
import { FaCalendarDays } from 'react-icons/fa6';
import { PageHeader } from '../components/common/Typography/PageHeader';
import {
  PageContainer,
  SectionHeader,
  ProfileLayout,
  Sidebar,
  CategoryList,
  CategoryItem,
  ContentPanel
} from './ProfilePage.styles';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ProfilePage: React.FC = () => {
  // We no longer need the auth context variables since we removed the refresh button
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const auth = useSupabaseAuth();
  const [activeCategory, setActiveCategory] = useState<ProfileCategory>('style-profile');
  // Removed refresh profile functionality as it's no longer needed
  
  // Use our custom hook to get all profile data and handlers
  const {
    styleProfile,
    subscription,
    shoppingLimit,
    aiSettings,
    notifications,
    otherSettings,
    handleStyleProfileSave,
    handleSubscriptionChangePlan,
    handleSubscriptionManageBilling,
    handleSubscriptionViewUpgradeOptions,
    handleShoppingLimitSave,
    handleAISettingsSave,
    handleAISettingsReset,
    handleNotificationsSave,
    handleOtherSettingsExportData,
    handleOtherSettingsDeleteAccount,
    handleOtherSettingsSave,
    refreshUserData
  } = useProfileData();
  
  // Refresh user data when the profile page is loaded
  useEffect(() => {
    // Only refresh user data once when the component mounts
    refreshUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Function to navigate to scenarios section
  const navigateToScenarios = useCallback(() => {
    setActiveCategory('scenarios');
  }, [setActiveCategory]);
  
  // Get all the memoized sections using our custom hook
  const sections = useProfileSections({
    styleProfile,
    subscription,
    shoppingLimit,
    aiSettings,
    notifications,
    otherSettings,
    handleStyleProfileSave,
    handleSubscriptionChangePlan,
    handleSubscriptionManageBilling,
    handleSubscriptionViewUpgradeOptions,
    handleShoppingLimitSave,
    handleAISettingsSave,
    handleAISettingsReset,
    handleNotificationsSave,
    handleOtherSettingsExportData,
    handleOtherSettingsDeleteAccount,
    handleOtherSettingsSave,
    onNavigateToScenarios: navigateToScenarios,
    onNavigateToSubscription: () => setActiveCategory('subscription')
  });
  
  // Function to render the appropriate content based on active category
  const renderContent = useCallback(() => {
    switch (activeCategory) {
      case 'style-profile':
        return sections.styleProfileSection;
      case 'subscription':
        return sections.subscriptionSection;
      case 'scenarios':
        return sections.scenariosSection;
      case 'my-progress':
        return sections.myProgressSection;
      case 'notifications':
        return sections.notificationsSection;
      case 'other':
        return sections.otherSettingsSection;
      default:
        return <div>Select a category from the sidebar</div>;
    }
  }, [activeCategory, sections]);
  
  return (
    <PageWrapper>
      <Header />
      <PageContainer>
        <SectionHeader>
          <div>
            <PageHeader 
              title="Profile Settings"
              description="Customize your style preferences, notification settings, and more."
              titleSize="lg"
            />
          </div>
        </SectionHeader>
        
        <ProfileLayout>
          <Sidebar>
            <CategoryList>
              {CATEGORIES.map(category => {
                // Get the correct icon for each category
                let Icon;
                switch(category.id) {
                  case 'style-profile':
                    Icon = FaPalette;
                    break;
                  case 'subscription':
                    Icon = FaCrown;
                    break;
                  case 'my-progress':
                    Icon = FaChartLine;
                    break;
                  case 'scenarios':
                    Icon = FaCalendarDays;
                    break;
                  case 'notifications':
                    Icon = FaBell;
                    break;
                  case 'other':
                    Icon = FaCog;
                    break;
                  default:
                    Icon = FaCog;
                }
                
                return (
                  <CategoryItem 
                    key={category.id}
                    $active={activeCategory === category.id}
                    onClick={() => setActiveCategory(category.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem' }}><Icon /></span>
                      <span>{category.label}</span>
                    </div>
                  </CategoryItem>
                );
              })}
            </CategoryList>
          </Sidebar>
          
          <ContentPanel>
            {renderContent()}
          </ContentPanel>
        </ProfileLayout>
      </PageContainer>
    </PageWrapper>
  );
};

export default ProfilePage;
