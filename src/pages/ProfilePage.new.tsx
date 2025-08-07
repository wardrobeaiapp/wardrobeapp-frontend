import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { useProfileSections } from '../components/profile/ProfileSections';
import { useProfileData } from '../hooks/useProfileData';
import { ProfileCategory, CATEGORIES } from '../types/profile';
import Header from '../components/Header/Header';
import Footer from '../components/Footer';
import { 
  FaUser, 
  FaCreditCard, 
  FaCalendarAlt, 
  FaChartLine, 
  FaBell, 
  FaCog,
  FaChevronRight
} from 'react-icons/fa';
import {
  PageContainer,
  SectionHeader,
  Title,
  Description,
  ProfileLayout,
  Sidebar,
  CategoryList,
  CategoryItem,
  CategoryIcon,
  CategoryLabel,
  ContentPanel
} from './ProfilePage.styles.new';
import styled from 'styled-components';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

// Map category IDs to their respective icons
const getCategoryIcon = (categoryId: ProfileCategory) => {
  switch (categoryId) {
    case 'style-profile':
      return <FaUser />;
    case 'subscription':
      return <FaCreditCard />;
    case 'scenarios':
      return <FaCalendarAlt />;
    case 'my-progress':
      return <FaChartLine />;
    case 'notifications':
      return <FaBell />;
    case 'other':
      return <FaCog />;
    default:
      return <FaUser />;
  }
};

const ProfilePage: React.FC = () => {
  // We no longer need the auth context variables since we removed the refresh button
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const auth = useSupabaseAuth();
  const [activeCategory, setActiveCategory] = useState<ProfileCategory>('style-profile');
  
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
    handleOtherSettingsSave
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
            <Title>Profile</Title>
            <Description>Manage your profile settings and preferences</Description>
          </div>
        </SectionHeader>
        
        <ProfileLayout>
          <Sidebar>
            <CategoryList>
              {CATEGORIES.map(category => (
                <CategoryItem 
                  key={category.id}
                  $active={activeCategory === category.id}
                  onClick={() => setActiveCategory(category.id)}
                >
                  <CategoryIcon>
                    {getCategoryIcon(category.id)}
                  </CategoryIcon>
                  <CategoryLabel>{category.label}</CategoryLabel>
                  <FaChevronRight size={12} />
                </CategoryItem>
              ))}
            </CategoryList>
          </Sidebar>
          
          <ContentPanel>
            {renderContent()}
          </ContentPanel>
        </ProfileLayout>
      </PageContainer>
      <Footer variant="simple" />
    </PageWrapper>
  );
};

export default ProfilePage;
