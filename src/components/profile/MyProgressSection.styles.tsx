import styled from 'styled-components';

// Main progress card container
export const ProgressCard = styled.div`
  background: ${props => props.theme || '#f8f9fa'};
  border-radius: 16px;
  padding: 24px;
  margin: 16px 0;
  border: 1px solid #e9ecef;
`;

// Card title with emoji
export const CardTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Generic stat label
export const StatLabel = styled.div`
  font-size: 14px;
  color: #718096;
  font-weight: 500;
`;

// Progress bar container
export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
`;

// Progress bar fill with dynamic width and color
export const ProgressFill = styled.div<{ $percentage: number; color?: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background-color: ${props => props.color || '#48bb78'};
  transition: width 0.3s ease;
`;

// Success message for within-limit status
export const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #38a169;
  font-weight: 500;
  margin-top: 8px;
`;

// Impulse buy tracker container
export const ImpulseTracker = styled.div`
  text-align: center;
  padding: 32px;
`;

// Large streak number display
export const StreakNumber = styled.div`
  font-size: 48px;
  font-weight: 700;
  color: #2d3748;
  margin: 16px 0 8px 0;
`;

// Streak label text
export const StreakLabel = styled.div`
  font-size: 16px;
  color: #718096;
  margin-bottom: 8px;
`;

// Streak encouragement message
export const StreakMessage = styled.div`
  font-size: 14px;
  color: #4a5568;
  margin-top: 16px;
`;

// Grid layout for savings cards
export const SavingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 20px 0;
`;

// Individual savings card
export const SavingsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e9ecef;
`;

// Savings amount with optional color
export const SavingsAmount = styled.div<{ color?: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color || '#2d3748'};
  margin: 8px 0;
`;

// Total savings highlight card
export const TotalSavingsCard = styled.div`
  background: linear-gradient(135deg, #e6fffa 0%, #b2f5ea 100%);
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// Last update card
export const LastUpdate = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  padding: 20px 24px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
