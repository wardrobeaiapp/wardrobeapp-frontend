import styled from 'styled-components';
import { formTokens, createFocusStyles, createButtonStyles } from '../../../../styles/tokens/forms';

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

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${formTokens.spacing.sm};
`;

export const Label = styled.label`
  font-size: ${formTokens.typography.fontSizes.sm};
  font-weight: ${formTokens.typography.fontWeights.semibold};
  color: ${formTokens.colors.text};
  margin-bottom: ${formTokens.spacing.xs};
  display: block;
  
  &.required::after {
    content: ' *';
    color: ${formTokens.colors.error};
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

export const Textarea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
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
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

export const SubmitButton = styled.button`
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button`
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
    color: #4b5563;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(107, 114, 128, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

export const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  border-radius: 9999px;
  font-size: 0.875rem;
`;

export const RemoveTagButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  background-color: #9ca3af;
  color: white;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: #6b7280;
  }
`;

// Duplicate ButtonContainer removed

export const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
`;

export const FormScreen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

export const ScreenTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem;
  text-align: center;
`;

export const NavigationButtons = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 1rem;
`;

export const ImagePreviewContainer = styled.div`
  margin-top: 0.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ImagePreview = styled.img`
  max-width: 100%;
  max-height: 200px;
  border-radius: 0.5rem;
  object-fit: cover;
  margin-bottom: 0.5rem;
`;

export const ImageUploadButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  width: 100%;
`;

export const FileInputLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
  flex: 1;
  text-align: center;
  
  &:hover {
    background-color: #e5e7eb;
  }
`;

export const FileInput = styled.input`
  display: none;
`;
