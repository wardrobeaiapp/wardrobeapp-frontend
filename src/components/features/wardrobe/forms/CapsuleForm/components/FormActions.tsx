import React from 'react';
import Button from '../../../../../common/Button';
import { ButtonContainer } from '../../../shared/styles/form.styles';

export interface FormActionsProps {
  onCancel: () => void;
  editCapsule?: any; // Using any to avoid circular dependency with Capsule type
  isSubmitting?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  editCapsule,
  isSubmitting = false
}) => {
  return (
    <ButtonContainer>
      <Button fullWidth variant="secondary" type="button" onClick={onCancel}>
        Cancel
      </Button>

      <Button fullWidth variant="primary" type="submit" disabled={isSubmitting}>
        {editCapsule ? 'Update Capsule' : 'Create Capsule'}
      </Button>
    </ButtonContainer>
  );
};

export default FormActions;
