import React from 'react';
import styled from 'styled-components';
import { Checkbox, CheckboxProps } from './Checkbox';

export interface CheckboxOption<T = string> {
  /**
   * Value of the checkbox option
   */
  value: T;
  /**
   * Label to display next to the checkbox
   */
  label: string;
  /**
   * Whether the option is disabled
   */
  disabled?: boolean;
}

export interface CheckboxGroupProps<T = string> {
  /**
   * Array of checkbox options
   */
  options: CheckboxOption<T>[];
  /**
   * Currently selected values
   */
  value: T[];
  /**
   * Callback when selection changes
   */
  onChange: (selectedValues: T[]) => void;
  /**
   * Whether the group is disabled
   */
  disabled?: boolean;
  /**
   * Additional class name
   */
  className?: string;
  /**
   * Direction of the checkboxes
   * @default 'row'
   */
  direction?: 'row' | 'column';
  /**
   * Additional props to pass to each checkbox
   */
  checkboxProps?: Omit<CheckboxProps, 'checked' | 'onChange' | 'value' | 'label'>;
}

const StyledCheckboxGroup = styled.div<{ direction: 'row' | 'column' }>`
  display: flex;
  flex-direction: ${({ direction }) => direction};
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

export function CheckboxGroup<T = string>({
  options,
  value = [],
  onChange,
  disabled = false,
  className,
  direction = 'row',
  checkboxProps = {},
}: CheckboxGroupProps<T>) {
  const handleChange = (optionValue: T, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
    }
  };

  // Generate a unique ID for the group to ensure unique checkbox IDs
  const groupId = React.useId();

  return (
    <StyledCheckboxGroup className={className} direction={direction}>
      {options.map((option, index) => {
        const optionId = `checkbox-${groupId}-${index}`;
        return (
          <Checkbox
            key={optionId}
            id={optionId}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={(e) => handleChange(option.value, e.target.checked)}
            disabled={disabled || option.disabled}
            {...checkboxProps}
          />
        );
      })}
    </StyledCheckboxGroup>
  );
}

export default CheckboxGroup;
