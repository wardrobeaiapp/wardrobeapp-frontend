import styled from 'styled-components';
import { theme } from '../../../styles/theme';
import { Card as BaseCard } from '../../cards/Card.styles';

// Grid layout for option cards
export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin: 24px 0;
`;

// Option card component using centralized Card with selection states
export const OptionCard = styled(BaseCard).attrs({ $variant: 'outline', $padding: 'md', $interactive: true })<{ $selected: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: ${props => props.$selected ? theme.colors.purple[50] : theme.colors.white};
  border: 1px solid ${props => props.$selected ? theme.colors.purple[500] : theme.colors.gray[200]};
  border-radius: 12px;
  cursor: pointer;
  box-shadow: ${props => props.$selected ? `0 4px 8px ${theme.colors.purple[500]}26` : `0 2px 4px ${theme.colors.gray[900]}0D`};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px ${theme.colors.gray[900]}1A;
    border-color: ${props => props.$selected ? theme.colors.purple[500] : theme.colors.gray[300]};
  }
`;

// Icon container
export const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
  font-size: 24px;
  flex-shrink: 0;
`;

// Text content container
export const CardTextContent = styled.div`
  display: flex;
  flex-direction: column;
`;

// Card label/title
export const CardLabel = styled.div`
  font-weight: 600;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
  text-align: left;
`;

// Card description
export const CardDescription = styled.div`
  font-size: 14px;
  color: #666;
  text-align: left;
  line-height: 1.4;
`;

// Section for sliders and other form elements
export const FormSection = styled.div`
  margin-top: 32px;
`;

// Follow-up question container
export const FollowUpQuestionContainer = styled.div`
  margin-left: 0;
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
`;

// Follow-up question title
export const FollowUpQuestionTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: left;
`;

// Follow-up options container
export const FollowUpOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.75rem;
`;

// Follow-up option button
export const FollowUpOptionButton = styled.button<{ $selected?: boolean }>`
  padding: 8px 16px;
  background-color: ${props => props.$selected ? '#6c5ce7' : '#f5f5f5'};
  color: ${props => props.$selected ? 'white' : '#333'};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: ${props => props.$selected ? 'bold' : 'normal'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$selected ? '#6c5ce7' : '#e0e0e0'};
  }
`;

// Container for individual slider
export const SliderContainer = styled.div`
  margin-bottom: 24px;
`;

// Slider title
export const SliderTitle = styled.div`
  font-weight: 500;
  font-size: 15px;
  color: #333;
  margin-bottom: 8px;
`;

// Slider input
export const SliderInput = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6c5ce7;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: #6c5ce7;
    cursor: pointer;
    border: none;
  }
`;

// Container for slider labels
export const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

// Individual slider label
export const SliderLabel = styled.div`
  font-size: 13px;
  color: #666;
`;

// Container for textarea
export const TextAreaContainer = styled.div`
  margin-top: 24px;
`;

// Styled textarea
export const StyledTextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #6c5ce7;
    box-shadow: 0 0 0 2px rgba(108, 92, 231, 0.1);
  }
  
  &::placeholder {
    color: #aaa;
  }
`;
