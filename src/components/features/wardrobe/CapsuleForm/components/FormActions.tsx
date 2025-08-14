import React from 'react';
import {
  ButtonGroup
} from '../../CapsuleForm.styles';
import {
  ModernCancelButton,
  ModernSubmitButton
} from '../../../../OutfitForm.styles';

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
    <ButtonGroup>
      <ModernCancelButton type="button" onClick={onCancel}>
        Cancel
      </ModernCancelButton>

      <ModernSubmitButton type="submit" disabled={isSubmitting}>
        {editCapsule ? 'Update Capsule' : 'Create Capsule'}
      </ModernSubmitButton>
    </ButtonGroup>
  );
};

export default FormActions;
