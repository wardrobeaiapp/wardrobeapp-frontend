import React from 'react';
import Button from '../Button';
import { 
  FormContainer, 
  FormGroup, 
  Label, 
  Select,
  Textarea, 
  ButtonContainer 
} from '../../pages/AIAssistantPage.styles';

interface CapsuleFormProps {
  capsuleSize: string;
  setCapsuleSize: (value: string) => void;
  capsuleStyle: string;
  setCapsuleStyle: (value: string) => void;
  handleGenerateCapsule: () => void;
  isLoading: boolean;
}

const CapsuleForm: React.FC<CapsuleFormProps> = ({
  capsuleSize,
  setCapsuleSize,
  capsuleStyle,
  setCapsuleStyle,
  handleGenerateCapsule,
  isLoading
}) => {
  return (
    <FormContainer>
      <FormGroup>
        <Label htmlFor="capsuleSize">Capsule Size</Label>
        <Select
          id="capsuleSize"
          value={capsuleSize}
          onChange={e => setCapsuleSize(e.target.value)}
        >
          <option value="10">10 items</option>
          <option value="15">15 items</option>
          <option value="20">20 items</option>
          <option value="30">30 items</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="capsuleStyle">Style Direction (Optional)</Label>
        <Textarea
          id="capsuleStyle"
          value={capsuleStyle}
          onChange={e => setCapsuleStyle(e.target.value)}
          placeholder="Describe the style direction for your capsule wardrobe (e.g., 'minimalist', 'bohemian', 'business casual')"
        />
      </FormGroup>

      <ButtonContainer>
        <Button primary onClick={handleGenerateCapsule} disabled={isLoading}>
          {isLoading ? 'Generating Capsule...' : 'Generate Capsule Wardrobe'}
        </Button>
      </ButtonContainer>
    </FormContainer>
  );
};

export default CapsuleForm;
