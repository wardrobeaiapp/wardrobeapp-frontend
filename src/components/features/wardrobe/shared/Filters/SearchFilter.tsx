import React from 'react';
import { MdSearch } from 'react-icons/md';
import { FormField, FormInput } from '../../../../common/Form';
import styled from 'styled-components';

type SearchFilterProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

const SearchContainer = styled(FormField)`
  flex: 0 0 auto;
  min-width: 200px;
  max-width: 300px;
  margin: 0;
  
  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af; /* gray-400 */
    pointer-events: none;
    z-index: 1;
  }
`;

export const SearchFilter: React.FC<SearchFilterProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  label = 'Search',
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <SearchContainer label={label} htmlFor="search-input" className={className}>
      <div style={{ position: 'relative' }}>
        <MdSearch className="search-icon" size={20} />
        <FormInput
          id="search-input"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          style={{ paddingLeft: '40px' }}
        />
      </div>
    </SearchContainer>
  );
};
