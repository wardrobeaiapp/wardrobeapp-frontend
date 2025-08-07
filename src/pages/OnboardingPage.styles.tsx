import styled from 'styled-components';
import FormStyles from '../components/Form';

// Reuse form container and card styles from shared Form styles
export const OnboardingContainer = styled(FormStyles.FormContainer)`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const OnboardingCard = styled(FormStyles.FormCard)`
  max-width: 700px;
  position: relative;
  overflow: visible;
  padding-top: 2rem;
`;

export const ProgressContainer = styled.div<{ $currentStep: number; $totalSteps: number }>`
  position: relative;
  width: 100%;
  max-width: 700px;
  margin-bottom: 20px;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 4px;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: ${props => `${(props.$currentStep / props.$totalSteps) * 100}%`};
    height: 6px;
    background-color: #6366f1;
    border-radius: 4px;
  }
  
  /* Hide any children - we'll use ::after for the dots */
  > * {
    display: none;
  }
`;

export const ProgressDot = styled.div<{ $active: boolean; $completed: boolean }>`
  /* Not used in the new design */
  display: none;
`;

export const StepContent = styled.div`
  margin-bottom: 30px;
  min-height: 300px;
`;

export const StepTitle = styled(FormStyles.FormTitle)`
  text-align: center;
  font-size: 1.75rem;
  margin-bottom: 0.75rem;
`;

export const StepDescription = styled(FormStyles.FormSubtitle)`
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

export const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

export const ActivityChipsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

export const ActivityChip = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-radius: 12px;
  border: 2px solid ${props => props.selected ? '#6366f1' : '#e0e0e0'};
  background-color: ${props => props.selected ? 'rgba(99, 102, 241, 0.1)' : 'white'};
  color: ${props => props.selected ? '#6366f1' : '#333'};
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 8px;
  
  &:hover {
    border-color: #6366f1;
    background-color: ${props => props.selected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const ChipIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 1.2rem;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  padding: 8px;
  flex-shrink: 0;
  /* Background and color are set via inline style */
`;

export const ChipContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ChipLabel = styled.span`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 4px;
`;

export const ChipDescription = styled.span`
  font-size: 0.85rem;
  color: #666;
  font-weight: normal;
  line-height: 1.3;
`;

export const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 20px;
`;

export const OptionButton = styled.button<{ selected: boolean }>`
  padding: 12px;
  border-radius: 6px;
  border: 2px solid ${props => props.selected ? '#6366f1' : '#e0e0e0'};
  background-color: ${props => props.selected ? 'rgba(99, 102, 241, 0.1)' : 'white'};
  color: ${props => props.selected ? '#6366f1' : '#333'};
  font-weight: ${props => props.selected ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #6366f1;
    background-color: ${props => props.selected ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'};
  }
`;

export const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 18px;
  color: #666;
`;

export const OptionChip = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid ${props => props.$selected ? '#6366f1' : '#e5e7eb'};
  background-color: ${props => props.$selected ? '#f5f3ff' : 'white'};
  color: ${props => props.$selected ? '#6366f1' : '#374151'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #6366f1;
    background-color: ${props => props.$selected ? '#f5f3ff' : '#f9fafb'};
  }
`;

export const OptionIcon = styled.span`
  margin-right: 0.75rem;
  font-size: 1.25rem;
  color: ${props => props.color || 'inherit'};
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  padding: 0 1rem;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  color: #4b5563;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #e5e7eb;
  }
  
  &::before {
    content: '←';
    margin-right: 0.5rem;
  }
`;

export const NextButton = styled.button<{ $isComplete?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #818cf8;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #6366f1;
  }
  
  &::after {
    content: ${props => props.$isComplete ? '"✓"' : '"→"'};
    margin-left: 0.5rem;
  }
`;

export const SkipButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 1rem;
  
  &:hover {
    color: #374151;
  }
`;

export const CompletionMessage = styled.div`
  text-align: center;
  margin: 2rem 0;
`;

export const CompletionIcon = styled.div`
  font-size: 3rem;
  color: #10b981;
  margin-bottom: 1rem;
`;

export const CompletionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #111827;
`;

export const CompletionText = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 2rem;
`;
