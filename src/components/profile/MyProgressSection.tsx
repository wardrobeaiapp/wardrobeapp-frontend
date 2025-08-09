import React, { useState, useEffect } from 'react';
import {
  SectionDivider,
  SectionWrapper
} from '../../pages/ProfilePage.styles';
import { getShoppingLimitData } from '../../services/userBudgetsService';
import { useSupabaseAuth } from '../../context/SupabaseAuthContext';
import { getUserProfileByUserId } from '../../services/supabaseAuthService';
import { getAIUsageData, AIUsageData } from '../../services/aiUsageService';
import { getImpulseBuyTrackerData, calculateDaysSinceStart, ImpulseBuyTrackerData } from '../../services/impulseBuyTrackerService';
import {
  ProgressCard,
  CardTitle,
  StatLabel,
  ProgressBar,
  ProgressFill,
  SuccessMessage,
  ImpulseTracker,
  StreakNumber,
  StreakLabel,
  StreakMessage,
  SavingsGrid,
  SavingsCard,
  SavingsAmount,
  TotalSavingsCard,
  LastUpdate
} from './MyProgressSection.styles';



interface MyProgressProps {
  onNavigateToSubscription?: () => void;
}

const MyProgressSection: React.FC<MyProgressProps> = ({ onNavigateToSubscription }) => {
  const { user } = useSupabaseAuth();
  const [shoppingData, setShoppingData] = useState<any>(null);
  const [subscriptionPlan, setSubscriptionPlan] = useState<'free' | 'pro'>('free');
  const [aiUsageData, setAiUsageData] = useState<AIUsageData | null>(null);
  const [impulseBuyTrackerData, setImpulseBuyTrackerData] = useState<ImpulseBuyTrackerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Fetch shopping data, user profile (for subscription plan), AI usage data, and impulse buy tracker data
        const [shopping, userProfile, aiUsage, impulseBuyTracker] = await Promise.all([
          getShoppingLimitData(user.id),
          getUserProfileByUserId(user.id),
          getAIUsageData(user.id),
          getImpulseBuyTrackerData(user.id)
        ]);
        
        setShoppingData(shopping);
        setSubscriptionPlan((userProfile?.subscription_plan as 'free' | 'pro') || 'free');
        setAiUsageData(aiUsage);
        setImpulseBuyTrackerData(impulseBuyTracker);
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [user?.id]);

  if (isLoading) {
    return (
      <SectionWrapper>
        <SectionDivider>My Progress</SectionDivider>
        <div>Loading your progress...</div>
      </SectionWrapper>
    );
  }

  // Helper function to get period display text
  const getPeriodText = (frequency: 'monthly' | 'quarterly' | 'yearly') => {
    switch (frequency) {
      case 'monthly': return 'This Month';
      case 'quarterly': return 'This Quarter';
      case 'yearly': return 'This Year';
      default: return 'This Period';
    }
  };

  // Calculate AI usage limit based on subscription plan
  const aiUsageLimit = subscriptionPlan === 'pro' ? 50 : 3;
  const aiUsageUsed = aiUsageData?.aiChecksUsed || 0; // Real data from database
  const aiUsagePercentage = (aiUsageUsed / aiUsageLimit) * 100;

  // Calculate progress and stats
  const shoppingLimit = shoppingData?.shoppingLimitAmount || 0;
  const shoppingLimitUsed = shoppingData?.shoppingLimitUsed || 0; // Actual usage from database
  const shoppingLimitFrequency = shoppingData?.shoppingLimitFrequency || 'monthly';
  const progressPercentage = shoppingLimit > 0 ? (shoppingLimitUsed / shoppingLimit) * 100 : 0;
  const isWithinLimit = progressPercentage <= 100;
  
  // Mock data for demonstration - in real app, this would come from purchase tracking
  const typicalMonthly = 280;
  const currentSpent = (shoppingLimitUsed || 0) * 40; // Mock: $40 per usage, ensure safe calculation
  const savedThisMonth = typicalMonthly - currentSpent;
  const totalSaved = 690;
  
  // Calculate impulse buy streak days from real tracker data
  const impulseBuyStreak = impulseBuyTrackerData?.isSet 
    ? calculateDaysSinceStart(impulseBuyTrackerData.startDate) 
    : 0;

  return (
    <SectionWrapper>
      <SectionDivider>My Progress</SectionDivider>
      
      {/* Shopping Limit Summary - Only show if shopping limit is set */}
      {shoppingLimit > 0 && (
        <ProgressCard theme="linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%)">
          <CardTitle>
            🛍️ Shopping Limit Summary
          </CardTitle>
          
          <div style={{ 
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              Justified Purchases {getPeriodText(shoppingLimitFrequency)}
            </div>
            <div style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#38a169',
              marginBottom: '16px'
            }}>
              {shoppingLimitUsed} of {shoppingLimit}
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <ProgressBar>
                <ProgressFill 
                  $percentage={Math.min(progressPercentage, 100)} 
                  color={isWithinLimit ? '#48bb78' : '#f56565'}
                />
              </ProgressBar>
            </div>
          </div>
          
          {isWithinLimit && (
            <SuccessMessage>
              ✅ You've stayed within your limit.
            </SuccessMessage>
          )}
        </ProgressCard>
      )}

      {/* AI Usage Tracker */}
      <ProgressCard theme="linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)">
        <CardTitle>
          🤖 AI Usage Tracker
        </CardTitle>
        
        <div style={{ 
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            AI Checks Used This Month
          </div>
          <div style={{ 
            fontSize: '36px', 
            fontWeight: '700', 
            color: '#4f46e5',
            marginBottom: '16px'
          }}>
            {aiUsageUsed} of {aiUsageLimit}
          </div>
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Usage</span>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>{Math.round(aiUsagePercentage)}%</span>
            </div>
            <ProgressBar>
              <ProgressFill 
                $percentage={aiUsagePercentage} 
                color="#4f46e5"
              />
            </ProgressBar>
          </div>
        </div>
        
        {/* Only show "Get more checks" button for free users */}
        {subscriptionPlan === 'free' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={onNavigateToSubscription}
              style={{
                background: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              + Get more checks
            </button>
          </div>
        )}
      </ProgressCard>

      {/* Impulse Buy Tracker - Only show if activated */}
      {impulseBuyTrackerData?.isSet && (
      <ProgressCard theme="linear-gradient(135deg, #faf5ff 0%, #e9d8fd 100%)">
        <CardTitle>
          🎯 Impulse Buy Tracker
        </CardTitle>
        
        <ImpulseTracker>
          <div>🏆</div>
          <StreakNumber>{impulseBuyStreak} Days</StreakNumber>
          <StreakLabel>No impulse buys streak!</StreakLabel>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '16px 0' }}>
            {[...Array(5)].map((_, i) => {
              // Create gradual color progression from dark purple to light purple
              const colors = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
              return (
                <div key={i} style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: colors[i]
                }} />
              );
            })}
          </div>
          
          <StreakMessage>Keep it up!</StreakMessage>
        </ImpulseTracker>
      </ProgressCard>
      )}

      {/* Savings This Month */}
      <ProgressCard theme="linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)">
        <CardTitle>
          💰 Saved this month
        </CardTitle>
        
        <SavingsGrid>
          <SavingsCard>
            <StatLabel>You spent</StatLabel>
            <SavingsAmount>${currentSpent}</SavingsAmount>
          </SavingsCard>
          <SavingsCard>
            <StatLabel>Typical monthly</StatLabel>
            <SavingsAmount>${typicalMonthly}</SavingsAmount>
          </SavingsCard>
          <SavingsCard>
            <StatLabel>Saved this month</StatLabel>
            <SavingsAmount color="#38a169">${savedThisMonth}</SavingsAmount>
          </SavingsCard>
        </SavingsGrid>
        
        <TotalSavingsCard>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              📈 Total saved since starting
            </div>
            <div style={{ fontSize: '14px', color: '#4a5568', marginTop: '4px' }}>
              Your cumulative savings
            </div>
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#38a169' }}>
              ${totalSaved}
            </div>
            <div style={{ fontSize: '12px', color: '#4a5568' }}>
              saved in total
            </div>
          </div>
        </TotalSavingsCard>
      </ProgressCard>

      {/* Last Update - Standalone Block */}
      <LastUpdate>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            backgroundColor: '#f7fafc', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            📅
          </div>
          <div>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              color: '#2d3748',
              marginBottom: '2px'
            }}>
              Last Update
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#718096'
            }}>
              Progress tracking updated
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#2d3748'
          }}>
            Apr 1
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#718096'
          }}>
            2024
          </div>
        </div>
      </LastUpdate>
    </SectionWrapper>
  );
};

export default MyProgressSection;
