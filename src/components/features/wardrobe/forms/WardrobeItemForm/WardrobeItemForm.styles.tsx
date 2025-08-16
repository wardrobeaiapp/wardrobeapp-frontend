import styled from 'styled-components';
import { formTokens, createFocusStyles, createButtonStyles } from '../../../../../styles/tokens/forms';

// Form Container Styles
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${formTokens.spacing.xl};
  width: 100%;
  padding: 0;
`;

// Photo Upload Area
export const PhotoUploadArea = styled.div`
  border: 2px dashed ${formTokens.colors.border};
  border-radius: ${formTokens.borderRadius.md};
  padding: ${formTokens.spacing.xxl};
  margin-bottom: ${formTokens.spacing.xxl};
  text-align: center;
  background-color: ${formTokens.colors.background.upload};
  transition: ${formTokens.transitions.all};
  cursor: pointer;
  
  &:hover {
    border-color: ${formTokens.colors.primary};
    background-color: ${formTokens.colors.background.uploadHover};
  }
`;

export const PhotoUploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${formTokens.spacing.lg};
`;

export const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  color: ${formTokens.colors.textPlaceholder};
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const UploadText = styled.p`
  color: ${formTokens.colors.textMuted};
  font-size: ${formTokens.typography.fontSizes.base};
  margin: 0;
`;

export const BrowseButton = styled.button`
  ${createButtonStyles('primary')}
  padding: ${formTokens.spacing.md} ${formTokens.spacing.xl};
`;

export const FileInfo = styled.p`
  color: ${formTokens.colors.textMuted};
  font-size: ${formTokens.typography.fontSizes.xs};
  margin: 0;
`;

// Form Layout
export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${formTokens.spacing.lg};
  
  @media (max-width: ${formTokens.form.breakpoints.mobile}) {
    grid-template-columns: 1fr;
  }
`;

export const Input = styled.input`
  width: 100%;
  padding: ${formTokens.form.inputPadding};
  border: 1px solid ${formTokens.colors.border};
  border-radius: ${formTokens.borderRadius.base};
  font-size: ${formTokens.typography.fontSizes.sm};
  transition: ${formTokens.transitions.colors};
  
  &:focus {
    ${createFocusStyles()}
  }
  
  &::placeholder {
    color: ${formTokens.colors.textPlaceholder};
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: ${formTokens.form.inputPadding};
  border: 1px solid ${formTokens.colors.border};
  border-radius: ${formTokens.borderRadius.base};
  font-size: ${formTokens.typography.fontSizes.sm};
  background-color: ${formTokens.colors.background.primary};
  transition: ${formTokens.transitions.colors};
  
  &:focus {
    ${createFocusStyles()}
  }
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: #8b5cf6;
`;

export const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  user-select: none;
`;

// Button Container and Buttons
export const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
`;

