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
  return (
    <SearchContainer label={label} htmlFor="search-input" className={className}>
      <div style={{ position: 'relative' }}>
        <span className="search-icon">
          <MdSearch size={20} />
        </span>
        <FormInput
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ paddingLeft: '2.5rem' }}
        />
      </div>
    </SearchContainer>
  );
};
