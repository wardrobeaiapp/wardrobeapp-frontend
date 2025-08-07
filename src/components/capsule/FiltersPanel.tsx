import React from 'react';
import { Season } from '../../types';
import {
  FiltersContainer,
  FilterGroup,
  FilterLabel,
  FilterSelect,
  FilterInput
} from '../CapsuleForm.styles';

interface FiltersPanelProps {
  searchQuery: string;
  categoryFilter: string;
  colorFilter: string;
  seasonFilter: string;
  categories: string[];
  colors: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onSeasonChange: (value: string) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({
  searchQuery,
  categoryFilter,
  colorFilter,
  seasonFilter,
  categories,
  colors,
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onSeasonChange
}) => {
  return (
    <FiltersContainer>
      <FilterGroup>
        <FilterLabel htmlFor="category-filter">Category</FilterLabel>
        <FilterSelect
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </FilterSelect>
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel htmlFor="color-filter">Color</FilterLabel>
        <FilterSelect
          id="color-filter"
          value={colorFilter}
          onChange={(e) => onColorChange(e.target.value)}
        >
          <option value="">All Colors</option>
          {colors.map(color => (
            <option key={color} value={color}>{color}</option>
          ))}
        </FilterSelect>
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel htmlFor="season-filter">Season</FilterLabel>
        <FilterSelect
          id="season-filter"
          value={seasonFilter}
          onChange={(e) => onSeasonChange(e.target.value)}
        >
          <option value="all">All Seasons</option>
          {Object.values(Season).map(season => (
            <option key={season} value={season}>{season}</option>
          ))}
        </FilterSelect>
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel htmlFor="search-query">Search</FilterLabel>
        <FilterInput
          id="search-query"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items..."
        />
      </FilterGroup>
    </FiltersContainer>
  );
};

export default FiltersPanel;
