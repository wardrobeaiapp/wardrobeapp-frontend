import styled from 'styled-components';
import { theme } from '../../../styles/theme';

export const ScenarioList = styled.div`
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  width: 100%;
  max-width: 900px;
  box-sizing: border-box;
`;

export const ScenarioItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  
  &:hover {
    transform: translateY(-0.1875rem);
    box-shadow: 0 0.375rem 0.75rem rgba(0, 0, 0, 0.1);
  }
`;

export const ScenarioHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
`;

export const ScenarioIcon = styled.div`
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-size: 1.5rem;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
`;

export const ScenarioName = styled.h3`
  margin: 0;
  flex-grow: 1;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  
  &:hover {
    color: #1f2937;
  }
`;

export const ScenarioDescription = styled.p`
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: #4b5563;
`;

export const FrequencyControls = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

export const FrequencyText = styled.div`
  font-size: 0.875rem;
  color: #4b5563;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

export const TimeInput = styled.select`
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 3.75rem;
  background-color: #f9fafb;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

export const FrequencyLabel = styled.label`
  font-size: 0.875rem;
  color: #4b5563;
  margin-right: 0.5rem;
  margin-left: 0.5rem;
  font-weight: 500;
`;

export const FrequencySelect = styled.select`
  padding: 0.375rem 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  min-width: 3.75rem;
  background-color: #f9fafb;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
  }
`;

export const AddButton = styled.button`
  background-color: ${theme.colors.primary};
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid ${theme.colors.primary};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${theme.colors.primary};
  }
`;

export const SaveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  background-color: #f3f4f6;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

export const FeedbackMessage = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 0.625rem 1rem;
  margin: 0.625rem 0;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: ${props => 
    props.type === 'success' ? '#d1fae5' : 
    props.type === 'error' ? '#fee2e2' : '#e0f2fe'};
  color: ${props => 
    props.type === 'success' ? '#065f46' : 
    props.type === 'error' ? '#b91c1c' : '#0369a1'};
  border: 1px solid ${props => 
    props.type === 'success' ? '#a7f3d0' : 
    props.type === 'error' ? '#fecaca' : '#bae6fd'};
`;
