import React from 'react';
import styled from 'styled-components';
import { Season, ItemCategory } from '../../../types';
import {
  FiltersContainer,
  FilterGroup,
  FilterLabel,
  FilterSelect,
  Input as FilterInput
} from './AIComponents.styles';

// Define missing styles that were in GenerateWithAIPopup.styles.tsx
const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
`;

const SearchInput = styled(FilterInput)`
  padding-left: 30px;
  background-image: url('/icons/search.svg');
  background-repeat: no-repeat;
  background-position: 8px center;
  background-size: 16px;
`;

interface FiltersPanelProps {
  searchQuery: string;
  categoryFilter: ItemCategory | 'all';
  colorFilter: string;
  seasonFilter: Season | 'all';
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: ItemCategory | 'all') => void;
  onColorChange: (value: string) => void;
  onSeasonChange: (value: Season | 'all') => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  searchQuery,
  categoryFilter,
  colorFilter,
  seasonFilter,
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onSeasonChange
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <FiltersContainer>
      <FilterGroup>
        <FilterLabel>Search</FilterLabel>
        <SearchInput 
          type="text" 
          placeholder="Search by name, brand, material..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </FilterGroup>
      
      <FilterRow>
        <FilterGroup>
          <FilterLabel>Category</FilterLabel>
          <FilterSelect 
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value as ItemCategory | 'all')}
          >
            <option value="all">All Categories</option>
            {Object.values(ItemCategory).map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Color</FilterLabel>
          <FilterInput 
            type="text" 
            placeholder="Enter color" 
            value={colorFilter}
            onChange={(e) => onColorChange(e.target.value)}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Season</FilterLabel>
          <FilterSelect 
            value={seasonFilter}
            onChange={(e) => onSeasonChange(e.target.value as Season | 'all')}
          >
            <option value="all">All Seasons</option>
            {Object.values(Season)
              .filter(season => season !== Season.ALL_SEASON)
              .map(season => (
                <option key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </option>
              ))}
          </FilterSelect>
        </FilterGroup>
      </FilterRow>
    </FiltersContainer>
  );
};

export default FiltersPanel;
