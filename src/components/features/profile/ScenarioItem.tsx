import React from 'react';
import { FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import { getScenarioIcon } from '../../../utils/scenarioIconUtils';
import { frequencyOptions, periodOptions } from '../../../data/onboardingOptions';
import {
  ScenarioItem as StyledScenarioItem,
  ScenarioHeader,
  ScenarioIcon,
  ScenarioName,
  ActionButtons,
  IconButton,
  ScenarioDescription,
  FrequencyControls,
  FrequencyText,
  TimeInput,
  FrequencyLabel,
  FrequencySelect
} from './ScenarioSettingsSection.styles';

export interface ScenarioItemProps {
  id: string;
  type: string;
  description: string;
  frequency: number;
  period: string;
  onDelete: (id: string) => void;
  onFrequencyChange: (id: string, value: number) => void;
  onPeriodChange: (id: string, value: string) => void;
  onEdit?: (id: string) => void;
}

const ScenarioItemComponent: React.FC<ScenarioItemProps> = ({
  id,
  type,
  description,
  frequency,
  period,
  onDelete,
  onFrequencyChange,
  onPeriodChange,
  onEdit
}) => {
  const { Icon, color, bgColor } = getScenarioIcon(type);
  const isTravel = type.toLowerCase().includes('travel');
  
  // Check if description is meaningful (not empty and not generic template)
  const isGenericDescription = description.startsWith('Settings for') && description.endsWith('scenario');
  const shouldShowDescription = description && description.trim() !== '' && !isGenericDescription;

  return (
    <StyledScenarioItem>
      <ScenarioHeader>
        <ScenarioIcon style={{ backgroundColor: bgColor }}>
          <Icon color={color} />
        </ScenarioIcon>
        <ScenarioName>{type}</ScenarioName>
        <ActionButtons>
          {onEdit && (
            <IconButton onClick={() => onEdit(id)}>
              <FaEdit size={14} />
            </IconButton>
          )}
          <IconButton onClick={() => onDelete(id)}>
            <FaTrash size={14} />
          </IconButton>
        </ActionButtons>
      </ScenarioHeader>
        
      {shouldShowDescription && (
        <ScenarioDescription>{description}</ScenarioDescription>
      )}
    
      <FrequencyControls>
        {/* Special case for travel scenarios */}
        {isTravel ? (
          <>
            <FrequencyText>
              <FaClock size={14} style={{ marginRight: '0.375rem' }} />
            </FrequencyText>
            <FrequencySelect
              id={`period-${id}`}
              name={`period-${id}`}
              value={period || 'monthly'}
              onChange={(e) => onPeriodChange(id, e.target.value)}
              aria-label={`Frequency for ${type}`}
            >
              <option value="" disabled>Select frequency</option>
              {frequencyOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </FrequencySelect>
          </>
        ) : (
          <>
            <FrequencyText>
              <FaClock size={14} style={{ marginRight: '0.375rem' }} /> 
            </FrequencyText>
            <TimeInput 
              id={`frequency-${id}`}
              name={`frequency-${id}`}
              value={Number.isFinite(frequency) ? frequency : 1}
              onChange={(e) => onFrequencyChange(id, parseInt(e.target.value) || 1)}
              aria-label={`Frequency for ${type}`}
            >
              {[1, 2, 3, 4, 5, 6, 7].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </TimeInput>
            <FrequencyLabel htmlFor={`frequency-${id}`}>time(s) per</FrequencyLabel>
            <FrequencySelect
              id={`period-${id}`}
              name={`period-${id}`}
              value={period || 'week'}
              onChange={(e) => onPeriodChange(id, e.target.value)}
              aria-label={`Period for ${type}`}
            >
              {periodOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </FrequencySelect>
          </>
        )}
      </FrequencyControls>
    </StyledScenarioItem>
  );
};

export default ScenarioItemComponent;
