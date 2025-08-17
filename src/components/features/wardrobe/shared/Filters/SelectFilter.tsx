import React from 'react';
import { FormField, FormSelect } from '../../../../common/Form';

type Option = {
  value: string;
  label: string;
};

type SelectFilterProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label: string;
  id: string;
  className?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
};

export const SelectFilter: React.FC<SelectFilterProps> = ({
  value,
  onChange,
  options,
  label,
  id,
  className,
  includeAllOption = true,
  allOptionLabel = 'All',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Pass the selected value directly, empty string means 'all' was selected
    onChange(e.target.value);
  };

  // Convert 'all' to empty string for the select element
  const displayValue = value === 'all' ? '' : value;

  // Filter out empty value options to avoid duplicates with our custom 'All' option
  const filteredOptions = options.filter(option => {
    // Keep all options except empty values that aren't specifically for 'All Scenarios'
    return option.value !== '' || option.label === allOptionLabel;
  });

  return (
    <FormField label={label} htmlFor={id} className={className}>
      <FormSelect
        id={id}
        value={displayValue}
        onChange={handleChange}
      >
        {includeAllOption && (
          <option value="">{allOptionLabel}</option>
        )}
        {filteredOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormSelect>
    </FormField>
  );
};
