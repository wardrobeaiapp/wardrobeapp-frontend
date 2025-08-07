import React from 'react';
import {
  StepTitle,
  StepDescription
} from '../../pages/OnboardingPage.styles';
import { frequencyOptions, currencyOptions, clothingBudgetStepContent } from '../../data/onboardingOptions';
import { FaDollarSign, FaChevronDown } from 'react-icons/fa';
import {
  StepContainer,
  BudgetInputContainer,
  DollarIconWrapper,
  AmountInput,
  CurrencySelectWrapper,
  FrequencySelectWrapper,
  StyledSelect,
  ChevronIconWrapper,
  SettingsNoteText
} from './ClothingBudgetStep.styles';

interface ClothingBudgetStepProps {
  // Direct values
  amount: number;
  currency: string;
  frequency: string;
  // Direct handlers
  onAmountChange: (amount: number) => void;
  onCurrencyChange: (currency: string) => void;
  onFrequencyChange: (frequency: string) => void;
}

const ClothingBudgetStep: React.FC<ClothingBudgetStepProps> = ({
  amount,
  currency,
  frequency,
  onAmountChange,
  onCurrencyChange,
  onFrequencyChange
}) => {
  return (
    <>
      <StepTitle>{clothingBudgetStepContent.title}</StepTitle>
      <StepDescription>
        {clothingBudgetStepContent.description}
      </StepDescription>
      
      <StepContainer>
        <BudgetInputContainer>
          <DollarIconWrapper>
            <FaDollarSign />
          </DollarIconWrapper>
          
          <AmountInput
            id="clothingBudgetAmount"
            name="clothingBudgetAmount"
            type="number"
            value={amount || ''}
            onChange={(e) => {
              const value = e.target.value;
              const newAmount = value ? parseInt(value) : 0;
              onAmountChange(newAmount);
            }}
            placeholder="0"
            className="no-focus-outline"
          />
          
          <CurrencySelectWrapper>
            <StyledSelect
              id="clothingBudgetCurrency"
              name="clothingBudgetCurrency"
              value={currency}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCurrencyChange(e.target.value)}
              className="no-focus-outline"
            >
              <option value="" disabled>Select currency</option>
              {currencyOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </StyledSelect>
            <ChevronIconWrapper>
              <FaChevronDown size={12} />
            </ChevronIconWrapper>
          </CurrencySelectWrapper>
          
          <FrequencySelectWrapper>
            <StyledSelect
              id="clothingBudgetFrequency"
              name="clothingBudgetFrequency"
              value={frequency}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onFrequencyChange(e.target.value)}
              className="no-focus-outline"
            >
              <option value="" disabled>Select frequency</option>
              {frequencyOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </StyledSelect>
            <ChevronIconWrapper>
              <FaChevronDown size={12} />
            </ChevronIconWrapper>
          </FrequencySelectWrapper>
        </BudgetInputContainer>
        
        <SettingsNoteText>
          {clothingBudgetStepContent.settingsNote}
        </SettingsNoteText>
      </StepContainer>
    </>
  );
};

export default ClothingBudgetStep;
