import React from 'react';
import { FormField, FormSelect } from '../../../../common/Form';

type Option<T extends string> = {
  value: T;
  label: string;
};

type SelectFilterProps<T extends string> = {
  value: T | 'all';
  onChange: (value: T | 'all') => void;
  options: Array<Option<T>>;
  label: string;
  id: string;
  className?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
};

export function SelectFilter<T extends string = string>({
  value,
  onChange,
  options,
  label,
  id,
  className,
  includeAllOption = true,
  allOptionLabel = 'All',
}: SelectFilterProps<T>) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === '') {
      onChange('all');
      return;
    }
    
    // Find the option to get the correctly typed value
    const option = options.find(opt => String(opt.value) === selectedValue);
    if (option) {
      onChange(option.value);
    }
  };

  // Convert value to string for the select element
  const displayValue = value === 'all' ? '' : String(value);

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
        {options.map(option => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </FormSelect>
    </FormField>
  );
};
