import styled from 'styled-components';
import { formTokens, createButtonStyles } from '../../../../../styles/tokens/forms';

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

// Button Container and Buttons
export const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

