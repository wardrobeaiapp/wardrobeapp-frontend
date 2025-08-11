import React from 'react';
import {
  FormGroup,
  Label,
  Input
} from '../../CapsuleForm.styles';

export interface BasicInfoSectionProps {
  name: string;
  setName: (name: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  setName
}) => {
  return (
    <FormGroup>
      <Label htmlFor="name">Capsule Name</Label>
      <Input
        id="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g., Summer 2025 Capsule (leave empty for auto-generation)"
      />
    </FormGroup>
  );
};

export default BasicInfoSection;
