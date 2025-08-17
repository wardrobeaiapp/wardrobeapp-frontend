import React, { useState, useEffect } from 'react';
import { SectionDivider } from '../../../../pages/ProfilePage.styles';
import { ClothingBudget } from '../../../../types';
import { 
  frequencyOptions as appFrequencyOptions, 
  currencyOptions as appCurrencyOptions, 
  clothingBudgetStepContent 
} from '../../../../data/onboardingOptions';
import { FormField, FormInput, FormSelect } from '../../../../components/common/Form';

interface BudgetSectionProps {
  initialData: ClothingBudget;
  onSave: (data: ClothingBudget) => void;
}

const BudgetSection: React.FC<BudgetSectionProps> = ({
  initialData,
  onSave
}) => {
  // Track if component is mounted to prevent state updates after unmount
  const [isMounted, setIsMounted] = useState(true);
  // State to track form values
  const [amount, setAmount] = useState(initialData.amount || 0);
  const [inputValue, setInputValue] = useState(initialData.amount?.toString() || '0'); // Track raw input value
  const [currency, setCurrency] = useState(initialData.currency || 'USD');
  const [frequency, setFrequency] = useState(initialData.frequency || 'monthly');
  
  // Update local state when initialData changes
  useEffect(() => {
    if (initialData) {
      // Force a re-render with the correct values
      setAmount(initialData.amount || 0);
      setInputValue(initialData.amount?.toString() || '0');
      setCurrency(initialData.currency || 'USD');
      setFrequency(initialData.frequency || 'monthly');
    }
  }, [initialData]);
  
  useEffect(() => {
    // Set up component mount state
    setIsMounted(true);
    
    // Clean up function to run when component unmounts
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  // Map app options to the format expected by this component
  const frequencyOptions = appFrequencyOptions.map(option => ({
    value: option.id,
    label: option.label
  }));

  const currencyOptions = appCurrencyOptions.map(option => ({
    value: option.id,
    label: option.label
  }));
  
  // No longer need handleSaveChanges as we call onSave directly in the cleanup function
  
  // Call onSave whenever amount, currency, or frequency changes
  useEffect(() => {
    // Only call onSave if the component is mounted and values have changed from initial
    if (isMounted && 
        (amount !== initialData.amount || 
         currency !== initialData.currency || 
         frequency !== initialData.frequency)) {
      // Call onSave with current values
      onSave({
        amount,
        currency,
        frequency
      });
    }
  }, [amount, currency, frequency, initialData.amount, initialData.currency, initialData.frequency, isMounted, onSave]);

  return (
    <>
      <SectionDivider>{clothingBudgetStepContent.profileSection.title}</SectionDivider>
      <FormField 
        label={clothingBudgetStepContent.description}
        htmlFor="clothingBudgetAmount"
      >
        <div style={{ display: 'flex', gap: '10px' }}>
          <FormInput
            id="clothingBudgetAmount"
            type="number"
            min="0"
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInputValue(e.target.value);
              const newAmount = e.target.value === '' ? 0 : parseFloat(e.target.value);
              setAmount(newAmount);
            }}
          />
          <FormSelect
            id="clothingBudgetCurrency"
            value={currency}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setCurrency(e.target.value);
            }}
          >
            {currencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
          <FormSelect
            id="clothingBudgetFrequency"
            value={frequency}
            isFullWidth
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setFrequency(e.target.value as typeof frequency);
            }}
          >
            {frequencyOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormSelect>
        </div>
      </FormField>
    </>
  );
};

export default BudgetSection;
