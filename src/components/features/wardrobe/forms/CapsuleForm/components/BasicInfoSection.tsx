import React from 'react';
import { Input } from '../CapsuleForm.styles';
import FormField from '../../../../../common/Form/FormField';

export interface BasicInfoSectionProps {
  /** Current capsule name */
  name: string;
  /** Handler for name changes */
  onNameChange: (name: string) => void;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  onNameChange,
  disabled = false,
  className,
}) => {
  return (
    <FormField 
      label="Capsule Name"
      htmlFor="capsule-name"
      helpText="Leave empty for auto-generation"
      disabled={disabled}
      className={className}
    >
      <Input
        id="capsule-name"
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="e.g., Summer 2025 Capsule"
        disabled={disabled}
      />
    </FormField>
  );
};

export default BasicInfoSection;
