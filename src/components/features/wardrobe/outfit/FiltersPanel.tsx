import React from 'react';
import { Season, ItemCategory } from '../../../../types';
import { formatCategoryForFilter } from '../../../../utils/textFormatting';
import {
  FormContainer,
  ThreeColumnRow,
  FormGroup,
  Label,
  Select,
  Input
} from '../forms/OutfitForm/OutfitForm.styles';

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
  return (
    <FormContainer>
      {/* Search Field - Full Width */}
      <FormGroup>
        <Label>Search</Label>
        <Input 
          type="text" 
          placeholder="Search by name, brand, material..." 
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
        />
      </FormGroup>
      
      {/* Filters Row - Category, Color, and Season in balanced layout */}
      <ThreeColumnRow>
        <FormGroup>
          <Label>Category</Label>
          <Select 
            value={categoryFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onCategoryChange(e.target.value as ItemCategory | 'all')}
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSeasonChange(e.target.value as Season | 'all')}
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
