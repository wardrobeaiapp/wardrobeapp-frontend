import styled from 'styled-components';
import { FormInput, FormSelect } from '../../../components/Form/Form.styles';

export const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0;
`;

export const BudgetInputContainer = styled.div`
  display: flex;
  align-items: center;
  width: 400px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  background-color: white;
  padding: 12px 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

export const DollarIconWrapper = styled.div`
  color: #10B981;
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

export const CurrencySelectWrapper = styled.div`
  position: relative;
  margin-right: 12px;
`;

export const FrequencySelectWrapper = styled.div`
  position: relative;
  flex: 1;
`;

export const StyledSelect = styled(FormSelect)`
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
