import React from 'react';
import {
  StepTitle,
  StepDescription
} from '../../../pages/OnboardingPage.styles';
import {
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
import {
  ActivitiesContainer,
  HomeActivityOptionContainer,
  SecondaryDescription,
  getIconStyles
} from './DailyActivitiesStep.styles';
import { SharedStyledTextArea } from './SharedOnboardingComponents.styles';
import {
  activityOptions,
  dressCodeOptions,
  remoteWorkOptions,
  creativeMobilityOptions,
  questionTexts,
  uniformUsageOptions,
  homeActivityOptions,
  studentDressCodeOptions
} from '../../../data/onboardingOptions';

interface DailyActivitiesStepProps {
  dailyActivities: string[];
  officeDressCode: string;
  remoteWorkPriority: string;
  creativeMobility: string;
  studentDressCode: string;
  homeActivities: string[];
  otherActivityDescription: string;
  uniformPreference: string;
  handleActivityToggle: (activityId: string) => void;
  handleDressCodeSelect: (dressCode: string) => void;
  handleRemoteWorkPrioritySelect: (priority: string) => void;
  handleCreativeMobilitySelect: (mobility: string) => void;
  handleStudentDressCodeSelect: (dressCode: string) => void;
  handleHomeActivityToggle: (activityId: string) => void;
  handleOtherActivityChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleUniformPreferenceSelect: (preference: string) => void;
}

// Helper function to get descriptions for each activity type
const getActivityDescription = (activityId: string): string => {
  switch (activityId) {
    case 'office':
      return 'Professional business environment';
    case 'remote':
      return 'Flexible work arrangements';
    case 'family':
      return 'Household and family responsibilities';
    case 'student':
      return 'Academic environment';
    case 'creative':
      return 'Creative industries and client meetings';
    case 'physical':
      return 'Manual labor or uniformed roles';
    case 'other':
      return 'Different lifestyle or mixed activities';
    default:
      return '';
  }
};

const DailyActivitiesStep: React.FC<DailyActivitiesStepProps> = ({
  dailyActivities,
  officeDressCode,
  remoteWorkPriority,
  creativeMobility,
  studentDressCode,
  homeActivities,
  otherActivityDescription,
  uniformPreference,
  handleActivityToggle,
  handleDressCodeSelect,
  handleRemoteWorkPrioritySelect,
  handleCreativeMobilitySelect,
  handleStudentDressCodeSelect,
  handleHomeActivityToggle,
  handleOtherActivityChange,
  handleUniformPreferenceSelect
}) => {
  return (
    <>
      <StepTitle>{questionTexts.dailyActivities.title}</StepTitle>
      <StepDescription>
        {questionTexts.dailyActivities.description}
      </StepDescription>
      <ActivitiesContainer>
        {activityOptions.map(activity => (
          <React.Fragment key={activity.id}>
            <OptionCard
              $selected={activity.id === 'other' 
                ? dailyActivities.includes('other') || dailyActivities.some(a => a.startsWith('other:'))
                : dailyActivities.includes(activity.id)
              }
              onClick={() => {
                handleActivityToggle(activity.id);
              }}
            >
              <CardIcon style={getIconStyles(activity.bgColor, activity.iconColor)}>
                {activity.icon}
              </CardIcon>
              <CardTextContent>
                <CardLabel>{activity.label}</CardLabel>
                <CardDescription>
                  {getActivityDescription(activity.id)}
                </CardDescription>
              </CardTextContent>
            </OptionCard>
            
            {/* Conditional follow-up question for office work */}
            {activity.id === 'office' && dailyActivities.includes('office') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.officeDressCode.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer>
                  {dressCodeOptions.map(option => (
                    <Button
                      key={option.id}
                      variant={officeDressCode === option.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleDressCodeSelect(option.id)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional follow-up question for remote work */}
            {activity.id === 'remote' && dailyActivities.includes('remote') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.remoteWorkPriority.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer>
                  {remoteWorkOptions.map(option => (
                    <Button
                      key={option.id}
                      variant={remoteWorkPriority === option.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleRemoteWorkPrioritySelect(option.id)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional follow-up question for family/home care */}
            {activity.id === 'family' && dailyActivities.includes('family') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.homeActivities.title}
                </FollowUpQuestionTitle>
                <SecondaryDescription>
                  {questionTexts.homeActivities.description}
                </SecondaryDescription>
                <FollowUpOptionsContainer>
                  {homeActivityOptions.map(option => (
                    <HomeActivityOptionContainer key={option.id}>
                      <Button
                        fullWidth
                        variant={homeActivities.includes(option.id) ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => handleHomeActivityToggle(option.id)}
                        style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                      >
                        {option.label}
                      </Button>
                    </HomeActivityOptionContainer>
                  ))}
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional follow-up question for creative/client-facing role */}
            {activity.id === 'creative' && dailyActivities.includes('creative') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.creativeMobility.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer>
                  {creativeMobilityOptions.map(option => (
                    <Button
                      key={option.id}
                      variant={creativeMobility === option.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleCreativeMobilitySelect(option.id)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional follow-up question for student activities */}
            {activity.id === 'student' && dailyActivities.includes('student') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.studentDressCode.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer>
                  {studentDressCodeOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant={studentDressCode === option.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleStudentDressCodeSelect(option.id)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional follow-up question for physical/uniform work */}
            {activity.id === 'physical' && dailyActivities.includes('physical') && (
              <FollowUpQuestionContainer>
                <FollowUpQuestionTitle>
                  {questionTexts.uniformUsage.title}
                </FollowUpQuestionTitle>
                <FollowUpOptionsContainer>
                  {uniformUsageOptions.map((option) => (
                    <Button
                      key={option.id}
                      variant={uniformPreference === option.id ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleUniformPreferenceSelect(option.id)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </FollowUpOptionsContainer>
              </FollowUpQuestionContainer>
            )}
            
            {/* Conditional textarea for Other activity */}
            {activity.id === 'other' && dailyActivities.includes('other') && (
              <FollowUpQuestionContainer style={{ width: '100%' }}>
                <FollowUpQuestionTitle>
                  {questionTexts.otherActivityDescription.title}
                </FollowUpQuestionTitle>
                <SharedStyledTextArea
                  id="otherActivityDescription"
                  name="otherActivityDescription"
                  value={otherActivityDescription}
                  onChange={handleOtherActivityChange}
                  placeholder="Describe your typical day and activities..."
                />
              </FollowUpQuestionContainer>
            )}
          </React.Fragment>
        ))}
      </ActivitiesContainer>
    </>
  );
};

export default DailyActivitiesStep;
