import React from 'react';
import styled from 'styled-components';
import { formTokens, createButtonStyles, createHoverTransform } from '../../../styles/tokens/forms';

export interface FormActionsProps {
  onSubmit?: () => void;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  isDisabled?: boolean;
  submitVariant?: 'primary' | 'secondary' | 'danger';
  layout?: 'row' | 'column';
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const ActionsContainer = styled.div<{ layout: 'row' | 'column'; align: 'left' | 'center' | 'right' }>`
  display: flex;
  flex-direction: ${props => props.layout};
  gap: ${formTokens.spacing.lg};
  
  ${props => props.layout === 'row' && `
    justify-content: ${
      props.align === 'left' ? 'flex-start' : 
      props.align === 'right' ? 'flex-end' : 
      'center'
    };
  `}
  
  ${props => props.layout === 'column' && `
    align-items: stretch;
  `}
  
  @media (max-width: ${formTokens.form.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const BaseButton = styled.button`
  min-width: 120px;
  height: ${formTokens.form.buttonHeight};
  border-radius: ${formTokens.borderRadius.md};
  font-size: ${formTokens.typography.fontSizes.sm};
  font-weight: ${formTokens.typography.fontWeights.semibold};
  cursor: pointer;
  transition: ${formTokens.transitions.all};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(BaseButton)<{ variant: 'primary' | 'secondary' | 'danger' }>`
  ${props => createButtonStyles(props.variant)}
`;

const CancelButton = styled(BaseButton)`
  background: ${formTokens.colors.secondary};
  color: ${formTokens.colors.secondaryText};
  border: 1px solid ${formTokens.colors.border};
  
  &:hover:not(:disabled) {
    ${createHoverTransform()}
    background: ${formTokens.colors.secondaryHover};
    color: ${formTokens.colors.secondaryTextHover};
    box-shadow: ${formTokens.shadows.buttonSecondary};
  }
`;

export const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onCancel,
  submitText = 'Save',
  cancelText = 'Cancel',
  isSubmitting = false,
  isDisabled = false,
  submitVariant = 'primary',
  layout = 'row',
  align = 'right',
  className
}) => {
  const handleSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isSubmitting && !isDisabled && onSubmit) {
      onSubmit();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <ActionsContainer layout={layout} align={align} className={className}>
      {onCancel && (
        <CancelButton type="button" onClick={handleCancel}>
          {cancelText}
        </CancelButton>
      )}
      {onSubmit && (
        <SubmitButton
          type="submit"
          variant={submitVariant}
          onClick={handleSubmit}
          disabled={isSubmitting || isDisabled}
        >
          {isSubmitting ? 'Saving...' : submitText}
        </SubmitButton>
      )}
    </ActionsContainer>
  );
};


