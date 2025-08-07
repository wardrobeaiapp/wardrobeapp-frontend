import { useMemo } from 'react';
import { ShoppingLimit } from '../../types';
import StyleProfileSection from './StyleProfileSection';
import SubscriptionSection from './SubscriptionSection';
import ShoppingLimitSection from './sections/ShoppingLimitSection';
import MyProgressSection from './MyProgressSection';
import NotificationsSection from './NotificationsSection';
import OtherSettingsSection from './OtherSettingsSection';
import ScenarioSettingsSection from './ScenarioSettingsSection';
import { 
  UserPreferences, 
  SubscriptionData,
  AISettingsData,
  NotificationsData,
  OtherSettingsData
} from '../../types/profile';

interface ProfileSectionsProps {
  styleProfile: UserPreferences;
  subscription: SubscriptionData;
  shoppingLimit: ShoppingLimit;
  aiSettings: AISettingsData;
  notifications: NotificationsData;
  otherSettings: OtherSettingsData;
  handleStyleProfileSave: (data: UserPreferences) => void;
  handleSubscriptionChangePlan: (plan: string) => void;
  handleSubscriptionManageBilling: () => void;
  handleSubscriptionViewUpgradeOptions: () => void;
  handleShoppingLimitSave: (data: ShoppingLimit) => void;
  handleAISettingsSave: (data: AISettingsData) => void;
  handleAISettingsReset: () => void;
  handleNotificationsSave: (data: NotificationsData) => void;
  handleOtherSettingsExportData: () => void;
  handleOtherSettingsDeleteAccount: () => void;
  handleOtherSettingsSave: (data: OtherSettingsData) => void;
  onNavigateToScenarios?: () => void;
}

export const useProfileSections = ({
  styleProfile,
  subscription,
  shoppingLimit,
  notifications,
  otherSettings,
  handleStyleProfileSave,
  handleSubscriptionChangePlan,
  handleSubscriptionManageBilling,
  handleSubscriptionViewUpgradeOptions,
  handleShoppingLimitSave,
  handleNotificationsSave,
  handleOtherSettingsExportData,
  handleOtherSettingsDeleteAccount,
  handleOtherSettingsSave,
  onNavigateToScenarios
}: ProfileSectionsProps) => {
  // Memoize each section separately to prevent unnecessary re-renders
  const styleProfileSection = useMemo(() => (
    <StyleProfileSection 
      initialData={styleProfile as any} 
      onSave={handleStyleProfileSave as any}
      onNavigateToScenarios={onNavigateToScenarios}
    />
  ), [styleProfile, handleStyleProfileSave, onNavigateToScenarios]);
  
  const subscriptionSection = useMemo(() => (
    <SubscriptionSection 
      profileData={{
        ...styleProfile,
        subscriptionPlan: subscription.plan,
        subscriptionRenewalDate: subscription.renewalDate
      }}
      handleNestedChange={(parentField, field, value) => {
        if (parentField === 'subscriptionPlan' && field === '') {
          handleSubscriptionChangePlan(value);
        }
      }}
      onSave={async (section) => {
        // This would typically save the subscription data
        console.log('Saving subscription data');
        return { success: true };
      }}
    />
  ), [styleProfile, subscription, handleSubscriptionChangePlan]);
  
  const scenariosSection = useMemo(() => (
    <ScenarioSettingsSection />
  ), []);
  
  const shoppingLimitSection = useMemo(() => (
    <ShoppingLimitSection 
      initialData={{ shoppingLimit }}
      onSave={handleShoppingLimitSave}
    />
  ), [shoppingLimit, handleShoppingLimitSave]);
  
  const myProgressSection = useMemo(() => (
    <MyProgressSection />
  ), []);
  
  const notificationsSection = useMemo(() => (
    <NotificationsSection 
      initialData={notifications}
      onSave={handleNotificationsSave}
    />
  ), [notifications, handleNotificationsSave]);
  
  const otherSettingsSection = useMemo(() => (
    <OtherSettingsSection 
      initialData={otherSettings}
      onExportData={handleOtherSettingsExportData}
      onDeleteAccount={handleOtherSettingsDeleteAccount}
      onSave={handleOtherSettingsSave}
    />
  ), [otherSettings, handleOtherSettingsExportData, handleOtherSettingsDeleteAccount, handleOtherSettingsSave]);

  // Return an object containing all memoized sections
  return {
    styleProfileSection,
    subscriptionSection,
    scenariosSection,
    shoppingLimitSection,
    myProgressSection,
    notificationsSection,
    otherSettingsSection
  };
};
