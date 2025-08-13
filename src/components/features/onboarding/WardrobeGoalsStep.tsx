import React from 'react';
import {
  StepTitle,
  StepDescription,
} from '../../../pages/OnboardingPage.styles';
import {
  OptionsGrid,
  OptionCard,
  CardIcon,
  CardTextContent,
  CardLabel,
  CardDescription
} from './OnboardingCardComponents.styles';
import { FormTextarea } from '../../../components/Form/Form.styles';
import { wardrobeGoalOptionsWithDetails, wardrobeGoalsStepContent } from '../../../data/onboardingOptions';

interface WardrobeGoalsStepProps {
  wardrobeGoals: string[];
  otherWardrobeGoalDescription: string;
  handleWardrobeGoalToggle: (goalId: string) => void;
  handleOtherWardrobeGoalChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const WardrobeGoalsStep: React.FC<WardrobeGoalsStepProps> = ({
  wardrobeGoals,
  otherWardrobeGoalDescription,
  handleWardrobeGoalToggle,
  handleOtherWardrobeGoalChange
}) => {
  // Using wardrobe goal options with details from central data file

  return (
    <>
      <StepTitle>{wardrobeGoalsStepContent.title}</StepTitle>
      <StepDescription>
        {wardrobeGoalsStepContent.description}
      </StepDescription>
      <OptionsGrid>
        {wardrobeGoalOptionsWithDetails.map(goal => (
          <React.Fragment key={goal.id}>
            <OptionCard
              $selected={wardrobeGoals.includes(goal.id)}
              onClick={() => handleWardrobeGoalToggle(goal.id)}
            >
              <CardIcon style={{ backgroundColor: goal.bgColor, color: goal.iconColor }}>
                <goal.icon />
              </CardIcon>
              <CardTextContent>
                <CardLabel>{goal.label}</CardLabel>
                {goal.description && <CardDescription>{goal.description}</CardDescription>}
              </CardTextContent>
            </OptionCard>
            
            {/* Conditional textarea for 'Other' option */}
            {goal.id === 'other' && wardrobeGoals.includes('other') && (
              <div style={{ 
                gridColumn: '1 / -1', // Make it span all columns
                marginTop: '0.5rem', 
                marginBottom: '1rem',
                width: '100%' // Ensure full width
              }}>
                <StepDescription style={{ textAlign: 'left', margin: '0.5rem 0', fontSize: '0.9rem' }}>
                  Please describe your other wardrobe goal:
                </StepDescription>
                <FormTextarea
                  id="otherWardrobeGoalDescription"
                  name="otherWardrobeGoalDescription"
                  value={otherWardrobeGoalDescription}
                  onChange={handleOtherWardrobeGoalChange}
                  placeholder={wardrobeGoalsStepContent.otherGoalPlaceholder}
                  rows={2}
                  style={{ width: '100%' }} // Ensure the textarea itself is full width
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </OptionsGrid>
    </>
  );
};

export default WardrobeGoalsStep;
