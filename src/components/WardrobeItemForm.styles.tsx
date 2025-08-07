import styled from 'styled-components';
import FormStyles from './Form';

// Form Container Styles
export const FormContainer = styled(FormStyles.Form)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

export const FormGroup = styled(FormStyles.FormGroup)`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled(FormStyles.FormLabel)`
  /* Any additional custom styles can be added here */
`;

export const Input = styled(FormStyles.FormInput)`
  /* Any additional custom styles can be added here */
`;

export const Select = styled(FormStyles.FormSelect)`
  /* Any additional custom styles can be added here */
`;

export const Textarea = styled(FormStyles.FormTextarea)`
  /* Any additional custom styles can be added here */
`;

export const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

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
