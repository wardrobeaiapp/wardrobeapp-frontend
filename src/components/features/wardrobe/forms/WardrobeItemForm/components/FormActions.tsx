import React from 'react';
import {
  ButtonContainer
} from '../WardrobeItemForm.styles';
import Button from '../../../../../common/Button';

interface FormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
  isDownloadingImage?: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
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
        disabled={isDisabled}
      >
        {isDownloadingImage ? 'Downloading Image...' : isSubmitting ? 'Saving...' : 'Save Item'}
      </Button>
    </ButtonContainer>
  );
};
