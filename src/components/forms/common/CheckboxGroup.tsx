import React from 'react';
import styled from 'styled-components';
import { formTokens } from '../../../styles/tokens/forms';

export interface CheckboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  layout?: 'row' | 'column';
  columns?: number;
  className?: string;
}

const GroupContainer = styled.div<{ layout: 'row' | 'column'; columns?: number }>`
  display: ${props => props.layout === 'row' ? 'flex' : 'grid'};
  
  ${props => props.layout === 'row' ? `
    flex-wrap: wrap;
    gap: ${formTokens.spacing.lg};
  ` : `
    grid-template-columns: repeat(${props.columns || 1}, 1fr);
    gap: ${formTokens.spacing.md};
    
    @media (max-width: ${formTokens.form.breakpoints.mobile}) {
      grid-template-columns: 1fr;
    }
  `}
`;

const CheckboxItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${formTokens.spacing.sm};
`;

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  accent-color: ${formTokens.colors.primary};
  cursor: pointer;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const CheckboxLabel = styled.label<{ disabled?: boolean }>`
  font-size: ${formTokens.typography.fontSizes.sm};
  color: ${props => props.disabled ? formTokens.colors.textMuted : formTokens.colors.text};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  user-select: none;
  line-height: ${formTokens.typography.lineHeights.normal};
  
  ${props => props.disabled && `
    opacity: 0.6;
  `}
`;

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  selectedValues,
  onChange,
  layout = 'column',
  columns = 2,
  className
}) => {
  const handleToggle = (value: string) => {
    const isSelected = selectedValues.includes(value);
    const newValues = isSelected
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    onChange(newValues);
  };

  return (
    <GroupContainer layout={layout} columns={columns} className={className}>
      {options.map(option => (
        <CheckboxItem key={option.value}>
          <CheckboxInput
            type="checkbox"
            id={`checkbox-${option.value}`}
            checked={selectedValues.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            disabled={option.disabled}
          />
          <CheckboxLabel 
            htmlFor={`checkbox-${option.value}`}
            disabled={option.disabled}
          >
            {option.label}
          </CheckboxLabel>
        </CheckboxItem>
      ))}
    </GroupContainer>
  );
};
