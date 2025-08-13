import styled from 'styled-components';
import { FormInput, FormSelect } from '../../../components/Form/Form.styles';

export const ShoppingLimitContainer = styled.div`
  background-color: #F0E7FF;
  border-radius: 16px;
  margin: 24px 0;
  padding: 16px 24px;
  display: flex;
  align-items: center;
`;

export const ShoppingBagIcon = styled.div`
  background-color: #2196F3;
  color: white;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
`;

export const InputsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const InputsRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
`;

export const AmountInputContainer = styled.div`
  background-color: #FFFFFF;
  border-radius: 8px;
  position: relative;
  width: 220px;
  height: 48px;
  display: flex;
  align-items: center;
`;

export const CurrencyIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #4CAF50;
  font-size: 20px;
`;

export const SelectContainer = styled.div`
  flex: 1;
`;

export const SettingsNote = styled.div`
  text-align: right;
  color: #666;
  font-size: 14px;
`;

// New styled components for ShoppingLimitStep
export const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0;
`;

export const LimitInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 400px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background-color: white;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const ShoppingBagIconWrapper = styled.div`
  color: #3B82F6;
  font-size: 24px;
  margin-right: 12px;
`;

export const AmountInput = styled(FormInput)`
  flex: 0 0 60px;
  border: none;
  outline: none;
  font-size: 18px;
  font-weight: 500;
  padding: 8px 0;
  margin-right: 12px;
`;

export const FrequencySelectWrapper = styled.div`
  position: relative;
  flex: 1;
`;

export const FrequencySelect = styled(FormSelect)`
  width: 100%;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 8px 0;
  padding-right: 24px;
  appearance: none;
  background-color: transparent;
`;

export const ChevronIconWrapper = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
`;

export const SettingsNoteText = styled.div`
  margin-top: 8px;
  color: #666;
  font-size: 14px;
`;
