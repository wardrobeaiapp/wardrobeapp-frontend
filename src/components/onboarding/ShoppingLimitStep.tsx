import React from 'react';
import {
  StepTitle,
  StepDescription
} from '../../pages/OnboardingPage.styles';
import { frequencyOptions, shoppingLimitStepContent } from '../../data/onboardingOptions';
import { FaShoppingBag, FaChevronDown } from 'react-icons/fa';
import {
  StepContainer,
  LimitInputContainer,
  ShoppingBagIconWrapper,
  AmountInput,
  FrequencySelectWrapper,
  FrequencySelect,
  ChevronIconWrapper,
  SettingsNoteText
} from './ShoppingLimitStep.styles';

interface ShoppingLimitStepProps {
  // Direct values
  amount: number;
  frequency: string;
  // Direct handlers
  onAmountChange: (amount: number) => void;
  onFrequencyChange: (frequency: string) => void;
}

const ShoppingLimitStep: React.FC<ShoppingLimitStepProps> = ({
  amount,
  frequency,
  onAmountChange,
  onFrequencyChange
}) => {
  const handleShoppingLimitAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newAmount = value ? parseInt(value) : 0;
    onAmountChange(newAmount);
  };

  const handleShoppingLimitFrequencyChange = (newFrequency: string) => {
    onFrequencyChange(newFrequency);
  };

  return (
    <>
      <StepTitle>{shoppingLimitStepContent.title}</StepTitle>
      <StepDescription>
        {shoppingLimitStepContent.description}
      </StepDescription>
      
      <StepContainer>
        <LimitInputContainer>
          <ShoppingBagIconWrapper>
            <FaShoppingBag />
          </ShoppingBagIconWrapper>
          
          <AmountInput
            id="shoppingLimitAmount"
            name="shoppingLimitAmount"
            type="number"
            value={amount || ''}
            onChange={handleShoppingLimitAmountChange}
            placeholder="0"
            className="no-focus-outline"
          />
          
          <FrequencySelectWrapper>
            <FrequencySelect
              id="shoppingLimitFrequency"
              name="shoppingLimitFrequency"
              value={frequency}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleShoppingLimitFrequencyChange(e.target.value)}
              className="no-focus-outline"
            >
              <option value="" disabled>Select frequency</option>
              {frequencyOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </FrequencySelect>
            <ChevronIconWrapper>
              <FaChevronDown size={12} />
            </ChevronIconWrapper>
          </FrequencySelectWrapper>
        </LimitInputContainer>
        
        <SettingsNoteText>
          {shoppingLimitStepContent.settingsNote}
        </SettingsNoteText>
      </StepContainer>
    </>
  );
};

export default ShoppingLimitStep;
