import React from 'react';
import {
  ButtonContainer,
  SubmitButton,
  CancelButton
} from '../../WardrobeItemForm.styles';

interface FormActionsProps {
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isDownloadingImage?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  isDownloadingImage = false
}) => {
  const isDisabled = isSubmitting || isDownloadingImage;

  return (
    <ButtonContainer>
      <CancelButton type="button" onClick={onCancel}>
        Cancel
      </CancelButton>
      <SubmitButton 
        type="submit" 
        onClick={onSubmit}
        disabled={isDisabled}
      >
        {isDownloadingImage ? 'Downloading Image...' : isSubmitting ? 'Saving...' : 'Save Item'}
      </SubmitButton>
    </ButtonContainer>
  );
};
