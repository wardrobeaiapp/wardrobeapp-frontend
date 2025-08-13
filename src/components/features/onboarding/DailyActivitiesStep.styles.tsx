import styled from 'styled-components';
import { StepDescription } from '../../../pages/OnboardingPage.styles';
import { FollowUpOptionButton } from './OnboardingCardComponents.styles';


// Main container styles
export const ActivitiesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 24px auto;
`;

// Home activity option container
export const HomeActivityOptionContainer = styled.div`
  margin: 0.25rem 0;
  width: 100%;
`;

// Secondary description for additional instructions
export const SecondaryDescription = styled(StepDescription)`
  text-align: left;
  margin: 0.25rem 0;
  font-size: 0.8rem;
  font-weight: normal;
`;

// Custom FollowUpOptionButton for home activities
export const HomeActivityButton = styled(FollowUpOptionButton)`
  width: 100%;
  justify-content: flex-start;
  text-align: left;
`;

// Textarea styles for other activity description
export const ActivityTextarea = styled.textarea`
  margin-top: 0.5rem;
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
`;

// Icon background and color styles
export const getIconStyles = (bgColor: string, iconColor: string) => ({
  backgroundColor: bgColor,
  color: iconColor
});
