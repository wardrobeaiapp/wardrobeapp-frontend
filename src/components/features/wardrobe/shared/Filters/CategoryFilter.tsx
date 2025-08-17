import React from 'react';
import { ItemCategory } from '../../../../../types';
import { SelectFilter } from './SelectFilter';

type CategoryFilterProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  className?: string;
  includeAllOption?: boolean;
  allOptionLabel?: string;
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  value,
  onChange,
  id = 'category-filter',
  className,
  includeAllOption = true,
  allOptionLabel = 'All Categories',
}) => {
  const categoryOptions = [
    ...(includeAllOption ? [{ value: 'all', label: allOptionLabel }] : []),
    ...Object.values(ItemCategory).map(category => ({
      value: category,
      label: formatCategoryForFilter(category),
    }))
  ];
  
  // Handle the case when 'all' is selected
  const handleChange = (value: string) => {
    onChange(value === 'all' ? 'all' : value);
  };

  return (
    <SelectFilter
      value={value}
      onChange={handleChange}
      label="Category"
      id={id}
      options={categoryOptions}
      className={className}
      includeAllOption={false} // We're handling the 'all' option manually
      allOptionLabel={allOptionLabel}
    />
  );
};

// Helper function to format category for display
function formatCategoryForFilter(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
