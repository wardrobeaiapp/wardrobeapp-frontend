import styled from 'styled-components';
import { formTokens } from '../../../../../styles/tokens/forms';

// Common form container
interface FormContainerProps {
  $fullWidth?: boolean;
  $gap?: string;
}

export const FormContainer = styled.div<FormContainerProps>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$gap || formTokens.spacing.xl};
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  padding: 0;
`;

// Common form group
interface FormGroupProps {
  $gap?: string;
}

export const FormGroup = styled.div<FormGroupProps>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$gap || formTokens.spacing.md};
`;

// Common button container
interface ButtonContainerProps {
  $justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between';
  $gap?: string;
  $withBorder?: boolean;
}

export const ButtonContainer = styled.div<ButtonContainerProps>`
  display: flex;
  gap: ${props => props.$gap || formTokens.spacing.md};
  justify-content: ${props => props.$justifyContent || 'flex-end'};
  margin-top: ${formTokens.spacing.lg};
  padding-top: ${props => (props.$withBorder ? formTokens.spacing.lg : '0')};
  border-top: ${props => 
    props.$withBorder ? `1px solid ${formTokens.colors.border}` : 'none'};
`;

// Common form section
interface FormSectionProps {
  $spacing?: 'sm' | 'md' | 'lg' | 'xl';
}

export const FormSection = styled.section<FormSectionProps>`
  margin-bottom: ${props => 
    formTokens.spacing[props.$spacing || 'lg']};
  padding: ${formTokens.spacing.lg};
  background: ${formTokens.colors.background.primary};
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
`;

// Common form title
export const FormTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${formTokens.colors.text};
  margin: 0 0 ${formTokens.spacing.lg} 0;
`;

// Common form description
export const FormDescription = styled.p`
  color: ${formTokens.colors.textMuted};
  font-size: 0.875rem;
  margin: -${formTokens.spacing.md} 0 ${formTokens.spacing.lg} 0;
`;
