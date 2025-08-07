import styled from 'styled-components';
import { theme, flexColumn, card, heading1, heading2, heading3, bodyText, smallText, autoGrid } from '../styles';

export const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
`;

export const Header = styled.header`
  margin-bottom: ${theme.spacing.xl};
`;

export const Title = styled.h1`
  ${heading1}
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.md};
`;

export const Description = styled.p`
  ${bodyText}
  color: ${theme.colors.lightText};
  margin: 0;
`;

export const OptionsContainer = styled.div`
  ${autoGrid('250px', theme.spacing.lg)}
  margin-bottom: ${theme.spacing.xl};
`;

export const OptionCard = styled.div<{ $active: boolean }>`
  background-color: ${props => props.$active ? `${theme.colors.primary}11` : theme.colors.gray[100]};
  border: 2px solid ${props => props.$active ? theme.colors.primary : theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.sm};
  }
`;

export const OptionTitle = styled.h3`
  ${heading3}
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.xs};
`;

export const OptionDescription = styled.p`
  ${smallText}
  color: ${theme.colors.lightText};
  margin: 0;
`;

export const ContentContainer = styled.div`
  ${card}
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
`;

export const FormContainer = styled.div`
  background-color: ${theme.colors.gray[100]};
  border-radius: ${theme.borderRadius.md};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

export const FormGroup = styled.div`
  ${flexColumn}
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

export const Label = styled.label`
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text};
`;

export const Input = styled.input`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}33;
  }
`;

export const Select = styled.select`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.md};
  background-color: ${theme.colors.white};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}33;
  }
`;

export const Textarea = styled.textarea`
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.gray[300]};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.typography.fontSize.md};
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}33;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

export const ResponseContainer = styled.div`
  ${card}
  background-color: ${theme.colors.white};
  border-radius: ${theme.borderRadius.md};
  box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};
`;

export const ResponseTitle = styled.h2`
  ${heading2}
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.md};
`;

export const OutfitCard = styled.div`
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

export const OutfitName = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem;
`;

export const OutfitItems = styled.ul`
  margin: 0 0 1.5rem;
  padding-left: 1.5rem;
`;

export const OutfitItem = styled.li`
  margin-bottom: 0.5rem;
`;

export const OutfitDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #4b5563;
`;

export const OutfitDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const StyleAdvice = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

export const StyleAdviceTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem;
`;

export const StyleAdviceText = styled.p`
  color: #4b5563;
  white-space: pre-line;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
`;

export const ErrorContainer = styled.div`
  padding: 1.5rem;
  background-color: #fee2e2;
  border-radius: 0.5rem;
  color: #b91c1c;
  margin-top: 1.5rem;
`;

export const HistoryItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const HistoryDate = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

export const HistoryTitle = styled.h4`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem;
`;

export const HistoryDescription = styled.p`
  color: #4b5563;
  margin: 0;
  font-size: 0.875rem;
`;

export const NoHistoryMessage = styled.p`
  text-align: center;
  color: #6b7280;
  padding: 2rem;
`;
