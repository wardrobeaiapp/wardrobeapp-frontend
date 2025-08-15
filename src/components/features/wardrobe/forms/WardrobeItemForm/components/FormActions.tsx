import React from 'react';
import {
  ButtonContainer
} from '../WardrobeItemForm.styles';
import Button from '../../../../../common/Button';

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
      <Button fullWidth variant="secondary" type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button 
        fullWidth
        variant="primary"
        type="submit" 
        onClick={onSubmit}
        disabled={isDisabled}
      >
        {isDownloadingImage ? 'Downloading Image...' : isSubmitting ? 'Saving...' : 'Save Item'}
      </Button>
    </ButtonContainer>
  );
};
