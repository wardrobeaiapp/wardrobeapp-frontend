import React from 'react';
import Button from '../Button';
import { 
  FormContainer, 
  FormGroup, 
  Label, 
  Textarea, 
  ButtonContainer 
} from '../../pages/AIAssistantPage.styles';

interface CheckItemFormProps {
  itemToCheck: string;
  setItemToCheck: (value: string) => void;
  handleCheckItem: () => void;
  isLoading: boolean;
}

const CheckItemForm: React.FC<CheckItemFormProps> = ({
  itemToCheck,
  setItemToCheck,
  handleCheckItem,
  isLoading
}) => {
  return (
    <FormContainer>
      <FormGroup>
        <Label htmlFor="itemToCheck">Describe the Item</Label>
        <Textarea
          id="itemToCheck"
          value={itemToCheck}
          onChange={e => setItemToCheck(e.target.value)}
          placeholder="Describe the item you want to check (e.g., 'black leather jacket from Zara, size M')"
        />
      </FormGroup>

      <ButtonContainer>
        <Button primary onClick={handleCheckItem} disabled={isLoading}>
          {isLoading ? 'Checking Item...' : 'Check Item'}
        </Button>
      </ButtonContainer>
    </FormContainer>
  );
};

export default CheckItemForm;
