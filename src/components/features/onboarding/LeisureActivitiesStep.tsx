import React from 'react';
import { StepTitle, StepDescription } from '../../../pages/OnboardingPage.styles';
import { FrequencyInput, FrequencySelect, FrequencyControls } from './LeisureActivitiesStep.styles';
import {
  OptionsGrid,
  OptionCard,
  CardIcon,
  CardTextContent,
  CardLabel,
  CardDescription,
  FollowUpQuestionContainer,
  FollowUpQuestionTitle,
  FollowUpOptionsContainer
} from './OnboardingCardComponents.styles';
import Button from '../../common/Button';
import { leisureActivityOptions, frequencyOptions, questionTexts, periodOptions } from '../../../data/onboardingOptions';
import { SharedStyledTextArea } from './SharedOnboardingComponents.styles';
import { getFrequencyLimits } from '../../../utils/frequencyValidation';

interface LeisureActivitiesStepProps {
  leisureActivities: string[];
  otherLeisureActivityDescription: string;
  outdoorFrequency: number;
  outdoorPeriod: string;
  socialFrequency: number;
  socialPeriod: string;
  travelFrequency: string;
  handleLeisureActivityToggle: (activityId: string) => void;
  handleOtherLeisureActivityDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleOutdoorFrequencyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleOutdoorPeriodChange: (period: string) => void;
  handleSocialFrequencyChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSocialPeriodChange: (period: string) => void;
  handleTravelFrequencyChange: (frequency: string) => void;
}

const LeisureActivitiesStep: React.FC<LeisureActivitiesStepProps> = ({
  leisureActivities,
  otherLeisureActivityDescription,
  outdoorFrequency,
  outdoorPeriod,
  socialFrequency,
  socialPeriod,
  travelFrequency,
  handleLeisureActivityToggle,
  handleOtherLeisureActivityDescriptionChange,
  handleOutdoorFrequencyChange,
  handleOutdoorPeriodChange,
  handleSocialFrequencyChange,
  handleSocialPeriodChange,
  handleTravelFrequencyChange
}) => {
  // Using leisure activity options and period options from central data file
  
  // Using frequency options from central data file for travel frequency
  const travelFrequencyOptions = frequencyOptions;

  return (
    <>
      <StepTitle>{questionTexts.leisureActivities.title}</StepTitle>
      <StepDescription>
        {questionTexts.leisureActivities.description}
      </StepDescription>
      <OptionsGrid style={{ display: 'flex', flexDirection: 'column'}}>
        {leisureActivityOptions.map(activity => (
          <React.Fragment key={activity.id}>
            <OptionCard
              $selected={leisureActivities.includes(activity.id)}
              onClick={() => handleLeisureActivityToggle(activity.id)}
            >
              <CardIcon style={{ backgroundColor: activity.bgColor, color: activity.iconColor }}>
                {activity.icon}
              </CardIcon>
              <CardTextContent>
                <CardLabel>{activity.label}</CardLabel>
                <CardDescription>
                  {activity.description}
                </CardDescription>
              </CardTextContent>
            </OptionCard>
            
            {/* Conditional follow-up question for outdoor activity frequency */}
            {activity.id === 'light-outdoor' && leisureActivities.includes('light-outdoor') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.outdoorFrequency.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer>
                  <FrequencyControls>
                    <FrequencyInput
                      type="number"
                      min="0"
                      max={getFrequencyLimits(outdoorPeriod).max}
                      value={outdoorFrequency.toString()}
                      onChange={handleOutdoorFrequencyChange}
                    />
                    <span>times per</span>
                    <FrequencySelect
                      value={outdoorPeriod}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleOutdoorPeriodChange(e.target.value)}
                    >
                    {periodOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                    </FrequencySelect>
                  </FrequencyControls>
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional follow-up question for social gatherings frequency */}
            {activity.id === 'social' && leisureActivities.includes('social') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.socialFrequency.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer>
                  <FrequencyControls>
                    <FrequencyInput
                      type="number"
                      min="0"
                      max={getFrequencyLimits(socialPeriod).max}
                      value={socialFrequency.toString()}
                      onChange={handleSocialFrequencyChange}
                    />
                    <span>times per</span>
                    <FrequencySelect
                      value={socialPeriod}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSocialPeriodChange(e.target.value)}
                    >
                    {periodOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                    </FrequencySelect>
                  </FrequencyControls>
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional follow-up question for travel frequency */}
            {activity.id === 'travel' && leisureActivities.includes('travel') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.travelFrequency.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer>
                  {travelFrequencyOptions.map((option: { id: string; label: string }) => (
                    <Button
                      key={option.id}
                      variant={travelFrequency === option.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleTravelFrequencyChange(option.id)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional follow-up question for 'other' leisure activity */}
            {activity.id === 'other' && leisureActivities.includes('other') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.otherLeisureActivity.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer style={{ width: '100%' }}>
                  <SharedStyledTextArea
                    id="otherLeisureActivityDescription"
                    name="otherLeisureActivityDescription"
                    value={otherLeisureActivityDescription}
                    onChange={handleOtherLeisureActivityDescriptionChange}
                    placeholder="Describe your other leisure activities here..."
                  />
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
          </React.Fragment>
        ))}
      </OptionsGrid>
    </>
  );
};

export default LeisureActivitiesStep;
