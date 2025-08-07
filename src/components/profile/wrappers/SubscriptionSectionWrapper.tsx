import React, { useState, useEffect, useCallback } from 'react';
import { ProfileData } from '../../../types';
import SubscriptionSection from '../SubscriptionSection';
import { ProfileSection } from '../sections/types';
import { SaveResult } from '../context/StyleProfileContext';

// Define the interface for SubscriptionSectionWrapper
interface SubscriptionSectionWrapperProps {
  profileData: ProfileData;
  handleNestedChange: (parentField: keyof ProfileData, field: string, value: any) => void;
  forwardedRef?: React.RefObject<{
    syncToContext: () => void;
  } | null>;
  handleSave: (section?: ProfileSection) => Promise<SaveResult>;
}

const SubscriptionSectionWrapper: React.FC<SubscriptionSectionWrapperProps> = ({ 
  profileData, 
  handleNestedChange,
  forwardedRef,
  handleSave
}) => {
  // Local state to track subscription data
  const [localSubscription, setLocalSubscription] = useState({
    plan: profileData.subscriptionPlan || 'free',
    renewalDate: profileData.subscriptionRenewalDate || ''
  });

  // Function to sync local state to context
  const syncToContext = useCallback(() => {
    // Update the context with local state
    handleNestedChange('subscriptionPlan', '', localSubscription.plan);
    handleNestedChange('subscriptionRenewalDate', '', localSubscription.renewalDate);
  }, [handleNestedChange, localSubscription]);

  // Update local state when profileData changes
  useEffect(() => {
    setLocalSubscription({
      plan: profileData.subscriptionPlan || 'free',
      renewalDate: profileData.subscriptionRenewalDate || ''
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.subscriptionPlan, profileData.subscriptionRenewalDate]);
  
  // Expose syncToContext method via ref
  useEffect(() => {
    if (forwardedRef && forwardedRef.current) {
      forwardedRef.current = {
        syncToContext
      };
    }
  }, [forwardedRef, syncToContext]);
  
  // Wrap the original onSave to ensure sync happens before save
  const wrappedOnSave = useCallback((section: string) => {
    // First sync local state to context
    syncToContext();
    // Then call handleSave
    return handleSave(section as any);
  }, [handleSave, syncToContext]);

  return (
    <SubscriptionSection
      profileData={profileData}
      handleNestedChange={handleNestedChange}
      onSave={wrappedOnSave}
    />
  );
};

export default SubscriptionSectionWrapper;
