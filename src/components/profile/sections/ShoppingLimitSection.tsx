import React, { useState, useEffect } from 'react';
import {
  FormGroup,
  Label,
  Select,
  Input,
  SectionDivider,
  SectionWrapper,
  SectionContent
} from '../../../pages/ProfilePage.styles';
import { ShoppingData, ShoppingLimit } from '../../../types';
import { shoppingLimitStepContent } from '../../../data/onboardingOptions';

interface ShoppingLimitSectionProps {
  initialData: Partial<ShoppingData>;
  onSave: (data: ShoppingLimit) => void;
}

const ShoppingLimitSection: React.FC<ShoppingLimitSectionProps> = ({
  initialData,
  onSave
}) => {
  // Use state to track the shopping limit amount
  const [amount, setAmount] = useState(initialData.shoppingLimit?.amount || 0);
  // Use frequency from initialData or default to monthly
  const [frequency, setFrequency] = useState(initialData.shoppingLimit?.frequency || 'monthly');
  // Track input focus state
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  
  // Initialize state from props (only once)
  // We're intentionally only setting this once on mount and ignoring future prop changes
  // to prevent re-render loops
  useEffect(() => {
    if (initialData) {
      setAmount(initialData.shoppingLimit?.amount || 0);
      setFrequency(initialData.shoppingLimit?.frequency || 'monthly');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Save on unmount as a fallback
  useEffect(() => {
    return () => {
      // Only save if the values have changed from the initial data
      if (amount !== initialData.shoppingLimit?.amount || frequency !== initialData.shoppingLimit?.frequency) {
        // Create data object matching ShoppingLimit type
        const dataToSave: ShoppingLimit = {
          amount,
          frequency
        };
        
        // Log the data being saved for debugging
        console.log('ShoppingLimitSection: Saving data on unmount', dataToSave);
        
        onSave(dataToSave);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Handle empty input case
    if (e.target.value === '') {
      setAmount(0);
      return;
    }
    
    // Use the raw string value to avoid issues with leading zeros
    const newAmount = parseFloat(e.target.value);
    if (!isNaN(newAmount)) {
      setAmount(newAmount);
    }
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFrequency = e.target.value;
    setFrequency(newFrequency);
    
    // Save on frequency change
    // Create data object matching ShoppingLimit type
    const dataToSave: ShoppingLimit = {
      amount,
      frequency: newFrequency
    };
    
    // Log the data being saved for debugging
    console.log('ShoppingLimitSection: Saving data on frequency change', dataToSave);
    
    onSave(dataToSave);
  };

  const handleAmountBlur = () => {
    setIsAmountFocused(false);
    // Save on blur to ensure value is saved
    // Save data in the correct structure
    // Create data object matching ShoppingLimit type
    const dataToSave: ShoppingLimit = {
      amount,
      frequency
    };
    
    // Log the data being saved for debugging
    console.log('ShoppingLimitSection: Saving data on amount blur', dataToSave);
    
    onSave(dataToSave);
  };

  return (
    <SectionWrapper>
      <SectionContent>
        <SectionDivider>{shoppingLimitStepContent.profileSection.title}</SectionDivider>
        <FormGroup>
          <Label htmlFor="shopping-limit-amount">{shoppingLimitStepContent.profileSection.mainLabel}</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Input
              id="shopping-limit-amount"
              name="shopping-limit-amount"
              type="number"
              value={isAmountFocused && amount === 0 ? '' : amount}
              onChange={handleAmountChange}
              onFocus={() => setIsAmountFocused(true)}
              onBlur={handleAmountBlur}
              min="0"
              step="1"
              aria-label="Shopping limit amount"
              style={{ width: '120px' }} // Add width constraint
            />
            <Select
              id="shopping-limit-frequency"
              name="shopping-limit-frequency"
              value={frequency}
              onChange={handleFrequencyChange}
              aria-label="Shopping limit frequency"
            >
              <option value="monthly">{shoppingLimitStepContent.profileSection.monthlyOption}</option>
              <option value="quarterly">{shoppingLimitStepContent.profileSection.quarterlyOption}</option>
              <option value="yearly">{shoppingLimitStepContent.profileSection.yearlyOption}</option>
            </Select>
          </div>
        </FormGroup>
      </SectionContent>
    </SectionWrapper>
  );
};

export default ShoppingLimitSection;
