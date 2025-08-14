import React from 'react';
import { ItemCategory, Season } from '../../../../types';
import { formatCategoryForFilter } from '../../../../utils/textFormatting';
import {
  FormContainer,
  ThreeColumnRow,
  FormGroup,
  Label,
  Select,
  Input,
} from '../../../OutfitForm.styles';

interface FiltersPanelProps {
  searchQuery: string;
  categoryFilter: string;
  colorFilter: string;
  seasonFilter: string;
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
  colors,
  onSearchChange,
  onCategoryChange,
  onColorChange,
  onSeasonChange,
}) => {
  return (
    <FormContainer>
      {/* Search Field - Full Width */}
      <FormGroup>
        <Label htmlFor="search-query">Search</Label>
        <Input
          id="search-query"
          type="text"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          placeholder="Search by name, brand, material..."
        />
      </FormGroup>
      
      {/* Filters Row - Category, Color, and Season in balanced layout */}
      <ThreeColumnRow>
        <FormGroup>
          <Label>Category</Label>
          <Select
            value={categoryFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCategoryChange(e.target.value)}
          >
            <option value="all">All Categories</option>
            {Object.values(ItemCategory).map(category => (
              <option key={category} value={category}>
                {formatCategoryForFilter(category)}
              </option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Color</Label>
          <Input
            type="text"
            placeholder="Enter color"
            value={colorFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onColorChange(e.target.value)}
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Season</Label>
          <Select
            value={seasonFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSeasonChange(e.target.value)}
          >
            <option value="all">All Seasons</option>
            {Object.values(Season).filter(season => season !== Season.ALL_SEASON).map(season => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </Select>
        </FormGroup>
      </ThreeColumnRow>
    </FormContainer>
  );
};

export default FiltersPanel;
