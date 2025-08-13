import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '../../../context/SupabaseAuthContext';
import { getUserProfileByUserId } from '../../../services/supabaseAuthService';
import { saveSubscriptionToUserProfile } from '../../../services/userPreferencesService';
import Button from '../../common/Button';
import {
  ContentHeader,
  Card,
  CardTitle,
  CardDescription,
  ButtonContainer,
  PremiumBadge,
  SectionWrapper
} from '../../../pages/ProfilePage.styles';
import SaveConfirmationModal from './modals/SaveConfirmationModal';
import ConfirmationModal from './modals/ConfirmationModal';
import styled from 'styled-components';
import { ProfileData } from '../../../types';

const FreeBadge = styled.span`
  background-color: #e0e0e0;
  color: #616161;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
  margin-left: 5px;
`;

interface SaveResult {
  success: boolean;
  error?: any;
}

interface SubscriptionProps {
  profileData: ProfileData;
  handleNestedChange: (parentField: keyof ProfileData, field: string, value: any) => void;
  onSave: (section: string) => Promise<SaveResult>; // Keep for backward compatibility
}

const SubscriptionSection: React.FC<SubscriptionProps> = ({ 
  profileData, 
  handleNestedChange, 
  onSave 
}) => {
  const { user } = useSupabaseAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const currentPlan = profileData.subscriptionPlan || 'free';
  const renewalDate = profileData.subscriptionRenewalDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Function to refresh subscription data from the database
  const refreshSubscriptionData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      console.log('Refreshing subscription data for user:', user.id);
      const freshUserProfile = await getUserProfileByUserId(user.id);
      console.log('Fresh user profile data:', freshUserProfile);
      
      if (freshUserProfile) {
        // Update local state with fresh data from database
        handleNestedChange('subscriptionPlan', '', freshUserProfile.subscription_plan || 'free');
        handleNestedChange('subscriptionRenewalDate', '', freshUserProfile.subscription_renewal_date || '');
      }
    } catch (error) {
      console.error('Error refreshing subscription data:', error);
    }
  }, [user?.id, handleNestedChange]);
  
  // Refresh subscription data when component mounts or when user changes
  useEffect(() => {
    refreshSubscriptionData();
  }, [user?.id, refreshSubscriptionData]);

  const handleUpgrade = async () => {
    try {
      if (!user?.id) {
        console.error('ERROR - handleUpgrade - No user ID available');
        setModalMessage('Error: User not authenticated. Please log in and try again.');
        setIsModalOpen(true);
        return;
      }

      console.log('DEBUG - handleUpgrade - Starting upgrade process for user:', user.id);
      
      // Create a copy of the profile data with the updated subscription info
      const updatedProfileData = {
        ...profileData,
        subscriptionPlan: 'pro'
      };
      
      // Set renewal date to one month from now
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      const formattedDate = oneMonthFromNow.toISOString().split('T')[0];
      updatedProfileData.subscriptionRenewalDate = formattedDate;
      
      // Update the local state
      handleNestedChange('subscriptionPlan', '', 'pro');
      handleNestedChange('subscriptionRenewalDate', '', formattedDate);
      
      console.log('DEBUG - handleUpgrade - Updated profile data:', updatedProfileData);
      
      // Save the changes directly to user_profiles table
      const result = await saveSubscriptionToUserProfile(updatedProfileData, user.id);
      
      if (result?.success) {
        setModalMessage('Successfully upgraded to Pro plan!');
        setIsModalOpen(true);
        console.log('Successfully upgraded to Pro plan');
        
        // Refresh subscription data from database to ensure UI is up-to-date
        await refreshSubscriptionData();
      } else {
        console.error('Error upgrading to Pro plan:', result?.error);
        setModalMessage('There was an error upgrading your plan. Please try again.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error in upgrade process:', error);
      setModalMessage('There was an error upgrading your plan. Please try again.');
      setIsModalOpen(true);
    }
  };
  
  const handleDowngrade = () => {
    // Open confirmation modal instead of using window.confirm
    setIsConfirmModalOpen(true);
  };
  
  const confirmDowngrade = async () => {
    try {
      if (!user?.id) {
        console.error('ERROR - confirmDowngrade - No user ID available');
        setModalMessage('Error: User not authenticated. Please log in and try again.');
        setIsModalOpen(true);
        return;
      }

      console.log('DEBUG - confirmDowngrade - Starting downgrade process for user:', user.id);
      
      // Create a copy of the profile data with the updated subscription info
      const updatedProfileData = {
        ...profileData,
        subscriptionPlan: 'free'
      };
      
      // Update the local state
      handleNestedChange('subscriptionPlan', '', 'free');
      
      console.log('DEBUG - confirmDowngrade - Updated profile data:', updatedProfileData);
      
      // Save the changes directly to user_profiles table
      const result = await saveSubscriptionToUserProfile(updatedProfileData, user.id);
      
      if (result?.success) {
        setModalMessage('Successfully downgraded to Free plan.');
        setIsModalOpen(true);
        setIsConfirmModalOpen(false);
        console.log('Successfully downgraded to Free plan');
        
        // Refresh subscription data from database to ensure UI is up-to-date
        await refreshSubscriptionData();
      } else {
        console.error('Error downgrading to Free plan:', result?.error);
        setModalMessage('There was an error downgrading your plan. Please try again.');
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error('Error in downgrade process:', error);
      setModalMessage('There was an error downgrading your plan. Please try again.');
      setIsModalOpen(true);
    }
  };
  
  const isPro = currentPlan === 'pro';
  
  // Define features based on the subscription plan
  const freeFeatures = [
    'Basic wardrobe management',
    'Limited item storage (up to 100 items)',
    'Basic outfit planning',
    'Standard support',
    'Core style features'
  ];
  
  const proFeatures = [
    'AI-powered outfit recommendations',
    'Unlimited wardrobe items',
    'Advanced calendar planning',
    'Priority support',
    'Exclusive style insights',
    'Seasonal trend analysis',
    'Personal stylist recommendations'
  ];
  
  const features = isPro ? proFeatures : freeFeatures;
  
  return (
    <SectionWrapper>
        <ContentHeader>My Subscription</ContentHeader>
        
        <Card>
          <CardTitle>
            Current Plan: {isPro ? 
              <PremiumBadge>Pro</PremiumBadge> : 
              <FreeBadge>Free</FreeBadge>
            }
          </CardTitle>
          <CardDescription>
            {isPro ? (
              <>
                Your Pro subscription renews on <strong>{renewalDate}</strong>
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#6B7280' }}>
                  {new Date(renewalDate) > new Date() ? 
                    `${Math.ceil((new Date(renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining` : 
                    'Renewal due today'}
                </div>
              </>
            ) : (
              "You're currently on the Free plan with basic features. Upgrade to Pro for enhanced capabilities!"
            )}
          </CardDescription>
          
          <div>
            <strong>Features included:</strong>
            <ul>
              {features.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
          
          {/* Success message is now handled by the modal */}
          
          <ButtonContainer>
            {isPro && (
              <>
                <Button onClick={handleDowngrade}>Downgrade to Free</Button>
                <Button onClick={() => {
                  setModalMessage('Billing management would open here');
                  setIsModalOpen(true);
                }}>Manage Billing</Button>
              </>
            )}
          </ButtonContainer>
        </Card>
        
        {!isPro && (
          <Card id="pro-plan-benefits">
            <CardTitle>Pro Plan Benefits</CardTitle>
            <CardDescription>
              Upgrade to unlock more features and enhance your wardrobe experience.
            </CardDescription>
            
            <ul>
              {proFeatures.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            
            <ButtonContainer>
              <Button primary onClick={handleUpgrade}>Upgrade Now</Button>
            </ButtonContainer>
          </Card>
        )}
      <SaveConfirmationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        message={modalMessage}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDowngrade}
        title="Downgrade Confirmation"
        message="Are you sure you want to downgrade to the Free plan? You will lose access to Pro features."
      />
    </SectionWrapper>
  );
};

export default SubscriptionSection;
